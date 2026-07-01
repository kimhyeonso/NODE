/**
 * [상품 및 액세서리 리스트 페이지 공통 스크립트]
 * 이 스크립트는 상품 리스트와 액세서리 리스트 페이지에서 공통으로 사용됩니다.
 */

// 장바구니 아이콘 SVG (공통 UI 요소)
const CART_ICON =
  '<svg aria-hidden="true" viewBox="0 0 24 24">' +
  '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
  '<circle cx="9" cy="20" r="1"></circle>' +
  '<circle cx="17" cy="20" r="1"></circle>' +
  "</svg>";

// 페이지 환경 설정 및 상태 변수
const pageSettings = getListingPageSettings();
let listingCards = [];
let compareInputs = [];
let catalogSpecs = {};

/** 1. 페이지 설정: 상품/액세서리 페이지별 DOM 요소 및 설정값 구분 */
function getListingPageSettings() {
  const productGrid = document.getElementById("product-grid");
  const accessoryGrid = document.getElementById("accessory-grid");

  if (productGrid) {
    return {
      grid: productGrid,
      noResults: document.getElementById("no-products-msg"),
      filters: document.querySelectorAll("#product-filters input"),
      sortSelect: document.getElementById("sort-select"),
      resetButton: document.getElementById("reset-filter"),
      count: document.getElementById("product-count"),
      pageCategory: document.body.dataset.productCategory || "all",
      allCategories: ["studio", "live"],
      cardClass: "product-card",
      nameClass: "product-name",
      countLabel: "products",
      noResultsText: "카테고리에 해당 제품이 없습니다.",
      loadingText: "상품을 불러오는 중입니다.",
      errorText: "상품 정보를 불러오지 못했습니다."
    };
  }

  if (accessoryGrid) {
    return {
      grid: accessoryGrid,
      noResults: null,
      filters: document.querySelectorAll("#accessory-filters input"),
      sortSelect: document.getElementById("sort-select"),
      resetButton: document.getElementById("reset-filter"),
      count: document.getElementById("accessory-count"),
      pageCategory: document.body.dataset.accessoryCategory || "all",
      allCategories: ["cable", "stand"],
      cardClass: "accessory-card",
      nameClass: "accessory-name",
      countLabel: "accessories",
      noResultsText: "카테고리에 해당 제품이 없습니다.",
      loadingText: "액세서리를 불러오는 중입니다.",
      errorText: "액세서리 정보를 불러오지 못했습니다."
    };
  }
  return null;
}

/** 2. 유틸리티 함수 */
function formatPrice(price) { return Number(price).toLocaleString("ko-KR") + "원"; }
function getDetailUrl(productId) { return "./product-detail.html?id=" + encodeURIComponent(productId); }

function ensureNoResultsMessage() {
  if (!pageSettings || pageSettings.noResults) return;

  const message = document.createElement("p");
  message.className = "no-results";
  message.textContent = pageSettings.noResultsText;
  message.style.display = "none";

  pageSettings.grid.insertAdjacentElement("afterend", message);
  pageSettings.noResults = message;
}

/** 3. 데이터 및 렌더링 로직 */
function getVisibleEntries(products) {
  return Object.entries(products).filter(([, product]) => {
    if (pageSettings.pageCategory === "all") return pageSettings.allCategories.includes(product.category);
    return product.category === pageSettings.pageCategory;
  });
}

function createListingCard(productId, product) {
  const card = document.createElement("article");
  const filterValues = [product.category].concat(product.filters || []);
  const detailUrl = getDetailUrl(productId);

  card.className = pageSettings.cardClass;
  card.dataset.productId = productId;
  card.dataset.price = product.price;
  card.dataset.values = filterValues.join(" ");

  card.innerHTML =
    `<div class="image-box">
      <a class="product-link" href="${detailUrl}" aria-label="${product.name} 상세페이지 보기">
        <img src="${product.images[0]}" alt="${product.name}">
      </a>
      <button class="cart-button" type="button" aria-label="장바구니에 담기">${CART_ICON}</button>
      <label class="compare-check" aria-label="비교 상품 선택"><input type="checkbox"></label>
    </div>
    <div class="brand">${product.brand}</div>
    <h3 class="${pageSettings.nameClass}"><a href="${detailUrl}">${product.name}</a></h3>
    <div class="price-row">
      <span class="sale-price">${formatPrice(product.price)}</span>
      <span class="original-price">${formatPrice(product.originalPrice)}</span>
    </div>`;
  return card;
}

