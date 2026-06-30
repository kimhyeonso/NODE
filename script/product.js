/*
  Product and accessory listing pages share this script.
  Each page is detected by its grid element and body data category.
*/

const CART_ICON =
  '<svg aria-hidden="true" viewBox="0 0 24 24">' +
  '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
  '<circle cx="9" cy="20" r="1"></circle>' +
  '<circle cx="17" cy="20" r="1"></circle>' +
  "</svg>";

const pageSettings = getListingPageSettings();

let listingCards = [];
let compareInputs = [];
let catalogSpecs = {};

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
      loadingText: "액세서리를 불러오는 중입니다.",
      errorText: "액세서리 정보를 불러오지 못했습니다."
    };
  }

  return null;
}

function formatPrice(price) {
  return Number(price).toLocaleString("ko-KR") + "원";
}

function getDetailUrl(productId) {
  return "./product-detail.html?id=" + encodeURIComponent(productId);
}

function getVisibleEntries(products) {
  return Object.entries(products).filter(function ([, product]) {
    if (pageSettings.pageCategory === "all") {
      return pageSettings.allCategories.includes(product.category);
    }

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
    '<div class="image-box">' +
    '<a class="product-link" href="' + detailUrl + '" aria-label="' + product.name + ' 상세페이지 보기">' +
    '<img src="' + product.images[0] + '" alt="' + product.name + '">' +
    "</a>" +
    '<button class="cart-button" type="button" aria-label="장바구니에 담기">' + CART_ICON + "</button>" +
    '<label class="compare-check" aria-label="비교 상품 선택"><input type="checkbox"></label>' +
    "</div>" +
    '<div class="brand">' + product.brand + "</div>" +
    '<h3 class="' + pageSettings.nameClass + '"><a href="' + detailUrl + '">' + product.name + "</a></h3>" +
    '<div class="price-row">' +
    '<span class="sale-price">' + formatPrice(product.price) + "</span>" +
    '<span class="original-price">' + formatPrice(product.originalPrice) + "</span>" +
    "</div>";

  return card;
}

function renderListingCards(products) {
  const entries = getVisibleEntries(products);

  pageSettings.grid.textContent = "";

  for (let i = 0; i < entries.length; i++) {
    const productId = entries[i][0];
    const product = entries[i][1];
    pageSettings.grid.appendChild(createListingCard(productId, product));
  }

  listingCards = Array.from(document.querySelectorAll("." + pageSettings.cardClass));
  compareInputs = Array.from(document.querySelectorAll(".compare-check input"));
}

function getSelectedFilters() {
  let selectedFilters = {};

  for (let i = 0; i < pageSettings.filters.length; i++) {
    const input = pageSettings.filters[i];

    if (input.checked === true) {
      const filterDomain = input.dataset.domain;
      const filterGroup = input.dataset.filter;

      if (!selectedFilters[filterDomain]) {
        selectedFilters[filterDomain] = {};
      }

      if (!selectedFilters[filterDomain][filterGroup]) {
        selectedFilters[filterDomain][filterGroup] = [];
      }

      selectedFilters[filterDomain][filterGroup].push(input.value);
    }
  }

  return selectedFilters;
}

function checkListingCard(card, selectedFilters) {
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

function filterListings() {
  const selectedFilters = getSelectedFilters();
  let visibleCount = 0;

  for (let i = 0; i < listingCards.length; i++) {
    if (checkListingCard(listingCards[i], selectedFilters) === true) {
      listingCards[i].style.display = "grid";
      visibleCount++;
    } else {
      listingCards[i].style.display = "none";
    }
  }

  if (pageSettings.count) {
    pageSettings.count.textContent = visibleCount + " " + pageSettings.countLabel;
  }

  if (pageSettings.noResults) {
    pageSettings.noResults.style.display = visibleCount === 0 ? "block" : "none";
  }
}

function sortListings() {
  let cardArray = listingCards.slice();

  if (pageSettings.sortSelect.value === "low") {
    cardArray.sort(function (a, b) {
      return Number(a.dataset.price) - Number(b.dataset.price);
    });
  } else if (pageSettings.sortSelect.value === "high") {
    cardArray.sort(function (a, b) {
      return Number(b.dataset.price) - Number(a.dataset.price);
    });
  }

  for (let i = 0; i < cardArray.length; i++) {
    pageSettings.grid.appendChild(cardArray[i]);
  }
}

function showMovePopup(messageText, linkText, linkHref) {
  if (document.querySelector(".compare-popup") !== null) {
    return;
  }

  const popup = document.createElement("div");
  popup.className = "compare-popup";
  popup.innerHTML =
    '<div class="compare-popup-box">' +
    "<strong>" + messageText + "</strong>" +
    '<div class="compare-popup-actions">' +
    '<button class="compare-cancel" type="button">계속 보기</button>' +
    '<a class="compare-go" href="' + linkHref + '">' + linkText + "</a>" +
    "</div>" +
    "</div>";

  document.body.appendChild(popup);

  popup.querySelector(".compare-cancel").addEventListener("click", function () {
    popup.remove();
  });

  popup.addEventListener("click", function (event) {
    if (event.target === popup) {
      popup.remove();
    }
  });
}

function getCardItem(card) {
  return {
    id: card.dataset.productId,
    name: card.querySelector("." + pageSettings.nameClass).textContent.trim(),
    brand: card.querySelector(".brand").textContent.trim(),
    salePrice: Number(card.dataset.price),
    originalPrice: Number(card.querySelector(".original-price").textContent.replace(/[^0-9]/g, "")),
    img: card.querySelector("img").getAttribute("src"),
    qty: 1
  };
}

function toggleCartItem(button) {
  const card = button.closest("." + pageSettings.cardClass);
  const productId = card.dataset.productId;
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const existingIndex = cart.findIndex(function (item) {
    return item.id === productId;
  });

  if (existingIndex !== -1) {
    cart.splice(existingIndex, 1);
    button.classList.remove("active");
  } else {
    cart.push(getCardItem(card));
    button.classList.add("active");
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));
  
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }
}

function setupCartButtons() {
  const cartButtons = document.querySelectorAll(".cart-button");
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];

  for (let i = 0; i < cart.length; i++) {
    const card = document.querySelector("." + pageSettings.cardClass + '[data-product-id="' + cart[i].id + '"]');

    if (card) {
      card.querySelector(".cart-button").classList.add("active");
    }
  }

  for (let i = 0; i < cartButtons.length; i++) {
    cartButtons[i].addEventListener("click", function () {
      toggleCartItem(this);

      if (this.classList.contains("active")) {
        showMovePopup("장바구니에 담겼습니다. 이동할까요?", "이동하기", "./shoppingCart.html");
      }
    });
  }
}

