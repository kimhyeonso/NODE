/**
 * [상품 상세 페이지 로직 관리]
 */

// 1. 데이터 로딩: JSON 파일에서 상품 카탈로그 정보를 불러옵니다.
async function loadProductCatalog() {
  const response = await fetch("./js/catalog/category.json");
  if (!response.ok) {
    throw new Error("상품 데이터를 불러오지 못했습니다.");
  }
  return response.json();
}

// 2. 유틸리티: 숫자를 한국식 가격 표기(원)로 변환합니다.
function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

// 3. 장바구니 관리: 로컬 스토리지 데이터를 읽어옵니다.
function readCartItems() {
  try {
    return JSON.parse(localStorage.getItem("cartItems")) || [];
  } catch (error) {
    return [];
  }
}

// 4. 장바구니 저장: 상품 추가 시 수량을 합산하여 저장합니다.
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

// 5. 팝업 UI: 장바구니 담기 성공 시 확인 팝업을 띄웁니다.
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

// 6. 메인 초기화: 상세 페이지의 데이터 바인딩 및 이벤트 설정
async function initProductDetail() {
  const catalog = await loadProductCatalog();
  const products = catalog.products;
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const fallbackId = catalog.fallbackId;
  const currentId = products[requestedId] ? requestedId : fallbackId;
  const product = products[currentId];
  const sharedDetailImages = catalog.sharedDetailImages;

  // DOM 요소 참조
  const productTitle = document.querySelector(".product-info h1");
  const productPrice = document.querySelector(".product-info .price");
  const productDescription = document.querySelector(".product-info .description");
  const productInfo = document.querySelector(".product-info");
  const mainImageElement = document.querySelector(".main-image img");
  const thumbnails = document.querySelectorAll(".thumb");
  const colorChipList = document.querySelector(".color-chips");
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

  // 페이지 기본 정보 설정
  document.title = product.name + " | NODE";
  productTitle.textContent = product.name;
  productPrice.textContent = formatPrice(product.price);
  productDescription.textContent = product.description;
  productInfo.setAttribute("data-brand", product.brand);

  // 상세 이미지 및 배경 이미지 설정
  detailHero.style.backgroundImage = 'linear-gradient(90deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.18)), url("' + sharedDetailImages[0] + '")';
  detailImagePrimary.src = sharedDetailImages[2];
  detailImageSecondary.src = sharedDetailImages[1];

  detailRepeatImages.forEach(function (image, index) {
    image.src = sharedDetailImages[index % sharedDetailImages.length];
  });

  // 색상 칩 생성 및 이벤트 등록
  const productColors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : product.images.map(function (image, index) {
        return { name: index === 0 ? "Default" : "Option " + (index + 1), hex: index === 0 ? "#171717" : "#f5f5f0", imageIndex: index };
      });

  colorChipList.textContent = "";
  productColors.forEach(function (color, colorIndex) {
    const imageIndex = Number(color.imageIndex);
    const image = product.images[imageIndex];
    const chip = document.createElement("button");
    chip.className = "color-chip";
    chip.type = "button";
    chip.dataset.imageIndex = String(imageIndex);
    chip.style.backgroundColor = color.hex || "#ddd";
    chip.disabled = !image;
    chip.addEventListener("click", function () {
      if (image) setMainImage(image, imageIndex);
    });
    colorChipList.appendChild(chip);
  });

  // 메인 이미지 변경 함수
  function setMainImage(image, index) {
    mainImageElement.src = image;
    thumbnails.forEach(function (thumbnail, thumbnailIndex) {
      thumbnail.classList.toggle("is-active", thumbnailIndex === index);
    });
    colorChipList.querySelectorAll(".color-chip").forEach(function (chip) {
      const isActive = Number(chip.dataset.imageIndex) === index;
      chip.classList.toggle("is-active", isActive);
    });
  }

  // 썸네일 클릭 이벤트
  thumbnails.forEach(function (thumbnail, index) {
    const image = product.images[index];
    if (!image) return thumbnail.disabled = true;
    thumbnail.style.backgroundImage = 'url("' + image + '")';
    thumbnail.addEventListener("click", function () { setMainImage(image, index); });
  });

  setMainImage(product.images[0], 0);

  // 사양 정보 렌더링
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

  // 수량 조절 버튼 로직
  let quantity = 1;
  function updateQuantity() {
    quantityValue.textContent = quantity;
    quantityMinus.disabled = quantity === 1;
  }
  quantityMinus.addEventListener("click", function () { if (quantity > 1) { quantity--; updateQuantity(); } });
  quantityPlus.addEventListener("click", function () { quantity++; updateQuantity(); });

  // 장바구니 버튼 이벤트
  addToCartButton.addEventListener("click", function () {
    saveCartItem({ id: currentId, name: product.name, brand: product.brand, salePrice: product.price, qty: quantity, img: product.images[0] });
    showDetailCartPopup();
  });

  // 탭 전환 이벤트
  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const selectedTab = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.toggle("is-active", btn === button));
      tabPanels.forEach(panel => panel.hidden = panel.id !== selectedTab);
    });
  });

  // 관련 상품 표시 로직
  let similarEntries = Object.entries(products).filter(entry => entry[0] !== currentId && entry[1].brand === product.brand);
  if (similarEntries.length < similarCards.length) {
    const otherEntries = Object.entries(products).filter(entry => entry[0] !== currentId && entry[1].brand !== product.brand);
    similarEntries = similarEntries.concat(otherEntries);
  }

  similarCards.forEach(function (card, index) {
    const entry = similarEntries[index];
    if (!entry) return;
    const [similarId, similarProduct] = entry;
    // 카드 내부 요소 업데이트 로직...
    card.querySelector(".similar-product-link").href = "./product-detail.html?id=" + encodeURIComponent(similarId);
    card.querySelector(".similar-name a").textContent = similarProduct.name;
    card.querySelector(".similar-price").textContent = formatPrice(similarProduct.price);
    card.querySelector(".similar-cart-button").addEventListener("click", () => {
      saveCartItem({ id: similarId, name: similarProduct.name, brand: similarProduct.brand, salePrice: similarProduct.price, qty: 1, img: similarProduct.images[0] });
      showDetailCartPopup();
    });
  });

  if (!products[requestedId]) history.replaceState(null, "", "./product-detail.html?id=" + fallbackId);
  updateQuantity();
}

// 에러 처리 및 초기 실행
initProductDetail().catch(function (error) {
  console.error(error);
});