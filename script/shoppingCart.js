const cartList = document.getElementById("cart-list");
const cartEmpty = document.getElementById("cart-empty");
const summaryOriginal = document.getElementById("summary-original");
const summaryDiscount = document.getElementById("summary-discount");
const summaryShipping = document.getElementById("summary-shipping");
const summaryTotal = document.getElementById("summary-total");
const btnCheckout = document.getElementById("btn-checkout");
const recommendList = document.getElementById("recommend-list");

// localStorage에서 장바구니 데이터 가져오기
function getCartItems() {
  return JSON.parse(localStorage.getItem("cartItems")) || [];
}

// localStorage에 장바구니 데이터 저장
function saveCartItems(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

// 가격 포맷 (숫자 → "1,000,000원")
function formatPrice(num) {
  return num.toLocaleString("ko-KR") + "원";
}

// 합계 계산 및 화면 업데이트
function updateSummary() {
  const cart = getCartItems();

  let totalOriginal = 0;
  let totalSale = 0;

  for (let i = 0; i < cart.length; i++) {
    totalOriginal += cart[i].originalPrice * cart[i].qty;
    totalSale += cart[i].salePrice * cart[i].qty;
  }

  const discount = totalOriginal - totalSale;
  const shipping = totalSale === 0 ? 0 : 0; // 무료배송 (추후 조건 변경 가능)

  summaryOriginal.textContent = formatPrice(totalOriginal);
  summaryDiscount.textContent = "-" + formatPrice(discount);
  summaryShipping.textContent = shipping === 0 ? "무료" : formatPrice(shipping);
  summaryTotal.textContent = formatPrice(totalSale + shipping);
}

// 상품 한 행(li) 생성
function createCartItem(item, index) {
  const li = document.createElement("li");
  li.className = "cart-item";
  li.setAttribute("data-index", index);

  // 상품 정보
  const infoDiv = document.createElement("div");
  infoDiv.className = "cart-item-info";

  const img = document.createElement("img");
  img.className = "cart-item-img";
  img.src = item.img;
  img.alt = item.name;

  const textDiv = document.createElement("div");
  textDiv.className = "cart-item-text";

  const brand = document.createElement("p");
  brand.className = "item-brand";
  brand.textContent = item.brand;

  const name = document.createElement("p");
  name.className = "item-name";
  name.textContent = item.name;

  textDiv.appendChild(brand);
  textDiv.appendChild(name);
  infoDiv.appendChild(img);
  infoDiv.appendChild(textDiv);

  // 단가
  const priceDiv = document.createElement("div");
  priceDiv.className = "cart-item-price";
  priceDiv.textContent = formatPrice(item.salePrice);

  // 수량 조절
  const qtyDiv = document.createElement("div");
  qtyDiv.className = "cart-qty";

  const minusBtn = document.createElement("button");
  minusBtn.type = "button";
  minusBtn.textContent = "-";
  minusBtn.setAttribute("aria-label", "수량 줄이기");

  const qtyNum = document.createElement("span");
  qtyNum.className = "cart-qty-num";
  qtyNum.textContent = item.qty;

  const plusBtn = document.createElement("button");
  plusBtn.type = "button";
  plusBtn.textContent = "+";
  plusBtn.setAttribute("aria-label", "수량 늘리기");

  qtyDiv.appendChild(minusBtn);
  qtyDiv.appendChild(qtyNum);
  qtyDiv.appendChild(plusBtn);

  // 합계
  const totalDiv = document.createElement("div");
  totalDiv.className = "cart-item-total";
  totalDiv.textContent = formatPrice(item.salePrice * item.qty);

  // 삭제 버튼
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "cart-delete";
  deleteBtn.type = "button";
  deleteBtn.textContent = "✕";
  deleteBtn.setAttribute("aria-label", "상품 삭제");

  li.appendChild(infoDiv);
  li.appendChild(priceDiv);
  li.appendChild(qtyDiv);
  li.appendChild(totalDiv);
  li.appendChild(deleteBtn);

  // 수량 + 버튼
  plusBtn.addEventListener("click", function () {
    const cart = getCartItems();
    cart[index].qty += 1;
    saveCartItems(cart);
    renderCart();

    if (typeof updateCartBadge === "function") {
      updateCartBadge();
    }
  });

  // 수량 - 버튼 (최소 1)
  minusBtn.addEventListener("click", function () {
    const cart = getCartItems();
    if (cart[index].qty <= 1) return;
    cart[index].qty -= 1;
    saveCartItems(cart);
    renderCart();

    if (typeof updateCartBadge === "function") {
      updateCartBadge();
    }
  });

  // 삭제 버튼
  deleteBtn.addEventListener("click", function () {
    const cart = getCartItems();
    cart.splice(index, 1);
    saveCartItems(cart);
    renderCart();

    if (typeof updateCartBadge === "function") {
      updateCartBadge();
    }
  });

  return li;
}

// 장바구니 전체 렌더링
function renderCart() {
  const cart = getCartItems();

  // 기존 상품 행 제거 (cart-empty는 유지)
  const existingItems = cartList.querySelectorAll(".cart-item");
  for (let i = 0; i < existingItems.length; i++) {
    existingItems[i].remove();
  }

  if (cart.length === 0) {
    // 빈 장바구니 메시지 표시
    cartEmpty.style.display = "block";
    updateSummary();
    return;
  }

  // 상품 있으면 빈 메시지 숨기고 상품 렌더링
  cartEmpty.style.display = "none";

  for (let i = 0; i < cart.length; i++) {
    const li = createCartItem(cart[i], i);
    cartList.appendChild(li);
  }

  updateSummary();
}

// YOU MAY NEED 추천 상품 렌더링
// 장바구니에 없는 상품 중 최대 3개를 추천합니다.
function renderRecommend() {
  if (recommendList === null) return;

  // 전체 상품 데이터 (product-main.html과 동일한 상품)
  const allProducts = [
    { name: "Home Studio Entry Monitor", brand: "NODE STUDIO", salePrice: 390000, img: "./image/Studio/studio_11.jpg" },
    { name: "Best Value Nearfield Monitor", brand: "NODE STUDIO", salePrice: 790000, img: "./image/Studio/studio_8.jpg" },
    { name: "Professional Coaxial Monitor", brand: "NODE STUDIO", salePrice: 1890000, img: "./image/Studio/studio_4.jpg" },
    { name: "3-Way Studio Monitor", brand: "NODE STUDIO", salePrice: 3890000, img: "./image/Studio/studio_6.jpg" },
    { name: "Battery Busking Amp Set", brand: "NODE LIVE", salePrice: 620000, img: "./image/stage/stage_1.jpg" },
    { name: "Compact PA Speaker", brand: "NODE LIVE", salePrice: 790000, img: "./image/stage/stage_2.jpg" },
    { name: "12-Inch Live Main Speaker", brand: "NODE LIVE", salePrice: 1180000, img: "./image/stage/stage_3.jpg" },
    { name: "Festival Main Speaker", brand: "NODE LIVE", salePrice: 3290000, img: "./image/stage/stage_11.jpg" }
  ];

  const cart = getCartItems();
  const cartNames = [];
  for (let i = 0; i < cart.length; i++) {
    cartNames.push(cart[i].name);
  }

  // 장바구니에 없는 상품만 필터링
  const candidates = [];
  for (let i = 0; i < allProducts.length; i++) {
    if (cartNames.indexOf(allProducts[i].name) === -1) {
      candidates.push(allProducts[i]);
    }
  }

  // 최대 3개만
  const recommended = candidates.slice(0, 3);

  recommendList.innerHTML = "";

  for (let i = 0; i < recommended.length; i++) {
    const product = recommended[i];

    const li = document.createElement("li");
    li.className = "recommend-item";

    const img = document.createElement("img");
    img.className = "recommend-item-img";
    img.src = product.img;
    img.alt = product.name;

    const infoDiv = document.createElement("div");
    infoDiv.className = "recommend-item-info";

    const name = document.createElement("p");
    name.className = "recommend-item-name";
    name.textContent = product.name;

    const price = document.createElement("p");
    price.className = "recommend-item-price";
    price.textContent = formatPrice(product.salePrice);

    infoDiv.appendChild(name);
    infoDiv.appendChild(price);

    const goLink = document.createElement("a");
    goLink.className = "recommend-item-go";
    goLink.href = "./product-main.html";
    goLink.textContent = "Go";

    li.appendChild(img);
    li.appendChild(infoDiv);
    li.appendChild(goLink);
    recommendList.appendChild(li);
  }
}

// 구매하기 버튼 로그인 체크
btnCheckout.addEventListener("click", function () {
  const cart = getCartItems();

  // 장바구니가 비어있으면 구매 불가
  if (cart.length === 0) {
    showEmptyCartPopup();
    return;
  }

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    // 로그인 상태 → 결제 완료 팝업
    showOrderCompletePopup();
  } else {
    // 비로그인 상태 → 로그인 유도 팝업
    showLoginPopup();
  }
});

