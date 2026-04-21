<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NNCart Ultimate Admin</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>

<body class="bg-gray-100 p-4">

    <h1 class="text-xl font-bold mb-3">NNCart Ultimate Admin</h1>

    <div class="grid grid-cols-3 gap-3 mb-3">
        <div class="bg-white p-2 text-center shadow"><h2 id="ordersCount" class="font-bold">0</h2>Orders</div>
        <div class="bg-white p-2 text-center shadow"><h2 id="revenue" class="font-bold">0</h2>Revenue</div>
        <div class="bg-white p-2 text-center shadow"><h2 id="pending" class="font-bold">0</h2>Pending</div>
    </div>

    <input id="search" placeholder="Search Customer..." class="border p-2 w-full mb-3">

    <div class="bg-white p-4 rounded shadow mb-4">
        <h2 class="font-bold mb-2">Add / Scan Product</h2>
        <input id="barcode" placeholder="Barcode" class="border p-2 w-full mb-1">
        <input id="pname" placeholder="Product Name" class="border p-2 w-full mb-1">
        <input id="price" placeholder="Price" class="border p-2 w-full mb-1">
        <input id="image" placeholder="Image URL" class="border p-2 w-full mb-1">
        <input id="category" placeholder="Category" class="border p-2 w-full mb-1">
        <input id="stock" placeholder="Stock" class="border p-2 w-full mb-1">
        <input id="color" placeholder="Color" class="border p-2 w-full mb-1">
        <input id="size" placeholder="Size" class="border p-2 w-full mb-1">

        <div class="flex gap-2 mt-2">
            <button onclick="startScanner()" class="bg-blue-500 text-white px-4 py-2 rounded">Scan & Fetch</button>
            <button onclick="saveProduct()" class="bg-green-500 text-white px-4 py-2 rounded">Save to Firebase</button>
        </div>
        <div id="scanner" class="mt-2"></div>
    </div>

    <hr class="my-4">

    <h2 class="font-bold">All Products</h2>
    <div id="products" class="mt-2"></div>

    <hr class="my-4">

    <h2 class="font-bold">Orders</h2>
    <div id="orders" class="mt-2"></div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCH...",
            authDomain: "nncart.firebaseapp.com",
            projectId: "nncart"
        };

        const db = getFirestore(initializeApp(firebaseConfig));
        let allOrders = [];

        // 📦 LOAD PRODUCTS
        window.loadProducts = async () => {
            const snap = await getDocs(collection(db, "products"));
            let html = "";
            snap.forEach(d => {
                let p = d.data();
                html += `
                <div class="bg-white p-3 mb-2 rounded shadow flex justify-between items-center">
                    <div>
                        <p class="font-bold">${p["Product Name"]}</p>
                        <p class="text-sm text-gray-600">₹${p["Price"]}</p>
                    </div>
                    <button onclick="deleteProduct('${d.id}')" class="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>`;
            });
            document.getElementById("products").innerHTML = html;
        };

        // 📦 LOAD ORDERS
        window.loadOrders = async () => {
            const snap = await getDocs(collection(db, "orders"));
            allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            renderOrders(allOrders);
            updateStats(allOrders);
        };

        // 🎨 RENDER ORDERS
        function renderOrders(data) {
            let html = "";
            data.forEach(o => {
                html += `
                <div class="bg-white p-3 mb-2 rounded shadow">
                    <h3>${o["Customer Name"]}</h3>
                    <p class="text-sm">${o["Products"]}</p>
                    <p class="font-bold">₹${o["Total"]}</p>
                    <p class="text-xs">Status: ${o["Status"]}</p>
                    <select onchange="updateStatus('${o.id}', this.value)" class="border p-1 mt-1">
                        <option ${o["Status"] == "Pending" ? "selected" : ""}>Pending</option>
                        <option ${o["Status"] == "Shipped" ? "selected" : ""}>Shipped</option>
                        <option ${o["Status"] == "Delivered" ? "selected" : ""}>Delivered</option>
                    </select>
                    <br>
                    <input placeholder="Shipping ID" value="${o["Shipping ID"] || ""}" onchange="updateShip('${o.id}', this.value)" class="border p-1 mt-1 w-full">
                    <div class="mt-2 flex gap-2">
                        ${o["Payment Proof"] ? `<a href="${o["Payment Proof"]}" target="_blank" class="text-blue-500 text-xs">View Payment</a>` : ""}
                        <button onclick='invoice(${JSON.stringify(o)})' class="bg-purple-500 text-white px-2 py-1 text-xs rounded">Invoice</button>
                        <button onclick="deleteOrder('${o.id}')" class="bg-red-500 text-white px-2 py-1 text-xs rounded">Delete</button>
                    </div>
                </div>`;
            });
            document.getElementById("orders").innerHTML = html;
        }

        // 📊 STATS
        function updateStats(d) {
            document.getElementById("ordersCount").innerText = d.length;
            let rev = 0, p = 0;
            d.forEach(o => {
                rev += Number(o["Total"] || 0);
                if (o["Status"] == "Pending") p++;
            });
            document.getElementById("revenue").innerText = "₹" + rev;
            document.getElementById("pending").innerText = p;
        }

        // 🔍 SEARCH
        document.getElementById("search").oninput = (e) => {
            let v = e.target.value.toLowerCase();
            renderOrders(allOrders.filter(o => o["Customer Name"]?.toLowerCase().includes(v)));
        };

        // 🔄 UPDATES
        window.updateStatus = async (id, s) => { await updateDoc(doc(db, "orders", id), { "Status": s }); loadOrders(); };
        window.updateShip = async (id, s) => { await updateDoc(doc(db, "orders", id), { "Shipping ID": s }); };
        window.deleteOrder = async (id) => { await deleteDoc(doc(db, "orders", id)); loadOrders(); };
        window.deleteProduct = async (id) => { await deleteDoc(doc(db, "products", id)); loadProducts(); };

        // 📷 SCANNER & API INTEGRATION
        window.startScanner = () => {
            const html5QrCode = new Html5Qrcode("scanner");
            html5QrCode.start({ facingMode: "environment" }, { fps: 10 }, async (txt) => {
                document.getElementById("barcode").value = txt;
                
                // Fetch product info from API
                try {
                    const res = await fetch("https://api.upcitemdb.com/prod/trial/lookup?upc=" + txt);
                    const data = await res.json();
                    if (data.items && data.items.length > 0) {
                        const p = data.items[0];
                        document.getElementById("pname").value = p.title || "";
                        document.getElementById("image").value = p.images[0] || "";
                        document.getElementById("price").value = p.offers[0]?.price || "";
                    }
                } catch (e) { console.log("API Error"); }
                
                html5QrCode.stop();
            });
        };

        // ➕ SAVE PRODUCT TO FIREBASE
        window.saveProduct = async () => {
            await addDoc(collection(db, "products"), {
                "Timestamp": new Date().toISOString(),
                "Barcode": document.getElementById("barcode").value,
                "Product Name": document.getElementById("pname").value,
                "Image URL": document.getElementById("image").value,
                "Price": document.getElementById("price").value,
                "category": document.getElementById("category").value,
                "stock": document.getElementById("stock").value,
                "color": document.getElementById("color").value,
                "size": document.getElementById("size").value
            });
            alert("Saved to Firebase!");
            loadProducts();
        };

        // 🧾 INVOICE
        window.invoice = (o) => {
            const { jsPDF } = window.jspdf;
            let doc = new jsPDF();
            doc.text("NNCart Invoice", 20, 20);
            doc.text("Customer: " + o["Customer Name"], 20, 40);
            doc.text("Product: " + o["Products"], 20, 50);
            doc.text("Amount: ₹" + o["Total"], 20, 60);
            doc.save("invoice.pdf");
        };

        window.onload = () => { loadOrders(); loadProducts(); };
        setInterval(loadOrders, 5000);

    </script>
</body>
</html>
