/* [마이페이지 메인 JS]
  1. localStorage에서 저장된 데이터를 가져와 화면에 그립니다.
  2. 카드 정보를 활용해 요약 정보를 업데이트합니다.
*/

// ==================== 1. 사용자 정보 표시 ====================
const savedUserName = localStorage.getItem("userName");
const userNameElement = document.querySelector(".user-info-card h2");
const userAvatarElement = document.querySelector(".user-avatar");

if (savedUserName) {
  // 로그인/회원가입 쪽에서 저장한 userName이 있으면 마이페이지 상단 이름과 아바타에 반영합니다.
  // 아바타는 이름의 첫 글자만 보여주는 방식입니다.
  // 이름이 있을 경우 화면에 반영
  userNameElement.innerHTML = `${savedUserName} <span>님</span>`; // 템플릿 리터럴 사용
  userAvatarElement.textContent = savedUserName.charAt(0);
}

// 로그아웃 시 회원정보는 유지하고 로그인 상태만 해제
const logoutLink = document.querySelector(".logo-out a");

if (logoutLink) {
  logoutLink.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
  });
}

// ==================== 2. 결제 수단 정보 표시 ====================
const savedCards = localStorage.getItem("mypageCards");
// 데이터가 없으면 빈 배열로 초기화 (에러 방지)
// 결제수단 페이지에서 저장한 카드 배열을 읽어서 메인 요약 카드와 기본 결제수단에 사용합니다.
const cards = savedCards ? JSON.parse(savedCards) : [];

// 요약 카드 개수 업데이트 함수
function updateCardCount() {
  const summaryCards = document.querySelectorAll(".summary-grid .card");
  // 3번째 카드(인덱스 2)의 숫자를 수정
  const paymentCount = summaryCards[2].querySelector("strong");
  
  // 데이터가 있으면 카드 배열 길이를, 없으면 기본값 3으로 설정
  // 저장된 카드가 있으면 실제 개수를 보여주고, 없으면 HTML 기본 카드 개수인 3개를 보여줍니다.
  const count = cards.length > 0 ? cards.length : 3;
  paymentCount.innerHTML = `${count}<small>개</small>`;
}

// 기본 카드 정보 업데이트 함수
function updatePrimaryCard() {
  if (cards.length === 0) return; // 카드가 없으면 함수 종료

  // 배열에서 primary가 true인 카드를 찾음 (없으면 첫 번째 카드)
  // primary가 true인 카드를 기본 결제수단으로 보여주고, 없으면 첫 번째 카드를 사용합니다.
  const primaryCard = cards.find(card => card.primary === true) || cards[0];

  const creditCard = document.querySelector(".credit-card");
  
  // 카드 정보 입력
  creditCard.querySelector("span").textContent = primaryCard.brand;
  creditCard.querySelector("strong").textContent = `•••• •••• •••• ${primaryCard.lastNumber}`;
  creditCard.querySelector("div small:last-child").textContent = primaryCard.expiry;
}

// ==================== 3. 최근 결제 내역 클릭 이벤트 ====================
function addTransactionEvents() {
  const transactionItems = document.querySelectorAll(".transaction-list li");

  // for문 대신 배열의 forEach 사용
  transactionItems.forEach((item) => {
    item.addEventListener("click", () => {
      // 이벤트 발생 시 클릭된 요소 내부에서 정보 추출
      // 최근 결제내역 항목을 클릭하면 해당 li 안의 상품명/결제정보/가격을 읽어 간단히 보여줍니다.
      const productName = item.querySelector("div:nth-child(2) strong").textContent;
      const paymentInfo = item.querySelector("div:nth-child(2) span").textContent;
      const price = item.lastElementChild.textContent;

      alert(`${productName}\n${paymentInfo}\n결제 금액: ${price}`);
    });
  });
}

// ==================== 4. 초기 실행 ====================
// 함수들을 호출하여 화면을 구성
updateCardCount();
updatePrimaryCard();
addTransactionEvents();
