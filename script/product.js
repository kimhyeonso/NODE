// 상품 JSON 파일 위치
const DATA_URL = "./js/product-data.json/product-image-data.json/product-image-data.json";

// HTML body에 적힌 페이지 종류
const PAGE_CATEGORY = document.body.dataset.productCategory || "studio";

// 비교페이지 파일명
const COMPARE_PAGE_URL = "./Compare.html";

// JSON을 불러오지 못했을 때 사용할 임시 데이터
const fallbackProducts = [
  { id: "s1_001", title: "홈 스튜디오 엔트리 모니터", url: "image/Studio/studio_1.jpg", filters: { space: "near-field", type: "2-way", sound: "flat", price_range: "under-50" } },
  { id: "s1_002", title: "가성비 베스트 니어필드", url: "image/Studio/studio_2.jpg", filters: { space: "near-field", type: "2-way", sound: "all-rounder", price_range: "under-50" } },
  { id: "s1_003", title: "믹싱 전문 동축 모니터", url: "image/Studio/studio_3.jpg", filters: { space: "near-field", type: "coaxial", sound: "flat", price_range: "100-300" } },
  { id: "s1_004", title: "프로 작업실용 2-Way", url: "image/Studio/studio_4.jpg", filters: { space: "near-field", type: "2-way", sound: "flat", price_range: "100-300" } },
  { id: "s1_005", title: "중급 미드필드 모니터", url: "image/Studio/studio_5.jpg", filters: { space: "mid-field", type: "2-way", sound: "flat", price_range: "300-500" } },
  { id: "s1_006", title: "대역 분리 3-Way 모니터", url: "image/Studio/studio_6.jpg", filters: { space: "mid-field", type: "3-way", sound: "flat", price_range: "over-500" } },
  { id: "s1_007", title: "하이엔드 파필드 메인", url: "image/Studio/studio_7.jpg", filters: { space: "far-field", type: "3-way", sound: "flat", price_range: "over-500" } },
  { id: "s1_008", title: "비트메이킹용 저음 강조형", url: "image/Studio/studio_8.jpg", filters: { space: "near-field", type: "2-way", sound: "bass-heavy", price_range: "50-100" } },
  { id: "l_001", title: "배터리형 버스킹 앰프 세트", url: "image/stage/stage_1.jpg", filters: { purpose: "portable", scale: "small", type: "battery", install: "stand" } },
  { id: "l_002", title: "가성비 소규모 PA 스피커", url: "image/stage/stage_2.jpg", filters: { purpose: "portable", scale: "small", type: "active", install: "stand" } },
  { id: "l_003", title: "라이브 카페용 12인치 메인", url: "image/stage/stage_3.jpg", filters: { purpose: "main", scale: "medium", type: "active", install: "stand" } },
  { id: "l_004", title: "고출력 서브우퍼 시스템", url: "image/stage/stage_5.jpg", filters: { purpose: "main", scale: "medium", type: "passive", install: "flying" } },
  { id: "l_005", title: "프로 스테이지 웨지 모니터", url: "image/stage/stage_5.jpg", filters: { purpose: "wedge", scale: "medium", type: "active", install: "floor" } },
  { id: "l_006", title: "교회/강당용 매립형 스피커", url: "image/stage/stage_6.jpg", filters: { purpose: "main", scale: "medium", type: "passive", install: "ceiling" } },
  { id: "l_007", title: "대규모 페스티벌 메인 스피커", url: "image/stage/stage_7.webp", filters: { purpose: "main", scale: "large", type: "passive", install: "flying" } },
  { id: "l_008", title: "컴팩트 웨지 모니터링 스피커", url: "image/stage/stage_8.jpg", filters: { purpose: "wedge", scale: "small", type: "active", install: "floor" } }
];

// 스튜디오 가격
const studioPrices = {
  "under-50": 390000,
  "50-100": 790000,
  "100-300": 1890000,
  "300-500": 3890000,
  "over-500": 6490000
};

