/**
 * Product Detail Page
 *
 * 이 파일은 product-detail.html 한 페이지에서 사용하는 스크립트입니다.
 * 상품 데이터는 js/catalog/category.json에서 가져오고,
 * URL의 id 값에 맞춰 상세 정보 / 이미지 / 추천 상품을 화면에 렌더링합니다.
 *
 * 섹션 안내
 * 1. 공통 상수 / 유틸
 * 2. 장바구니 저장 로직
 * 3. 장바구니 완료 팝업
 * 4. 애니메이션 구현: Similar Products 자동 슬라이드
 * 5. 상품 상세 데이터 렌더링
 * 6. 이벤트 연결
 */

// ==================== 1. 공통 상수 / 유틸 ====================

const SIMILAR_CART_ICON =
  '<svg aria-hidden="true" viewBox="0 0 24 24">' +
  '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
  '<circle cx="9" cy="20" r="1"></circle>' +
  '<circle cx="17" cy="20" r="1"></circle>' +
  "</svg>";

// 상품 목록, 상세 이미지, 스펙 데이터가 모여 있는 JSON 파일을 불러옵니다.
async function loadProductCatalog() {
  const response = await fetch("./js/catalog/category.json");

  if (!response.ok) {
    throw new Error("상품 데이터를 불러오지 못했습니다.");
  }

  return response.json();
}

// 가격 숫자를 한국어 표기 방식으로 바꿉니다. 예: 2850000 -> 2,850,000원
function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

// ==================== 2. 장바구니 저장 로직 ====================

function readCartItems() {
  try {
    // localStorage에는 문자열로 저장되기 때문에 JSON.parse로 배열 형태로 되돌립니다.
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
  // 추천 상품 카드에서 아이콘을 한 번 더 눌렀을 때 해당 상품만 장바구니에서 제거합니다.
  const nextCart = readCartItems().filter(function (cartItem) {
    return cartItem.id !== productId;
  });

  localStorage.setItem("cartItems", JSON.stringify(nextCart));
}

function hasCartItem(productId) {
  // 새로고침 후에도 이미 담긴 추천 상품이면 버튼 active 상태를 유지하기 위한 확인 함수입니다.
  return readCartItems().some(function (cartItem) {
    return cartItem.id === productId;
  });
}

// ==================== 3. 장바구니 완료 팝업 ====================

function showDetailCartPopup() {
  // 팝업이 이미 떠 있으면 중복 생성하지 않습니다.
  if (document.querySelector(".compare-popup")) return;

  // HTML에 미리 넣지 않고, 장바구니 버튼을 눌렀을 때 필요한 팝업 요소를 만듭니다.
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

// ==================== 4. 애니메이션 구현: Similar Products ====================

function setupSimilarSwiper() {
  const container = document.querySelector(".swiper-container");
  if (!container) return;

  const wrapper = container.querySelector(".swiper-wrapper");
  if (!wrapper) return;

  // 모바일에서는 CSS 그리드로 2열 고정 배치하므로 Swiper를 실행하지 않습니다.
  if (window.matchMedia("(max-width: 768px)").matches) return;

  // 5개 카드만 있을 때도 loop/autoplay가 끊기지 않도록 원본 슬라이드를 한 번 복제합니다.
  if (!wrapper.dataset.cloned) {
    const slides = Array.from(wrapper.querySelectorAll(".swiper-slide"));

    slides.forEach(function (slide) {
      wrapper.appendChild(slide.cloneNode(true));
    });

    wrapper.dataset.cloned = "true";
  }

  if (typeof Swiper === "undefined") return;

  // 데스크톱/태블릿 화면에서는 추천 상품을 자동 슬라이드로 보여줍니다.
  const swiper = new Swiper(".similar-swiper", {
    loop: true,
    speed: 500,
    slidesPerView: 1.2,
    spaceBetween: 14,
    autoplay: {
      delay: 1800,
      disableOnInteraction: false
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 16 },
      900: { slidesPerView: 3, spaceBetween: 18 },
      1200: { slidesPerView: 5, spaceBetween: 15 }
    }
  });

  let hoverDirection = null;
  let hoverTimer = null;

  // 왼쪽/오른쪽 hover 이동을 멈추고 기본 자동 슬라이드를 다시 시작합니다.
  function stopHoverSlide() {
    hoverDirection = null;
    window.clearInterval(hoverTimer);
    hoverTimer = null;
    swiper.autoplay.start();
  }

  // 슬라이더 가장자리 영역에 마우스가 올라가면 해당 방향으로 반복 이동합니다.
  function startHoverSlide(direction) {
    // 이미 같은 방향으로 움직이는 중이면 interval을 새로 만들지 않습니다.
    if (hoverDirection === direction) return;

    window.clearInterval(hoverTimer);
    hoverDirection = direction;
    swiper.autoplay.stop();

    function moveSlide() {
      if (direction === "prev") {
        swiper.slidePrev();
        return;
      }

      swiper.slideNext();
    }

    moveSlide();
    // 마우스를 가장자리에 계속 두면 0.9초마다 한 칸씩 추가 이동합니다.
    hoverTimer = window.setInterval(moveSlide, 900);
  }

  // 카드가 아니라 슬라이더 박스 전체 기준으로 마우스 위치를 계산합니다.
  container.addEventListener("mousemove", function (event) {
    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;

    // 양쪽 25%를 방향 이동 영역으로 사용합니다.
    const edgeSize = rect.width * 0.25;

    if (mouseX <= edgeSize) {
      startHoverSlide("prev");
      return;
    }

    if (mouseX >= rect.width - edgeSize) {
      startHoverSlide("next");
      return;
    }

    // 가운데 영역으로 돌아오면 hover 이동을 멈추고 autoplay로 복귀합니다.
    if (hoverDirection) {
      stopHoverSlide();
    }
  });

  // 슬라이더 밖으로 마우스가 나가도 interval이 남지 않도록 정리합니다.
  container.addEventListener("mouseleave", stopHoverSlide);
}

// ==================== 5. 상품 상세 데이터 렌더링 ====================

async function initProductDetail() {
  const catalog = await loadProductCatalog();
  const products = catalog.products;

  // product-detail.html?id=상품ID 형태의 URL에서 id 값을 읽습니다.
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const fallbackId = catalog.fallbackId;

  // 없는 id로 접근하면 기본 상품으로 보여줍니다.
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
  setupSimilarSwiper();

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
    // 상세 페이지 중간에 들어가는 공통 이미지 영역입니다.
    // 상품별 이미지가 아니라 catalog의 sharedDetailImages를 함께 사용합니다.
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
