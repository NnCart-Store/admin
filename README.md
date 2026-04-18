<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <title>NnCart | Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen p-4">
    <h1 class="text-3xl font-bold text-yellow-500 text-center mb-6">NnCart Admin Panel</h1>
    
    <div class="flex justify-center gap-4 mb-6">
        <button onclick="showSection('orders')" class="bg-yellow-600 px-6 py-2 rounded-lg font-bold">Orders</button>
        <button onclick="showSection('inventory')" class="bg-blue-600 px-6 py-2 rounded-lg font-bold">Inventory</button>
    </div>

    <div id="ordersSection" class="grid gap-4 max-w-4xl mx-auto">
        <h2 class="text-xl font-bold text-white">Recent Orders</h2>
        <div id="orderList"></div>
    </div>

    <div id="inventorySection" class="hidden max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl">
        <h2 class="text-xl font-bold text-white mb-4">Inventory Management</h2>
        <div id="inventoryList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            </div>
    </div>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
        import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

        // 🔥 Apna Firebase Config yahan paste karo
        const firebaseConfig = { 
            /* const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "nncart.firebaseapp.com",
    projectId: "nncart",
    // ... baki sab details
};
*/ 
        };
        const db = getFirestore(initializeApp(firebaseConfig));

        // Tab Switching Logic
        window.showSection = (section) => {
            document.getElementById('ordersSection').classList.toggle('hidden', section !== 'orders');
            document.getElementById('inventorySection').classList.toggle('hidden', section !== 'inventory');
        };

        // Fetch Data
        async function loadData() {
            // Orders
            const orderSnap = await getDocs(collection(db, "order"));
            let oHtml = "";
            orderSnap.forEach(doc => {
                const o = doc.data();
                oHtml += `<div class="bg-gray-800 p-4 rounded-xl border-l-4 border-yellow-500">
                            <p class="font-bold">${o['Customer Name']} - ${o['Mobile']}</p>
                            <p class="text-sm">Product: ${o['Products']} | Price: ${o['Price']}</p>
                          </div>`;
            });
            document.getElementById('orderList').innerHTML = oHtml;

            // Inventory (Connecting to Firestore 'inventory' collection)
            const invSnap = await getDocs(collection(db, "inventory"));
            let iHtml = "";
            invSnap.forEach(doc => {
                const i = doc.data();
                iHtml += `<div class="bg-gray-700 p-3 rounded-lg text-sm">
                            <p><b>Product:</b> ${i['Product Name']}</p>
                            <p><b>Barcode:</b> ${i['Barcode']}</p>
                            <p><b>Stock:</b> ${i['stock']} | <b>Price:</b> ${i['Price']}</p>
                            <p><b>Color/Size:</b> ${i['color']} / ${i['size']}</p>
                          </div>`;
            });
            document.getElementById('inventoryList').innerHTML = iHtml;
        }
        loadData();
    </script>
</body>
</html>
