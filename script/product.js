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
// 상품/악세사리 목록 페이지가 같은 JS를 쓰기 때문에 현재 페이지에 맞는 설정을 먼저 구합니다.
// product-grid가 있으면 상품 페이지, accessory-grid가 있으면 악세사리 페이지로 판단합니다.
const pageSettings = getListingPageSettings();
let listingCards = [];
let compareInputs = [];
let catalogSpecs = {};

/** 1. 페이지 설정: 상품/액세서리 페이지별 DOM 요소 및 설정값 구분 */
function getListingPageSettings() {
  const productGrid = document.getElementById("product-grid");
  const accessoryGrid = document.getElementById("accessory-grid");

  if (productGrid) {
    // 상품 목록 페이지에서 사용할 DOM, 카테고리, 카드 클래스 이름을 한곳에 모아둡니다.
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
    // 악세사리 목록 페이지도 같은 렌더링/필터 함수를 쓰되 DOM id와 카테고리만 다르게 설정합니다.
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

  // 악세사리 페이지처럼 HTML에 결과 없음 문구가 없는 경우 JS에서 직접 만들어 붙입니다.
  const message = document.createElement("p");
  message.className = "no-results";
  message.textContent = pageSettings.noResultsText;
  message.style.display = "none";

  pageSettings.grid.insertAdjacentElement("afterend", message);
  pageSettings.noResults = message;
}

/** 3. 데이터 및 렌더링 로직 */
function getVisibleEntries(products) {
  // 현재 페이지 카테고리에 맞는 상품만 먼저 걸러냅니다.
  // all 페이지는 allCategories 배열에 들어있는 전체 카테고리를 보여줍니다.
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
  // 필터링할 때 카드 내부 텍스트를 다시 찾지 않도록 category와 filter 값을 data-values에 저장합니다.
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
  // JSON 데이터로 카드 HTML을 만들기 때문에 상품 추가/수정은 category.json 중심으로 관리됩니다.
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
      // 같은 필터 영역에서 여러 옵션을 선택할 수 있어서 domain/filter 구조로 묶어 저장합니다.
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
    // 조건에 맞지 않는 카드는 DOM에서 삭제하지 않고 숨김 처리만 해서 초기화/정렬 때 다시 사용할 수 있습니다.
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
  // 가격순 정렬은 카드에 저장해둔 data-price 값을 기준으로 합니다.
  if (sortVal === "low") cardArray.sort((a, b) => a.dataset.price - b.dataset.price);
  else if (sortVal === "high") cardArray.sort((a, b) => b.dataset.price - a.dataset.price);
  cardArray.forEach(card => pageSettings.grid.appendChild(card));
}

/** 5. 이벤트 핸들러 및 팝업 */
function showMovePopup(messageText, linkText, linkHref) {
  // 장바구니/비교 페이지로 이동할지 묻는 공통 팝업입니다.
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
  // 이미 장바구니에 있으면 제거, 없으면 추가하는 토글 방식입니다.
  if (index !== -1) { cart.splice(index, 1); button.classList.remove("active"); }
  else { cart.push(getCardItem(card)); button.classList.add("active"); }
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

function getCardItem(card) {
  // 장바구니 페이지에서 필요한 최소 상품 정보만 카드 DOM에서 뽑아 localStorage에 저장합니다.
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
  // 필터 체크박스와 정렬 select에 이벤트를 연결합니다.
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
      // 이미 장바구니에 담긴 상품은 새로고침 후에도 active 상태로 표시합니다.
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

  // 비교 페이지에서 표를 만들 수 있도록 상품 기본 정보와 스펙 배열을 함께 저장합니다.
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
          // 비교 페이지 레이아웃이 두 상품 기준이라 2개까지만 선택하게 제한합니다.
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
    // 상품/악세사리 목록과 비교 스펙은 모두 같은 category.json에서 가져옵니다.
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
