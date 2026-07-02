// 비교하기 팝업

(function setupVsPopup() {
  let popup = document.querySelector(".vspopup");

  if (!popup) {
    popup = document.createElement("div");
    popup.className = "vspopup";
    popup.innerHTML =
      `<div class="vstext">
        <p>COMPARE PRODUCTS</p>
        <h3>상품을 두개 골라 <br> 차이점을 한눈에 확인하세요!</h3>
        <p>오른쪽 상단의 <strong style="color: #C28E47;">체크 버튼</strong>을 클릭하면 <br> 비교 목록에 추가 됩니다</p>
      </div>
      <div class="vsimg"><img src="./image/popup/vspopup-01.png" alt="팝업 이미지"></div>
      <div class="vsexplain">
        <img src="./image/popup/vspopup-02-02.png" alt="팝업 이미지2">
        <div class="vsbox">
          <span>최대 2개까지 선택하여 <br> 제품을 비교할 수 있습니다</span>
          <p>선택 완료 후 <strong style="color: #C28E47;">[비교하기]</strong>버튼이 활성화 됩니다</p>
        </div>
      </div>
      <div class="button">직접 비교해보세요 -></div>
      <div class="closeBtn">
        <input type="checkbox" id="today"><label for="today">오늘 하루 보지 않기</label>
        <p class="close">닫기</p>
      </div>`;
    document.body.insertBefore(popup, document.body.firstChild);
  }

  const cookieName = "vspopupClosed";
  const todayCheck = popup.querySelector("#today");
  const closeButton = popup.querySelector(".closeBtn .close, .closeBtn p");
  const guideButton = popup.querySelector(".button");

  function setVsCookie(name, value, day) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  }

  function getVsCookie(name) {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.split("=")[0] === name) {
        return cookie.split("=")[1];
      }
    }

    return "";
  }

  function closeVsPopup() {
    if (todayCheck && todayCheck.checked) {
      setVsCookie(cookieName, "close", 1);
    }

    popup.style.display = "none";
    document.body.classList.remove("vspopup-visible");
  }

  function showVsPopup() {
    popup.style.display = "";
    document.body.classList.add("vspopup-visible");
  }

  if (getVsCookie(cookieName) === "close") {
    popup.style.display = "none";
    document.body.classList.remove("vspopup-visible");
  } else {
    showVsPopup();
  }

  if (closeButton) {
    closeButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      closeVsPopup();
    });
  }

  if (guideButton) {
    guideButton.addEventListener("click", () => {
      const target = document.querySelector("#accessory-grid, #product-grid");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.href = "./product-main.html";
      }
      closeVsPopup();
    });
  }
})();




/**
 * [상품 및 액세서리 리스트 페이지 공통 스크립트]
 * 이 스크립트는 상품 리스트와 액세서리 리스트 페이지에서 공통으로 사용됩니다.
 *
 * 핵심 흐름
 * 1. 현재 HTML이 상품 페이지인지 액세서리 페이지인지 판단합니다.
 * 2. category.json에서 상품 데이터를 불러옵니다.
 * 3. 현재 페이지 카테고리에 맞는 카드만 생성합니다.
 * 4. 필터/정렬/장바구니/비교 기능을 연결합니다.
 * 5. 스크롤 시 카드가 자연스럽게 나타나도록 애니메이션을 붙입니다.
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
  // 같은 product.js를 여러 목록 페이지에서 쓰기 위해, 페이지에 존재하는 grid id로 화면 종류를 구분합니다.
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

// 숫자 가격을 화면 표시용 문자열로 바꿉니다. 예: 128000 -> 128,000원
function formatPrice(price) { return Number(price).toLocaleString("ko-KR") + "원"; }

// 상품 상세 페이지는 URL query string의 id로 상품을 구분합니다.
function getDetailUrl(productId) { return "./product-detail.html?id=" + encodeURIComponent(productId); }

function ensureNoResultsMessage() {
  // product-main.html에는 noResults 요소가 있고, accessory 쪽에는 없을 수 있어서 없는 경우만 생성합니다.
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
  // products는 { 상품ID: 상품객체 } 구조이므로 Object.entries로 id와 상품 정보를 함께 다룹니다.
  return Object.entries(products).filter(([, product]) => {
    if (pageSettings.pageCategory === "all") return pageSettings.allCategories.includes(product.category);
    return product.category === pageSettings.pageCategory;
  });
}

function createListingCard(productId, product) {
  // JSON 상품 데이터 하나를 실제 화면에 들어갈 article 카드 하나로 변환합니다.
  const card = document.createElement("article");

  // category와 filters를 합쳐 data-values에 저장해두면 필터링할 때 DOM 텍스트를 매번 읽지 않아도 됩니다.
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

  // 현재 페이지에서 보여줄 상품만 추린 뒤 grid 안을 비우고 새 카드들을 채웁니다.
  const entries = getVisibleEntries(products);
  pageSettings.grid.textContent = "";

  // JSON 데이터로 카드 HTML을 만들기 때문에 상품 추가/수정은 category.json 중심으로 관리됩니다.
  entries.forEach(([id, product]) => pageSettings.grid.appendChild(createListingCard(id, product)));

  // 렌더링 후 만들어진 카드/비교 체크박스를 배열로 다시 잡아 이후 기능에서 공통으로 사용합니다.
  listingCards = Array.from(document.querySelectorAll("." + pageSettings.cardClass));
  compareInputs = Array.from(document.querySelectorAll(".compare-check input"));
  observeListingCards();
}

/** 4. 필터 및 정렬 로직 */
function getSelectedFilters() {
  // 선택된 체크박스를 domain/filter 그룹 구조로 정리합니다.
  // 예: { studio: { type: ["monitor"], feature: ["wireless"] } }
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
  // 카드가 가진 data-values와 현재 선택된 필터 조건을 비교해 표시 여부를 반환합니다.
  const cardValues = card.dataset.values.split(/\s+/);
  const filterDomains = Object.keys(selectedFilters);
  if (filterDomains.length === 0) return true;

  return filterDomains.some(domain => {
    // 선택된 domain 자체가 카드에 없으면 해당 domain 조건은 실패입니다.
    if (!cardValues.includes(domain)) return false;
    const domainFilters = selectedFilters[domain];

    // 같은 domain 안에서는 각 필터 그룹을 모두 만족해야 합니다.
    // 단, 한 그룹 안의 여러 선택지는 하나만 맞아도 통과합니다.
    return Object.keys(domainFilters).every(group => 
      domainFilters[group].some(val => cardValues.includes(val))
    );
  });
}