function renderListingCards(products) {
  ensureNoResultsMessage();
  const entries = getVisibleEntries(products);
  pageSettings.grid.textContent = "";
  entries.forEach(([id, product]) => pageSettings.grid.appendChild(createListingCard(id, product)));
  listingCards = Array.from(document.querySelectorAll("." + pageSettings.cardClass));
  compareInputs = Array.from(document.querySelectorAll(".compare-check input"));
}

/** 4. 필터 및 정렬 로직 */
function getSelectedFilters() {
  let selectedFilters = {};
  pageSettings.filters.forEach(input => {
    if (input.checked) {
      const { domain, filter } = input.dataset;
      if (!selectedFilters[domain]) selectedFilters[domain] = {};
      if (!selectedFilters[domain][filter]) selectedFilters[domain][filter] = [];
      selectedFilters[domain][filter].push(input.value);
    }
  });
  return selectedFilters;
}

function checkListingCard(card, selectedFilters) {
  const cardValues = card.dataset.values.split(/\s+/);
  const filterDomains = Object.keys(selectedFilters);
  if (filterDomains.length === 0) return true;

  return filterDomains.some(domain => {
    if (!cardValues.includes(domain)) return false;
    const domainFilters = selectedFilters[domain];
    return Object.keys(domainFilters).every(group => 
      domainFilters[group].some(val => cardValues.includes(val))
    );
  });
}

function filterListings() {
  ensureNoResultsMessage();
  const selectedFilters = getSelectedFilters();
  let visibleCount = 0;
  listingCards.forEach(card => {
    const isVisible = checkListingCard(card, selectedFilters);
    card.style.display = isVisible ? "grid" : "none";
    if (isVisible) visibleCount++;
  });
  if (pageSettings.count) pageSettings.count.textContent = `${visibleCount} ${pageSettings.countLabel}`;
  if (pageSettings.noResults) {
    pageSettings.noResults.classList.add("no-results");
    pageSettings.noResults.textContent = pageSettings.noResultsText;
    pageSettings.noResults.style.display = visibleCount === 0 ? "block" : "none";
  }
}

function sortListings() {
  let cardArray = [...listingCards];
  const sortVal = pageSettings.sortSelect.value;
  if (sortVal === "low") cardArray.sort((a, b) => a.dataset.price - b.dataset.price);
  else if (sortVal === "high") cardArray.sort((a, b) => b.dataset.price - a.dataset.price);
  cardArray.forEach(card => pageSettings.grid.appendChild(card));
}

/** 5. 이벤트 핸들러 및 팝업 */
function showMovePopup(messageText, linkText, linkHref) {
  if (document.querySelector(".compare-popup")) return;
  const popup = document.createElement("div");
  popup.className = "compare-popup";
  popup.innerHTML = `<div class="compare-popup-box"><strong>${messageText}</strong><div class="compare-popup-actions"><button class="compare-cancel" type="button">계속 보기</button><a class="compare-go" href="${linkHref}">${linkText}</a></div></div>`;
  document.body.appendChild(popup);
  popup.querySelector(".compare-cancel").onclick = () => popup.remove();
  popup.onclick = (e) => { if (e.target === popup) popup.remove(); };
}

function toggleCartItem(button) {
  const card = button.closest("." + pageSettings.cardClass);
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const index = cart.findIndex(i => i.id === card.dataset.productId);
  if (index !== -1) { cart.splice(index, 1); button.classList.remove("active"); }
  else { cart.push(getCardItem(card)); button.classList.add("active"); }
  localStorage.setItem("cartItems", JSON.stringify(cart));

  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }
}