// 빈 장바구니 안내 팝업
function showEmptyCartPopup() {
  if (document.querySelector(".empty-popup") !== null) return;

  const popup = document.createElement("div");
  popup.className = "empty-popup";

  const popupBox = document.createElement("div");
  popupBox.className = "empty-popup-box";

  const message = document.createElement("strong");
  message.textContent = "장바구니에 담긴 상품이 없습니다.";

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.textContent = "확인";
  confirmBtn.addEventListener("click", function () {
    popup.remove();
  });

  popupBox.appendChild(message);
  popupBox.appendChild(confirmBtn);
  popup.appendChild(popupBox);
  document.body.appendChild(popup);

  popup.addEventListener("click", function (e) {
    if (e.target === popup) popup.remove();
  });
}

// 결제 완료 팝업
function showOrderCompletePopup() {
  if (document.querySelector(".order-popup") !== null) return;

  const popup = document.createElement("div");
  popup.className = "order-popup";

  const popupBox = document.createElement("div");
  popupBox.className = "order-popup-box";

  const icon = document.createElement("div");
  icon.className = "order-popup-icon";
  icon.textContent = "✓";

  const message = document.createElement("strong");
  message.textContent = "결제가 완료되었습니다.";

  const sub = document.createElement("p");
  sub.textContent = "이용해주셔서 감사합니다.";

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.textContent = "확인";
  confirmBtn.addEventListener("click", function () {
    popup.remove();

    // 장바구니 비우기
    saveCartItems([]);
    renderCart();
    renderRecommend();

    if (typeof updateCartBadge === "function") {
      updateCartBadge();
    }
  });

  popupBox.appendChild(icon);
  popupBox.appendChild(message);
  popupBox.appendChild(sub);
  popupBox.appendChild(confirmBtn);
  popup.appendChild(popupBox);
  document.body.appendChild(popup);
}

// 로그인 유도 팝업
function showLoginPopup() {
  if (document.querySelector(".login-popup") !== null) return;

  const popup = document.createElement("div");
  popup.className = "login-popup";

  const popupBox = document.createElement("div");
  popupBox.className = "login-popup-box";

  const message = document.createElement("strong");
  message.textContent = "로그인이 필요한 서비스입니다.";

  const sub = document.createElement("p");
  sub.textContent = "로그인 페이지로 이동하시겠습니까?";

  const actions = document.createElement("div");
  actions.className = "login-popup-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "취소";
  cancelBtn.addEventListener("click", function () {
    popup.remove();
  });

  const loginBtn = document.createElement("a");
  loginBtn.href = "./login.html";
  loginBtn.textContent = "로그인하기";

  actions.appendChild(cancelBtn);
  actions.appendChild(loginBtn);
  popupBox.appendChild(message);
  popupBox.appendChild(sub);
  popupBox.appendChild(actions);
  popup.appendChild(popupBox);
  document.body.appendChild(popup);

  // 팝업 바깥 클릭 시 닫기
  popup.addEventListener("click", function (e) {
    if (e.target === popup) {
      popup.remove();
    }
  });
}

// 페이지 로드 시 실행
renderCart();
renderRecommend();