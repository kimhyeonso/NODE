/*
  [이 파일의 역할]
  1. 회원가입할 때 저장한 이름을 가져옵니다.
  2. 결제수단 페이지에서 저장한 카드 정보를 가져옵니다.
  3. 가져온 값을 마이페이지 메인 화면에 표시합니다.
*/

// ==================== 회원 정보 ====================
// [수정 포인트] 회원가입 JS에서 사용하는 localStorage 이름과 같아야 합니다.
// localStorage는 브라우저를 닫아도 간단한 값을 기억하는 저장 공간입니다.
const savedUserName = localStorage.getItem("userName");
const userName = document.querySelector(".user-info-card h2");
const userAvatar = document.querySelector(".user-avatar");

if (savedUserName && userName && userAvatar) {
  userName.innerHTML = savedUserName + " <span>님</span>";
  userAvatar.textContent = savedUserName.charAt(0);
}

// ==================== 결제 수단 정보 ====================
// 결제수단 페이지에서 저장한 카드 정보 가져오기
const savedCards = localStorage.getItem("mypageCards");
let cards = [];

if (savedCards) {
  // localStorage에는 글자만 저장할 수 있습니다.
  // JSON.parse는 저장된 글자를 다시 배열과 객체로 되돌립니다.
  cards = JSON.parse(savedCards);
}

// [수정 포인트] 요약 카드 순서가 바뀌면 summaryCards[2] 숫자도 변경
function updateCardCount() {
  const summaryCards = document.querySelectorAll(".summary-grid .card");
  const paymentCount = summaryCards[2].querySelector("strong");
  let count = cards.length;

  if (count === 0) {
    count = 3;
  }

  paymentCount.innerHTML = count + "<small>개</small>";
}

// 기본 결제수단 카드 변경
function updatePrimaryCard() {
  if (cards.length === 0) {
    return;
  }

  let primaryCard = cards[0];

  for (let i = 0; i < cards.length; i++) {
    if (cards[i].primary === true) {
      primaryCard = cards[i];
    }
  }

  const creditCard = document.querySelector(".credit-card");

  creditCard.querySelector("span").textContent = primaryCard.brand;
  creditCard.querySelector("strong").textContent = "••••  ••••  ••••  " + primaryCard.lastNumber;
  creditCard.querySelector("div small:last-child").textContent = primaryCard.expiry;
}

// ==================== 최근 결제 내역 클릭 ====================
// [수정 포인트] alert 대신 상세 페이지 이동으로 바꿀 수 있습니다.
function addTransactionEvents() {
  const transactionItems = document.querySelectorAll(".transaction-list li");

  for (let i = 0; i < transactionItems.length; i++) {
    transactionItems[i].addEventListener("click", function () {
      const productName = this.querySelector("div:nth-child(2) strong").textContent;
      const paymentInfo = this.querySelector("div:nth-child(2) span").textContent;
      // li의 마지막 자식 strong이 결제 금액입니다.
      const price = this.lastElementChild.textContent;

      alert(productName + "\n" + paymentInfo + "\n결제 금액: " + price);
    });
  }
}

// ==================== 최초 실행 ====================
updateCardCount();
updatePrimaryCard();
addTransactionEvents();
