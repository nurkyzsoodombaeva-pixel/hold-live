import {
  fetchProducts,
  saveProduct,
  deleteFromFirebase,
  updateProduct,
} from "./firebase.js";

/* ================= ADMIN ================= */

const ADMIN_PASSWORD = "1234";

const adminIcon = document.querySelector("#adminIcon");
const loginBox = document.querySelector(".admin-login");
const loginBtn = document.querySelector("#loginBtn");
const passInput = document.querySelector("#adminPassword");

const isAdmin = () => localStorage.getItem("isAdmin") === "true";

adminIcon?.addEventListener("click", () => {
  loginBox.style.display = "flex";
});

loginBtn.addEventListener("click", () => {
  if (passInput.value === ADMIN_PASSWORD) {
    localStorage.setItem("isAdmin", "true");
    loginBox.style.display = "none";
    updateAdminUI();
    render(allProducts);
  } else {
    alert("Неверный пароль");
  }
});

const closeLogin = document.querySelector("#closeLogin");

closeLogin.addEventListener("click", () => {
  loginBox.style.display = "none";
});

// loginBtn?.addEventListener("click", () => {
//   if (passInput.value === ADMIN_PASSWORD) {
//     loginBox.style.display = "none";
//     render(allProducts);
//   } else {
//     alert("Неверный пароль");
//   }
// });

const addBtn = document.querySelector("#addProductBtn");

const modal = document.querySelector(".modal");
const closeModal = document.querySelector(".close-modal");

const title = document.querySelector("#title");
const desc = document.querySelector("#desc");
const price = document.querySelector("#price");
const image = document.querySelector("#image");
const category = document.querySelector("#category");
const subCategory = document.querySelector("#subCategory");


addBtn?.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeModal?.addEventListener("click", () => {
  modal.style.display = "none";
});

function updateAdminUI() {
  if (isAdmin()) {
    addBtn.classList.remove("hidden");
  } else {
    addBtn.classList.add("hidden");
  }
}

updateAdminUI();

localStorage.setItem("isAdmin", "true");
updateAdminUI();

/* ================= DATA ================= */

const productsContainer = document.querySelector(".products");
const searchInput = document.querySelector(".search");
const categoryCards = document.querySelectorAll(".category-card");
const subBox = document.querySelector(".subcategories");

let allProducts = [];
let currentCategory = null;

/* ================= MAPS ================= */

const categoryMap = {
  face: "Уход за лицом",
  body: "Уход за телом",
  hair: "Волосы",
  makeup: "Макияж",
};

const subMap = {
  face: [
    "Тонеры",
    "Сыворотки",
    "Кремы",
    "SPF",
    "Маски",
    "Патчи",
    "Пилинги",
    "Гели",
    "Мицеллярная вода",
    "Тонизирующие лосьоны",
    "Масла",
    "Гидрофильные масла",
    "Пенка",
    "Молочко",
    "Скрабы",
    "Тоники",
    "Эссенции",
    "Инзимная пудра",
  ],
  body: [
    "Лосьоны",
    "Скрабы",
    "Кремы",
    "Масла",
    "Гели",
    "Пилинги",
    "Маски",
    "Гидрофильные масла",
    "Молочко",
    "Тонизирующие лосьоны",
  ],
  hair: [
    "Шампуни",
    "Кондиционеры",
    "Маски",
    "Бальзамы",
    "Масла",
    "Сыворотки",
    "Эссенции",
    "Тоники для кожи головы",
    "Пилинги для кожи головы",
    "Скрабы для кожи головы",
    "Ампулы",
    "Несмываемый уход",
    "Термозащита",
    "Спреи",
    "Мисты",
    "Кремы для волос",
    "Воск",
    "Гель",
    "Мусс",
    "Пенка",
    "Лак",
    "Сухой шампунь",
    "Наборы",
  ],makeup: [
  "Праймеры",
  "Тональные кремы",
  "BB-кремы",
  "CC-кремы",
  "Кушоны",
  "Консилеры",
  "Корректоры",
  "Пудры",
  "Румяна",
  "Бронзеры",
  "Хайлайтеры",
  "Контуринг",
  "Палетки для лица",

  "Тени",
  "Палетки теней",
  "Подводки",
  "Карандаши для глаз",
  "Тушь",
  "База под тени",

  "Карандаши для бровей",
  "Тушь для бровей",
  "Гели для бровей",
  "Тени для бровей",

  "Помады",
  "Тинты",
  "Блески",
  "Бальзамы для губ",
  "Карандаши для губ",

  "Фиксаторы макияжа",
  "Спонжи",
  "Кисти",
  "Наборы"
],
};

