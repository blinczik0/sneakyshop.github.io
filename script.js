const telegram = "https://t.me/your_telegram";
const grid = document.getElementById("productGrid");
const homePage = document.getElementById("homePage");

let cart = [];

const base = [
  {name:"Geek Bar Pulse",c:"disposable",p:120,img:"https://picsum.photos/300?1"},
  {name:"Elf Bar BC5000",c:"disposable",p:95,img:"https://picsum.photos/300?2"},
  {name:"Vaporesso XROS 3",c:"pod",p:160,img:"https://picsum.photos/300?3"},
  {name:"Uwell Caliburn G3",c:"pod",p:170,img:"https://picsum.photos/300?4"}
];

const products=[];
while(products.length<40){
  let b=base[products.length%base.length];
  products.push({...b,name:b.name+" "+(products.length+1)});
}

function render(list){
  grid.innerHTML="";
  list.forEach((p,index)=>{
    grid.innerHTML+=`
    <div class="card">
      <img src="${p.img}">
      <div class="info">
        <div>${p.name}</div>
        <div class="price">${p.p} zł</div>
        <button class="add" onclick="addToCart(${index})">В корзину</button>
      </div>
    </div>`;
  });
}

function showCategory(cat){
  homePage.style.display="none";
  render(products.filter(p=>p.c===cat));
}

function showAll(){
  homePage.style.display="none";
  render(products);
}

function goHome(){
  homePage.style.display="block";
  grid.innerHTML="";
}

function addToCart(index){
  const item = products[index];
  let found = cart.find(x=>x.name===item.name);
  if(found) found.qty++;
  else cart.push({...item,qty:1});
  updateCart();
}

function removeFromCart(i){
  cart.splice(i,1);
  updateCart();
}

function changeQty(i,delta){
  cart[i].qty+=delta;
  if(cart[i].qty<1) cart[i].qty=1;
  updateCart();
}

function updateCart(){
  const list=document.getElementById("cartList");
  list.innerHTML="";
  let total=0;

  cart.forEach((p,i)=>{
    total+=p.p*p.qty;
    list.innerHTML+=`
    <div class="cart-item">
      <img src="${p.img}">
      <div>
        <div>${p.name}</div>
        <div>${p.p} zł</div>
        <div class="qty-controls">
          <button onclick="changeQty(${i},-1)">-</button>
          ${p.qty}
          <button onclick="changeQty(${i},1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${i})">×</button>
    </div>`;
  });

  document.getElementById("totalPrice").innerText = total + " zł";
  document.getElementById("headerCartCount").innerText =
    cart.reduce((a,b)=>a+b.qty,0);
}

function toggleCart(){
  document.getElementById("cartPanel").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

function checkout(){
  if(!cart.length) return alert("Корзина пуста");
  window.open(telegram);
}
