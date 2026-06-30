
// 첫번째 섹션 구현
function BrandLogoMorph__init() {
  const scrollContainer = document.querySelector(".section-container");
  const logoSection = document.querySelector(".brand-logo-section");
  const storySection = document.querySelector(".brand-story-section");
  const sourceImg = document.querySelector(".brand-logo-section img");
  const targetImg = document.querySelector(".brand-story-container .logo img");

  if (!scrollContainer || !logoSection || !storySection || !sourceImg || !targetImg) return;

  const morph = document.createElement("div");
  const morphSource = document.createElement("img");
  const morphTarget = document.createElement("img");

  morph.className = "brand-logo-morph";
  morphSource.className = "brand-logo-morph-source";
  morphTarget.className = "brand-logo-morph-target";
  morphSource.src = sourceImg.src;
  morphSource.alt = "";
  morphTarget.src = targetImg.src;
  morphTarget.alt = "";
  morph.setAttribute("aria-hidden", "true");

  morph.append(morphSource, morphTarget);
  document.body.appendChild(morph);

  let ticking = false;
  let progress = 0;
  let displayProgress = 0;
  let animationId = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeInOut(value) {
    return value * value * (3 - 2 * value);
  }

  function getContentRect(element) {
    const containerRect = scrollContainer.getBoundingClientRect();
    const rect = element.getBoundingClientRect();

    return {
      top: rect.top - containerRect.top + scrollContainer.scrollTop,
      left: rect.left - containerRect.left,
      width: rect.width,
      height: rect.height
    };
  }

  function getViewportRectAt(element, sectionTop) {
    const containerRect = scrollContainer.getBoundingClientRect();
    const contentRect = getContentRect(element);

    return {
      top: containerRect.top + contentRect.top - sectionTop,
      left: containerRect.left + contentRect.left,
      width: contentRect.width,
      height: contentRect.height
    };
  }

  function renderMorph() {
    const startY = logoSection.offsetTop;
    const endY = storySection.offsetTop;
    const easedProgress = easeInOut(displayProgress);
    const sourceRect = getViewportRectAt(sourceImg, startY);
    const targetRect = getViewportRectAt(targetImg, endY);

    const currentLeft = sourceRect.left + (targetRect.left - sourceRect.left) * easedProgress;
    const currentTop = sourceRect.top + (targetRect.top - sourceRect.top) * easedProgress;
    const currentWidth = sourceRect.width + (targetRect.width - sourceRect.width) * easedProgress;
    const currentHeight = sourceRect.height + (targetRect.height - sourceRect.height) * easedProgress;

    morph.style.opacity = "1";
    morph.style.width = `${currentWidth}px`;
    morph.style.height = `${currentHeight}px`;
    morph.style.transform = `translate3d(${currentLeft}px, ${currentTop}px, 0)`;

    morphSource.style.opacity = String(1 - easedProgress);
    morphTarget.style.opacity = String(easedProgress);
  }

  function animateMorph() {
    const distance = progress - displayProgress;

    displayProgress += distance * 0.12;

    if (Math.abs(distance) < 0.001) {
      displayProgress = progress;
    }

    const isActive = displayProgress > 0.001 && displayProgress < 0.999;

    document.body.classList.toggle("brand-logo-morphing", isActive);

    if (isActive) {
      renderMorph();
    } else {
      morph.style.opacity = "0";
    }

    if (displayProgress !== progress) {
      animationId = requestAnimationFrame(animateMorph);
    } else {
      animationId = null;
    }
  }

  function updateMorph() {
    ticking = false;

    const startY = logoSection.offsetTop;
    const endY = storySection.offsetTop;
    const rawProgress = (scrollContainer.scrollTop - startY) / (endY - startY);

    progress = clamp(rawProgress, 0, 1);

    if (rawProgress <= 0 || rawProgress >= 1) {
      progress = rawProgress <= 0 ? 0 : 1;
      displayProgress = progress;
      document.body.classList.remove("brand-logo-morphing");
      morph.style.opacity = "0";

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      return;
    }

    if (animationId === null) {
      animationId = requestAnimationFrame(animateMorph);
    }
  }

  function requestUpdate() {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(updateMorph);
  }

  scrollContainer.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  sourceImg.addEventListener("load", requestUpdate);
  targetImg.addEventListener("load", requestUpdate);

  updateMorph();
}

