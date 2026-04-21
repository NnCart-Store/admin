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

<!-- DASHBOARD -->
<div class="grid grid-cols-3 gap-3 mb-3">
<div class="bg-white p-2 text-center"><h2 id="ordersCount">0</h2>Orders</div>
<div class="bg-white p-2 text-center"><h2 id="revenue">0</h2>Revenue</div>
<div class="bg-white p-2 text-center"><h2 id="pending">0</h2>Pending</div>
</div>

<!-- SEARCH -->
<input id="search" placeholder="Search Customer..." class="border p-2 w-full mb-3">

<!-- PRODUCT ADD -->
<h2 class="font-bold">Add / Scan Product</h2>

<input id="barcode" placeholder="Barcode" class="border p-2 w-full mb-1">
<input id="pname" placeholder="Product Name" class="border p-2 w-full mb-1">
<input id="price" placeholder="Price" class="border p-2 w-full mb-1">
<input id="image" placeholder="Image URL" class="border p-2 w-full mb-1">
<input id="category" placeholder="Category" class="border p-2 w-full mb-1">
<input id="stock" placeholder="Stock" class="border p-2 w-full mb-1">
<input id="color" placeholder="Color" class="border p-2 w-full mb-1">
<input id="size" placeholder="Size" class="border p-2 w-full mb-1">

<button onclick="startScanner()" class="bg-blue-500 text-white px-3 py-1 mt-1">Scan</button>
<button onclick="saveProduct()" class="bg-green-500 text-white px-3 py-1 mt-1">Save</button>

<div id="scanner" class="mt-2"></div>

<hr class="my-4">

<!-- PRODUCTS LIST -->
<h2 class="font-bold">All Products</h2>
<div id="products"></div>

<hr class="my-4">

<!-- ORDERS -->
<h2 class="font-bold">Orders</h2>
<div id="orders"></div>

<script type="module">

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
apiKey:"AIzaSyCH...",
authDomain:"nncart.firebaseapp.com",
projectId:"nncart"
};

const db = getFirestore(initializeApp(firebaseConfig));

let allOrders=[];

// 📦 LOAD PRODUCTS
async function loadProducts(){
const snap = await getDocs(collection(db,"products"));
let html="";
snap.forEach(d=>{
let p=d.data();
html+=`
<div class="bg-white p-2 mb-2">
<p>${p["Product Name"]}</p>
<p>₹${p["Price"]}</p>
<button onclick="deleteProduct('${d.id}')" class="bg-red-500 text-white px-2">Delete</button>
</div>`;
});
document.getElementById("products").innerHTML=html;
}

// 📦 LOAD ORDERS
async function loadOrders(){
const snap = await getDocs(collection(db,"orders"));
allOrders = snap.docs.map(d=>({id:d.id,...d.data()}));
renderOrders(allOrders);
updateStats(allOrders);
}

// 🎨 RENDER ORDERS
function renderOrders(data){
let html="";
data.forEach(o=>{
html+=`
<div class="bg-white p-3 mb-2 rounded">
<h3>${o["Customer Name"]}</h3>
<p>${o["Products"]}</p>
<p>₹${o["Total"]}</p>
<p>Status: ${o["Status"]}</p>

<select onchange="updateStatus('${o.id}',this.value)">
<option ${o["Status"]=="Pending"?"selected":""}>Pending</option>
<option ${o["Status"]=="Shipped"?"selected":""}>Shipped</option>
<option ${o["Status"]=="Delivered"?"selected":""}>Delivered</option>
</select>

<input placeholder="Shipping ID" value="${o["Shipping ID"]||""}" 
onchange="updateShip('${o.id}',this.value)" class="border mt-1">

${o["Payment Proof"] ? `<a href="${o["Payment Proof"]}" target="_blank">View Payment</a>` : ""}

<button onclick='invoice(${JSON.stringify(o)})' class="bg-purple-500 text-white px-2 mt-1">Invoice</button>
<button onclick="deleteOrder('${o.id}')" class="bg-red-500 text-white px-2 mt-1">Delete</button>

</div>`;
});
document.getElementById("orders").innerHTML=html;
}

// 📊 STATS
function updateStats(d){
document.getElementById("ordersCount").innerText=d.length;

let rev=0,p=0;
d.forEach(o=>{
rev+=Number(o["Total"]||0);
if(o["Status"]=="Pending")p++;
});

document.getElementById("revenue").innerText="₹"+rev;
document.getElementById("pending").innerText=p;
}

// 🔍 SEARCH
document.getElementById("search").oninput=(e)=>{
let v=e.target.value.toLowerCase();
renderOrders(allOrders.filter(o=>o["Customer Name"]?.toLowerCase().includes(v)));
};

// 🔄 UPDATE STATUS
window.updateStatus=async(id,s)=>{
await updateDoc(doc(db,"orders",id),{"Status":s});
loadOrders();
};

// 🚚 SHIPPING
window.updateShip=async(id,s)=>{
await updateDoc(doc(db,"orders",id),{"Shipping ID":s});
};

// ❌ DELETE ORDER
window.deleteOrder=async(id)=>{
await deleteDoc(doc(db,"orders",id));
loadOrders();
};

// ❌ DELETE PRODUCT
window.deleteProduct=async(id)=>{
await deleteDoc(doc(db,"products",id));
loadProducts();
};

// 📷 SCANNER
window.startScanner=()=>{
const html5QrCode=new Html5Qrcode("scanner");

html5QrCode.start({facingMode:"environment"},{fps:10},async(txt)=>{

document.getElementById("barcode").value=txt;

const snap=await getDocs(collection(db,"products"));
snap.forEach(d=>{
let p=d.data();
if(p["Barcode"]==txt){
document.getElementById("pname").value=p["Product Name"];
document.getElementById("price").value=p["Price"];
document.getElementById("image").value=p["Image URL"];
}
});

html5QrCode.stop();
});
};

// ➕ SAVE PRODUCT
window.saveProduct=async()=>{
await addDoc(collection(db,"products"),{
"Timestamp":new Date().toISOString(),
"Barcode":document.getElementById("barcode").value,
"Product Name":document.getElementById("pname").value,
"Image URL":document.getElementById("image").value,
"Price":document.getElementById("price").value,
"category":document.getElementById("category").value,
"stock":document.getElementById("stock").value,
"color":document.getElementById("color").value,
"size":document.getElementById("size").value
});
alert("Saved");
loadProducts();
};

// 🧾 INVOICE
window.invoice=(o)=>{
const {jsPDF}=window.jspdf;
let doc=new jsPDF();

doc.text("NNCart Invoice",20,20);
doc.text("Customer: "+o["Customer Name"],20,40);
doc.text("Product: "+o["Products"],20,50);
doc.text("Amount: ₹"+o["Total"],20,60);
doc.text("Status: "+o["Status"],20,70);

doc.save("invoice.pdf");
};

window.onload=()=>{
loadOrders();
loadProducts();
};

setInterval(loadOrders,5000);

</script>

</body>
</html>
