/* * PRODUCT 페이지 JS
 * 역할 분리:
 * 1. js/catalog/category.json: 제품과 액세서리의 공통 카탈로그 데이터
 * 2. product.js: 데이터 로드, 상품 카드 생성, 필터링, 정렬, 장바구니/비교 기능 관리
 * 3. product-*.html: 상품 카드가 들어갈 자리(#product-grid) 제공
 */

const productGrid = document.getElementById("product-grid");
const noProductsMsg = document.getElementById("no-products-msg");
const filterInputs = document.querySelectorAll("#product-filters input");
const sortSelect = document.getElementById("sort-select");
const resetButton = document.getElementById("reset-filter");
const productCount = document.getElementById("product-count");
const pageCategory = document.body.dataset.productCategory || "all"; // 페이지별 카테고리 설정

let productCards = []; // 화면에 그려진 모든 상품 카드 DOM 배열
let compareInputs = []; // 비교 선택 체크박스 요소 배열
let productSpecs = {}; // 상세 스펙 정보를 담을 객체

// 장바구니 아이콘 (SVG)
const CART_ICON =
  '<svg aria-hidden="true" viewBox="0 0 24 24">' +
  '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
  '<circle cx="9" cy="20" r="1"></circle>' +
  '<circle cx="17" cy="20" r="1"></circle>' +
  "</svg>";

// 가격 천 단위 콤마 추가 함수
function formatPrice(price) {
  return Number(price).toLocaleString("ko-KR") + "원";
}

// 상세 페이지 주소 생성 함수
function getDetailUrl(productId) {
  return "./product-detail.html?id=" + encodeURIComponent(productId);
}

// 현재 페이지 카테고리에 맞는 상품 데이터만 추출
function getVisibleProductEntries(products) {
  return Object.entries(products).filter(function ([, product]) {
    if (pageCategory === "all") {
      return product.category === "studio" || product.category === "live";
    }
    return product.category === pageCategory;
  });
}

// 상품 카드 HTML 동적 생성 함수
function createProductCard(productId, product) {
  const card = document.createElement("article");
  const filterValues = [product.category].concat(product.filters || []);
  const detailUrl = getDetailUrl(productId);

  card.className = "product-card";
  card.dataset.productId = productId;
  card.dataset.price = product.price;
  card.dataset.values = filterValues.join(" "); // 필터링을 위해 값들을 데이터셋에 저장

  card.innerHTML =
    '<div class="image-box">' +
    '<a class="product-link" href="' + detailUrl + '" aria-label="' + product.name + ' 상세페이지 보기">' +
    '<img src="' + product.images[0] + '" alt="' + product.name + '">' +
    "</a>" +
    '<button class="cart-button" type="button" aria-label="장바구니에 담기">' + CART_ICON + "</button>" +
    '<label class="compare-check" aria-label="비교 상품 선택"><input type="checkbox"></label>' +
    "</div>" +
    '<div class="brand">' + product.brand + "</div>" +
    '<h3 class="product-name"><a href="' + detailUrl + '">' + product.name + "</a></h3>" +
    '<div class="price-row">' +
    '<span class="sale-price">' + formatPrice(product.price) + "</span>" +
    '<span class="original-price">' + formatPrice(product.originalPrice) + "</span>" +
    "</div>";

  return card;
}

// 화면에 상품 카드들을 렌더링하는 함수
function renderProductCards(products) {
  const productEntries = getVisibleProductEntries(products);
  productGrid.textContent = "";

  for (let i = 0; i < productEntries.length; i++) {
    const productId = productEntries[i][0];
    const product = productEntries[i][1];
    productGrid.appendChild(createProductCard(productId, product));
  }

  // 카드 생성 후 요소 참조 갱신
  productCards = Array.from(document.querySelectorAll(".product-card"));
  compareInputs = Array.from(document.querySelectorAll(".compare-check input"));
}