BrandLogoMorph__init();


// 네번째 섹션 애니메이션 구현
function MenuScrollAnimation__init() {
  const scrollContainer = document.querySelector(".section-container");
  const menuSection = document.querySelector(".menu-section");
  const menuItems = document.querySelectorAll(".menu-section .title-box > .title, .menu-section .box");

  if (!menuSection || menuItems.length === 0) return;

  menuSection.classList.add("menu-animation-ready");

  menuItems.forEach(function(item, index) {
    item.style.setProperty("--menu-delay", `${index * 0.16}s`);
  });

  const menuObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      menuItems.forEach(function(item) {
        item.classList.toggle("on", entry.isIntersecting);
      });

      // if (entry.isIntersecting) {
      //   menuObserver.unobserve(entry.target);
      // }
    });
  }, {
    root: scrollContainer || null,
    threshold: 0.4
  });

  menuObserver.observe(menuSection);

  function activateMenuIfInView() {
    const sectionRect = menuSection.getBoundingClientRect();
    const containerRect = scrollContainer
      ? scrollContainer.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight };
    const isInView = sectionRect.top < containerRect.bottom * 0.75 && sectionRect.bottom > containerRect.top;

    if (isInView) {
      menuItems.forEach(function(item) {
        item.classList.add("on");
      });
      menuObserver.unobserve(menuSection);
    }
  }

  requestAnimationFrame(activateMenuIfInView);
}

MenuScrollAnimation__init();

//다섯번째 섹션 애니메이션 구현
const searchCopy = document.querySelectorAll(".search-copy")

const observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
        if(entry.isIntersecting){
            entry.target.classList.add("on")
        }else{
            entry.target.classList.remove("on")
        }
    })
},{
    threshold : .3
})

searchCopy.forEach(function(box){
    observer.observe(box)
})


