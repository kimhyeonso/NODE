/*
  PRODUCT 페이지 JS

  1. 체크박스 필터
  2. 가격 정렬
  3. 필터 초기화
  4. 장바구니 버튼
  5. 비교 상품 2개 선택

*/


// 페이지 요소들을 불러옵니다 (DOM 선택)
const productGrid = document.getElementById("product-grid"); // 상품들이 담길 전체 박스
const productCards = document.querySelectorAll(".product-card"); // 각 상품 카드들
const filterInputs = document.querySelectorAll("#product-filters input"); // 카테고리 체크박스들
const sortSelect = document.getElementById("sort-select"); // 가격 정렬 선택창
const resetButton = document.getElementById("reset-filter"); // 초기화 버튼
const productCount = document.getElementById("product-count"); // 상품 개수 표시란

// 상세 페이지로 이동할 링크를 자동으로 생성하는 루프
for (let i = 0; i < productCards.length; i++) {
  const card = productCards[i];
  const productImage = card.querySelector(".image-box img"); // 상품 이미지
  const productName = card.querySelector(".product-name"); // 상품 이름
  const productId = card.getAttribute("data-product-id"); // HTML에서 가져온 상품 고유 ID
  const detailUrl = "./product-detail.html?id=" + encodeURIComponent(productId); // 상세페이지 URL 완성

  // 이미지에 링크 입히기
  let imageLink = document.createElement("a");
  imageLink.className = "product-link";
  imageLink.href = detailUrl;
  imageLink.setAttribute("aria-label", productName.textContent + " 상세페이지 보기");
  productImage.parentElement.insertBefore(imageLink, productImage);
  imageLink.appendChild(productImage);

  // 이름에 링크 입히기
  let nameLink = document.createElement("a");
  nameLink.href = detailUrl;
  nameLink.textContent = productName.textContent;
  productName.textContent = "";
  productName.appendChild(nameLink);
}

// 필터 관련 함수들
// 같은 필터 그룹 안에서는 OR, 같은 상품 영역의 다른 그룹끼리는 AND로 검사합니다.
// ALL 페이지에서 STUDIO와 LIVE 영역을 함께 선택하면 두 영역의 결과를 모두 보여줍니다.
function getSelectedFilters() {
  let selectedFilters = {};

  for (let i = 0; i < filterInputs.length; i++) {
    if (filterInputs[i].checked === true) {
      const filterDomain = filterInputs[i].dataset.domain;
      const filterGroup = filterInputs[i].dataset.filter;

      if (!selectedFilters[filterDomain]) {
        selectedFilters[filterDomain] = {};
      }

      if (!selectedFilters[filterDomain][filterGroup]) {
        selectedFilters[filterDomain][filterGroup] = [];
      }

      selectedFilters[filterDomain][filterGroup].push(filterInputs[i].value);
    }
  }

  return selectedFilters;
}

function checkProductCard(card, selectedFilters) {
  const cardValues = card.getAttribute("data-values").split(/\s+/);
  const filterDomains = Object.keys(selectedFilters);

  if (filterDomains.length === 0) {
    return true;
  }

  for (let i = 0; i < filterDomains.length; i++) {
    const filterDomain = filterDomains[i];
    const domainFilters = selectedFilters[filterDomain];
    const filterGroups = Object.keys(domainFilters);
    const hasDomainTokens = cardValues.includes("studio") || cardValues.includes("live");

    if (hasDomainTokens && !cardValues.includes(filterDomain)) {
      continue;
    }

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

      if (!matchesGroup) {
        matchesDomain = false;
        break;
      }
    }

    if (matchesDomain) {
      return true;
    }
  }

  return false;
}

function filterProducts() { // 조건에 맞는 상품만 화면에 표시
  let selectedFilters = getSelectedFilters();
  let visibleCount = 0;
  for (let i = 0; i < productCards.length; i++) {
    if (checkProductCard(productCards[i], selectedFilters) === true) {
      productCards[i].style.display = "grid"; // 일치하면 보여줌
      visibleCount++;
    } else {
      productCards[i].style.display = "none"; // 불일치하면 숨김
    }
  }
  productCount.textContent = visibleCount + " products"; // 남은 상품 수 표시
}

// 정렬 관련 함수
function sortProducts() { // 가격 오름차순/내림차순 정렬
  let cardArray = [];
  for (let i = 0; i < productCards.length; i++) {
    cardArray.push(productCards[i]);
  }

  if (sortSelect.value === "low") { // 가격 낮은 순 정렬
    cardArray.sort(function (a, b) {
      return Number(a.getAttribute("data-price")) - Number(b.getAttribute("data-price"));
    });
  }
  if (sortSelect.value === "high") { // 가격 높은 순 정렬
    cardArray.sort(function (a, b) {
      return Number(b.getAttribute("data-price")) - Number(a.getAttribute("data-price"));
    });
  }

  for (let i = 0; i < cardArray.length; i++) {
    productGrid.appendChild(cardArray[i]); // 정렬된 순서대로 HTML에 다시 배치
  }
}

// 5. 이벤트 리스너 (사용자의 동작 감지)
for (let i = 0; i < filterInputs.length; i++) {
  filterInputs[i].addEventListener("change", filterProducts); // 필터 클릭 시 실행
}

sortSelect.addEventListener("change", function () { // 정렬 변경 시 실행
  sortProducts();
});

resetButton.addEventListener("click", function () { // 초기화 클릭 시 실행
  for (let i = 0; i < filterInputs.length; i++) {
    filterInputs[i].checked = false;
  }
  sortSelect.value = "featured";
  filterProducts();
  sortProducts();
});

// 6. 장바구니 버튼 아이콘 생성 및 동작
const cartButtons = document.querySelectorAll(".cart-button");
for (let i = 0; i < cartButtons.length; i++) {
  cartButtons[i].innerHTML = '<svg ...생략...></svg>'; // SVG 아이콘 넣기
  cartButtons[i].addEventListener("click", function () {
    this.classList.toggle("active"); // 클릭하면 활성화/비활성화 전환
  });
}

// 비교 기능 (최대 2개 선택)
const compareInputs = document.querySelectorAll(".compare-check input");
function showComparePopup() { // 2개 선택 시 안내창 생성
  if (document.querySelector(".compare-popup") !== null) return;
  // ... (팝업 생성 및 DOM 조작 코드)
}

for (let i = 0; i < compareInputs.length; i++) {
  compareInputs[i].addEventListener("change", function () {
    let checkedCount = 0;
    // ... (선택된 개수 확인 및 3개 이상 선택 시 경고 알림 로직)
  });
}

// 8. 초기 실행
filterProducts(); // 페이지 열리자마자 필터 상태 적용
