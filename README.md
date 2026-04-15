<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NnCart Admin Inventory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/html5-qrcode"></script>
    <style>
        .glass { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="bg-slate-950 text-white min-h-screen">

    <div class="p-4 max-w-md mx-auto">
        <h1 class="text-2xl font-black text-amber-500 mb-4 text-center">NnCart Inventory</h1>
        
        <div class="rounded-3xl border-4 border-slate-800 overflow-hidden bg-black mb-4">
            <div id="reader" style="width: 100%; min-height: 250px;"></div>
        </div>
        
        <button onclick="startScanning()" class="w-full bg-amber-500 text-black font-black py-4 rounded-2xl shadow-lg active:scale-95 transition">📸 SCAN BARCODE</button>
    </div>

    <div id="modal" class="fixed inset-0 glass z-50 hidden flex items-center justify-center p-4">
        <div class="bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
            <h2 class="text-xl font-bold text-amber-500 mb-4">Product Details</h2>
            
            <div class="space-y-3 text-sm">
                <div><label>Barcode</label><input type="text" id="barcode" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1" readonly></div>
                <div><label>Product Name</label><input type="text" id="pname" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1"></div>
                <div><label>Image URL</label><input type="text" id="img_url" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1"></div>
                
                <div class="grid grid-cols-2 gap-2">
                    <div><label>Price</label><input type="number" id="price" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1"></div>
                    <div><label>Quantity/Stock</label><input type="number" id="qty" value="1" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1"></div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div><label>Category</label><input type="text" id="cat" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1"></div>
                    <div><label>Size</label><input type="text" id="size" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1"></div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div><label>Color</label><input type="text" id="color" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1"></div>
                    <div><label>Shipping ID</label><input type="text" id="ship_id" class="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 mt-1"></div>
                </div>
            </div>

            <div class="flex gap-2 mt-6">
                <button onclick="closeModal()" class="flex-1 bg-slate-700 py-3 rounded-xl font-bold">Cancel</button>
                <button onclick="saveData()" id="save-btn" class="flex-1 bg-green-600 py-3 rounded-xl font-bold">Save</button>
            </div>
        </div>
    </div>

    <script>
        const html5QrCode = new Html5Qrcode("reader");
        const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2ZGgqtp2rTq6OaanKKZA3XhWCuqcPezUu-Ed4gD_zhX3rMVC0cT3I8wvbNfPmT1fJ/exec";

        function startScanning() {
            html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, 
            (decodedText) => {
                document.getElementById('barcode').value = decodedText;
                html5QrCode.stop();
                document.getElementById('modal').classList.remove('hidden');
            });
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
        }

        async function saveData() {
            const btn = document.getElementById('save-btn');
            btn.innerText = "Saving...";
            
            const payload = {
                barcode: document.getElementById('barcode').value,
                name: document.getElementById('pname').value,
                imageUrl: document.getElementById('img_url').value,
                price: document.getElementById('price').value,
                qty: document.getElementById('qty').value,
                category: document.getElementById('cat').value,
                size: document.getElementById('size').value,
                color: document.getElementById('color').value,
                shippingId: document.getElementById('ship_id').value
            };

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload)
            });
            
            alert("Inventory Saved!");
            location.reload(); // Page refresh to scan next
        }
    </script>
</body>
</html>