function filterListings() {
  ensureNoResultsMessage();
  const selectedFilters = getSelectedFilters();
  let visibleCount = 0;

  // 현재 DOM에 있는 카드들을 순회하면서 조건에 맞는 카드만 display:grid로 보여줍니다.
  listingCards.forEach(card => {
    // 조건에 맞지 않는 카드는 DOM에서 삭제하지 않고 숨김 처리만 해서 초기화/정렬 때 다시 사용할 수 있습니다.
    const isVisible = checkListingCard(card, selectedFilters);
    card.style.display = isVisible ? "grid" : "none";
    if (isVisible) visibleCount++;
  });

  // 필터 결과 개수와 결과 없음 문구를 화면 상태에 맞춰 갱신합니다.
  if (pageSettings.count) pageSettings.count.textContent = `${visibleCount} ${pageSettings.countLabel}`;
  if (pageSettings.noResults) {
    pageSettings.noResults.classList.add("no-results");
    pageSettings.noResults.textContent = pageSettings.noResultsText;
    pageSettings.noResults.style.display = visibleCount === 0 ? "block" : "none";
  }
}

function sortListings() {
  if (!pageSettings.sortSelect) return;

  // DOM 노드를 배열로 복사해서 정렬한 뒤, grid에 다시 append하면 화면 순서가 바뀝니다.
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
  // 같은 팝업이 여러 번 뜨지 않도록 이미 있으면 바로 종료합니다.
  if (document.querySelector(".compare-popup")) return;
  const popup = document.createElement("div");
  popup.className = "compare-popup";
  popup.innerHTML = `<div class="compare-popup-box"><strong>${messageText}</strong><div class="compare-popup-actions"><button class="compare-cancel" type="button">계속 보기</button><a class="compare-go" href="${linkHref}">${linkText}</a></div></div>`;
  document.body.appendChild(popup);
  popup.querySelector(".compare-cancel").onclick = () => popup.remove();
  popup.onclick = (e) => { if (e.target === popup) popup.remove(); };

  const goLink = popup.querySelector(".compare-go");
  goLink.addEventListener("click", () => {
    // 비교 페이지로 이동할 때는 선택한 2개 상품을 유지해야 하므로 pagehide 초기화를 잠시 막습니다.
    if (linkHref.includes("compare.html")) {
      sessionStorage.setItem("preserveCompareSelection", "1");
    }
  });
}

