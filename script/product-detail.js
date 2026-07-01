/**
 * [상품 상세 페이지 로직 관리]
 */

// Similar Products 카드 안의 장바구니 버튼에 넣을 SVG 아이콘입니다.
// product.js의 목록 카드와 같은 아이콘을 사용해서 상세페이지와 목록페이지의 UI를 맞춥니다.
const SIMILAR_CART_ICON =
  '<svg aria-hidden="true" viewBox="0 0 24 24">' +
  '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
  '<circle cx="9" cy="20" r="1"></circle>' +
  '<circle cx="17" cy="20" r="1"></circle>' +
  "</svg>";

async function loadProductCatalog() {
  // 상품명, 가격, 이미지, 색상, 스펙 정보는 HTML에 직접 쓰지 않고 JSON에서 가져옵니다.
  // 이렇게 하면 상품이 바뀌어도 HTML 구조를 다시 만들 필요 없이 데이터만 수정하면 됩니다.
  const response = await fetch("./js/catalog/category.json");
  if (!response.ok) {
    throw new Error("상품 데이터를 불러오지 못했습니다.");
  }
  return response.json();
}

// 2. 유틸리티: 숫자를 한국식 가격 표기(원)로 변환합니다.
function formatPrice(price) {
  // 숫자 가격을 390000 -> 390,000원 형태로 보여주기 위한 공통 함수입니다.
  return price.toLocaleString("ko-KR") + "원";
}