function getCardItem(card) {
  return {
    id: card.dataset.productId,
    name: card.querySelector("." + pageSettings.nameClass).textContent.trim(),
    brand: card.querySelector(".brand").textContent.trim(),
    salePrice: Number(card.dataset.price),
    originalPrice: Number(card.querySelector(".original-price").textContent.replace(/[^0-9]/g, "")),
    img: card.querySelector("img").src,
    qty: 1
  };
}

function setupFilterAndSort() {
  pageSettings.filters.forEach(input => {
    input.addEventListener("change", filterListings);
  });

  if (pageSettings.sortSelect) {
    pageSettings.sortSelect.addEventListener("change", () => {
      sortListings();
      filterListings();
    });
  }

  if (pageSettings.resetButton) {
    pageSettings.resetButton.addEventListener("click", () => {
      pageSettings.filters.forEach(input => {
        input.checked = false;
      });
      if (pageSettings.sortSelect) pageSettings.sortSelect.value = "featured";
      sortListings();
      filterListings();
    });
  }
}

function setupCartButtons() {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];

  listingCards.forEach(card => {
    const button = card.querySelector(".cart-button");
    if (!button) return;

    if (cart.some(item => item.id === card.dataset.productId)) {
      button.classList.add("active");
    }

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      toggleCartItem(button);
      if (button.classList.contains("active")) {
        showMovePopup("장바구니에 담겼습니다.", "장바구니 보기", "./shoppingCart.html");
      }
    });
  });
}

function getCompareItem(card) {
  const productId = card.dataset.productId;

  return {
    id: productId,
    name: card.querySelector("." + pageSettings.nameClass).textContent.trim(),
    brand: card.querySelector(".brand").textContent.trim(),
    img: card.querySelector("img").getAttribute("src"),
    price: Number(card.dataset.price),
    originalPrice: Number(card.querySelector(".original-price").textContent.replace(/[^0-9]/g, "")),
    specs: catalogSpecs[productId] || []
  };
}

function setupCompareInputs() {
  let compareItems = JSON.parse(localStorage.getItem("compareItems")) || [];

  compareInputs.forEach(input => {
    const card = input.closest("." + pageSettings.cardClass);
    if (!card) return;

    const isSelected = compareItems.some(item => item.id === card.dataset.productId);
    input.checked = isSelected;
    card.classList.toggle("compare-selected", isSelected);

    input.addEventListener("change", () => {
      compareItems = JSON.parse(localStorage.getItem("compareItems")) || [];
      const productId = card.dataset.productId;

      if (input.checked) {
        const isAlreadySelected = compareItems.some(item => item.id === productId);

        if (!isAlreadySelected && compareItems.length >= 2) {
          input.checked = false;
          card.classList.remove("compare-selected");
          alert("비교 상품은 2개까지만 선택할 수 있습니다.");
          return;
        }

        if (!compareItems.some(item => item.id === productId)) {
          compareItems.push(getCompareItem(card));
        }
        card.classList.add("compare-selected");
        if (compareItems.length === 2) {
          showMovePopup("비교 페이지로 이동할까요?", "비교하기", "./compare.html");
        }
      } else {
        compareItems = compareItems.filter(item => item.id !== productId);
        card.classList.remove("compare-selected");
      }

      localStorage.setItem("compareItems", JSON.stringify(compareItems));
    });
  });
}

/** 6. 초기화 및 실행 */
async function initListingPage() {
  if (!pageSettings) return;
  pageSettings.grid.textContent = pageSettings.loadingText;
  try {
    const res = await fetch("./js/catalog/category.json");
    const data = await res.json();
    catalogSpecs = data.specifications || {};
    renderListingCards(data.products || {});
    setupFilterAndSort();
    setupCartButtons();
    setupCompareInputs();
    sortListings();
    filterListings();
  } catch (err) {
    pageSettings.grid.innerHTML = `<p class="no-results">${pageSettings.errorText}</p>`;
    console.error(err);
  }
}

initListingPage();