/* ================= HELP ================= */

const norm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .trim();

function inCategory(p, key) {
  return (
    norm(p.category) === norm(key) ||
    norm(p.category) === norm(categoryMap[key])
  );
}

/* ================= RENDER ================= */

function render(products) {
  if (!productsContainer) return;

  const admin = isAdmin();

  productsContainer.innerHTML = "";

  if (!products.length) {
    productsContainer.innerHTML = "<p>Нет товаров</p>";
    return;
  }

  products.forEach((p) => {
    const status = p.available ? "В наличии" : "Нет в наличии";
    const cls = p.available ? "in-stock" : "out-stock";

    productsContainer.innerHTML += `
      <div class="product-card ${cls}" data-id="${p.id}">
        <img src="${p.image}" />

        <div class="product-info">
          <span class="status">${status}</span>

          <h3>${p.title}</h3>
          <p>${p.description || ""}</p>
          <div class="price">${p.price} сом</div>

          ${
            admin
              ? `
              <button class="price-btn" onclick="event.stopPropagation(); changePrice('${p.id}', ${p.price})">
                💰 Изменить цену
              </button>

              <button class="status-btn" onclick="event.stopPropagation(); toggleStatus('${p.id}', ${p.available})">
                🔄 Сменить статус
              </button>

              <button class="delete-btn" onclick="event.stopPropagation(); deleteProduct('${p.id}')">
                🗑 Удалить
              </button>
              `
              : ""
          }
        </div>
      </div>
    `;
  });
}

productsContainer.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;

  const id = card.dataset.id;
  openProduct(id);
});

// productsContainer.addEventListener("click", (e) => {
//   if (e.target.closest("button")) return; // ❌ если кнопка — ничего не делаем

//   const card = e.target.closest(".product-card");
//   if (!card) return;

//   openProductModal(card.dataset.id);
// });

/* ================= CATEGORY ================= */

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    const key = card.dataset.category;
    currentCategory = key;

    renderSub(key);
    render(allProducts.filter((p) => inCategory(p, key)));
  });
});

/* ================= SUB ================= */

function renderSub(key) {
  if (!subBox) return;

  const set = new Set(subMap[key] || []);

  allProducts
    .filter((p) => inCategory(p, key))
    .forEach((p) => {
      if (p.subCategory) set.add(p.subCategory);
    });

  subBox.innerHTML = "";

  [...set].forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "sub-btn";
    btn.textContent = s;

    btn.onclick = () => {
      render(
        allProducts.filter(
          (p) => inCategory(p, key) && norm(p.subCategory) === norm(s),
        ),
      );
      document
        .querySelectorAll(".sub-btn")
        .forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");
    };

    subBox.appendChild(btn);
  });
}

/* ================= SEARCH ================= */

searchInput?.addEventListener("input", (e) => {
  const v = e.target.value.toLowerCase();

  render(allProducts.filter((p) => p.title.toLowerCase().includes(v)));
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

window.openProduct = (id) => {
  const p = allProducts.find((x) => x.id === id);

  if (!p) return;

  document.querySelector("#modalImage").src = p.image;

  document.querySelector("#modalTitle").textContent = p.title;

  document.querySelector("#modalPrice").textContent = p.price + " сом";

  document.querySelector("#modalDesc").textContent = p.description;

  document.querySelector("#modalStatus").textContent = p.available
    ? "🟢 В наличии"
    : "🔴 Нет в наличии";

  document.querySelector("#productModal").style.display = "flex";
};

document.querySelector(".close-product-modal").onclick = () => {
  document.querySelector("#productModal").style.display = "none";
};

document.querySelector("#productModal").addEventListener("click", (e) => {
  if (e.target.id === "productModal") {
    document.querySelector("#productModal").style.display = "none";
  }
});

window.changePrice = async (id, currentPrice) => {
  const newPrice = prompt("Введите новую цену:", currentPrice);

  if (newPrice === null) return;

  if (isNaN(newPrice) || Number(newPrice) <= 0) {
    alert("Введите корректную цену");
    return;
  }

  await updateProduct(id, {
    price: Number(newPrice),
  });

  alert("Цена изменена!");
};
/* ================= ADD ================= */

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

  title.value = "";
  desc.value = "";
  price.value = "";
  image.value = "";
  subCategory.value = "";

  modal.style.display = "none";

  alert("Товар добавлен!");
});

/* ================= INIT ================= */

fetchProducts((data) => {
  allProducts = data;
  render(allProducts);
});
