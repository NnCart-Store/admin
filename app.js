let products = JSON.parse(localStorage.getItem("products")) || [];

// Add Product (global function)
function addProduct(name, price, image){

    if(!name || !price){
        alert("Fill all fields");
        return;
    }

    products.push({
        name,
        price,
        image
    });

    localStorage.setItem("products", JSON.stringify(products));

    renderProducts();
}

// Delete product
function deleteProduct(index){
    products.splice(index,1);
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
}

// Render list
function renderProducts(){
    let list = document.getElementById("list");
    if(!list) return;

    list.innerHTML = "";

    products.forEach((p,i)=>{
        list.innerHTML += `
        <div style="background:#eee;padding:10px;margin:5px 0;border-radius:5px">
            <b>${p.name}</b><br>
            ₹${p.price}<br>
            <button onclick="deleteProduct(${i})"
            style="background:red;color:white;padding:5px;margin-top:5px">
            Delete
            </button>
        </div>
        `;
    });
}

// init
renderProducts();
