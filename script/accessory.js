/*
  ACCESSORY 페이지 JS

  역할 분리
  1. category.json: 제품과 액세서리의 공통 카탈로그 데이터를 보관
  2. accessory.js: category.json에서 cable/stand 데이터를 읽어 액세서리 카드를 생성
  3. accessory-*.html: 액세서리 카드가 들어갈 자리(#accessory-grid)만 제공
*/

const accessoryGrid = document.getElementById("accessory-grid");
const filterInputs = document.querySelectorAll("#accessory-filters input");
const sortSelect = document.getElementById("sort-select");
const resetButton = document.getElementById("reset-filter");
const accessoryCount = document.getElementById("accessory-count");
const pageCategory = document.body.dataset.accessoryCategory || "all";

let accessoryCards = [];
let compareInputs = [];
let catalogSpecs = {};

const CART_ICON =
  '<svg aria-hidden="true" viewBox="0 0 24 24">' +
  '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
  '<circle cx="9" cy="20" r="1"></circle>' +
  '<circle cx="17" cy="20" r="1"></circle>' +
  "</svg>";

function formatPrice(price) {
  return Number(price).toLocaleString("ko-KR") + "원";
}

function getDetailUrl(productId) {
  return "./product-detail.html?id=" + encodeURIComponent(productId);
}

function getVisibleAccessoryEntries(products) {
  return Object.entries(products).filter(function ([, product]) {
    if (pageCategory === "all") {
      return product.category === "cable" || product.category === "stand";
    }

    return product.category === pageCategory;
  });
}

function createAccessoryCard(productId, product) {
  const card = document.createElement("article");
  const filterValues = [product.category].concat(product.filters || []);
  const detailUrl = getDetailUrl(productId);

  card.className = "accessory-card";
  card.dataset.productId = productId;
  card.dataset.price = product.price;
  card.dataset.values = filterValues.join(" ");

  // 카드 마크업은 JS에서 만들고, 상품 내용은 category.json에서 가져옵니다.
  card.innerHTML =
    '<div class="image-box">' +
    '<a class="product-link" href="' + detailUrl + '" aria-label="' + product.name + ' 상세페이지 보기">' +
    '<img src="' + product.images[0] + '" alt="' + product.name + '">' +
    "</a>" +
    '<button class="cart-button" type="button" aria-label="장바구니에 담기">' + CART_ICON + "</button>" +
    '<label class="compare-check" aria-label="비교 상품 선택"><input type="checkbox"></label>' +
    "</div>" +
    '<div class="brand">' + product.brand + "</div>" +
    '<h3 class="accessory-name"><a href="' + detailUrl + '">' + product.name + "</a></h3>" +
    '<div class="price-row">' +
    '<span class="sale-price">' + formatPrice(product.price) + "</span>" +
    '<span class="original-price">' + formatPrice(product.originalPrice) + "</span>" +
    "</div>";

  return card;
}

function renderAccessoryCards(products) {
  const accessoryEntries = getVisibleAccessoryEntries(products);

  accessoryGrid.textContent = "";

  for (let i = 0; i < accessoryEntries.length; i++) {
    const productId = accessoryEntries[i][0];
    const product = accessoryEntries[i][1];
    accessoryGrid.appendChild(createAccessoryCard(productId, product));
  }

  accessoryCards = Array.from(document.querySelectorAll(".accessory-card"));
  compareInputs = Array.from(document.querySelectorAll(".compare-check input"));
}

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