// 라이브 가격
const livePrices = [620000, 790000, 1180000, 1490000, 980000, 1560000, 3290000, 720000];

// 한 페이지에 보여줄 개수
const ITEMS_PER_PAGE = 12;

let products = [];
let selectedSort = "featured";
let currentPage = 1;

const grid = document.querySelector("#product-grid");
const pagination = document.querySelector("#pagination");
const title = document.querySelector("#product-title");
const count = document.querySelector("#product-count");
const sortSelect = document.querySelector("#sort-select");
const filterInputs = document.querySelectorAll("#product-filters input[type='checkbox']");
const resetFilterButton = document.querySelector("#reset-filter");

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

// JSON 데이터를 화면에서 사용할 모양으로 변경
function makeProductData(data) {
  let result = [];
  let liveIndex = 0;

  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    let category = "live";
    let basePrice;

    if (item.id.indexOf("s") === 0) {
      category = "studio";
      basePrice = studioPrices[item.filters.price_range] || 890000;
    } else {
      basePrice = livePrices[liveIndex] || 990000;
      liveIndex++;
    }

    let price = basePrice;
    if (i % 2 === 1) {
      price = price + 90000;
    }

    let newProduct = {
      id: item.id,
      category: category,
      name: item.title,
      image: item.url,
      filters: item.filters,
      price: price,
      originalPrice: Math.ceil((price * 1.2) / 10000) * 10000
    };

    result.push(newProduct);
  }

  return result;
}

// 현재 페이지에 맞는 상품만 남기기
function selectPageProducts(data) {
  if (PAGE_CATEGORY === "all") {
    return data;
  }

  let result = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].category === PAGE_CATEGORY) {
      result.push(data[i]);
    }
  }

  return result;
}

// JSON 파일 불러오기
function loadProducts() {
  fetch(DATA_URL)
    .then(function (response) {
      if (response.ok === false) {
        throw new Error("상품 데이터 오류");
      }
      return response.json();
    })
    .then(function (data) {
      products = selectPageProducts(makeProductData(data));
      renderProducts();
    })
    .catch(function () {
      products = selectPageProducts(makeProductData(fallbackProducts));
      renderProducts();
    });
}

// 체크된 필터를 항목별로 정리
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

