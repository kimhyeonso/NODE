// HTML body에 적힌 액세서리 페이지 종류
const PAGE_CATEGORY = document.body.dataset.accessoryCategory || "all";

// 액세서리 상품 데이터
let accessories = [
  { category: "cable", name: "Balanced XLR Cable 1M", image: "image/cable/cable_1.jpg", price: 39000, originalPrice: 49000, filters: { connector: "xlr", purpose: "microphone", length: "1m" } },
  { category: "cable", name: "Premium XLR Cable 3M", image: "image/cable/cable_2.jpg", price: 59000, originalPrice: 69000, filters: { connector: "xlr", purpose: "microphone", length: "3m" } },
  { category: "cable", name: "Studio TRS Cable 3M", image: "image/cable/cable_3.jpg", price: 32000, originalPrice: 39000, filters: { connector: "trs", purpose: "instrument", length: "3m" } },
  { category: "cable", name: "Stereo Audio Cable 1M", image: "image/cable/cable_4.jpg", price: 28000, originalPrice: 35000, filters: { connector: "rca", purpose: "instrument", length: "1m" } },
  { category: "cable", name: "Speaker Cable 5M", image: "image/cable/cable_5.jpg", price: 65000, originalPrice: 79000, filters: { connector: "ts", purpose: "speaker", length: "5m" } },
  { category: "cable", name: "Gold Connector Cable 10M", image: "image/cable/cable_6.jpg", price: 89000, originalPrice: 105000, filters: { connector: "xlr", purpose: "speaker", length: "10m" } },
  { category: "cable", name: "Low Noise Patch Cable 1M", image: "image/cable/cable_8.jpg", price: 24000, originalPrice: 29000, filters: { connector: "ts", purpose: "instrument", length: "1m" } },
  { category: "cable", name: "3.5mm Audio Cable 3M", image: "image/cable/cable_9.png", price: 45000, originalPrice: 55000, filters: { connector: "rca", purpose: "speaker", length: "3m" } },
  { category: "cable", name: "Professional Speaker Cable 10M", image: "image/cable/cable_10.jpg", price: 72000, originalPrice: 85000, filters: { connector: "ts", purpose: "speaker", length: "10m" } },
  { category: "cable", name: "Balanced TRS Cable 5M", image: "image/cable/cable_11.jpg", price: 42000, originalPrice: 52000, filters: { connector: "trs", purpose: "speaker", length: "5m" } },
  { category: "stand", name: "Desktop Monitor Stand", image: "image/stands/stand_1.jpg", price: 89000, originalPrice: 109000, filters: { location: "desktop", load: "small", feature: "angle" } },
  { category: "stand", name: "Isolation Speaker Stand", image: "image/stands/stand_2.webp", price: 129000, originalPrice: 149000, filters: { location: "desktop", load: "small", feature: "isolation" } },
  { category: "stand", name: "Adjustable Studio Stand", image: "image/stands/stand_3.jpg", price: 159000, originalPrice: 185000, filters: { location: "floor", load: "large", feature: "angle" } },
  { category: "stand", name: "Heavy Duty PA Stand", image: "image/stands/stand_4.jpg", price: 119000, originalPrice: 139000, filters: { location: "floor", load: "large", feature: "angle" } },
  { category: "stand", name: "Minimal Floor Stand", image: "image/stands/stand_5.jpg", price: 179000, originalPrice: 205000, filters: { location: "floor", load: "large", feature: "isolation" } },
  { category: "stand", name: "Aluminium Speaker Stand", image: "image/stands/stand_6.jpg", price: 145000, originalPrice: 169000, filters: { location: "floor", load: "large", feature: "angle" } },
  { category: "stand", name: "Compact Tripod Stand", image: "image/stands/stand_7.jpg", price: 98000, originalPrice: 115000, filters: { location: "floor", load: "small", feature: "angle" } },
  { category: "stand", name: "Premium Monitor Base", image: "image/stands/stand_8.jpg", price: 215000, originalPrice: 249000, filters: { location: "desktop", load: "large", feature: "isolation" } },
  { category: "stand", name: "Isolation Monitor Bracket", image: "image/stands/stand_9.jpg", price: 78000, originalPrice: 89000, filters: { location: "desktop", load: "small", feature: "isolation" } },
  { category: "stand", name: "Stage Speaker Pole", image: "image/stands/stand_10.jpg", price: 69000, originalPrice: 82000, filters: { location: "floor", load: "large", feature: "angle" } }
];

const ITEMS_PER_PAGE = 12;
let selectedSort = "featured";
let currentPage = 1;

const grid = document.querySelector("#accessory-grid");
const pagination = document.querySelector("#pagination");
const title = document.querySelector("#accessory-title");
const count = document.querySelector("#accessory-count");
const sortSelect = document.querySelector("#sort-select");
const filterInputs = document.querySelectorAll("#accessory-filters input[type='checkbox']");
const resetFilterButton = document.querySelector("#reset-filter");

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

// 케이블 또는 스탠드 전용 페이지 상품 고르기
function selectPageAccessories() {
  if (PAGE_CATEGORY === "all") {
    return;
  }

  let result = [];

  for (let i = 0; i < accessories.length; i++) {
    if (accessories[i].category === PAGE_CATEGORY) {
      result.push(accessories[i]);
    }
  }

  accessories = result;
}