// 3. 장바구니 관리: 로컬 스토리지 데이터를 읽어옵니다.
function readCartItems() {
  try {
    // 장바구니 데이터는 다른 페이지와 공유해야 하므로 localStorage에 저장해 둡니다.
    return JSON.parse(localStorage.getItem("cartItems")) || [];
  } catch (error) {
    // 저장된 값이 깨져 있어도 상세페이지가 멈추지 않도록 빈 배열로 복구합니다.
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
    // 이미 담긴 상품이면 새로 추가하지 않고 수량만 더합니다.
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

// 5. 팝업 UI: 장바구니 담기 성공 시 확인 팝업을 띄웁니다.
function showDetailCartPopup() {
  // 같은 팝업이 여러 번 겹쳐 뜨지 않도록 이미 있으면 새로 만들지 않습니다.
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
  // URL의 id 값으로 어떤 상품을 보여줄지 결정합니다.
  // 예: product-detail.html?id=home-studio-entry-monitor
  // 잘못된 id로 들어오면 fallbackId 상품을 보여줘서 빈 화면을 막습니다.
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
  // JSON에서 가져온 상품 데이터를 화면의 제목, 가격, 설명 영역에 바로 반영합니다.
  document.title = product.name + " | NODE";
  productTitle.textContent = product.name;
  productPrice.textContent = formatPrice(product.price);
  productDescription.textContent = product.description;
  productInfo.setAttribute("data-brand", product.brand);

  // 상세 이미지 및 배경 이미지 설정
  // 상세페이지 중간의 큰 이미지들은 모든 상품이 공통으로 쓰는 sharedDetailImages를 순서대로 배치합니다.
  detailHero.style.backgroundImage = 'linear-gradient(90deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.18)), url("' + sharedDetailImages[0] + '")';
  detailImagePrimary.src = sharedDetailImages[2];
  detailImageSecondary.src = sharedDetailImages[1];

  detailRepeatImages.forEach(function (image, index) {
    image.src = sharedDetailImages[index % sharedDetailImages.length];
  });

  // 색상 칩 생성 및 이벤트 등록
  // 상품마다 colors 데이터가 있으면 그 색상 칩을 만들고, 없으면 이미지 개수 기준으로 기본 칩을 만듭니다.
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
    // 연결할 이미지가 없는 색상은 클릭할 수 없게 비활성화합니다.
    chip.disabled = !image;
    chip.addEventListener("click", function () {
      if (image) setMainImage(image, imageIndex);
    });
    colorChipList.appendChild(chip);
  });

  // 메인 이미지 변경 함수
  // 썸네일이나 색상 칩을 클릭했을 때 메인 이미지와 활성 표시를 동시에 바꿉니다.
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
  // 상품 이미지 배열을 기준으로 왼쪽 썸네일 배경을 만들고 클릭 이벤트를 연결합니다.
  thumbnails.forEach(function (thumbnail, index) {
    const image = product.images[index];
    if (!image) return thumbnail.disabled = true;
    thumbnail.style.backgroundImage = 'url("' + image + '")';
    thumbnail.addEventListener("click", function () { setMainImage(image, index); });
  });

  setMainImage(product.images[0], 0);

  // 사양 정보 렌더링
  // specifications 데이터는 [항목명, 값] 형태라서 dt/dd 구조로 반복 생성합니다.
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
  // 수량은 1개 미만으로 내려가지 않게 minus 버튼을 비활성화합니다.
  let quantity = 1;
  function updateQuantity() {
    quantityValue.textContent = quantity;
    quantityMinus.disabled = quantity === 1;
  }
  quantityMinus.addEventListener("click", function () { if (quantity > 1) { quantity--; updateQuantity(); } });
  quantityPlus.addEventListener("click", function () { quantity++; updateQuantity(); });

  // 장바구니 버튼 이벤트
  addToCartButton.addEventListener("click", function () {
    // 현재 보고 있는 상품 id와 선택 수량을 cartItems에 저장합니다.
    // shoppingCart.html에서도 같은 localStorage 키를 읽어서 장바구니 목록을 보여줍니다.
    saveCartItem({ id: currentId, name: product.name, brand: product.brand, salePrice: product.price, qty: quantity, img: product.images[0] });
    showDetailCartPopup();
  });

  // 탭 전환 이벤트
  // 버튼의 data-tab 값과 section의 id 값을 맞춰서 해당 상세정보/리뷰/배송 탭만 보이게 합니다.
  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const selectedTab = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.toggle("is-active", btn === button));
      tabPanels.forEach(panel => panel.hidden = panel.id !== selectedTab);
    });
  });

  // 관련 상품 표시 로직
  // 우선 현재 상품과 같은 브랜드의 상품을 추천하고, 카드 개수가 부족하면 다른 브랜드 상품으로 채웁니다.
  // 현재 보고 있는 상품은 추천 목록에서 제외합니다.
  let similarEntries = Object.entries(products).filter(entry => entry[0] !== currentId && entry[1].brand === product.brand);
  if (similarEntries.length < similarCards.length) {
    const otherEntries = Object.entries(products).filter(entry => entry[0] !== currentId && entry[1].brand !== product.brand);
    similarEntries = similarEntries.concat(otherEntries);
  }

  similarCards.forEach(function (card, index) {
    const entry = similarEntries[index];
    if (!entry) return;
    const [similarId, similarProduct] = entry;
    // HTML에 미리 만들어 둔 카드 틀에 JSON 상품 데이터를 채워 넣습니다.
    // 이미지, 링크, 브랜드, 이름, 가격, 장바구니 아이콘을 모두 JS에서 갱신합니다.
    const similarUrl = "./product-detail.html?id=" + encodeURIComponent(similarId);
    const imageBox = card.querySelector(".similar-image-box");
    const productLink = card.querySelector(".similar-product-link");
    const nameLink = card.querySelector(".similar-name a");
    const cartButton = card.querySelector(".similar-cart-button");

    imageBox.style.backgroundImage = 'url("' + similarProduct.images[0] + '")';
    productLink.href = similarUrl;
    productLink.setAttribute("aria-label", similarProduct.name + " 상세페이지 보기");
    card.querySelector(".similar-brand").textContent = similarProduct.brand;
    nameLink.href = similarUrl;
    nameLink.textContent = similarProduct.name;
    card.querySelector(".similar-price").textContent = formatPrice(similarProduct.price);
    cartButton.innerHTML = SIMILAR_CART_ICON;
    cartButton.addEventListener("click", () => {
      // 추천 상품의 장바구니 버튼은 기본 수량 1개로 저장합니다.
      saveCartItem({ id: similarId, name: similarProduct.name, brand: similarProduct.brand, salePrice: similarProduct.price, qty: 1, img: similarProduct.images[0] });
      cartButton.classList.add("is-active");
      showDetailCartPopup();
    });
  });

  // 잘못된 id로 들어온 경우 주소창도 fallback 상품 id로 정리합니다.
  if (!products[requestedId]) history.replaceState(null, "", "./product-detail.html?id=" + fallbackId);
  updateQuantity();
}

// 에러 처리 및 초기 실행
initProductDetail().catch(function (error) {
  console.error(error);
});