// 현재 체크된 필터들을 수집하는 함수
function getSelectedFilters() {
  let selectedFilters = {};

  for (let i = 0; i < filterInputs.length; i++) {
    if (filterInputs[i].checked === true) {
      const filterDomain = filterInputs[i].dataset.domain;
      const filterGroup = filterInputs[i].dataset.filter;

      if (!selectedFilters[filterDomain]) selectedFilters[filterDomain] = {};
      if (!selectedFilters[filterDomain][filterGroup]) selectedFilters[filterDomain][filterGroup] = [];

      selectedFilters[filterDomain][filterGroup].push(filterInputs[i].value);
    }
  }
  return selectedFilters;
}

// 각 카드가 선택된 필터 조건과 일치하는지 확인하는 함수
function checkProductCard(card, selectedFilters) {
  const cardValues = card.dataset.values.split(/\s+/);
  const filterDomains = Object.keys(selectedFilters);

  if (filterDomains.length === 0) return true;

  for (let i = 0; i < filterDomains.length; i++) {
    const filterDomain = filterDomains[i];
    const domainFilters = selectedFilters[filterDomain];
    const filterGroups = Object.keys(domainFilters);

    if (!cardValues.includes(filterDomain)) continue;

    let matchesDomain = true;
    for (let j = 0; j < filterGroups.length; j++) {
      const groupValues = domainFilters[filterGroups[j]];
      let matchesGroup = false;

      for (let k = 0; k < groupValues.length; k++) {
        if (cardValues.includes(groupValues[k])) {
          matchesGroup = true;
          break;
        }
      }
      if (!matchesGroup) { matchesDomain = false; break; }
    }
    if (matchesDomain) return true;
  }
  return false;
}

// 필터 조건에 따라 상품 가시성 조절
function filterProducts() {
  const selectedFilters = getSelectedFilters();
  let visibleCount = 0;

  for (let i = 0; i < productCards.length; i++) {
    // 상품 카드 표시/숨김 로직
    if (checkProductCard(productCards[i], selectedFilters) === true) {
      productCards[i].style.display = "grid";
      visibleCount++;
    } else {
      productCards[i].style.display = "none";
    }
  }

  // 상품 개수 텍스트 업데이트
  productCount.textContent = visibleCount + " products";

  // 메시지 표시 여부 결정
  if (noProductsMsg) {
    noProductsMsg.style.display = (visibleCount === 0) ? "block" : "none";
  }

  // 상품이 하나도 없으면 메시지를 보여주고, 있으면 숨김
  if (visibleCount === 0) {
    noProductsMsg.style.display = "block";
  } else {
    noProductsMsg.style.display = "none";
  }
}

// 가격 기준 정렬 함수
function sortProducts() {
  let cardArray = productCards.slice();

  if (sortSelect.value === "low") {
    cardArray.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
  } else if (sortSelect.value === "high") {
    cardArray.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
  }

  for (let i = 0; i < cardArray.length; i++) {
    productGrid.appendChild(cardArray[i]);
  }
}

