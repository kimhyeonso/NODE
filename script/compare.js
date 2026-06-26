const compareItems = JSON.parse(localStorage.getItem("compareItems")) || [];

const compareEmpty = document.querySelector(".compare-empty");
const compareTableWrap = document.querySelector(".compare-table-wrap");
const compareTableBody = document.querySelector(".compare-table-body");
const clearButton = document.querySelector(".compare-clear-btn");

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

// specs 배열에서 항목명으로 값 찾기
function getSpec(specs, label) {
  if (!specs) return "-";
  const found = specs.find(function(s) { return s[0] === label; });
  return found ? found[1] : "-";
}

if (compareItems.length === 0) {
  compareEmpty.style.display = "block";
  compareTableWrap.style.display = "none";
} else {
  compareEmpty.style.display = "none";
  compareTableWrap.style.display = "block";

  // 비교할 스펙 항목 (products.json specifications 기준)
  // 상품마다 항목명이 다를 수 있으므로 후보 라벨을 배열로 처리
const firstId = compareItems[0].id;
const isAccessory = firstId.includes("cable") || firstId.includes("stand");

const productSpecRows = [
  { label: "제품 유형",  keys: ["제품 유형"] },
  { label: "주파수 응답", keys: ["주파수 응답"] },
  { label: "최대 출력",  keys: ["최대 출력"] },
  { label: "출력",       keys: ["앰프 출력", "정격 출력", "허용 입력"] },
  { label: "드라이버",   keys: ["드라이버"] },
  { label: "입력 방식",  keys: ["입력 방식"] },
  { label: "크기",       keys: ["크기"] },
  { label: "무게",       keys: ["무게", "제품 무게"] },
];

const accessorySpecRows = [
  { label: "제품 유형",  keys: ["제품 유형"] },
  { label: "길이",       keys: ["길이", "전체 높이", "높이", "높이 조절"] },
  { label: "커넥터",     keys: ["커넥터"] },
  { label: "도체",       keys: ["도체"] },
  { label: "차폐 방식",  keys: ["차폐 방식"] },
  { label: "외경",       keys: ["외경", "상판 크기"] },
  { label: "피복",       keys: ["피복", "소재"] },
  { label: "보증 기간",  keys: ["보증 기간"] },
];

const specRows = isAccessory ? accessorySpecRows : productSpecRows;

  function getSpecMulti(specs, keys) {
    if (!specs) return "-";
    for (var i = 0; i < keys.length; i++) {
      var found = specs.find(function(s) { return s[0] === keys[i]; });
      if (found) return found[1];
    }
    return "-";
  }

  compareTableBody.innerHTML = `
    <tr>
      <th>상품</th>
      ${compareItems.map(function(item) {
        return `
          <td>
            <img src="${item.img}" alt="${item.name}">
            <h3>${item.name}</h3>
          </td>
        `;
      }).join("")}
    </tr>

    <tr>
      <th>브랜드</th>
      ${compareItems.map(function(item) {
        return `<td>${item.brand}</td>`;
      }).join("")}
    </tr>

    <tr>
      <th>가격</th>
      ${compareItems.map(function(item) {
        return `<td class="compare-price">${formatPrice(item.price)}</td>`;
      }).join("")}
    </tr>

    ${specRows.map(function(row) {
      return `
        <tr>
          <th>${row.label}</th>
          ${compareItems.map(function(item) {
            return `<td>${getSpecMulti(item.specs, row.keys)}</td>`;
          }).join("")}
        </tr>
      `;
    }).join("")}

    <tr>
      <th>상세보기</th>
      ${compareItems.map(function(item) {
        return `
          <td>
            <a class="compare-detail-link" href="./product-detail.html?id=${item.id}">
              상세보기
            </a>
          </td>
        `;
      }).join("")}
    </tr>
  `;
}

clearButton.addEventListener("click", function () {
  localStorage.removeItem("compareItems");
  location.reload();
});