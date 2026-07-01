/*
  [이 파일의 역할]
  1. 카드 목록을 배열로 관리합니다.
  2. 배열을 이용해 카드 HTML을 만듭니다.
  3. 추가/수정/삭제 후 배열을 localStorage에 저장합니다.
  4. 저장이 끝나면 카드 목록을 다시 그립니다.
*/

// ==================== 기본 카드 데이터 ====================
// [수정 포인트] 처음 표시할 카드사, 브랜드, 끝 4자리, 유효기간, 색상
// primary는 한 카드만 true로 설정하세요.
const defaultCards = [
  {
    company: "신한카드",
    brand: "VISA",
    lastNumber: "2486",
    expiry: "08/29",
    color: "card-dark",
    primary: true
  },
  {
    company: "현대카드",
    brand: "MASTER",
    lastNumber: "7312",
    expiry: "11/28",
    color: "card-blue",
    primary: false
  },
  {
    company: "국민카드",
    brand: "VISA",
    lastNumber: "9041",
    expiry: "03/30",
    color: "card-light",
    primary: false
  }
];

// ==================== 저장된 카드 불러오기 ====================
let cards = [];
const savedCards = localStorage.getItem("mypageCards");

if (savedCards) {
  // 이전에 결제수단 페이지에서 저장한 카드 목록이 있으면 그 데이터를 우선 사용합니다.
  // 저장된 글자를 다시 카드 배열로 바꿉니다.
  cards = JSON.parse(savedCards);
} else {
  // 저장된 데이터가 없으면 화면 예시용 기본 카드 3개를 localStorage에 저장해 초기값으로 사용합니다.
  cards = defaultCards;
  saveCards();
}

const cardList = document.querySelector(".payment-card-list");
const cardCount = document.querySelector(".section-heading > span");
const addCardButton = document.querySelector(".primary-button");

// 카드 정보를 브라우저 localStorage에 저장
function saveCards() {
  // 카드 배열은 페이지를 이동해도 유지되어야 하므로 localStorage에 문자열로 저장합니다.
  // 배열은 바로 저장할 수 없어서 JSON.stringify로 글자로 바꿉니다.
  localStorage.setItem("mypageCards", JSON.stringify(cards));
}

// ==================== 카드 화면 만들기 ====================
// [수정 포인트] 동적으로 만들어지는 카드 HTML 구조
function createCardHtml(card, index) {
  let primaryBadge = "";
  let primaryButton = '<button type="button" data-action="primary" data-index="' + index + '">기본으로 설정</button>';

  if (card.primary === true) {
    // 기본 결제수단인 카드는 배지를 보여주고, 기본 설정 버튼은 숨깁니다.
    primaryBadge = '<span class="primary-badge">기본 결제 수단</span>';
    primaryButton = "";
  }

  // 어려운 백틱 문자열 대신 짧은 문자열을 + 기호로 이어 붙였습니다.
  let html = "";

  html += '<article class="payment-method">';
  html += '  <div class="card-visual ' + card.color + '">';
  html += '    <div class="card-top">';
  html += '      <span class="card-chip" aria-hidden="true"></span>';
  html += '      <strong>' + card.brand + '</strong>';
  html += '    </div>';
  html += '    <p>••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;' + card.lastNumber + '</p>';
  html += '    <div class="card-bottom">';
  html += '      <span>KIM HYUNSOO</span>';
  html += '      <span>' + card.expiry + '</span>';
  html += '    </div>';
  html += '  </div>';
  html += '  <div class="method-info">';
  html += '    <div>';
  html +=        primaryBadge;
  html += '      <h3>' + card.company + '</h3>';
  html += '      <p>개인 · ' + card.brand + ' · ' + card.lastNumber + '</p>';
  html += '    </div>';
  html += '    <div class="method-actions">';
  html +=        primaryButton;
  html += '      <button type="button" data-action="edit" data-index="' + index + '">수정</button>';
  html += '      <button type="button" class="danger" data-action="delete" data-index="' + index + '">삭제</button>';
  html += '    </div>';
  html += '  </div>';
  html += '</article>';

  return html;
}

// 카드 목록 출력
function renderCards() {
  let html = "";

  // 현재 cards 배열을 기준으로 카드 HTML을 다시 만듭니다.
  // 추가/수정/삭제 후에는 이 함수를 다시 호출해서 화면을 최신 상태로 맞춥니다.
  for (let i = 0; i < cards.length; i++) {
    html += createCardHtml(cards[i], i);
  }

  if (cards.length === 0) {
    html = "<p>등록된 결제 수단이 없습니다.</p>";
  }

  cardList.innerHTML = html;
  cardCount.textContent = "총 " + cards.length + "개";
  // innerHTML로 버튼들이 새로 만들어지기 때문에 렌더링 후 이벤트를 다시 연결해야 합니다.
  addCardEvents();
}

