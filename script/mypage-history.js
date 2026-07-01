/*
  [이 파일의 역할]
  1. 표의 모든 결제내역 행(tr)을 가져옵니다.
  2. 선택한 기간과 상태에 맞는 행만 배열에 담습니다.
  3. 한 페이지에 필요한 개수만 화면에 보여줍니다.
*/

// ==================== 자주 수정하는 설정 ====================
// [수정 포인트] 한 페이지에 보여줄 결제내역 개수
const ITEMS_PER_PAGE = 2;

// 필터와 표 요소 가져오기
// 결제내역 페이지는 HTML 테이블에 있는 tr들을 가져와서 필터링/페이지네이션만 JS로 처리합니다.
const periodSelect = document.querySelector(".history-filters label:nth-child(1) select");
const statusSelect = document.querySelector(".history-filters label:nth-child(2) select");
const searchButton = document.querySelector(".history-filters button");
const tableRows = document.querySelectorAll(".history-table tbody tr");
const pageButtons = document.querySelectorAll(".pagination button");

let currentPage = 1;
let visibleRows = [];

// ==================== 상태 / 기간 필터 ====================
// [수정 포인트] HTML 옵션 문구를 바꾸면 아래 문자열도 함께 변경
function checkStatus(row) {
  // 선택된 상태값과 각 행의 .status 텍스트를 비교해서 보여줄 행인지 판단합니다.
  const selectedStatus = statusSelect.value;
  const rowStatus = row.querySelector(".status").textContent;

  if (selectedStatus === "전체 상태") {
    return true;
  }

  if (selectedStatus === "취소·환불" && rowStatus === "환불 완료") {
    return true;
  }

  return selectedStatus === rowStatus;
}

// 선택한 기간 안에 있는 결제인지 확인
function checkPeriod(row) {
  // 선택된 기간값과 각 행의 결제 날짜를 비교해서 기간 안에 있는 행인지 판단합니다.
  const selectedPeriod = periodSelect.value;

  if (selectedPeriod === "전체 기간") {
    return true;
  }

  // "2026. 06. 18"을 Date가 읽기 쉬운 "2026-06-18"로 변경합니다.
  let dateText = row.children[1].textContent.trim();
  dateText = dateText.split(". ").join("-");
  dateText = dateText.replace(".", "");
  const paymentDate = new Date(dateText);
  // [수정 포인트] 샘플 데이터의 조회 기준 날짜
  // 현재 날짜 대신 샘플 결제내역 기준일을 고정해서 필터 결과가 항상 같게 나오도록 했습니다.
  const standardDate = new Date("2026-06-23");
  let monthCount = 6;

  if (selectedPeriod === "최근 1년") {
    monthCount = 12;
  }

  standardDate.setMonth(standardDate.getMonth() - monthCount);

  return paymentDate >= standardDate;
}

// 필터에 맞는 행 모으기
function filterRows() {
  visibleRows = [];

  // 상태 조건과 기간 조건을 모두 만족하는 행만 visibleRows에 모아둡니다.
  for (let i = 0; i < tableRows.length; i++) {
    if (checkStatus(tableRows[i]) && checkPeriod(tableRows[i])) {
      visibleRows.push(tableRows[i]);
    }
  }
}

// ==================== 결제내역 출력 / 페이지 번호 ====================
function renderHistory() {
  // 먼저 전체 행을 숨기고, 현재 페이지에 해당하는 행만 다시 보여줍니다.
  for (let i = 0; i < tableRows.length; i++) {
    tableRows[i].style.display = "none";
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  // slice를 쓰지 않고 시작 번호부터 끝 번호 전까지 직접 반복합니다.
  for (let i = start; i < end; i++) {
    if (visibleRows[i] !== undefined) {
      visibleRows[i].style.display = "table-row";
    }
  }

  updatePagination();
}

// 페이지 버튼 상태 변경
function updatePagination() {
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / ITEMS_PER_PAGE));

  // 필터 결과 개수에 따라 페이지 번호 버튼을 숨기거나 활성화합니다.
  for (let i = 0; i < pageButtons.length; i++) {
    const button = pageButtons[i];
    const text = button.textContent;

    button.classList.remove("active");

    if (!isNaN(Number(text))) {
      // 삼항연산자 대신 if/else로 버튼 표시 여부를 정합니다.
      if (Number(text) <= totalPages) {
        button.style.display = "block";
      } else {
        button.style.display = "none";
      }

      if (Number(text) === currentPage) {
        button.classList.add("active");
      }
    }
  }

  pageButtons[0].disabled = currentPage === 1;
  pageButtons[pageButtons.length - 1].disabled = currentPage === totalPages;
}

// ==================== 클릭 이벤트 ====================
// 페이지 버튼 클릭
for (let i = 0; i < pageButtons.length; i++) {
  pageButtons[i].addEventListener("click", function () {
    const buttonText = this.textContent;
    const totalPages = Math.max(1, Math.ceil(visibleRows.length / ITEMS_PER_PAGE));

    // 이전/다음/숫자 버튼을 모두 같은 이벤트 안에서 처리합니다.

    if (buttonText === "이전" && currentPage > 1) {
      currentPage--;
    } else if (buttonText === "다음" && currentPage < totalPages) {
      currentPage++;
    } else if (!isNaN(Number(buttonText))) {
      currentPage = Number(buttonText);
    }

    renderHistory();
  });
}

// 조회 버튼 클릭
searchButton.addEventListener("click", function () {
  // 조회 버튼을 누르면 1페이지로 돌아간 뒤 필터 결과를 다시 계산합니다.
  currentPage = 1;
  filterRows();
  renderHistory();

  if (visibleRows.length === 0) {
    alert("선택한 조건에 맞는 결제 내역이 없습니다.");
  }
});

// [수정 포인트] 현재 상세 버튼은 alert로 주문 정보를 보여줍니다.
const detailLinks = document.querySelectorAll(".history-table td > a");

for (let i = 0; i < detailLinks.length; i++) {
  detailLinks[i].addEventListener("click", function (event) {
    event.preventDefault();

    // 상세 링크(td)의 부모는 td, 그 부모가 현재 결제내역 tr입니다.
    // 상세 링크는 실제 상세 페이지 이동 대신 현재 행의 주문 정보를 alert로 보여주는 방식입니다.
    const row = this.parentElement.parentElement;
    const productName = row.querySelector(".order-info strong").textContent;
    const orderNumber = row.querySelector(".order-info small").textContent;
    const price = row.children[3].textContent.trim();
    const status = row.querySelector(".status").textContent;

    alert(
      "상품명: " + productName +
      "\n주문번호: " + orderNumber +
      "\n결제금액: " + price +
      "\n상태: " + status
    );
  });
}

// ==================== 최초 실행 ====================
filterRows();
renderHistory();
