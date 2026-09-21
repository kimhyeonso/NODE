/**
 * product-detail.html 전용 스크립트
 *
 * 이 파일은 상품 상세페이지 한 화면에서 필요한 동작을 담당합니다.
 * 상품 정보는 `js/catalog/category.json`에서 가져오고,
 * URL의 `id` 값에 맞는 상품을 찾아 화면에 렌더링합니다.
 *
 * 주요 기능
 * 1. 상품 데이터 로딩 및 가격 포맷 변환
 * 2. 상세 상품 / 추천 상품 장바구니 저장
 * 3. 장바구니 이동 팝업 생성
 * 4. Similar Products 추천 상품 Slick 슬라이더
 * 5. 상품명, 가격, 이미지, 색상칩, 사양 렌더링
 * 6. 수량 조절, 탭 전환, 추천 상품 카드 이벤트 연결
 */

// ==================== 1. 공통 상수 / 유틸 ====================

// Similar Products 카드의 장바구니 버튼에 넣는 SVG 아이콘입니다.
const SIMILAR_CART_ICON =
  '<svg aria-hidden="true" viewBox="0 0 24 24">' +
  '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
  '<circle cx="9" cy="20" r="1"></circle>' +
  '<circle cx="17" cy="20" r="1"></circle>' +
  "</svg>";

// 상품 목록, 상세 이미지, 스펙 정보가 들어 있는 JSON 파일을 불러옵니다.
async function loadProductCatalog() {
  const response = await fetch("./js/catalog/category.json");

  if (!response.ok) {
    throw new Error("상품 데이터를 불러오지 못했습니다.");
  }

  return response.json();
}

// 숫자 가격을 한국어 표기 방식으로 변환합니다. 예: 2850000 -> 2,850,000원
function formatPrice(price) {
  return Number(price).toLocaleString("ko-KR") + "원";
}

// ==================== 2. 장바구니 저장 로직 ====================

function readCartItems() {
  try {
    // localStorage에는 문자열로 저장되므로 JSON.parse로 배열 형태로 되돌립니다.
    return JSON.parse(localStorage.getItem("cartItems")) || [];
  } catch (error) {
    // 저장된 값이 깨져 있어도 페이지가 멈추지 않도록 빈 배열로 처리합니다.
    return [];
  }
}

function saveCartItem(item) {
  const cart = readCartItems();

  // 이미 장바구니에 있는 상품이면 새로 추가하지 않고 수량만 더합니다.
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

function removeCartItem(productId) {
  // 추천 상품 아이콘을 다시 눌렀을 때 해당 상품만 장바구니에서 제거합니다.
  const nextCart = readCartItems().filter(function (cartItem) {
    return cartItem.id !== productId;
  });

  localStorage.setItem("cartItems", JSON.stringify(nextCart));
}

function hasCartItem(productId) {
  // 새로고침 후에도 이미 담긴 추천 상품은 active 상태로 표시하기 위한 확인 함수입니다.
  return readCartItems().some(function (cartItem) {
    return cartItem.id === productId;
  });
}

// ==================== 3. 장바구니 완료 팝업 ====================

function showDetailCartPopup() {
  // 같은 팝업이 여러 번 겹쳐 뜨지 않도록 기존 팝업이 있으면 중단합니다.
  if (document.querySelector(".compare-popup")) return;

  // 팝업은 HTML에 미리 두지 않고, 장바구니 버튼을 눌렀을 때 동적으로 생성합니다.
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
  cancelButton.textContent = "계속 보기";

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

  // 팝업 바깥 어두운 영역을 눌러도 닫히게 처리합니다.
  popup.addEventListener("click", function (event) {
    if (event.target === popup) {
      popup.remove();
    }
  });
}

// ==================== 4. Similar Products 슬라이더 ====================

function setupSimilarSlick() {
  const slider = $(".similar-slider .product-list");
  if (!slider.length) return;

  // Slick은 jQuery 기반 슬라이더 플러그인입니다.
  // CDN 로딩이 실패하면 오류를 내지 않고 슬라이더 초기화를 건너뜁니다.
  if (typeof $.fn.slick !== "function") return;

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  function toggleSimilarSlider() {
    const isSlickActive = slider.hasClass("slick-initialized");

    // 모바일에서는 슬라이더를 쓰지 않고 CSS 2열 그리드로 추천 상품 4개만 보여줍니다.
    if (mobileQuery.matches) {
      if (isSlickActive) slider.slick("unslick");
      return;
    }

    // 이미 Slick이 적용된 상태라면 중복 초기화하지 않습니다.
    if (isSlickActive) return;

    slider.slick({
      autoplay: true,
      autoplaySpeed: 1800,
      arrows: false,
      draggable: true,
      dots: false,
      infinite: true,
      pauseOnHover: true,
      slidesToShow: 4,
      slidesToScroll: 1,
      swipe: true,
      swipeToSlide: true,
      touchMove: true,
      speed: 500,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 2
          }
        }
      ]
    });
  }

  toggleSimilarSlider();

  // 화면 너비가 모바일/데스크탑으로 바뀔 때 Slick 적용 여부를 다시 판단합니다.
  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", toggleSimilarSlider);
  } else {
    mobileQuery.addListener(toggleSimilarSlider);
  }
}

