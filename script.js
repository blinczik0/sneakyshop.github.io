const telegram = "https://t.me/your_telegram";
const grid = document.getElementById("productGrid");
const homePage = document.getElementById("homePage");

let cart = [];
let products = []; // каждый элемент = одна строка из JSON (название + вкус/цвет)
let variantsByProduct = new Map(); // название модели -> отсортированный массив вариантов (для модалки)

function normalizeName(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Рандомная картинка для каждого индекса (уникальная на товар)
function getRandomImage(index) {
  return `https://picsum.photos/seed/${index}/400/400`;
}

function buildProductsFromCatalog(raw) {
  const list = [];
  const variantsMap = new Map(); // name -> variants[]

  raw.forEach((row, index) => {
    const name = normalizeName(row["Название"]);
    const type = row["Тип"] === "Под" ? "pod" : "disposable";
    const variant = (row["Вкусы"] || "").trim();
    const displayName = variant ? name + " — " + variant : name;
    const p = type === "pod" ? 145 : 42;

    list.push({
      name,
      variant,
      displayName,
      c: type,
      p,
      img: getRandomImage(index),
      index,
    });

    if (variant) {
      if (!variantsMap.has(name)) variantsMap.set(name, []);
      if (!variantsMap.get(name).includes(variant)) {
        variantsMap.get(name).push(variant);
      }
    }
  });

  variantsMap.forEach((arr, key) => {
    variantsMap.set(key, arr.sort((a, b) => a.localeCompare(b, "ru")));
  });
  variantsByProduct = variantsMap;

  return list;
}

function openFlavorsModalByIndex(productIndex) {
  const product = products[productIndex];
  if (!product) return;
  const variants = variantsByProduct.get(product.name);
  if (!variants || variants.length === 0) return;

  const modal = document.getElementById("variantModal");
  const titleEl = document.getElementById("variantModalTitle");
  const subEl = document.getElementById("variantModalSub");
  const optionsEl = document.getElementById("variantOptions");
  const confirmBtn = document.getElementById("variantConfirmBtn");

  titleEl.textContent = product.name;
  subEl.textContent = "Вкусы / цвета (отсортированы по алфавиту)";
  optionsEl.innerHTML = "";
  confirmBtn.style.display = "none";

  variants.forEach((v) => {
    const row = document.createElement("div");
    row.className = "variant-option variant-option-row";
    row.textContent = v;
    optionsEl.appendChild(row);
  });

  modal.classList.add("active");
}

function closeVariantModal() {
  document.getElementById("variantModal").classList.remove("active");
}

function addToCart(productIndex) {
  const product = products[productIndex];
  if (!product) return;
  const item = {
    name: product.displayName,
    p: product.p,
    img: product.img,
    qty: 1,
  };
  const found = cart.find((x) => x.name === product.displayName);
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
    card.style.animationDelay = `${Math.min(index * 0.02, 0.4)}s`;
    const hasVariants = variantsByProduct.get(p.name) && variantsByProduct.get(p.name).length > 0;
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${escapeHtml(p.displayName)}" loading="lazy">
      </div>
      <div class="info">
        <div class="card-name" ${hasVariants ? `onclick="openFlavorsModalByIndex(${globalIndex})" title="Показать все вкусы/цвета"` : ""}>${escapeHtml(p.displayName)}</div>
        <div class="price">${p.p} zł</div>
        <button class="add" onclick="addToCart(${globalIndex})">В корзину</button>
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

fetch("kaifsmoke.json")
  .then((r) => r.json())
  .then((data) => {
    products = buildProductsFromCatalog(data);
    updateCart();
  })
  .catch((err) => {
    console.error("Ошибка загрузки kaifsmoke.json", err);
    products = [
      { name: "ELF BAR BC 45000", displayName: "ELF BAR BC 45000 — Blue Razz Ice", variant: "Blue Razz Ice", c: "disposable", p: 42, img: getRandomImage(0), index: 0 },
      { name: "Vaporesso Xros 4 mini", displayName: "Vaporesso Xros 4 mini — Black", variant: "Black", c: "pod", p: 145, img: getRandomImage(1), index: 1 },
    ];
    variantsByProduct.set("ELF BAR BC 45000", ["Blue Razz Ice", "Lemon Lime"]);
    variantsByProduct.set("Vaporesso Xros 4 mini", ["Black", "Ice Blue"]);
  });