function checkAccessoryCard(card, selectedFilters) {
  const cardValues = card.dataset.values.split(/\s+/);
  const filterDomains = Object.keys(selectedFilters);

  if (filterDomains.length === 0) {
    return true;
  }

  for (let i = 0; i < filterDomains.length; i++) {
    const filterDomain = filterDomains[i];
    const domainFilters = selectedFilters[filterDomain];
    const filterGroups = Object.keys(domainFilters);

    if (!cardValues.includes(filterDomain)) {
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

function filterAccessories() {
  const selectedFilters = getSelectedFilters();
  let visibleCount = 0;

  for (let i = 0; i < accessoryCards.length; i++) {
    if (checkAccessoryCard(accessoryCards[i], selectedFilters) === true) {
      accessoryCards[i].style.display = "grid";
      visibleCount++;
    } else {
      accessoryCards[i].style.display = "none";
    }
  }

  accessoryCount.textContent = visibleCount + " accessories";
}

function sortAccessories() {
  let cardArray = accessoryCards.slice();

  if (sortSelect.value === "low") {
    cardArray.sort(function (a, b) {
      return Number(a.dataset.price) - Number(b.dataset.price);
    });
  }

  if (sortSelect.value === "high") {
    cardArray.sort(function (a, b) {
      return Number(b.dataset.price) - Number(a.dataset.price);
    });
  }

  for (let i = 0; i < cardArray.length; i++) {
    accessoryGrid.appendChild(cardArray[i]);
  }
}

function showMovePopup(messageText, linkText, linkHref) {
  if (document.querySelector(".compare-popup") !== null) {
    return;
  }

  const popup = document.createElement("div");
  popup.className = "compare-popup";

  const popupBox = document.createElement("div");
  popupBox.className = "compare-popup-box";

  const message = document.createElement("strong");
  message.textContent = messageText;

  const actions = document.createElement("div");
  actions.className = "compare-popup-actions";

  const cancelButton = document.createElement("button");
  cancelButton.className = "compare-cancel";
  cancelButton.type = "button";
  cancelButton.textContent = "계속 보기";

  const moveLink = document.createElement("a");
  moveLink.className = "compare-go";
  moveLink.href = linkHref;
  moveLink.textContent = linkText;

  actions.appendChild(cancelButton);
  actions.appendChild(moveLink);
  popupBox.appendChild(message);
  popupBox.appendChild(actions);
  popup.appendChild(popupBox);
  document.body.appendChild(popup);

  cancelButton.addEventListener("click", function () {
    popup.remove();
  });

  popup.addEventListener("click", function (event) {
    if (event.target === popup) {
      popup.remove();
    }
  });
}

function addToCart(button) {
  const card = button.closest(".accessory-card");
  const name = card.querySelector(".accessory-name").textContent.trim();
  const brand = card.querySelector(".brand").textContent.trim();
  const salePrice = Number(card.dataset.price);
  const originalPriceText = card.querySelector(".original-price").textContent.replace(/[^0-9]/g, "");
  const originalPrice = Number(originalPriceText);
  const img = card.querySelector("img").getAttribute("src");

  const item = {
    id: card.dataset.productId,
    name: name,
    brand: brand,
    salePrice: salePrice,
    originalPrice: originalPrice,
    img: img,
    qty: 1
  };

  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  let existing = null;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id === item.id) {
      existing = cart[i];
      break;
    }
  }

  if (existing !== null) {
    existing.qty += 1;
  } else {
    cart.push(item);
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));
}

function setupCartButtons() {
  const cartButtons = document.querySelectorAll(".cart-button");

  for (let i = 0; i < cartButtons.length; i++) {
    cartButtons[i].addEventListener("click", function () {
      this.classList.add("active");
      addToCart(this);
      showMovePopup("장바구니 페이지로 이동할까요?", "이동하기", "./shoppingCart.html");
    });
  }
}

function getCompareItems() {
  let compareItems = [];

  for (let i = 0; i < compareInputs.length; i++) {
    if (compareInputs[i].checked === true) {
      const card = compareInputs[i].closest(".accessory-card");

      compareItems.push({
        id: card.dataset.productId,
        name: card.querySelector(".accessory-name").textContent.trim(),
        brand: card.querySelector(".brand").textContent.trim(),
        price: Number(card.dataset.price),
        img: card.querySelector(".image-box img").getAttribute("src"),
        specs: catalogSpecs[card.dataset.productId] || null
      });
    }
  }

  return compareItems;
}

function saveCompareItems() {
  const compareItems = getCompareItems();
  localStorage.setItem("compareItems", JSON.stringify(compareItems));
  return compareItems;
}

function setupCompareInputs() {
  for (let i = 0; i < compareInputs.length; i++) {
    compareInputs[i].addEventListener("change", function () {
      let checkedCount = 0;
      const selectedCard = this.closest(".accessory-card");

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
        saveCompareItems();
        return;
      }

      const compareItems = saveCompareItems();

      if (compareItems.length === 2) {
        showMovePopup("비교 페이지로 이동할까요?", "비교하기", "./compare.html");
      }
    });
  }
}

function setupFilterAndSort() {
  for (let i = 0; i < filterInputs.length; i++) {
    filterInputs[i].addEventListener("change", filterAccessories);
  }

  sortSelect.addEventListener("change", function () {
    sortAccessories();
    filterAccessories();
  });

  resetButton.addEventListener("click", function () {
    for (let i = 0; i < filterInputs.length; i++) {
      filterInputs[i].checked = false;
    }

    sortSelect.value = "featured";
    sortAccessories();
    filterAccessories();
  });
}

async function initAccessoryPage() {
  if (accessoryGrid === null) {
    return;
  }

  accessoryGrid.textContent = "액세서리를 불러오는 중입니다.";

  try {
    const response = await fetch("./js/catalog/category.json");

    if (!response.ok) {
      throw new Error("액세서리 데이터를 불러오지 못했습니다.");
    }

    const catalog = await response.json();
    catalogSpecs = catalog.specifications || {};

    renderAccessoryCards(catalog.products || {});
    setupFilterAndSort();
    setupCartButtons();
    setupCompareInputs();
    sortAccessories();
    filterAccessories();
  } catch (error) {
    accessoryGrid.innerHTML = '<p class="no-results">액세서리 정보를 불러오지 못했습니다.</p>';
    console.error(error);
  }
}

initAccessoryPage();
