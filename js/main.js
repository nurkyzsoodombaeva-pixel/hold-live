import { fetchProducts, saveProduct } from "./firebase.js";

const productsContainer = document.querySelector(".products");
const categoryCards = document.querySelectorAll(".category-card");
const subcategoriesBlock = document.querySelector(".subcategories");

let allProducts = [];

const subcategories = {
  face: [
    "Тонеры",
    "Сыворотки",
    "Кремы",
    "Маски",
    "Патчи",
    "SPF",
    "Ампула",
    "Эсенция",
    "Гидрафилка",
  ],

  body: [
    "Лосьоны",
    "Кремы для тела",
    "Скрабы",
    "Масла",
  ],

  hair: [
    "Шампуни",
    "Кондиционеры",
    "Маски",
    "Масла",
  ],

  makeup: [
    "Тональные основы",
    "Пудры",
    "Тушь",
    "Помады",
  ],
};

const categoryMap = {
  face: "Уход за лицом",
  body: "Уход за телом",
  hair: "Волосы",
  makeup: "Макияж",
};

function normalizeString(value) {
  return String(value ?? "").trim().toLowerCase();
}

function productMatchesCategory(product, categoryKey) {
  const categoryLabel = categoryMap[categoryKey] || "";

  return (
    normalizeString(product.category) === normalizeString(categoryKey) ||
    normalizeString(product.category) === normalizeString(categoryLabel)
  );
}

function getProductsByCategory(categoryKey) {
  return allProducts.filter((product) =>
    productMatchesCategory(product, categoryKey)
  );
}

function renderCategorySubcategories(categoryKey) {
  const categoryProducts = getProductsByCategory(categoryKey);

  const subcategorySet = new Set(subcategories[categoryKey] || []);

  categoryProducts.forEach((product) => {
    if (product.subCategory) {
      subcategorySet.add(product.subCategory);
    }
  });

  subcategoriesBlock.innerHTML = "";

  [...subcategorySet].forEach((item) => {
    const button = document.createElement("button");

    button.className = "subcategory-btn";
    button.textContent = item;

    button.onclick = () => {
      const filtered = allProducts.filter(
        (product) =>
          productMatchesCategory(product, categoryKey) &&
          normalizeString(product.subCategory) === normalizeString(item)
      );

      renderProducts(filtered);

      document.querySelector("#products")?.scrollIntoView({
        behavior: "smooth",
      });
    };

    subcategoriesBlock.append(button);
  });
}

fetchProducts((products) => {
  allProducts = products;
  renderProducts(allProducts);
});

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;

    if (!subcategories[category]) return;

    renderCategorySubcategories(category);
    renderProducts(getProductsByCategory(category));

    document.querySelector("#products")?.scrollIntoView({
      behavior: "smooth",
    });
  });
});

const searchInput = document.querySelector(".search");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    renderProducts(
      allProducts.filter((product) =>
        product.title.toLowerCase().includes(value)
      )
    );
  });
}

const addBtn = document.querySelector("#addBtn");
const titleInput = document.querySelector("#title");
const descInput = document.querySelector("#desc");
const priceInput = document.querySelector("#price");
const imageInput = document.querySelector("#image");
const categoryInput = document.querySelector("#category");
const subCategoryInput = document.querySelector("#subCategory");



if (addBtn) {
  addBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const categoryValue = categoryInput.value;
    const categoryLabel = categoryMap[categoryValue] || categoryValue;

    const newProduct = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      price: Number(priceInput.value),
      image: imageInput.value.trim(),
      category: categoryLabel,
      subCategory: subCategoryInput.value.trim(),
      rating: 0,
      reviews: 0,
    };

    if (
      !newProduct.title ||
      !newProduct.price ||
      !newProduct.image ||
      !newProduct.subCategory
    ) {
      alert("Заполните все обязательные поля!");
      return;
    }

    try {
      await saveProduct(newProduct);

      alert("Товар успешно добавлен!");

      titleInput.value = "";
      descInput.value = "";
      priceInput.value = "";
      imageInput.value = "";
      subCategoryInput.value = "";

      modal.classList.remove("active");
    } catch (error) {
      console.error(error);
      alert("Ошибка при добавлении товара.");
    }
  });
}

// ---------------- FOOTER ----------------

const footer = document.querySelector(".footer");

let clickCount = 0;
let clickTimer = null;

const modal = document.querySelector(".modal");
const closeModal = document.querySelector(".close-modal");

footer.addEventListener("click", () => {
  clickCount++;

  clearTimeout(clickTimer);

  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 1500);

  if (clickCount === 5) {
    modal.classList.add("active");
    clickCount = 0;
  }
});

closeModal.addEventListener("click", () => {
  modal.classList.remove("active");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
  }
});

// ---------------- STARS ----------------

function renderStars(rating = 0) {
  let html = "";

  for (let i = 1; i <= 5; i++) {
    html +=
      i <= rating
        ? `<span class="star active">★</span>`
        : `<span class="star">☆</span>`;
  }

  return html;
}

// ---------------- RENDER PRODUCTS ----------------

function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (!products.length) {
    productsContainer.innerHTML = `
      <p class="empty">
        Товары не найдены
      </p>
    `;
    return;
  }

  products.forEach((product) => {
    productsContainer.innerHTML += `
      <div class="product-card">

        <img src="${product.image}" alt="${product.title}">

        <div class="product-info">

          <span class="product-category">
            ${product.subCategory}
          </span>

          <h3>${product.title}</h3>

          <p>${product.description}</p>

          <div class="rating">

            <div class="stars">
              ${renderStars(product.rating)}
            </div>

            <span>${product.rating ?? 0}</span>

            <span>
              (${product.reviews ?? 0} отзывов)
            </span>

          </div>

          <div class="price">
            ${product.price} сом
          </div>

        </div>

      </div>
    `;
  });
}