async function loadProductCatalog() {
  const response = await fetch("./js/catalog/products.json");

  if (!response.ok) {
    throw new Error("상품 데이터를 불러오지 못했습니다.");
  }

  return response.json();
}

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

function readCartItems() {
  try {
    return JSON.parse(localStorage.getItem("cartItems")) || [];
  } catch (error) {
    return [];
  }
}

function saveCartItem(item) {
  const cart = readCartItems();
  const existing = cart.find(function (cartItem) {
    return cartItem.id === item.id;
  });

  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }

  localStorage.setItem("cartItems", JSON.stringify(cart));
}

function showDetailCartPopup() {
  if (document.querySelector(".compare-popup")) return;

  const popup = document.createElement("div");
  popup.className = "compare-popup";

  const popupBox = document.createElement("div");
  popupBox.className = "compare-popup-box";

  const message = document.createElement("strong");
  message.textContent = "장바구니에 담겼습니다.";

  const actions = document.createElement("div");
  actions.className = "compare-popup-actions";

  const cancelButton = document.createElement("button");
  cancelButton.className = "compare-cancel";
  cancelButton.type = "button";
  cancelButton.textContent = "계속 쇼핑";

  const cartLink = document.createElement("a");
  cartLink.className = "compare-go";
  cartLink.href = "./shoppingCart.html";
  cartLink.textContent = "장바구니 보기";

  actions.appendChild(cancelButton);
  actions.appendChild(cartLink);
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

async function initProductDetail() {
  const catalog = await loadProductCatalog();
  const products = catalog.products;
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const fallbackId = catalog.fallbackId;
  const currentId = products[requestedId] ? requestedId : fallbackId;
  const product = products[currentId];
  const sharedDetailImages = catalog.sharedDetailImages;

  const productTitle = document.querySelector(".product-info h1");
  const productPrice = document.querySelector(".product-info .price");
  const productDescription = document.querySelector(".product-info .description");
  const productInfo = document.querySelector(".product-info");
  const mainImageElement = document.querySelector(".main-image img");
  const thumbnails = document.querySelectorAll(".thumb");
  const colorChips = document.querySelectorAll(".color-chip");
  const detailHero = document.querySelector(".detail-hero");
  const detailImagePrimary = document.querySelector(".detail-image-primary");
  const detailImageSecondary = document.querySelector(".detail-image-secondary");
  const detailRepeatImages = document.querySelectorAll(".detail-repeat-image");
  const quantityMinus = document.querySelector(".quantity-minus");
  const quantityPlus = document.querySelector(".quantity-plus");
  const quantityValue = document.querySelector(".quantity-value");
  const addToCartButton = document.querySelector(".add-cart-button");
  const tabButtons = document.querySelectorAll(".product-tabs button");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const specificationList = document.querySelector(".specification-list");
  const similarCards = document.querySelectorAll(".similar-products .card");

  document.title = product.name + " | NODE";
  productTitle.textContent = product.name;
  productPrice.textContent = formatPrice(product.price);
  productDescription.textContent = product.description;
  productInfo.setAttribute("data-brand", product.brand);

  detailHero.style.backgroundImage =
    'linear-gradient(90deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.18)), url("' +
    sharedDetailImages[0] +
    '")';

  detailImagePrimary.src = sharedDetailImages[2];
  detailImagePrimary.alt = "NODE 라이프스타일 상세 이미지";
  detailImageSecondary.src = sharedDetailImages[1];
  detailImageSecondary.alt = "NODE 소재 상세 이미지";

  detailRepeatImages.forEach(function (image, index) {
    image.src = sharedDetailImages[index % sharedDetailImages.length];
    image.alt = "NODE 공통 상세 이미지 " + (index + 1);
  });

  function setMainImage(image, index) {
    mainImageElement.src = image;
    mainImageElement.alt = product.name + " 상품 이미지 " + (index + 1);

    thumbnails.forEach(function (thumbnail, thumbnailIndex) {
      thumbnail.classList.toggle("is-active", thumbnailIndex === index);
    });

    colorChips.forEach(function (chip, chipIndex) {
      const isActive = chipIndex === index;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", String(isActive));
    });
  }

  thumbnails.forEach(function (thumbnail, index) {
    const image = product.images[index];

    if (!image) {
      thumbnail.style.backgroundImage = "none";
      thumbnail.disabled = true;
      thumbnail.setAttribute("aria-label", "등록된 상품 이미지 없음");
      return;
    }

    thumbnail.style.backgroundImage = 'url("' + image + '")';
    thumbnail.disabled = false;
    thumbnail.setAttribute("aria-label", product.name + " 상품 이미지 " + (index + 1));
    thumbnail.addEventListener("click", function () {
      setMainImage(image, index);
    });
  });

  colorChips.forEach(function (chip) {
    const imageIndex = Number(chip.dataset.imageIndex);
    const image = product.images[imageIndex];

    chip.disabled = !image;
    chip.addEventListener("click", function () {
      if (image) {
        setMainImage(image, imageIndex);
      }
    });
  });

  setMainImage(product.images[0], 0);

  const currentSpecifications = catalog.specifications[currentId] || [];
  specificationList.textContent = "";

  currentSpecifications.forEach(function (specification) {
    const row = document.createElement("div");
    const name = document.createElement("dt");
    const value = document.createElement("dd");

    name.textContent = specification[0];
    value.textContent = specification[1];
    row.appendChild(name);
    row.appendChild(value);
    specificationList.appendChild(row);
  });

  let quantity = 1;

  function updateQuantity() {
    quantityValue.textContent = quantity;
    quantityMinus.disabled = quantity === 1;
  }

  quantityMinus.addEventListener("click", function () {
    if (quantity > 1) {
      quantity--;
      updateQuantity();
    }
  });

  quantityPlus.addEventListener("click", function () {
    quantity++;
    updateQuantity();
  });

  addToCartButton.addEventListener("click", function () {
    saveCartItem({
      id: currentId,
      name: product.name,
      brand: product.brand,
      salePrice: product.price,
      originalPrice: product.originalPrice || product.price,
      img: product.images[0],
      qty: quantity
    });
    showDetailCartPopup();
  });

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const selectedTab = button.dataset.tab;

      tabButtons.forEach(function (tabButton) {
        const isSelected = tabButton === button;
        tabButton.classList.toggle("is-active", isSelected);
        tabButton.setAttribute("aria-selected", String(isSelected));
      });

      tabPanels.forEach(function (panel) {
        const isSelected = panel.id === selectedTab;
        panel.hidden = !isSelected;
        panel.classList.toggle("is-active", isSelected);
      });
    });
  });

  let similarEntries = Object.entries(products).filter(function (entry) {
    return entry[0] !== currentId && entry[1].brand === product.brand;
  });

  if (similarEntries.length < similarCards.length) {
    const otherEntries = Object.entries(products).filter(function (entry) {
      return entry[0] !== currentId && entry[1].brand !== product.brand;
    });
    similarEntries = similarEntries.concat(otherEntries);
  }

  similarCards.forEach(function (card, index) {
    const entry = similarEntries[index];
    if (!entry) return;

    const similarId = entry[0];
    const similarProduct = entry[1];
    const similarUrl = "./product-detail.html?id=" + encodeURIComponent(similarId);
    const imageBox = card.querySelector(".similar-image-box");
    const imageLink = card.querySelector(".similar-product-link");
    const nameLink = card.querySelector(".similar-name a");
    const cartButton = card.querySelector(".similar-cart-button");

    imageBox.style.backgroundImage = 'url("' + similarProduct.images[0] + '")';
    imageLink.href = similarUrl;
    imageLink.setAttribute("aria-label", similarProduct.name + " 상세페이지 보기");
    nameLink.href = similarUrl;
    nameLink.textContent = similarProduct.name;
    card.querySelector(".similar-brand").textContent = similarProduct.brand;
    card.querySelector(".similar-price").textContent = formatPrice(similarProduct.price);

    cartButton.innerHTML =
      '<svg aria-hidden="true" viewBox="0 0 24 24">' +
      '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
      '<circle cx="9" cy="20" r="1"></circle>' +
      '<circle cx="17" cy="20" r="1"></circle>' +
      "</svg>";

    cartButton.addEventListener("click", function () {
      cartButton.classList.add("is-active");
      saveCartItem({
        id: similarId,
        name: similarProduct.name,
        brand: similarProduct.brand,
        salePrice: similarProduct.price,
        originalPrice: similarProduct.originalPrice || similarProduct.price,
        img: similarProduct.images[0],
        qty: 1
      });
      showDetailCartPopup();
    });
  });

  if (!products[requestedId]) {
    history.replaceState(null, "", "./product-detail.html?id=" + fallbackId);
  }

  updateQuantity();
}

initProductDetail().catch(function (error) {
  console.error(error);

  const productTitle = document.querySelector(".product-info h1");
  const productDescription = document.querySelector(".product-info .description");

  if (productTitle) {
    productTitle.textContent = "상품 정보를 불러오지 못했습니다.";
  }

  if (productDescription) {
    productDescription.textContent = "로컬 서버로 페이지를 실행한 뒤 다시 시도해 주세요.";
  }
});
