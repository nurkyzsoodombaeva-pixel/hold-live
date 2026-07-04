import {
  fetchProducts,
  saveProduct,
  deleteFromFirebase,
  updateProduct,
} from "./firebase.js";

/* ================= ADMIN ================= */

const ADMIN_PASSWORD = "1234";

function isAdmin() {
  return localStorage.getItem("isAdmin") === "true";
}

function initAdmin() {
  const box = document.querySelector(".admin-login");
  const btn = document.querySelector("#loginBtn");
  const pass = document.querySelector("#adminPassword");

  if (!box || !btn) return;

  if (isAdmin()) box.style.display = "none";

  btn.addEventListener("click", () => {
    if (pass.value === ADMIN_PASSWORD) {
      localStorage.setItem("isAdmin", "true");
      box.style.display = "none";
    } else {
      alert("Неверный пароль");
    }
  });
}

/* ================= DATA ================= */

const productsContainer = document.querySelector(".products");
const searchInput = document.querySelector(".search");
const categoryCards = document.querySelectorAll(".category-card");
const subBlock = document.querySelector(".subcategories");

let allProducts = [];

/* ================= MAPS ================= */

const categoryMap = {
  face: "Уход за лицом",
  body: "Уход за телом",
  hair: "Волосы",
  makeup: "Макияж",
};

const subcategories = {
  face: ["Тонеры", "Сыворотки", "Кремы", "SPF", "Маски", "Патчи", "Пилинги", "Гели", "Мицеллярная вода", "Масла", "Тканевые маски", "Пенка", "Скрабы", "Гидрофильное масло", "Гидрофильный гель",],
  body: ["Лосьоны", "Скрабы", "Кремы", "Масла", "Гели", "Маски", "Патчи", "Пилинги", "Гидрофильное масло", "Гидрофильный гель", "Гидрофильный бальзам", "Гидрофильная вода", "Гидрофильная пенка",],
  hair: ["Шампуни", "Маски", "Кондиционеры", "Сыворотки", "Масла", "Гели",],
  makeup: ["Тональные", "Пудры", "Румяна", "Тени", "Помады", "Блески", "Карандаши", "Подводки", "Туши", "База под макияж", "Консилеры", "Хайлайтеры", "Бронзеры", "Праймеры", "Кисти", "Спонжи", "Палетки", "Наборы", "Средства для бровей", "Средства для ресниц", "Линзы"],
};

/* ================= HELPERS ================= */

const norm = (v) => String(v ?? "").toLowerCase().trim();

function inCategory(p, key) {
  return (
    p.category === key ||
    p.category === categoryMap[key]
  );
}

/* ================= RENDER ================= */

function render(products) {
  productsContainer.innerHTML = "";

  if (!products.length) {
    productsContainer.innerHTML = "<p>Нет товаров</p>";
    return;
  }

  const admin = isAdmin();

  products.forEach((p) => {
    const status = p.available ? "В наличии" : "Нет в наличии";
    const cls = p.available ? "in-stock" : "out-stock";

    productsContainer.innerHTML += `
      <div class="product-card ${cls}">

        <img src="${p.image}" />

        <div class="product-info">

          <span class="status">${status}</span>

          ${admin ? `
            <button onclick="toggleStatus('${p.id}', ${p.available})">сменить</button>
            <button onclick="deleteProduct('${p.id}')">🗑</button>
          ` : ""}

          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div>${p.price} сом</div>

        </div>
      </div>
    `;
  });
}

/* ================= CATEGORY ================= */

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    const key = card.dataset.category;

    renderSub(key);
    render(allProducts.filter((p) => inCategory(p, key)));
  });
});

/* ================= SUBCATEGORIES ================= */
function renderSub(key) {
  if (!subBlock) return;

  const set = new Set(subcategories[key] || []);

  allProducts
    .filter((p) => inCategory(p, key))
    .forEach((p) => {
      if (p.subCategory) set.add(p.subCategory);
    });

  subBlock.innerHTML = "";

  [...set].forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "subcategory-btn";
    btn.textContent = s;

    btn.addEventListener("click", () => {
      render(
        allProducts.filter(
          (p) =>
            inCategory(p, key) &&
            norm(p.subCategory) === norm(s)
        )
      );
    });

    subBlock.appendChild(btn);
  });
}

/* ================= SEARCH ================= */

searchInput?.addEventListener("input", (e) => {
  const v = e.target.value.toLowerCase();

  render(allProducts.filter((p) =>
    p.title.toLowerCase().includes(v)
  ));
});

/* ================= ADMIN ACTIONS ================= */

window.deleteProduct = async (id) => {
  await deleteFromFirebase(id);
};

window.toggleStatus = async (id, current) => {
  await updateProduct(id, {
    available: !current,
  });
};

/* ================= ADD PRODUCT ================= */

document.querySelector("#addBtn")?.addEventListener("click", async () => {
  const product = {
    title: title.value,
    description: desc.value,
    price: Number(price.value),
    image: image.value,
    category: categoryMap[category.value],
    subCategory: subCategory.value,
    available: true,
  };

  await saveProduct(product);
});

/* ================= INIT ================= */

fetchProducts((data) => {
  allProducts = data;
  render(allProducts);
});

initAdmin();