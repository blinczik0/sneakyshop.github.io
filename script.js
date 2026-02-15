const telegram = "https://t.me/your_telegram";
const grid = document.getElementById("productGrid");
const homePage = document.getElementById("homePage");

let cart = [];

// SVG-изображения устройств (одноразка / под)
const svgDisposable = (color) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200"><rect x="20" y="20" width="80" height="160" rx="8" fill="${color}" stroke="#333" stroke-width="2"/><rect x="35" y="40" width="50" height="80" rx="4" fill="#1a1a2e"/><circle cx="60" cy="170" r="8" fill="#2a2a4a"/></svg>`)}`;
const svgPod = (color) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180"><rect x="15" y="10" width="70" height="140" rx="6" fill="${color}" stroke="#333" stroke-width="2"/><rect x="25" y="25" width="50" height="60" rx="4" fill="#1a1a2e"/><rect x="30" y="100" width="40" height="35" rx="3" fill="#252540"/></svg>`)}`;

const products = [
  // Одноразки
  { name: "Geek Bar Pulse", c: "disposable", p: 45, img: svgDisposable("#00d4aa") },
  { name: "Geek Bar Meloso Mini", c: "disposable", p: 35, img: svgDisposable("#ff6b9d") },
  { name: "Geek Bar Razz", c: "disposable", p: 38, img: svgDisposable("#a855f7") },
  { name: "Elf Bar BC5000", c: "disposable", p: 42, img: svgDisposable("#22c55e") },
  { name: "Elf Bar 600", c: "disposable", p: 28, img: svgDisposable("#3b82f6") },
  { name: "Elf Bar TE5000", c: "disposable", p: 40, img: svgDisposable("#f59e0b") },
  { name: "Lost Mary OS5000", c: "disposable", p: 44, img: svgDisposable("#ec4899") },
  { name: "Lost Mary QM600", c: "disposable", p: 32, img: svgDisposable("#8b5cf6") },
  { name: "Lost Mary BM5000", c: "disposable", p: 43, img: svgDisposable("#06b6d4") },
  { name: "Lost Mary MT15000", c: "disposable", p: 55, img: svgDisposable("#f97316") },
  { name: "Funky Republic TI7000", c: "disposable", p: 48, img: svgDisposable("#14b8a6") },
  { name: "SKE Crystal Bar", c: "disposable", p: 36, img: svgDisposable("#6366f1") },
  { name: "HQD Cuvie Plus", c: "disposable", p: 30, img: svgDisposable("#e11d48") },
  { name: "Puff Bar Plus", c: "disposable", p: 32, img: svgDisposable("#0ea5e9") },
  { name: "RandM Tornado 7000", c: "disposable", p: 42, img: svgDisposable("#84cc16") },
  { name: "Vozol Gear 10000", c: "disposable", p: 48, img: svgDisposable("#d946ef") },
  { name: "Masking Aroma 10000", c: "disposable", p: 46, img: svgDisposable("#f43f5e") },
  { name: "Crystal Bar 4000", c: "disposable", p: 34, img: svgDisposable("#2dd4bf") },
  { name: "Elf Bar Pi7000", c: "disposable", p: 50, img: svgDisposable("#a3e635") },
  { name: "Geek Bar Pulse Mini", c: "disposable", p: 38, img: svgDisposable("#fb923c") },
  // Pod-системы
  { name: "Vaporesso XROS 4", c: "pod", p: 165, img: svgPod("#4f46e5") },
  { name: "Vaporesso XROS 3", c: "pod", p: 155, img: svgPod("#7c3aed") },
  { name: "Vaporesso XROS 2", c: "pod", p: 140, img: svgPod("#2563eb") },
  { name: "Uwell Caliburn G3", c: "pod", p: 175, img: svgPod("#059669") },
  { name: "Uwell Caliburn A3", c: "pod", p: 145, img: svgPod("#0d9488") },
  { name: "Uwell Caliburn X", c: "pod", p: 168, img: svgPod("#0f766e") },
  { name: "SMOK Nord 5", c: "pod", p: 158, img: svgPod("#dc2626") },
  { name: "SMOK Nord 4", c: "pod", p: 142, img: svgPod("#b91c1c") },
  { name: "SMOK Novo 5", c: "pod", p: 135, img: svgPod("#991b1b") },
  { name: "Voopoo Vinci 3", c: "pod", p: 152, img: svgPod("#4d7c0f") },
  { name: "Voopoo Argus Pod", c: "pod", p: 138, img: svgPod("#15803d") },
  { name: "Geekvape Aegis Pod", c: "pod", p: 148, img: svgPod("#0e7490") },
  { name: "Geekvape Sonder U", c: "pod", p: 125, img: svgPod("#0369a1") },
  { name: "Aspire Flexus Q", c: "pod", p: 132, img: svgPod("#6d28d9") },
  { name: "Aspire R1", c: "pod", p: 118, img: svgPod("#7e22ce") },
  { name: "Innokin Gozee Box", c: "pod", p: 145, img: svgPod("#be185d") },
  { name: "Innokin Klypse", c: "pod", p: 128, img: svgPod("#9d174d") },
  { name: "OXVA Xlim Pro", c: "pod", p: 155, img: svgPod("#1e40af") },
  { name: "OXVA Xlim SQ", c: "pod", p: 135, img: svgPod("#1e3a8a") },
  { name: "Vaporesso Eco Nano", c: "pod", p: 122, img: svgPod("#0c4a6e") },
];