// ==================== 카드 버튼 이벤트 ====================
// 카드 목록을 다시 그릴 때마다 버튼 이벤트도 다시 연결
function addCardEvents() {
  const actionButtons = document.querySelectorAll(".method-actions button");

  for (let i = 0; i < actionButtons.length; i++) {
    actionButtons[i].addEventListener("click", function () {
      // 버튼의 data-action 값으로 기본 설정/수정/삭제 중 어떤 동작인지 구분합니다.
      const action = this.getAttribute("data-action");
      const index = Number(this.getAttribute("data-index"));

      if (action === "primary") {
        setPrimaryCard(index);
      }

      if (action === "edit") {
        editCard(index);
      }

      if (action === "delete") {
        deleteCard(index);
      }
    });
  }
}

// 기본 결제수단 설정
function setPrimaryCard(index) {
  // 한 번에 하나의 카드만 기본 결제수단이 될 수 있으므로 전체 primary를 false로 초기화합니다.
  for (let i = 0; i < cards.length; i++) {
    cards[i].primary = false;
  }

  cards[index].primary = true;
  saveCards();
  renderCards();
  alert("기본 결제 수단이 변경되었습니다.");
}

// [수정 포인트] 현재는 prompt로 카드사와 유효기간만 수정
function editCard(index) {
  // 현재 프로젝트에서는 별도 모달 대신 prompt로 카드 이름과 유효기간만 간단히 수정합니다.
  const company = prompt("카드사 이름을 입력해주세요.", cards[index].company);
  const expiry = prompt("유효기간을 입력해주세요. 예: 08/29", cards[index].expiry);

  if (company === null || expiry === null) {
    return;
  }

  if (company.trim() === "" || expiry.trim() === "") {
    alert("카드사와 유효기간을 모두 입력해주세요.");
    return;
  }

  cards[index].company = company.trim();
  cards[index].expiry = expiry.trim();

  saveCards();
  renderCards();
  alert("카드 정보가 수정되었습니다.");
}

// 카드 삭제
function deleteCard(index) {
  const result = confirm(cards[index].company + "를 삭제하시겠어요?");

  if (result === false) {
    return;
  }

  const wasPrimary = cards[index].primary;
  cards.splice(index, 1);

  // 삭제한 카드가 기본 카드였으면 남아 있는 첫 번째 카드를 새 기본 카드로 지정합니다.
  if (wasPrimary === true && cards.length > 0) {
    cards[0].primary = true;
  }

  saveCards();
  renderCards();
}

// [수정 포인트] 현재는 prompt로 새 카드 정보를 입력받음
function addNewCard() {
  // 새 카드 등록도 prompt로 값을 입력받고, 필수값 검증 후 cards 배열에 추가합니다.
  const company = prompt("카드사 이름을 입력해주세요. 예: 삼성카드");

  if (company === null) {
    return;
  }

  const brand = prompt("카드 브랜드를 입력해주세요. 예: VISA");
  const lastNumber = prompt("카드 마지막 4자리를 입력해주세요.");
  const expiry = prompt("유효기간을 입력해주세요. 예: 08/29");

  if (!company || !brand || !lastNumber || !expiry) {
    alert("모든 카드 정보를 입력해주세요.");
    return;
  }

  if (lastNumber.length !== 4 || isNaN(Number(lastNumber))) {
    alert("카드 마지막 번호는 숫자 4자리로 입력해주세요.");
    return;
  }

  // CSS 카드 색상 클래스를 순서대로 반복 사용
  const colorNames = ["card-dark", "card-blue", "card-light"];
  const color = colorNames[cards.length % colorNames.length];

  let isPrimary = false;

  if (cards.length === 0) {
    // 카드가 하나도 없는 상태에서 새로 등록하면 자동으로 기본 결제수단이 됩니다.
    isPrimary = true;
  }

  const newCard = {
    company: company.trim(),
    brand: brand.trim().toUpperCase(),
    lastNumber: lastNumber,
    expiry: expiry.trim(),
    color: color,
    primary: isPrimary
  };

  cards.push(newCard);
  saveCards();
  renderCards();
  alert("새 결제 수단이 등록되었습니다.");
}

// ==================== 최초 실행 ====================
addCardButton.addEventListener("click", addNewCard);
renderCards();
