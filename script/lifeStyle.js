window.addEventListener("DOMContentLoaded", function () {
  function GalleryAnimation__init() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const galleryWrapper = document.querySelector(".gallery-wrapper");
  const gallerySection = document.querySelector(".gallery-section");
  const galleryImages = document.querySelectorAll(".gallery-section img");
  const galleryMessage = document.querySelector(".gallery-message");

  if (!galleryWrapper || !gallerySection || galleryImages.length === 0 || !galleryMessage) return;

  const cols = 4;
  const rows = 4;
  const tiles = [];

  function getCoverImagePosition(img, imgRect) {
    const naturalWidth = img.naturalWidth || imgRect.width;
    const naturalHeight = img.naturalHeight || imgRect.height;
    const scale = Math.max(imgRect.width / naturalWidth, imgRect.height / naturalHeight);
    const coverWidth = naturalWidth * scale;
    const coverHeight = naturalHeight * scale;

    return {
      width: coverWidth,
      height: coverHeight,
      x: (imgRect.width - coverWidth) / 2,
      y: (imgRect.height - coverHeight) / 2
    };
  }

  function createMosaicTiles() {
    gallerySection.querySelectorAll(".mosaic-tile").forEach(tile => tile.remove());
    tiles.length = 0;

    const sectionRect = gallerySection.getBoundingClientRect();

    galleryImages.forEach((img) => {
      if (window.getComputedStyle(img).display === "none") return;

      const imgRect = img.getBoundingClientRect();
      if (imgRect.width === 0 || imgRect.height === 0) return;

      const imgLeft = imgRect.left - sectionRect.left;
      const imgTop = imgRect.top - sectionRect.top;
      const tileW = imgRect.width / cols;
      const tileH = imgRect.height / rows;
      const coverImage = getCoverImagePosition(img, imgRect);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tile = document.createElement("div");
          tile.className = "mosaic-tile";

          tile.style.left = `${imgLeft + c * tileW}px`;
          tile.style.top = `${imgTop + r * tileH}px`;
          tile.style.width = `${tileW + 0.8}px`;
          tile.style.height = `${tileH + 0.8}px`;

          tile.style.backgroundImage = `url(${img.src})`;
          tile.style.backgroundSize = `${coverImage.width}px ${coverImage.height}px`;
          tile.style.backgroundPosition = `${coverImage.x - c * tileW}px ${coverImage.y - r * tileH}px`;

          gallerySection.appendChild(tile);
          tiles.push(tile);
        }
      }
    });
  }

  let tl;
  let resizeTimer;

  function buildGalleryTimeline() {
    if (tl) {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    }

    gsap.set(galleryImages, { opacity: 1 });
    gsap.set(galleryMessage, { opacity: 0, scale: 0.7 });
    createMosaicTiles();

    tl = gsap.timeline({
      scrollTrigger: {
        trigger: galleryWrapper,
        start: "top top+=80",
        end: "+=1400",
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true
      }
    });

    tl.set(tiles, { opacity: 1 })
    .set(galleryImages, { opacity: 0 }, "<")
    .to(tiles, {
      x: function (index, target) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const screenCenter = window.innerWidth / 2;

        return centerX < screenCenter
          ? gsap.utils.random(-900, -350)
          : gsap.utils.random(350, 900);
      },
      y: () => gsap.utils.random(-180, 180),
      rotate: () => gsap.utils.random(-25, 25),
      opacity: 0,
      duration: 1,
      stagger: {
        amount: 0.8,
        from: "random"
      }
    })
    .to(galleryMessage, {
      opacity: 1,
      scale: 1,
      duration: 0.8
    }, "-=0.2");
  }

  buildGalleryTimeline();

  window.addEventListener("load", function () {
    buildGalleryTimeline();
    ScrollTrigger.refresh();
  });

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      buildGalleryTimeline();
      ScrollTrigger.refresh();
    }, 120);
  });
}

  function ContentAnimation__init() {
    const animateItems = document.querySelectorAll(".intro-text, .small-images, .intro-image, .product-card, .discover-section");

    if (animateItems.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      animateItems.forEach(function (item) {
        item.classList.add("on");
      });
      return;
    }

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