// 상품 페이지 이동 여부를 묻는 팝업창
function showMovePopup(messageText, linkText, linkHref) {
  if (document.querySelector(".compare-popup") !== null) return;

  const popup = document.createElement("div");
  popup.className = "compare-popup";
  popup.innerHTML = `
    <div class="compare-popup-box">
      <strong>${messageText}</strong>
      <div class="compare-popup-actions">
        <button class="compare-cancel" type="button">계속 보기</button>
        <a class="compare-go" href="${linkHref}">${linkText}</a>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  popup.querySelector(".compare-cancel").addEventListener("click", () => popup.remove());
  popup.addEventListener("click", (e) => { if (e.target === popup) popup.remove(); });
}

// 토글 방식의 장바구니 로직
function toggleCartItem(button) {
  const card = button.closest(".product-card");
  const productId = card.dataset.productId;

  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const existingIndex = cart.findIndex(item => item.id === productId);

  if (existingIndex !== -1) {
    cart.splice(existingIndex, 1);
    button.classList.remove("active");
  } else {
    const item = {
      id: productId,
      name: card.querySelector(".product-name").textContent.trim(),
      brand: card.querySelector(".brand").textContent.trim(),
      salePrice: Number(card.dataset.price),
      originalPrice: Number(card.querySelector(".original-price").textContent.replace(/[^0-9]/g, "")),
      img: card.querySelector("img").getAttribute("src"),
      qty: 1
    };
    cart.push(item);
    button.classList.add("active");
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));
}

// [교체할 함수 2: 버튼 설정 및 상태 동기화]
function setupCartButtons() {
  const cartButtons = document.querySelectorAll(".cart-button");

  // 페이지 로드 시 기존 장바구니 상태와 버튼 동기화
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  cart.forEach(item => {
    const card = document.querySelector(`.product-card[data-product-id="${item.id}"]`);
    if (card) card.querySelector(".cart-button").classList.add("active");
  });

  cartButtons.forEach(button => {
    button.addEventListener("click", function () {
      toggleCartItem(this);
      if (this.classList.contains("active")) {
        showMovePopup("장바구니에 담겼습니다. 이동할까요?", "이동하기", "./shoppingCart.html");
      }
    });
  });
}

// 비교 상품 선택 데이터 추출
function getCompareItems() {
  return compareInputs.filter(input => input.checked).map(input => {
    const card = input.closest(".product-card");
    return {
      id: card.dataset.productId,
      name: card.querySelector(".product-name").textContent.trim(),
      brand: card.querySelector(".brand").textContent.trim(),
      price: Number(card.dataset.price),
      img: card.querySelector(".image-box img").getAttribute("src"),
      specs: productSpecs[card.dataset.productId] || null
    };
  });
}

// 비교 항목 저장
function saveCompareItems() {
  const compareItems = getCompareItems();
  localStorage.setItem("compareItems", JSON.stringify(compareItems));
  return compareItems;
}

// 비교 체크박스 로직
function setupCompareInputs() {
  compareInputs.forEach(input => {
    input.addEventListener("change", function () {
      const selectedCard = this.closest(".product-card");
      selectedCard.classList.toggle("compare-selected", this.checked);

      const checkedCount = compareInputs.filter(i => i.checked).length;
      if (checkedCount > 2) {
        this.checked = false;
        selectedCard.classList.remove("compare-selected");
        alert("비교 상품은 2개까지만 선택할 수 있습니다.");
        saveCompareItems();
        return;
      }

      const compareItems = saveCompareItems();
      if (compareItems.length === 2) {
        showMovePopup("비교 페이지로 이동할까요?", "비교하기", "./compare.html");
      }
    });
  });
}

// 필터 및 정렬 이벤트 등록
function setupFilterAndSort() {
  filterInputs.forEach(input => input.addEventListener("change", filterProducts));
  sortSelect.addEventListener("change", () => { sortProducts(); filterProducts(); });
  resetButton.addEventListener("click", () => {
    filterInputs.forEach(i => i.checked = false);
    sortSelect.value = "featured";
    sortProducts();
    filterProducts();
  });
}

// 초기화 함수
async function initProductPage() {
  if (!productGrid) return;
  productGrid.textContent = "상품을 불러오는 중입니다.";

  try {
    const response = await fetch("./js/catalog/category.json");
    if (!response.ok) throw new Error("데이터 로드 실패");

    const catalog = await response.json();
    productSpecs = catalog.specifications || {};

    renderProductCards(catalog.products || {});
    setupFilterAndSort();
    setupCartButtons();
    setupCompareInputs();
    sortProducts();
    filterProducts();
  } catch (error) {
    productGrid.innerHTML = '<p class="no-results">상품 정보를 불러오지 못했습니다.</p>';
    console.error(error);
  }
}

initProductPage();
