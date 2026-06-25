import { fetchProducts, saveProduct } from "./firebase.js";

const productsContainer = document.querySelector(".products");
const categoryCards = document.querySelectorAll(".category-card");
const subcategoriesBlock = document.querySelector(".subcategories");

let allProducts = [];

// ---------------- ПОДКАТЕГОРИИ ----------------

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

  body: ["Лосьоны", "Кремы для тела", "Скрабы", "Масла"],

  hair: ["Шампуни", "Кондиционеры", "Маски", "Масла"],

  makeup: ["Тональные основы", "Пудры", "Тушь", "Помады"],
};

const categoryMap = {
  face: "Уход за лицом",
  body: "Уход за телом",
  hair: "Волосы",
  makeup: "Макияж",
};

function normalizeString(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function productMatchesCategory(product, categoryKey) {
  const categoryLabel = categoryMap[categoryKey] || "";
  const productCategory = normalizeString(product.category);
  const keyNormalized = normalizeString(categoryKey);
  const labelNormalized = normalizeString(categoryLabel);

  return (
    productCategory === keyNormalized || productCategory === labelNormalized
  );
}

function getProductsByCategory(categoryKey) {
  return allProducts.filter((product) =>
    productMatchesCategory(product, categoryKey),
  );
}

function renderCategorySubcategories(categoryKey) {
  const categoryProducts = getProductsByCategory(categoryKey);
  const subcategorySet = new Set(subcategories[categoryKey] || []);

  categoryProducts.forEach((product) => {
    if (product.subCategory) {
      subcategorySet.add(product.subCategory.trim());
    }
  });

  subcategoriesBlock.innerHTML = "";

  Array.from(subcategorySet).forEach((item) => {
    const button = document.createElement("button");

    button.className = "subcategory-btn";
    button.textContent = item;

    button.addEventListener("click", () => {
      const filtered = allProducts.filter((product) => {
        return (
          productMatchesCategory(product, categoryKey) &&
          normalizeString(product.subCategory) === normalizeString(item)
        );
      });

      renderProducts(filtered);

      document.querySelector("#products")?.scrollIntoView({
        behavior: "smooth",
      });
    });

    subcategoriesBlock.appendChild(button);
  });
}

const STORAGE_KEY = "hold_live_products";

function loadProductsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Не удалось прочитать localStorage", error);
    return null;
  }
}

function saveProductsToStorage(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.warn("Не удалось сохранить в localStorage", error);
  }
}

// ---------------- ЗАГРУЗКА ТОВАРОВ ----------------

async function getProducts() {
  const savedProducts = loadProductsFromStorage();

  if (Array.isArray(savedProducts) && savedProducts.length > 0) {
    allProducts = savedProducts;
    renderProducts(allProducts);
  }

  try {
    const firebaseProducts = await fetchProducts();

    if (Array.isArray(firebaseProducts) && firebaseProducts.length > 0) {
      allProducts = firebaseProducts;
      renderProducts(allProducts);
      saveProductsToStorage(allProducts);
      return;
    }

    if (!savedProducts || savedProducts.length === 0) {
      const response = await fetch("./data/products.json");

      if (!response.ok) {
        throw new Error("Ошибка загрузки JSON");
      }

      const products = await response.json();
      allProducts = products;
      renderProducts(allProducts);
      saveProductsToStorage(allProducts);
    }
  } catch (error) {
    console.log("Firebase load failed:", error);

    if (!savedProducts || savedProducts.length === 0) {
      try {
        const response = await fetch("./data/products.json");

        if (!response.ok) {
          throw new Error("Ошибка загрузки JSON");
        }

        const products = await response.json();
        allProducts = products;
        renderProducts(allProducts);
        saveProductsToStorage(allProducts);
      } catch (fetchError) {
        console.log(fetchError);
      }
    }
  }
}

// ---------------- КАТЕГОРИИ (НЕ ТРОГАЮ) ----------------

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

// ---------------- INIT ----------------

getProducts();

const searchInput = document.querySelector(".search");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = allProducts.filter((product) =>
      product.title.toLowerCase().includes(value),
    );

    renderProducts(filtered);
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
    const subCategoryValue = subCategoryInput.value.trim();

    const newProduct = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      price: priceInput.value.trim(),
      image: imageInput.value.trim(),
      category: categoryLabel,
      subCategory: subCategoryValue,
      rating: 0,
      reviews: 0,
    };

    if (
      !newProduct.title ||
      !newProduct.price ||
      !newProduct.image ||
      !newProduct.subCategory
    ) {
      alert("Заполни все поля");
      return;
    }

    allProducts.push(newProduct);
    saveProductsToStorage(allProducts);

    try {
      await saveProduct(newProduct);
    } catch (error) {
      console.warn("Не удалось сохранить товар в Firebase", error);
    }

    renderProducts(allProducts);

    titleInput.value = "";
    descInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    subCategoryInput.value = "";
  });
}

const footer = document.querySelector(".footer");

let clickCount = 0;
let clickTimer = null;

// модалка
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

function renderStars(rating) {
  const maxStars = 5;
  let starsHtml = "";

  for (let i = 0; i < maxStars; i++) {
    starsHtml +=
      i < rating
        ? '<span class="star active">★</span>'
        : '<span class="star">☆</span>';
  }

  return starsHtml;
}

function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (!products || products.length === 0) {
    productsContainer.innerHTML = "<p>Товары не найдены</p>";
    return;
  }

  products.forEach((product) => {
    const rating = product.rating ?? 0;
    const reviews = product.reviews ?? 0;

    productsContainer.innerHTML += `
      <div class="product-card">
        <img src="${product.image}" alt="${product.title}">

        <div class="product-info">
          <span class="product-category">${product.subCategory}</span>

          <h3>${product.title}</h3>

          <p>${product.description}</p>

          <div class="rating">
            <div class="stars">
              ${renderStars(rating)}
            </div>

            <span>${rating}</span>
            <span>(${reviews} отзывов)</span>
          </div>

          <div class="price">${product.price} сом</div>
        </div>
      </div>
    `;
  });
}
