/*
  상품 데이터: js/catalog/products.json
  화면 동작: 이 파일

  상품명, 가격, 이미지, 설명, 제품 사양을 수정할 때는
  products.json만 수정합니다.
*/

async function loadProductCatalog() {
  const response = await fetch("./js/catalog/products.json");

  if (!response.ok) {
    throw new Error("상품 데이터를 불러오지 못했습니다.");
  }

  return response.json();
}

async function initProductDetail() {
  const catalog = await loadProductCatalog();
  const products = catalog.products;

  // ==================== 현재 URL의 상품 선택 ====================
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const fallbackId = catalog.fallbackId;
  const product = products[requestedId] || products[fallbackId];
  const productSpecifications = catalog.specifications;
  const sharedDetailImages = catalog.sharedDetailImages;

  window.productSpecifications = productSpecifications;
  
  const productTitle = document.querySelector(".product-info h1");
  const productPrice = document.querySelector(".product-info .price");
  const productDescription = document.querySelector(".product-info .description");
  const productCategory = document.querySelector(".product-info");
  const mainImage = document.querySelector(".main-image");
  const mainImageElement = mainImage.querySelector("img");
  const thumbnails = document.querySelectorAll(".thumb");
  const colorChips = document.querySelectorAll(".color-chip");
  const detailHero = document.querySelector(".detail-hero");
  const detailImagePrimary = document.querySelector(".detail-image-primary");
  const detailImageSecondary = document.querySelector(".detail-image-secondary");
  const detailRepeatImages = document.querySelectorAll(".detail-repeat-image");
  const similarCards = document.querySelectorAll(".similar-products .card");
  const quantityMinus = document.querySelector(".quantity-minus");
  const quantityPlus = document.querySelector(".quantity-plus");
  const quantityValue = document.querySelector(".quantity-value");
  const tabButtons = document.querySelectorAll(".product-tabs button");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const specificationList = document.querySelector(".specification-list");
  
  function formatPrice(price) {
    return price.toLocaleString("ko-KR") + "원";
  }
  
  function setMainImage(image, index) {
    mainImageElement.src = image;
    mainImageElement.alt = product.name + " 상품 이미지 " + (index + 1);
  
    for (let i = 0; i < thumbnails.length; i++) {
      thumbnails[i].classList.toggle("is-active", i === index);
    }

    for (let i = 0; i < colorChips.length; i++) {
      colorChips[i].classList.toggle("is-active", i === index);
      colorChips[i].setAttribute("aria-pressed", i === index ? "true" : "false");
    }
  }
  
  document.title = product.name + " | NODE";
  productTitle.textContent = product.name;
  productPrice.textContent = formatPrice(product.price);
  productDescription.textContent = product.description;
  productCategory.setAttribute("data-brand", product.brand);
  detailHero.style.backgroundImage =
    'linear-gradient(90deg, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.18)), url("' +
    sharedDetailImages[0] +
    '")';
  
  /*
    모든 상품의 상세정보 영역은 아래 공통 이미지 4장을 사용합니다.
    이미지를 교체할 때 파일명은 유지하고
    image/product-detail/shared 폴더의 원본만 바꾸면 됩니다.
  */
  // ==================== 모든 상품 공통 상세 이미지 ====================
  // 파일 교체 위치: image/product-detail/shared/
  detailImagePrimary.src = sharedDetailImages[2];
  detailImagePrimary.alt = "NODE 오디오 라이프스타일 상세 이미지";
  detailImageSecondary.src = sharedDetailImages[1];
  detailImageSecondary.alt = "NODE 오디오 소재 상세 이미지";
  
  for (let i = 0; i < detailRepeatImages.length; i++) {
    const repeatedImage = sharedDetailImages[i % sharedDetailImages.length];
    detailRepeatImages[i].src = repeatedImage;
    detailRepeatImages[i].alt = "NODE 공통 상세 이미지 " + (i + 1);
  }
  
  const currentSpecifications =
    productSpecifications[requestedId] || productSpecifications[fallbackId];
  
  specificationList.textContent = "";
  
  for (let i = 0; i < currentSpecifications.length; i++) {
    const specificationRow = document.createElement("div");
    const specificationName = document.createElement("dt");
    const specificationValue = document.createElement("dd");
  
    specificationName.textContent = currentSpecifications[i][0];
    specificationValue.textContent = currentSpecifications[i][1];
    specificationRow.appendChild(specificationName);
    specificationRow.appendChild(specificationValue);
    specificationList.appendChild(specificationRow);
  }
  
  for (let i = 0; i < thumbnails.length; i++) {
    const image = product.images[i];

    if (!image) {
      thumbnails[i].style.backgroundImage = "none";
      thumbnails[i].classList.remove("is-active");
      thumbnails[i].disabled = true;
      thumbnails[i].setAttribute("aria-label", "등록된 상품 이미지 없음");
      continue;
    }

    thumbnails[i].style.backgroundImage = 'url("' + image + '")';
    thumbnails[i].disabled = false;
    thumbnails[i].setAttribute("aria-label", product.name + " 상품 이미지 " + (i + 1));
    thumbnails[i].addEventListener("click", function () {
      setMainImage(image, i);
    });
  }

  for (let i = 0; i < colorChips.length; i++) {
    const imageIndex = Number(colorChips[i].dataset.imageIndex);
    const image = product.images[imageIndex];

    colorChips[i].disabled = !image;
    colorChips[i].addEventListener("click", function () {
      if (image) {
        setMainImage(image, imageIndex);
      }
    });
  }
  
  setMainImage(product.images[0], 0);
  
  // ==================== 수량 선택 기능 ====================
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
  
  updateQuantity();
  
  // ==================== 상세정보·리뷰·배송 탭 기능 ====================
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function () {
      const selectedTab = this.dataset.tab;
  
      for (let j = 0; j < tabButtons.length; j++) {
        const isSelected = tabButtons[j] === this;
        tabButtons[j].classList.toggle("is-active", isSelected);
        tabButtons[j].setAttribute("aria-selected", String(isSelected));
      }
  
      for (let j = 0; j < tabPanels.length; j++) {
        const isSelected = tabPanels[j].id === selectedTab;
        tabPanels[j].hidden = !isSelected;
        tabPanels[j].classList.toggle("is-active", isSelected);
      }
    });
  }
  
  // ==================== 추천 상품 자동 연결 ====================
  const currentId = products[requestedId] ? requestedId : fallbackId;
  let similarEntries = Object.entries(products).filter(function (entry) {
    return entry[0] !== currentId && entry[1].brand === product.brand;
  });
  
  if (similarEntries.length < similarCards.length) {
    const otherEntries = Object.entries(products).filter(function (entry) {
      return entry[0] !== currentId && entry[1].brand !== product.brand;
    });
    similarEntries = similarEntries.concat(otherEntries);
  }
  
  for (let i = 0; i < similarCards.length; i++) {
    const similarId = similarEntries[i][0];
    const similarProduct = similarEntries[i][1];
    const similarUrl = "./product-detail.html?id=" + encodeURIComponent(similarId);
    const similarImageBox = similarCards[i].querySelector(".similar-image-box");
    const similarImageLink = similarCards[i].querySelector(".similar-product-link");
    const similarNameLink = similarCards[i].querySelector(".similar-name a");
    const similarCartButton = similarCards[i].querySelector(".similar-cart-button");
  
    similarImageBox.style.backgroundImage = 'url("' + similarProduct.images[0] + '")';
    similarImageLink.href = similarUrl;
    similarImageLink.setAttribute("aria-label", similarProduct.name + " 상세페이지 보기");
    similarNameLink.href = similarUrl;
    similarNameLink.textContent = similarProduct.name;
    similarCards[i].querySelector(".similar-brand").textContent = similarProduct.brand;
    similarCards[i].querySelector(".similar-price").textContent = formatPrice(similarProduct.price);
  
    similarCartButton.innerHTML =
      '<svg aria-hidden="true" viewBox="0 0 24 24">' +
      '<path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6"></path>' +
      '<circle cx="9" cy="20" r="1"></circle>' +
      '<circle cx="17" cy="20" r="1"></circle>' +
      "</svg>";
  
    similarCartButton.addEventListener("click", function () {
      this.classList.toggle("is-active");
    });
  }
  
  if (!products[requestedId]) {
    history.replaceState(null, "", "./product-detail.html?id=" + fallbackId);
  }
  
}

initProductDetail().catch(function (error) {
  console.error(error);

  const productTitle = document.querySelector(".product-info h1");
  const productDescription = document.querySelector(".product-info .description");

  if (productTitle) {
    productTitle.textContent = "상품 정보를 불러오지 못했습니다.";
  }

  if (productDescription) {
    productDescription.textContent =
      "로컬 서버로 페이지를 실행한 뒤 다시 시도해 주세요.";
  }
});