function SearchDragAnimation__init() {
  const $dragArea = $(".seach-section .dragArea");
  const $slider = $(".seach-section .slider");
  const $cursorCircle = $(".seach-section .cursorCircle");

  if ($dragArea.length === 0 || $slider.length === 0) return;

  let isDown = false;
  let startX = 0;
  let moveX = 0;
  let mouseX = 0;
  let mouseY = 0;
  let circleX = 0;
  let circleY = 0;
  let dragDistance = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getMinMoveX() {
    return Math.min($dragArea.outerWidth() - $slider[0].scrollWidth, 0);
  }

  function moveSlider(value) {
    moveX = clamp(value, getMinMoveX(), 0);
    $slider.css({
      transform: `translateX(${moveX}px)`
    });
  }

  //드레그 영역에 마우스가 들어오면 원 보이기
  $dragArea.on("pointerenter", function(e) {
    const event = e.originalEvent || e;
    if (event.pointerType === "touch") return;

    $cursorCircle.addClass("on");
    circleX = event.clientX;
    circleY = event.clientY;
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  // 드레그 영역에서 마우스가 나가면 원 숨기기
  $dragArea.on("pointerleave", function(e) {
    const event = e.originalEvent || e;
    if (event.pointerType === "touch") return;

    $cursorCircle.removeClass("on drag");
    $dragArea.removeClass("dragging");
    isDown = false;
  });

  //드레그 영역에서 시간차로 마우스 따라다님
  $dragArea.on("pointermove", function(e) {
    const event = e.originalEvent || e;

    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  function cursorMove() {
    if (isDown) {
      circleX = mouseX;
      circleY = mouseY;
    } else {
      circleX = circleX + (mouseX - circleX) * 0.1;
      circleY = circleY + (mouseY - circleY) * 0.1;
    }

    $cursorCircle.css({
      left: circleX,
      top: circleY
    });

    requestAnimationFrame(cursorMove);
  }

  cursorMove();

  //마우스 클릭할때
  $dragArea.on("pointerdown", function(e) {
    const event = e.originalEvent || e;

    if (event.pointerType === "touch") return;

    isDown = true;
    dragDistance = 0;
    startX = event.clientX - moveX;
    mouseX = event.clientX;
    mouseY = event.clientY;

    $dragArea.addClass("dragging");
    $cursorCircle.addClass("drag");

    e.preventDefault();

    if (this.setPointerCapture && event.pointerId !== undefined) {
      this.setPointerCapture(event.pointerId);
    }
  });

  //클릭한 상태에서만 드레그
  $(document).on("pointermove", function(e) {
    if (!isDown) return;

    const event = e.originalEvent || e;

    mouseX = event.clientX;
    mouseY = event.clientY;

    const nextMoveX = event.clientX - startX;
    dragDistance = Math.max(dragDistance, Math.abs(nextMoveX - moveX));

    moveSlider(nextMoveX);
  });

  $(document).on("pointerup pointercancel", function() {
    isDown = false;
    $dragArea.removeClass("dragging");
    $cursorCircle.removeClass("drag");
  });

  $dragArea.on("click", "a", function(e) {
    if (dragDistance > 6) {
      e.preventDefault();
    }
  });

  $(window).on("resize", function() {
    moveSlider(moveX);
  });
}

SearchDragAnimation__init();

// 캔버스 구현
const canvas = document.getElementById("soundNodeCanvas");
const soundNodeSection = canvas?.closest(".sound-node-section");
const ctx = canvas?.getContext("2d");

let width;
let height;
let particles = [];
let animationId = null;
let isVisible = false;

const mouse = {
  x: null,
  y: null,
  radius: 180
};

function resizeCanvas() {
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  createParticles();
}

function createParticles() {
  particles = [];

  const particleCount = width < 768 ? 45 : 90;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4
    });
  }
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fill();
  });
}

function updateParticles() {
  particles.forEach((particle) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > width) {
      particle.speedX *= -1;
    }

    if (particle.y < 0 || particle.y > height) {
      particle.speedY *= -1;
    }
  });
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 130) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 130})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function connectMouse() {
  particles.forEach((particle) => {
    if (mouse.x === null || mouse.y === null) return;

    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(201, 167, 106, ${1 - distance / mouse.radius})`;
      ctx.lineWidth = 1;
      ctx.moveTo(mouse.x, mouse.y);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size + 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201, 167, 106, 0.8)";
      ctx.fill();
    }
  });
}

function animate() {
  if (!isVisible || !ctx) {
    animationId = null;
    return;
  }

  ctx.clearRect(0, 0, width, height);

  drawParticles();
  connectParticles();
  connectMouse();
  updateParticles();

  animationId = requestAnimationFrame(animate);
}

function updatePointer(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();

  mouse.x = clientX - rect.left;
  mouse.y = clientY - rect.top;
}

function resetPointer() {
  mouse.x = null;
  mouse.y = null;
}

if (canvas && ctx && soundNodeSection) {
  soundNodeSection.addEventListener("pointermove", (event) => {
    updatePointer(event.clientX, event.clientY);
  });

  soundNodeSection.addEventListener("pointerleave", resetPointer);
  soundNodeSection.addEventListener("pointercancel", resetPointer);

  const sectionObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;

      if (isVisible && animationId === null) {
        animationId = requestAnimationFrame(animate);
      }
    },
    { threshold: 0.05 }
  );

  sectionObserver.observe(soundNodeSection);
  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
}
