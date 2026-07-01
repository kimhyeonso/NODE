window.addEventListener("DOMContentLoaded", function () {
  function GalleryAnimation__init() {
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const galleryWrapper = document.querySelector(".gallery-wrapper");
    const galleryImages = document.querySelectorAll(".gallery-section img");
    const galleryMessage = document.querySelector(".gallery-message");

    if (!galleryWrapper || galleryImages.length === 0 || !galleryMessage) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: galleryWrapper,
        start: "top top",
        end: "+=1200",
        pin: true,
        scrub: 1
      }
    });

    tl.to(galleryImages, {
      scale: 0.8,
      filter: "blur(10px)",
      x: () => gsap.utils.random(-1000, 1000),
      y: () => gsap.utils.random(-600, 600),
      rotate: () => gsap.utils.random(-90, 90),
      opacity: 0,
      stagger: {
        amount: 0.8,
        from: "random"
      }
    }).to(galleryMessage, {
      opacity: 1,
      scale: 1,
      duration: 1
    }, "-=0.2");

    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });
  }

  function ContentAnimation__init() {
    const animateItems = document.querySelectorAll(".intro-text, .small-images, .intro-image, .product-card");

    if (animateItems.length === 0) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("on", entry.isIntersecting);
      });
    }, {
      threshold: 0.1
    });

    animateItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  GalleryAnimation__init();
  ContentAnimation__init();
});
