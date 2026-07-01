console.clear();

// 장바구니 총 개수(badge) 업데이트 - 전역 함수로 선언
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  let totalQty = 0;

  for (let i = 0; i < cart.length; i++) {
    totalQty += cart[i].qty;
  }

  const $badge = $(".cartCount");

  if (totalQty > 0) {
    $badge.text(totalQty).css("display", "inline-block");
  } else {
    $badge.hide();
  }
}

$(function(){

// 스크롤 위치에 따라 메인 메뉴바 스타일 변경
function TopMenuScroll__init() {
  const $topMenuBar = $(".top-menu-bar");

  function updateTopMenuBar() {
    $topMenuBar.toggleClass("scrolled", $(window).scrollTop() > 0);
  }

  updateTopMenuBar();
  $(window).on("scroll", updateTopMenuBar);
}

TopMenuScroll__init();

//호버시 서브 메뉴 보임
function TopMenu__init() {
  let closeTimer = null;

  $(".gnb > li").mouseenter(function () {
    let $snb = $(this).children(".snb");

    clearTimeout(closeTimer);
    $(".snb").not($snb).stop(true, true).slideUp(250);
    $snb.stop(true, true).slideDown(250);
  });

  $(".top-menu-bar").mouseleave(function () {
    closeTimer = setTimeout(function () {
      $(".snb").stop(true, true).slideUp(250);
    }, 250);
  });

  $(".snb").mouseenter(function () {
    clearTimeout(closeTimer);
  });

  $(".snb").mouseleave(function () {
    closeTimer = setTimeout(function () {
      $(".snb").stop(true, true).slideUp(250);
    }, 250);
  });
}

TopMenu__init();

// 사이드 메뉴 열기 / 닫기
function MobileSideBar__init() {
  $(".hamburger-btn").on("click", function () {
    $(".side-menu-box").addClass("active");
    $(".dim").addClass("active");
    $("body").addClass("scroll-lock");
  });

  $(".exit-btn, .dim").on("click", function () {
    $(".side-menu-box").removeClass("active");
    $(".dim").removeClass("active");
    $("body").removeClass("scroll-lock");
  });
}

MobileSideBar__init();

// 사이드 1차 메뉴 클릭 시 2차 메뉴 열기
function SideMenu__show() {
  $(".side-main-gnb > li > a").on("click", function (e) {
    let $this = $(this);
    let $li = $this.parent();
    let $subMenu = $this.siblings(".side-sub-menu");

    if ($subMenu.length === 0) return;

    e.preventDefault();

    $li.toggleClass("active");
    $subMenu.stop().slideToggle(300);

    $li
      .siblings()
      .removeClass("active")
      .find(".side-sub-menu")
      .stop()
      .slideUp(300);
  });
}

SideMenu__show();

// 로그인 상태 체크
const userName = localStorage.getItem("userName");
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

if (isLoggedIn && userName) {
  $(".before-login").hide();
  $(".after-login").show();
  $("#header-username").text(userName);

  $(".side-before-login").hide();
  $(".side-after-login").show();
  $("#side-username").text(userName);
  $(".menu-icon .line").hide();
} else {
  $(".before-login").show();
  $(".after-login").hide();

  $(".side-before-login").show();
  $(".side-after-login").hide();
  $(".menu-icon .line").show();
}

// 로그인 전에는 공통 헤더의 마이페이지와 장바구니 이용 제한
$(".top-menu-bar").on(
  "click",
  'a[href$="mypage-main.html"], a[href$="shoppingCart.html"]',
  function (event) {
    if (isLoggedIn) return;

    event.preventDefault();
    alert("로그인 해주세요.");
  }
);

//스크롤시 팝업창 불투명도 조절
$(window).on("scroll", function () {
  if ($(window).scrollTop() > 50) {
    $(".popup").addClass("scrolled");
  } else {
    $(".popup").removeClass("scrolled");
  }
});

//쿠키창 x 클릭 시 24시간 보이지 않기
function PopupVisibility__update() {
  $("body").toggleClass("popup-visible", $(".popup").is(":visible"));
}

$(".closeBtn").on("click", () => {
  if ($("#closeCheckBox").is(":checked")) {
    setCookie("todaypopup", "close", 1);
  }

  $(".popup").hide();
  PopupVisibility__update();
});

function setCookie(name, value, day) {
  let date = new Date();
  date.setDate(date.getDate() + day);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name) {
  let cook = document.cookie.split(";");

  for (let i = 0; i < cook.length; i++) {
    let cookie = cook[i].trim();
    if (cookie.split("=")[0] === name) {
      return cookie.split("=")[1];
    }
  }

  return '';
}

if (getCookie("todaypopup") === "close") {
  $(".popup").hide();
}

PopupVisibility__update();

//탑버튼 클릭시 맨 위로 올라가게하기
function TopButton__update() {
  $(".topBtn").toggleClass("scrolled", $(window).scrollTop() > 50);
}

TopButton__update();
$(window).on("scroll", TopButton__update);

  $(".topBtn").on("click", function () {
    $("html, body").animate({ scrollTop: 0 },500);
});

// 페이지 로드 시 뱃지 1회 실행
updateCartBadge();

})