<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NnCart | Master Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen p-4">
    <h1 class="text-3xl font-bold text-yellow-500 text-center mb-6">NnCart Admin Master Panel</h1>
    
    <div class="flex justify-center gap-4 mb-6">
        <button onclick="showSection('orders')" class="bg-yellow-600 px-6 py-2 rounded-lg font-bold">Orders</button>
        <button onclick="showSection('inventory')" class="bg-blue-600 px-6 py-2 rounded-lg font-bold">Inventory</button>
    </div>

    <div id="ordersSection" class="grid gap-4 max-w-4xl mx-auto">
        <h2 class="text-xl font-bold mb-4">Recent Customer Orders</h2>
        <div id="orderList" class="space-y-4"></div>
    </div>

    <div id="inventorySection" class="hidden max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl">
        <h2 class="text-xl font-bold mb-4">Inventory & Scanner</h2>
        
        <div id="reader" class="mb-6 bg-black rounded-lg overflow-hidden border-2 border-blue-500"></div>
        <div id="result" class="text-green-400 font-bold mb-4">Scan karo product barcode...</div>

        <div id="inventoryList" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    </div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

        // 🔥 Yahan apna Firebase Config daalo
        const firebaseConfig = { 
            apiKey: "AIzaSyCH2di4fAKw8vA80Cv8bMobi...", 
            authDomain: "nncart.firebaseapp.com",
            projectId: "nncart",
            storageBucket: "nncart.appspot.com",
            messagingSenderId: "662993037031",
            appId: "1:662993037031:web:893e379fe374cb74d26442"
        };
        const db = getFirestore(initializeApp(firebaseConfig));

        // --- SECTION LOGIC ---
        window.showSection = (section) => {
            document.getElementById('ordersSection').classList.toggle('hidden', section !== 'orders');
            document.getElementById('inventorySection').classList.toggle('hidden', section !== 'inventory');
        };

        // --- ORDER MANAGEMENT ---
        window.updateStatus = async (id, status) => {
            await updateDoc(doc(db, "order", id), { Status: status });
            alert("Order Status: " + status);
            loadData();
        };

        // --- INVENTORY MANAGEMENT ---
        window.deleteProduct = async (id) => {
            if(confirm("Delete this product entry?")) {
                await deleteDoc(doc(db, "inventory", id));
                loadData();
            }
        };

        // Scanner Logic
        const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
        html5QrcodeScanner.render(async (decodedText) => {
            document.getElementById('result').innerText = "Scanned: " + decodedText;
            await addDoc(collection(db, "inventory"), {
                "Barcode": decodedText,
                "Product Name": "New Scan Item",
                "stock": "1",
                "Price": "0"
            });
            alert("Product added to inventory!");
            loadData();
        });

        // --- FETCH DATA ---
        async function loadData() {
            // Orders Fetching
            const orderSnap = await getDocs(collection(db, "order"));
            let oHtml = "";
            orderSnap.forEach(d => {
                const o = d.data();
                oHtml += `
                <div class="bg-gray-800 p-4 rounded-xl border-l-4 border-yellow-500 shadow-lg">
                    <p class="font-bold text-lg">${o['Customer Name']} | ${o['Mobile']}</p>
                    <p class="text-sm">Item: ${o['Products']} | Amount: ₹${o['Total']}</p>
                    <p class="text-xs text-yellow-400 mt-1">Status: ${o['Status'] || 'Pending'}</p>
                    <div class="mt-3 flex gap-2 flex-wrap">
                        <button onclick="updateStatus('${d.id}', 'Confirmed')" class="bg-green-600 px-3 py-1 text-xs rounded hover:bg-green-700">Confirm</button>
                        <button onclick="updateStatus('${d.id}', 'Shipped')" class="bg-blue-600 px-3 py-1 text-xs rounded hover:bg-blue-700">Ship</button>
                    </div>
                </div>`;
            });
            document.getElementById('orderList').innerHTML = oHtml;

            // Inventory Fetching
            const invSnap = await getDocs(collection(db, "inventory"));
            let iHtml = "";
            invSnap.forEach(d => {
                const i = d.data();
                iHtml += `
                <div class="bg-gray-700 p-3 rounded-lg text-sm flex justify-between items-center border border-gray-600">
                    <div>
                        <p class="font-bold">${i['Product Name'] || 'Unnamed'}</p>
                        <p class="text-xs text-gray-300">Barcode: ${i['Barcode']}</p>
                        <p class="text-xs">Stock: ${i['stock']} | Price: ₹${i['Price']}</p>
                    </div>
                    <button onclick="deleteProduct('${d.id}')" class="bg-red-500 p-2 rounded text-white font-bold">X</button>
                </div>`;
            });
            document.getElementById('inventoryList').innerHTML = iHtml;
        }
        loadData();
    </script>
</body>
</html>