// 체크된 필터 정리
function getCheckedFilters() {
  let checkedFilters = {};

  for (let i = 0; i < filterInputs.length; i++) {
    let input = filterInputs[i];

    if (input.checked === true) {
      let domain = input.dataset.domain;
      let filterName = input.dataset.filter;

      if (checkedFilters[domain] === undefined) {
        checkedFilters[domain] = {};
      }

      if (checkedFilters[domain][filterName] === undefined) {
        checkedFilters[domain][filterName] = [];
      }

      checkedFilters[domain][filterName].push(input.value);
    }
  }

  return checkedFilters;
}

// 상품이 필터에 맞는지 확인
function checkAccessoryFilter(item, checkedFilters) {
  let domainNames = Object.keys(checkedFilters);

  if (domainNames.length === 0) {
    return true;
  }

  let itemFilters = checkedFilters[item.category];

  if (itemFilters === undefined) {
    return false;
  }

  let filterNames = Object.keys(itemFilters);

  for (let i = 0; i < filterNames.length; i++) {
    let filterName = filterNames[i];
    let selectedValues = itemFilters[filterName];
    let matched = false;

    for (let j = 0; j < selectedValues.length; j++) {
      if (item.filters[filterName] === selectedValues[j]) {
        matched = true;
      }
    }

    if (matched === false) {
      return false;
    }
  }

  return true;
}

// 필터와 정렬 적용
function getVisibleAccessories() {
  let checkedFilters = getCheckedFilters();
  let result = [];

  for (let i = 0; i < accessories.length; i++) {
    if (checkAccessoryFilter(accessories[i], checkedFilters) === true) {
      result.push(accessories[i]);
    }
  }

  if (selectedSort === "low") {
    result.sort(function (a, b) {
      return a.price - b.price;
    });
  }

  if (selectedSort === "high") {
    result.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  return result;
}

// 상품 카드 만들기
function createAccessoryCard(item) {
  let discount = Math.round((1 - item.price / item.originalPrice) * 100);

  return `
    <article class="accessory-card">
      <div class="image-box">
        <!-- 상세페이지가 완성되면 #을 상세페이지 주소로 수정 -->
        <a class="product-link" href="#">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </a>
        <button class="cart-button" type="button" aria-label="장바구니에 담기">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>
            <circle cx="9" cy="20" r="1"></circle>
            <circle cx="17" cy="20" r="1"></circle>
          </svg>
        </button>
      </div>
      <div class="brand">NODE ${item.category.toUpperCase()}</div>
      <h3 class="accessory-name"><a href="#">${item.name}</a></h3>
      <div class="price-row">
        <span class="sale-price">${formatPrice(item.price)}</span>
        <span class="original-price">${formatPrice(item.originalPrice)}</span>
        <span class="discount-rate">${discount}% OFF</span>
      </div>
    </article>
  `;
}

// 페이지 번호 만들기
function renderPagination(totalItems) {
  let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  let html = "";

  for (let i = 1; i <= totalPages; i++) {
    let activeClass = "";

    if (i === currentPage) {
      activeClass = " active";
    }

    html += '<button class="page-button' + activeClass + '" type="button" data-page="' + i + '">' + i + "</button>";
  }

  pagination.innerHTML = html;

  if (totalPages <= 1) {
    pagination.style.display = "none";
  } else {
    pagination.style.display = "flex";
  }

  addPaginationEvents();
}

// 상품 목록 출력
function renderAccessories() {
  let visible = getVisibleAccessories();
  let start = (currentPage - 1) * ITEMS_PER_PAGE;
  let end = start + ITEMS_PER_PAGE;
  let pageItems = visible.slice(start, end);
  let html = "";

  title.textContent = PAGE_CATEGORY.toUpperCase();
  count.textContent = visible.length + " accessories";

  for (let i = 0; i < pageItems.length; i++) {
    html += createAccessoryCard(pageItems[i]);
  }

  if (pageItems.length === 0) {
    html = '<p class="no-results">선택한 조건에 맞는 상품이 없습니다.</p>';
  }

  grid.innerHTML = html;
  renderPagination(visible.length);
  addCartEvents();
}

// 페이지 번호 클릭
function addPaginationEvents() {
  let pageButtons = document.querySelectorAll(".page-button");

  for (let i = 0; i < pageButtons.length; i++) {
    pageButtons[i].addEventListener("click", function () {
      currentPage = Number(this.dataset.page);
      renderAccessories();
      window.scrollTo(0, document.querySelector(".toolbar").offsetTop);
    });
  }
}

// 장바구니 버튼 클릭
function addCartEvents() {
  let cartButtons = document.querySelectorAll(".cart-button");

  for (let i = 0; i < cartButtons.length; i++) {
    cartButtons[i].addEventListener("click", function () {
      this.classList.toggle("active");
    });
  }
}

// 필터 체크 이벤트
for (let i = 0; i < filterInputs.length; i++) {
  filterInputs[i].addEventListener("change", function () {
    currentPage = 1;
    renderAccessories();
  });
}

// 필터 초기화
resetFilterButton.addEventListener("click", function () {
  for (let i = 0; i < filterInputs.length; i++) {
    filterInputs[i].checked = false;
  }

  currentPage = 1;
  renderAccessories();
});

// 가격 정렬
sortSelect.addEventListener("change", function () {
  selectedSort = sortSelect.value;
  currentPage = 1;
  renderAccessories();
});

selectPageAccessories();
renderAccessories();
