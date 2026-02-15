const telegram = "https://t.me/your_telegram";
const grid = document.getElementById("productGrid");
const homePage = document.getElementById("homePage");

let cart = [];
let products = []; // заполняется из kaifsmoke.json
let catalogRaw = [];

// SVG по типу (одноразка / под)
const svgDisposable = (color) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200"><rect x="20" y="20" width="80" height="160" rx="8" fill="${color}" stroke="#333" stroke-width="2"/><rect x="35" y="40" width="50" height="80" rx="4" fill="#1a1a2e"/><circle cx="60" cy="170" r="8" fill="#2a2a4a"/></svg>`)}`;
const svgPod = (color) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180"><rect x="15" y="10" width="70" height="140" rx="6" fill="${color}" stroke="#333" stroke-width="2"/><rect x="25" y="25" width="50" height="60" rx="4" fill="#1a1a2e"/><rect x="30" y="100" width="40" height="35" rx="3" fill="#252540"/></svg>`)}`;

// Цвета и опционально URL картинок по названию (ключ — нормализованное имя)
const productColors = {
  "ELF BAR BC 45000 5% NEW": "#22c55e",
  "OXVA Xlim GO 2": "#4f46e5",
  "ELF BAR TRIO 40000 5%": "#ec4899",
  "ELF BAR RAYA D3 PRO 30000 5%": "#f59e0b",
  "ELFBAR GH 33000 PRO 5%": "#06b6d4",
  "Vaporesso Xros 4 mini": "#8b5cf6",
  "ELFBAR MOONNIGHT 40000 5%": "#a855f7",
  "ELFBAR RAYA D3 25000 5%": "#14b8a6",
  "Vaporesso Xros Pro 2 NEW": "#e11d48",
  "ELF BAR LUSH KING PRO 40000 5%": "#84cc16",
  "ELF BAR ELFX Mini": "#0ea5e9",
  "ELF BAR ELFX PRO": "#d946ef",
  "Vaporesso Xros 5 Mini": "#6366f1",
  "Vaporesso Xros 5": "#0d9488",
  "Vaporesso Xros PRO": "#dc2626",
  "ELFBAR ICE KING 30000 5%": "#2dd4bf",
  "ELFBAR NIC KING 30000 5%": "#f97316",
  "ELFBAR SOUR KING 30000 5%": "#a3e635",
  "ELFBAR SWEET KING 30000 5%": "#fb923c",
};

// Реальные изображения товаров (PNG/SVG). Добавь сюда URL с Гугла по желанию — иначе используется SVG-заглушка выше.
const productImageUrls = {
  // Пример: "ELF BAR BC 45000 5% NEW": "https://example.com/elfbar-bc45000.png",
};

function normalizeName(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}

function getProductImage(name, type) {
  const n = normalizeName(name);
  if (productImageUrls[n]) return productImageUrls[n];
  const color = productColors[n] || (type === "pod" ? "#4f46e5" : "#00d4aa");
  return type === "Под" || type === "pod" ? svgPod(color) : svgDisposable(color);
}

function buildProductsFromCatalog(raw) {
  const map = new Map(); // key: normalizedName|type
  raw.forEach((row) => {
    const name = normalizeName(row["Название"]);
    const type = row["Тип"] === "Под" ? "pod" : "disposable";
    const key = name + "|" + type;
    const option = (row["Вкусы"] || "").trim();
    if (!map.has(key)) {
      map.set(key, {
        name,
        c: type,
        p: type === "pod" ? 145 : 42,
        img: getProductImage(name, row["Тип"]),
        variants: [],
      });
    }
    if (option && !map.get(key).variants.includes(option)) {
      map.get(key).variants.push(option);
    }
  });
  return Array.from(map.values());
}

function openVariantModal(productIndex) {
  const product = products[productIndex];
  if (!product) return;
  const modal = document.getElementById("variantModal");
  const titleEl = document.getElementById("variantModalTitle");
  const subEl = document.getElementById("variantModalSub");
  const optionsEl = document.getElementById("variantOptions");
  const confirmBtn = document.getElementById("variantConfirmBtn");

  titleEl.textContent = product.name;
  subEl.textContent = product.c === "pod" ? "Выберите цвет" : "Выберите вкус";
  optionsEl.innerHTML = "";
  confirmBtn.style.display = "none";
  confirmBtn.dataset.productIndex = String(productIndex);

  let selectedOption = null;
  product.variants.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "variant-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      optionsEl.querySelectorAll(".variant-option").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedOption = opt;
      confirmBtn.style.display = "block";
    });
    optionsEl.appendChild(btn);
  });

  confirmBtn.onclick = () => {
    if (!selectedOption) return;
    addToCartWithVariant(productIndex, selectedOption);
    closeVariantModal();
  };

  modal.classList.add("active");
}

function closeVariantModal() {
  document.getElementById("variantModal").classList.remove("active");
}

function addToCartWithVariant(productIndex, option) {
  const product = products[productIndex];
  const fullName = product.name + " — " + option;
  const item = {
    name: fullName,
    p: product.p,
    img: product.img,
    qty: 1,
  };
  const found = cart.find((x) => x.name === fullName);
  if (found) found.qty++;
  else cart.push(item);
  updateCart();
  const countEl = document.getElementById("headerCartCount");
  if (countEl) {
    countEl.classList.remove("bump");
    void countEl.offsetWidth;
    countEl.classList.add("bump");
  }
}

function render(list) {
  grid.innerHTML = "";
  grid.classList.add("grid-visible");
  list.forEach((p, index) => {
    const globalIndex = products.indexOf(p);
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${Math.min(index * 0.03, 0.5)}s`;
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="info">
        <div class="card-name">${p.name}</div>
        <div class="price">${p.p} zł</div>
        <button class="add" onclick="openVariantModal(${globalIndex})">В корзину</button>
      </div>`;
    grid.appendChild(card);
  });
}

function showCategory(cat) {
  homePage.classList.remove("home-visible");
  homePage.style.display = "none";
  const list = products.filter((p) => p.c === cat);
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

// Загрузка каталога
fetch("kaifsmoke.json")
  .then((r) => r.json())
  .then((data) => {
    catalogRaw = data;
    products = buildProductsFromCatalog(data);
    updateCart();
  })
  .catch((err) => {
    console.error("Ошибка загрузки kaifsmoke.json", err);
    products = [
      { name: "ELF BAR BC 45000 5% NEW", c: "disposable", p: 42, img: svgDisposable("#22c55e"), variants: ["Blue Razz Ice", "Lemon Lime"] },
      { name: "Vaporesso Xros 4 mini", c: "pod", p: 145, img: svgPod("#8b5cf6"), variants: ["Black", "Ice Blue"] },
    ];
  });