function render(list) {
  grid.innerHTML = "";
  grid.classList.add("grid-visible");
  list.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${Math.min(index * 0.05, 0.6)}s`;
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="info">
        <div class="card-name">${p.name}</div>
        <div class="price">${p.p} zł</div>
        <button class="add" onclick="addToCart(${products.indexOf(p)})">В корзину</button>
      </div>`;
    grid.appendChild(card);
  });
}

function showCategory(cat) {
  homePage.classList.remove("home-visible");
  homePage.style.display = "none";
  const list = products.filter(p => p.c === cat);
  render(list);
}

function showAll() {
  homePage.classList.remove("home-visible");
  homePage.style.display = "none";
  render(products);
}

function goHome() {
  homePage.style.display = "block";
  homePage.classList.add("home-visible");
  grid.innerHTML = "";
  grid.classList.remove("grid-visible");
}

function addToCart(index) {
  const item = products[index];
  let found = cart.find(x => x.name === item.name);
  if (found) found.qty++;
  else cart.push({ ...item, qty: 1 });
  updateCart();
  // Микро-анимация счётчика
  const countEl = document.getElementById("headerCartCount");
  if (countEl) {
    countEl.classList.remove("bump");
    void countEl.offsetWidth;
    countEl.classList.add("bump");
  }
}

function removeFromCart(i) {
  cart.splice(i, 1);
  updateCart();
}

function changeQty(i, delta) {
  cart[i].qty += delta;
  if (cart[i].qty < 1) cart[i].qty = 1;
  updateCart();
}

function updateCart() {
  const list = document.getElementById("cartList");
  list.innerHTML = "";
  let total = 0;

  cart.forEach((p, i) => {
    total += p.p * p.qty;
    const item = document.createElement("div");
    item.className = "cart-item";
    item.innerHTML = `
      <img src="${p.img}" alt="">
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${p.p} zł × ${p.qty}</div>
        <div class="qty-controls">
          <button type="button" onclick="changeQty(${i},-1)" aria-label="Меньше">−</button>
          <span>${p.qty}</span>
          <button type="button" onclick="changeQty(${i},1)" aria-label="Больше">+</button>
        </div>
      </div>
      <button type="button" class="remove-btn" onclick="removeFromCart(${i})" aria-label="Удалить">×</button>`;
    list.appendChild(item);
  });

  document.getElementById("totalPrice").innerText = total + " zł";
  document.getElementById("headerCartCount").innerText = cart.reduce((a, b) => a + b.qty, 0);
}

function toggleCart() {
  document.getElementById("cartPanel").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

function checkout() {
  if (!cart.length) return alert("Корзина пуста");
  window.open(telegram);
}