function toggleCartItem(button) {
  // 클릭한 장바구니 버튼이 속한 카드에서 상품 정보를 찾아 localStorage cartItems를 갱신합니다.
  const card = button.closest("." + pageSettings.cardClass);
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const index = cart.findIndex(i => i.id === card.dataset.productId);

  // 이미 장바구니에 있으면 제거, 없으면 추가하는 토글 방식입니다.
  if (index !== -1) { cart.splice(index, 1); button.classList.remove("active"); }
  else { cart.push(getCardItem(card)); button.classList.add("active"); }
  localStorage.setItem("cartItems", JSON.stringify(cart));

  // 공통 헤더에 장바구니 개수 배지가 있으면 즉시 갱신합니다.
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }
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
      // 정렬 후에도 현재 선택된 필터 상태를 다시 적용해야 숨김/표시 상태가 유지됩니다.
      sortListings();
      filterListings();
    });
  }

  if (pageSettings.resetButton) {
    pageSettings.resetButton.addEventListener("click", () => {
      // 필터 초기화 버튼은 체크박스, 정렬값, 화면 표시 상태를 모두 기본값으로 되돌립니다.
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

  // 각 카드의 장바구니 버튼에 클릭 이벤트를 연결합니다.
  listingCards.forEach(card => {
    const button = card.querySelector(".cart-button");
    if (!button) return;

    if (cart.some(item => item.id === card.dataset.productId)) {
      // 이미 장바구니에 담긴 상품은 새로고침 후에도 active 상태로 표시합니다.
      button.classList.add("active");
    }

    button.addEventListener("click", event => {
      // 버튼 클릭이 상세페이지 링크 클릭으로 번지지 않게 막습니다.
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

function clearCompareSelectionState() {
  // 비교 선택 상태를 localStorage와 현재 화면에서 모두 지웁니다.
  localStorage.removeItem("compareItems");

  document.querySelectorAll("." + pageSettings.cardClass).forEach(card => {
    card.classList.remove("compare-selected");
    const input = card.querySelector(".compare-check input");
    if (input) input.checked = false;
  });
}

function setupCompareInputs() {
  // 새로고침 후에도 localStorage에 남아 있는 비교 선택 상태를 카드 체크박스에 반영합니다.
  let compareItems = JSON.parse(localStorage.getItem("compareItems")) || [];

  compareInputs.forEach(input => {
    const card = input.closest("." + pageSettings.cardClass);
    if (!card) return;

    const isSelected = compareItems.some(item => item.id === card.dataset.productId);
    input.checked = isSelected;
    card.classList.toggle("compare-selected", isSelected);

    input.addEventListener("change", () => {
      // 다른 탭/이전 동작에서 compareItems가 바뀌었을 수 있어 change 시점에 다시 읽습니다.
      compareItems = JSON.parse(localStorage.getItem("compareItems")) || [];
      const productId = card.dataset.productId;

      if (input.checked) {
        // 같은 상품이 중복 저장되지 않도록 먼저 확인합니다.
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

        // 비교 상품 2개가 채워지면 비교 페이지 이동 팝업을 띄웁니다.
        if (compareItems.length === 2) {
          showMovePopup("비교 페이지로 이동할까요?", "비교하기", "./compare.html");
        }
      } else {
        // 체크를 해제하면 localStorage와 카드 스타일에서도 선택 상태를 제거합니다.
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

  // 데이터가 도착하기 전까지 grid 영역에 로딩 문구를 보여줍니다.
  pageSettings.grid.textContent = pageSettings.loadingText;
  try {
    // 상품/악세사리 목록과 비교 스펙은 모두 같은 category.json에서 가져옵니다.
    const res = await fetch("./js/catalog/category.json");
    const data = await res.json();
    catalogSpecs = data.specifications || {};

    // 데이터 렌더링이 끝난 뒤에 이벤트를 연결해야 동적으로 생성된 카드 버튼을 찾을 수 있습니다.
    renderListingCards(data.products || {});
    setupFilterAndSort();
    setupCartButtons();
    setupCompareInputs();
    sortListings();
    filterListings();
  } catch (err) {
    // fetch 실패나 JSON 구조 문제가 생기면 사용자에게 에러 문구를 보여주고 콘솔에도 남깁니다.
    pageSettings.grid.innerHTML = `<p class="no-results">${pageSettings.errorText}</p>`;
    console.error(err);
  }
}

initListingPage();






window.addEventListener("pagehide", () => {
  // 비교 페이지로 이동하는 경우에는 선택 상품이 필요하므로 초기화하지 않습니다.
  const preserve = sessionStorage.getItem("preserveCompareSelection");
  if (preserve === "1") {
    sessionStorage.removeItem("preserveCompareSelection");
    return;
  }

  const compareItems = JSON.parse(localStorage.getItem("compareItems")) || [];
  if (compareItems.length > 0) {
    // 일반 페이지 이탈/새로고침 때는 비교 선택이 다음 방문에 남지 않도록 정리합니다.
    localStorage.removeItem("compareItems");
    document.querySelectorAll("." + pageSettings.cardClass).forEach(card => {
      card.classList.remove("compare-selected");
      const input = card.querySelector(".compare-check input");
      if (input) input.checked = false;
    });
  }
});

// 스크롤 애니메이션 함수
function observeListingCards() {
  if (!listingCards.length) return;

  // IntersectionObserver를 지원하지 않는 브라우저에서는 애니메이션 대기 없이 바로 표시합니다.
  if (!("IntersectionObserver" in window)) {
    listingCards.forEach(card => card.classList.add("fade-in"));
    return;
  }

  // 카드가 viewport에 10% 이상 들어오면 fade-in 클래스를 붙이고 관찰을 종료합니다.
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  listingCards.forEach(card => observer.observe(card));
}