// 상품이 선택한 필터에 맞는지 확인
function checkProductFilter(product, checkedFilters) {
  let domainNames = Object.keys(checkedFilters);

  if (domainNames.length === 0) {
    return true;
  }

  let productFilters = checkedFilters[product.category];

  if (productFilters === undefined) {
    return false;
  }

  let filterNames = Object.keys(productFilters);

  for (let i = 0; i < filterNames.length; i++) {
    let filterName = filterNames[i];
    let selectedValues = productFilters[filterName];
    let matched = false;

    for (let j = 0; j < selectedValues.length; j++) {
      if (product.filters[filterName] === selectedValues[j]) {
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
function getFilteredProducts() {
  let checkedFilters = getCheckedFilters();
  let result = [];

  for (let i = 0; i < products.length; i++) {
    if (checkProductFilter(products[i], checkedFilters) === true) {
      result.push(products[i]);
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

// 상품 카드 HTML 만들기
function createProductCard(product) {
  let discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return `
    <article class="product-card">
      <div class="image-box">
        <!-- 상세페이지가 완성되면 #을 상세페이지 주소로 수정 -->
        <a class="product-link" href="#">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </a>
        <button class="cart-button" type="button" aria-label="장바구니에 담기">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>
            <circle cx="9" cy="20" r="1"></circle>
            <circle cx="17" cy="20" r="1"></circle>
          </svg>
        </button>
        <label class="compare-check">
          <input type="checkbox" class="compare-input" value="${product.id}">
          <span>비교</span>
        </label>
      </div>
      <div class="brand">NODE ${product.category.toUpperCase()}</div>
      <h3 class="product-name"><a href="#">${product.name}</a></h3>
      <div class="colors">
        <span class="color-swatch" style="background:#f2f0e9"></span>
        <span class="color-swatch" style="background:#202020"></span>
      </div>
      <div class="price-row">
        <span class="sale-price">${formatPrice(product.price)}</span>
        <span class="original-price">${formatPrice(product.originalPrice)}</span>
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
function renderProducts() {
  let filteredProducts = getFilteredProducts();
  let start = (currentPage - 1) * ITEMS_PER_PAGE;
  let end = start + ITEMS_PER_PAGE;
  let visibleProducts = filteredProducts.slice(start, end);
  let html = "";

  title.textContent = PAGE_CATEGORY.toUpperCase();
  count.textContent = filteredProducts.length + " products";

  for (let i = 0; i < visibleProducts.length; i++) {
    html += createProductCard(visibleProducts[i]);
  }

  if (visibleProducts.length === 0) {
    html = '<p class="no-results">선택한 조건에 맞는 상품이 없습니다.</p>';
  }

  grid.innerHTML = html;
  renderPagination(filteredProducts.length);
  addCardEvents();
}

// 페이지 번호 클릭 이벤트
function addPaginationEvents() {
  let pageButtons = document.querySelectorAll(".page-button");

  for (let i = 0; i < pageButtons.length; i++) {
    pageButtons[i].addEventListener("click", function () {
      currentPage = Number(this.dataset.page);
      renderProducts();
      window.scrollTo(0, document.querySelector(".filter-toolbar").offsetTop);
    });
  }
}

// 장바구니와 비교 체크 이벤트
function addCardEvents() {
  let cartButtons = document.querySelectorAll(".cart-button");
  let compareInputs = document.querySelectorAll(".compare-input");

  for (let i = 0; i < cartButtons.length; i++) {
    cartButtons[i].addEventListener("click", function () {
      this.classList.toggle("active");
    });
  }

  for (let i = 0; i < compareInputs.length; i++) {
    compareInputs[i].addEventListener("change", function () {
      checkCompareCount(this);
    });
  }
}

// 비교 상품 개수 확인
function checkCompareCount(clickedInput) {
  let selectedInputs = document.querySelectorAll(".compare-input:checked");

  if (selectedInputs.length > 2) {
    clickedInput.checked = false;
    alert("상품은 2개까지만 비교할 수 있어요.");
    return;
  }

  if (selectedInputs.length === 2) {
    let productIds = [];

    for (let i = 0; i < selectedInputs.length; i++) {
      productIds.push(selectedInputs[i].value);
    }

    showComparePopup(productIds);
  }
}

// 비교 안내창
function showComparePopup(productIds) {
  let oldPopup = document.querySelector(".compare-popup");

  if (oldPopup) {
    oldPopup.remove();
  }

  let popup = document.createElement("div");
  popup.className = "compare-popup";
  popup.innerHTML = `
    <div class="compare-popup-box">
      <strong>선택한 두 상품을 비교하시겠어요?</strong>
      <div class="compare-popup-actions">
        <button class="compare-cancel" type="button">계속 보기</button>
        <a class="compare-go" href="${COMPARE_PAGE_URL}?items=${productIds.join(",")}">비교하기</a>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  document.querySelector(".compare-cancel").addEventListener("click", function () {
    popup.remove();
  });
}

// 필터 체크 이벤트
for (let i = 0; i < filterInputs.length; i++) {
  filterInputs[i].addEventListener("change", function () {
    currentPage = 1;
    renderProducts();
  });
}

// 필터 초기화
resetFilterButton.addEventListener("click", function () {
  for (let i = 0; i < filterInputs.length; i++) {
    filterInputs[i].checked = false;
  }

  currentPage = 1;
  renderProducts();
});

// 가격 정렬
sortSelect.addEventListener("change", function () {
  selectedSort = sortSelect.value;
  currentPage = 1;
  renderProducts();
});

loadProducts();