function getCompareItems() {
  let compareItems = [];

  for (let i = 0; i < compareInputs.length; i++) {
    if (compareInputs[i].checked === true) {
      const card = compareInputs[i].closest("." + pageSettings.cardClass);

      compareItems.push({
        id: card.dataset.productId,
        name: card.querySelector("." + pageSettings.nameClass).textContent.trim(),
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
      const selectedCard = this.closest("." + pageSettings.cardClass);
      selectedCard.classList.toggle("compare-selected", this.checked);

      const checkedCount = compareInputs.filter(function (input) {
        return input.checked;
      }).length;

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
  for (let i = 0; i < pageSettings.filters.length; i++) {
    pageSettings.filters[i].addEventListener("change", filterListings);
  }

  pageSettings.sortSelect.addEventListener("change", function () {
    sortListings();
    filterListings();
  });

  pageSettings.resetButton.addEventListener("click", function () {
    for (let i = 0; i < pageSettings.filters.length; i++) {
      pageSettings.filters[i].checked = false;
    }

    pageSettings.sortSelect.value = "featured";
    sortListings();
    filterListings();
  });
}

async function initListingPage() {
  if (!pageSettings) {
    return;
  }

  pageSettings.grid.textContent = pageSettings.loadingText;

  try {
    const response = await fetch("./js/catalog/category.json");

    if (!response.ok) {
      throw new Error("카탈로그 데이터를 불러오지 못했습니다.");
    }

    const catalog = await response.json();
    catalogSpecs = catalog.specifications || {};

    renderListingCards(catalog.products || {});
    setupFilterAndSort();
    setupCartButtons();
    setupCompareInputs();
    sortListings();
    filterListings();
  } catch (error) {
    pageSettings.grid.innerHTML = '<p class="no-results">' + pageSettings.errorText + "</p>";
    console.error(error);
  }
}

initListingPage();
