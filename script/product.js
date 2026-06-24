/*
  PRODUCT 페이지 JS

  상품 카드는 HTML에 직접 작성되어 있습니다.
  이 파일은 아래 기능만 담당합니다.
  1. 체크박스 필터
  2. 가격 정렬
  3. 필터 초기화
  4. 장바구니 버튼
  5. 비교 상품 2개 선택
*/

const productGrid = document.getElementById("product-grid");
const productCards = document.querySelectorAll(".product-card");
const filterInputs = document.querySelectorAll("#product-filters input");
const sortSelect = document.getElementById("sort-select");
const resetButton = document.getElementById("reset-filter");
const productCount = document.getElementById("product-count");

// 상품 이미지를 누르면 상세페이지로 이동합니다.
// 상세페이지가 완성되면 아래의 "#"만 실제 파일 주소로 바꾸면 됩니다.
const productImages = document.querySelectorAll(".image-box img");

for (let i = 0; i < productImages.length; i++) {
  let imageLink = document.createElement("a");
  imageLink.className = "product-link";
  imageLink.href = "#";
  imageLink.setAttribute("aria-label", "상품 상세페이지 보기");

  productImages[i].parentElement.insertBefore(imageLink, productImages[i]);
  imageLink.appendChild(productImages[i]);
}

// 체크된 필터 값을 배열에 담기
function getSelectedValues() {
  let selectedValues = [];

  for (let i = 0; i < filterInputs.length; i++) {
    if (filterInputs[i].checked === true) {
      selectedValues.push(filterInputs[i].value);
    }
  }

  return selectedValues;
}

// 상품 카드가 선택한 필터에 맞는지 확인
function checkProductCard(card, selectedValues) {
  let cardValues = card.getAttribute("data-values");

  for (let i = 0; i < selectedValues.length; i++) {
    if (cardValues.indexOf(selectedValues[i]) === -1) {
      return false;
    }
  }

  return true;
}

// 선택한 필터에 맞는 상품만 보여주기
function filterProducts() {
  let selectedValues = getSelectedValues();
  let visibleCount = 0;

  for (let i = 0; i < productCards.length; i++) {
    if (checkProductCard(productCards[i], selectedValues) === true) {
      productCards[i].style.display = "grid";
      visibleCount++;
    } else {
      productCards[i].style.display = "none";
    }
  }

  productCount.textContent = visibleCount + " products";
}

// 가격순으로 상품 카드 순서 변경
function sortProducts() {
  let cardArray = [];

  for (let i = 0; i < productCards.length; i++) {
    cardArray.push(productCards[i]);
  }

  if (sortSelect.value === "low") {
    cardArray.sort(function (a, b) {
      return Number(a.getAttribute("data-price")) - Number(b.getAttribute("data-price"));
    });
  }

  if (sortSelect.value === "high") {
    cardArray.sort(function (a, b) {
      return Number(b.getAttribute("data-price")) - Number(a.getAttribute("data-price"));
    });
  }

  for (let i = 0; i < cardArray.length; i++) {
    productGrid.appendChild(cardArray[i]);
  }
}

// 체크박스를 바꾸면 상품 다시 확인
for (let i = 0; i < filterInputs.length; i++) {
  filterInputs[i].addEventListener("change", filterProducts);
}

// 정렬 선택
sortSelect.addEventListener("change", function () {
  sortProducts();
});

// 필터 초기화
resetButton.addEventListener("click", function () {
  for (let i = 0; i < filterInputs.length; i++) {
    filterInputs[i].checked = false;
  }

  sortSelect.value = "featured";
  filterProducts();
  sortProducts();
});

// 장바구니 버튼
const cartButtons = document.querySelectorAll(".cart-button");

for (let i = 0; i < cartButtons.length; i++) {
  cartButtons[i].innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 24 24">' +
    '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
    '<circle cx="9" cy="20" r="1"></circle>' +
    '<circle cx="17" cy="20" r="1"></circle>' +
    "</svg>";
  cartButtons[i].setAttribute("aria-label", "장바구니에 담기");

  cartButtons[i].addEventListener("click", function () {
    this.classList.toggle("active");
  });
}

// 비교 상품은 최대 2개만 선택
const compareInputs = document.querySelectorAll(".compare-check input");

// 비교 상품 2개를 골랐을 때 안내창 만들기
function showComparePopup() {
  // 안내창이 이미 열려 있으면 또 만들지 않습니다.
  if (document.querySelector(".compare-popup") !== null) {
    return;
  }

  let popup = document.createElement("div");
  popup.className = "compare-popup";

  let popupBox = document.createElement("div");
  popupBox.className = "compare-popup-box";

  let message = document.createElement("strong");
  message.textContent = "비교 페이지로 이동할까요?";

  let actions = document.createElement("div");
  actions.className = "compare-popup-actions";

  let cancelButton = document.createElement("button");
  cancelButton.className = "compare-cancel";
  cancelButton.type = "button";
  cancelButton.textContent = "계속 보기";

  let compareLink = document.createElement("a");
  compareLink.className = "compare-go";
  compareLink.href = "#";
  compareLink.textContent = "비교하기";

  actions.appendChild(cancelButton);
  actions.appendChild(compareLink);
  popupBox.appendChild(message);
  popupBox.appendChild(actions);
  popup.appendChild(popupBox);
  document.body.appendChild(popup);

  cancelButton.addEventListener("click", function () {
    popup.remove();
  });
}

for (let i = 0; i < compareInputs.length; i++) {
  compareInputs[i].addEventListener("change", function () {
    let checkedCount = 0;
    let selectedCard = this.parentElement.parentElement;

    if (this.checked === true) {
      selectedCard.classList.add("compare-selected");
    } else {
      selectedCard.classList.remove("compare-selected");
    }

    for (let j = 0; j < compareInputs.length; j++) {
      if (compareInputs[j].checked === true) {
        checkedCount++;
      }
    }

    if (checkedCount > 2) {
      this.checked = false;
      selectedCard.classList.remove("compare-selected");
      alert("비교 상품은 2개까지만 선택할 수 있습니다.");
    }

    if (checkedCount === 2) {
      showComparePopup();
    }
  });
}

// 페이지를 열었을 때 상품 개수 표시
filterProducts();
