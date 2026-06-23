console.clear();

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
  $(".gnb > li").mouseenter(function () {
    let $snb = $(this).children(".snb");

    $(".snb").not($snb).stop(true, true).slideUp(250);
    $snb.stop(true, true).slideDown(250);
  });

  $(".top-menu-bar").mouseleave(function () {
    $(".snb").stop(true, true).slideUp(250);
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

//사이드 1차메뉴 클릭시 2차메뉴
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

})