// ==================== 5. 상품 상세 데이터 렌더링 ====================

async function initProductDetail() {
  const catalog = await loadProductCatalog();
  const products = catalog.products;

  // product-detail.html?id=상품ID 형태의 URL에서 id 값을 읽습니다.
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const fallbackId = catalog.fallbackId;

  // 존재하지 않는 id로 접근하면 기본 상품을 보여줍니다.
  const currentId = products[requestedId] ? requestedId : fallbackId;
  const product = products[currentId];
  const sharedDetailImages = catalog.sharedDetailImages;

  // 아래 DOM 변수들은 렌더링/이벤트 함수 안에서 반복해서 사용됩니다.
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
  let quantity = 1;

  // 페이지 진입 시 필요한 화면 렌더링과 이벤트 연결을 한 번에 실행합니다.
  renderProductSummary();
  renderDetailImages();
  renderColorChips();
  renderSpecifications();
  bindQuantityControls();
  bindAddToCart();
  bindTabs();
  renderSimilarProducts();
  setupSimilarSlick();

  // fallback 상품을 보여준 경우, 주소창도 실제 fallback id로 정리합니다.
  if (!products[requestedId]) {
    history.replaceState(null, "", "./product-detail.html?id=" + fallbackId);
  }

  // ---------- 기본 상품 정보 ----------

  function renderProductSummary() {
    // 브라우저 탭 제목과 상단 상품명/가격/설명을 현재 상품 데이터로 채웁니다.
    document.title = product.name + " | NODE";
    productTitle.textContent = product.name;
    productPrice.textContent = formatPrice(product.price);
    productDescription.textContent = product.description;
    productInfo.setAttribute("data-brand", product.brand);
  }

  // ---------- 상세 이미지 ----------

  function renderDetailImages() {
    // 상세페이지 중간에 들어가는 공통 이미지 영역입니다.
    // 상품별 이미지가 아니라 category.json의 sharedDetailImages를 함께 사용합니다.
    detailHero.style.backgroundImage =
      'linear-gradient(90deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.18)), url("' +
      sharedDetailImages[0] +
      '")';

    detailImagePrimary.src = sharedDetailImages[2];
    detailImageSecondary.src = sharedDetailImages[1];

    detailRepeatImages.forEach(function (image, index) {
      image.src = sharedDetailImages[index % sharedDetailImages.length];
    });
  }

  // ---------- 색상칩 / 대표 이미지 ----------

  function getProductColors() {
    // JSON에 colors 배열이 있으면 그 값을 그대로 색상칩에 사용합니다.
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors;
    }

    // colors가 없는 상품도 이미지 개수만큼 기본 색상칩이 나오도록 fallback을 만듭니다.
    return product.images.map(function (image, index) {
      return {
        name: index === 0 ? "Default" : "Option " + (index + 1),
        hex: index === 0 ? "#171717" : "#f5f5f0",
        imageIndex: index
      };
    });
  }

  function setMainImage(image, index) {
    // 대표 이미지를 바꾸고, 썸네일/색상칩의 활성 상태도 같은 index로 맞춥니다.
    mainImageElement.src = image;

    thumbnails.forEach(function (thumbnail, thumbnailIndex) {
      thumbnail.classList.toggle("is-active", thumbnailIndex === index);
    });

    colorChipList.querySelectorAll(".color-chip").forEach(function (chip) {
      const isActive = Number(chip.dataset.imageIndex) === index;
      chip.classList.toggle("is-active", isActive);
    });
  }

  function renderColorChips() {
    const productColors = getProductColors();

    // 기존 색상칩을 비운 뒤 현재 상품 기준으로 다시 생성합니다.
    colorChipList.textContent = "";

    productColors.forEach(function (color) {
      const imageIndex = Number(color.imageIndex);
      const image = product.images[imageIndex];
      const chip = document.createElement("button");

      chip.className = "color-chip";
      chip.type = "button";
      chip.dataset.imageIndex = String(imageIndex);
      chip.style.backgroundColor = color.hex || "#ddd";
      chip.disabled = !image;

      // 색상칩 클릭 시 해당 색상에 연결된 상품 이미지로 변경합니다.
      chip.addEventListener("click", function () {
        if (image) setMainImage(image, imageIndex);
      });

      colorChipList.appendChild(chip);
    });

    thumbnails.forEach(function (thumbnail, index) {
      const image = product.images[index];

      // 상품 이미지보다 썸네일 버튼이 많을 경우 빈 썸네일은 비활성화합니다.
      if (!image) {
        thumbnail.disabled = true;
        return;
      }

      thumbnail.style.backgroundImage = 'url("' + image + '")';

      // 썸네일 클릭 시 대표 이미지를 해당 이미지로 변경합니다.
      thumbnail.addEventListener("click", function () {
        setMainImage(image, index);
      });
    });

    // 첫 진입 시에는 첫 번째 상품 이미지를 대표 이미지로 보여줍니다.
    setMainImage(product.images[0], 0);
  }

  // ---------- 사양 정보 ----------

  function renderSpecifications() {
    const currentSpecifications = catalog.specifications[currentId] || [];

    // 상품마다 스펙 개수가 다를 수 있어서 비운 뒤 현재 상품 스펙만 다시 넣습니다.
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
  }

  // ==================== 6. 이벤트 연결 ====================

  // ---------- 수량 조절 ----------

  function updateQuantity() {
    // 화면에 보이는 수량과 minus 버튼 활성 상태를 현재 quantity 값에 맞춥니다.
    quantityValue.textContent = quantity;
    quantityMinus.disabled = quantity === 1;
  }

  function bindQuantityControls() {
    updateQuantity();

    // 수량은 1보다 작아질 수 없게 막습니다.
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
  }

  // ---------- 상세 상품 장바구니 ----------

  function bindAddToCart() {
    addToCartButton.addEventListener("click", function () {
      // 현재 상세 상품과 선택한 수량을 장바구니 저장 형식에 맞춰 넘깁니다.
      saveCartItem({
        id: currentId,
        name: product.name,
        brand: product.brand,
        salePrice: product.price,
        qty: quantity,
        img: product.images[0]
      });

      if (typeof updateCartBadge === "function") {
        updateCartBadge();
      }

      showDetailCartPopup();
    });
  }

  // ---------- 탭 전환 ----------

  function bindTabs() {
    tabButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const selectedTab = button.dataset.tab;

        // 클릭한 탭 버튼만 is-active 상태로 만듭니다.
        tabButtons.forEach(function (tabButton) {
          tabButton.classList.toggle("is-active", tabButton === button);
        });

        // 버튼의 data-tab 값과 id가 일치하는 패널만 보여줍니다.
        tabPanels.forEach(function (panel) {
          panel.hidden = panel.id !== selectedTab;
        });
      });
    });
  }

  // ---------- 추천 상품 ----------

  function getSimilarEntries() {
    // 1순위: 현재 상품과 같은 브랜드이면서 현재 상품은 아닌 것.
    let similarEntries = Object.entries(products).filter(function (entry) {
      return entry[0] !== currentId && entry[1].brand === product.brand;
    });

    // 같은 브랜드 상품이 부족하면 다른 브랜드 상품으로 남은 칸을 채웁니다.
    if (similarEntries.length < similarCards.length) {
      const otherEntries = Object.entries(products).filter(function (entry) {
        return entry[0] !== currentId && entry[1].brand !== product.brand;
      });

      similarEntries = similarEntries.concat(otherEntries);
    }

    return similarEntries;
  }

  function renderSimilarProducts() {
    const similarEntries = getSimilarEntries();

    similarCards.forEach(function (card, index) {
      const entry = similarEntries[index];
      if (!entry) return;

      // HTML에 미리 만들어둔 카드 틀에 실제 추천 상품 데이터를 주입합니다.
      const similarId = entry[0];
      const similarProduct = entry[1];
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
      cartButton.classList.toggle("is-active", hasCartItem(similarId));
      cartButton.setAttribute("aria-pressed", String(hasCartItem(similarId)));

      cartButton.addEventListener("click", function () {
        const isAlreadyInCart = hasCartItem(similarId);

        if (isAlreadyInCart) {
          removeCartItem(similarId);
          cartButton.classList.remove("is-active");
          cartButton.setAttribute("aria-pressed", "false");

          if (typeof updateCartBadge === "function") {
            updateCartBadge();
          }

          return;
        }

        // 추천 상품 카드에서는 수량 선택이 없으므로 1개로 장바구니에 담습니다.
        saveCartItem({
          id: similarId,
          name: similarProduct.name,
          brand: similarProduct.brand,
          salePrice: similarProduct.price,
          qty: 1,
          img: similarProduct.images[0]
        });

        cartButton.classList.add("is-active");
        cartButton.setAttribute("aria-pressed", "true");

        if (typeof updateCartBadge === "function") {
          updateCartBadge();
        }

        showDetailCartPopup();
      });
    });
  }
}

initProductDetail().catch(function (error) {
  // 데이터 로딩 실패나 렌더링 에러가 나면 콘솔에서 확인할 수 있게 남깁니다.
  console.error(error);
});
