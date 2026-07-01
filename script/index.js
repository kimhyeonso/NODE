
// 두번째 섹션 구현
function BrandFade__init() {
  const scrollContainer = document.querySelector(".section-container");
  const logoSection = document.querySelector(".brand-logo-section");
  const storySection = document.querySelector(".brand-story-section");

  if (!scrollContainer || !logoSection || !storySection) return;

  function updateFade() {
    const scrollTop = scrollContainer.scrollTop;
    const logoTop = logoSection.offsetTop;

    const fadeStart = logoTop + window.innerHeight * 0.35;

    if (scrollTop >= fadeStart) {
      logoSection.classList.add("fade-out");
    } else {
      logoSection.classList.remove("fade-out");
    }
  }

  const storyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      storySection.classList.toggle("fade-in", entry.isIntersecting);
    });
  }, {
    root: scrollContainer,
    threshold: 0.2
  });

  scrollContainer.addEventListener("scroll", updateFade, { passive: true });
  window.addEventListener("resize", updateFade);
  storyObserver.observe(storySection);

  updateFade();
}

BrandFade__init();

// 두번째 섹션 캔버스 구현
function SoundWaveCanvas__init() {
const canvas = document.getElementById("soundWaveCanvas");
if (!canvas) return;

const ctx = canvas.getContext("2d");
if (!ctx) return;

const soundWaveSection = canvas.closest(".sound-wave-section");
const scrollContainer = document.querySelector(".section-container");

let w, h;
let progress1 = 0;
let progress2 = 0;
let progress3 = 0;
let waveTime = 0;
let animationId = null;

const particles = [];

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  w = rect.width;
  h = rect.height;
  canvas.width = Math.round(w * pixelRatio);
  canvas.height = Math.round(h * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  particles.length = 0;

  const particleCount = w < 768 ? 90 : 180;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.7 + 0.2
    });
  }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(230, 210, 170, ${p.alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawWaveGroup(options) {
  const {
    progress,
    color,
    alpha,
    lineCount,
    amplitude,
    frequency,
    yOffset,
    phase,
    lineGap,
    lineWidth
  } = options;

  const maxX = Math.min(w, w * progress);

  for (let i = 0; i < lineCount; i++) {
    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha - i * 0.018;
    ctx.lineWidth = lineWidth;

    for (let x = 0; x < maxX; x += 8) {
      const percent = x / w;

      const y =
        h * yOffset +
        Math.sin(percent * frequency + phase + i * 0.18) * amplitude +
        Math.sin(percent * frequency * 0.45 + phase) * amplitude * 0.55 +
        i * lineGap;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    if (maxX > 0) {
      const percent = maxX / w;
      const y =
        h * yOffset +
        Math.sin(percent * frequency + phase + i * 0.18) * amplitude +
        Math.sin(percent * frequency * 0.45 + phase) * amplitude * 0.55 +
        i * lineGap;

      ctx.lineTo(maxX, y);
    }

    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function animate() {
  ctx.clearRect(0, 0, w, h);

  drawParticles();

  progress1 += 0.018;
  progress2 += 0.014;
  progress3 += 0.011;

  progress1 = Math.min(progress1, 1);
  progress2 = Math.min(progress2, 1);
  progress3 = Math.min(progress3, 1);

  const isWaveDrawn = progress1 === 1 && progress2 === 1 && progress3 === 1;

  if (isWaveDrawn) {
    waveTime += 0.01;
  }

  drawWaveGroup({
    progress: progress1,
    color: "#d89500",
    alpha: 0.9,
    lineCount: 16,
    amplitude: h * 0.22,
    frequency: 15,
    yOffset: 0.5,
    phase: waveTime + 0.4,
    lineGap: 7,
    lineWidth: 2
  });

  drawWaveGroup({
    progress: progress2,
    color: "#f0dfc1",
    alpha: 0.75,
    lineCount: 10,
    amplitude: h * 0.16,
    frequency: 11,
    yOffset: 0.43,
    phase: waveTime * 1.25 + 2.1,
    lineGap: 5,
    lineWidth: 1.8
  });

  drawWaveGroup({
    progress: progress3,
    color: "#8c8068",
    alpha: 0.55,
    lineCount: 14,
    amplitude: h * 0.25,
    frequency: 18,
    yOffset: 0.48,
    phase: waveTime * 0.85 + 4.2,
    lineGap: 6,
    lineWidth: 1
  });

  animationId = requestAnimationFrame(animate);
}

function startWaveAnimation() {
  if (animationId !== null) return;

  progress1 = 0;
  progress2 = 0;
  progress3 = 0;
  waveTime = 0;

  resizeCanvas();
  animationId = requestAnimationFrame(animate);
}

if (soundWaveSection && "IntersectionObserver" in window) {
  const soundWaveObserver = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          startWaveAnimation();
          soundWaveObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: scrollContainer || null,
      threshold: 0.35
    }
  );

  soundWaveObserver.observe(soundWaveSection);
} else {
  startWaveAnimation();
}
}

SoundWaveCanvas__init();

//세번째 섹션 애니메이션 구현
const soundHeading = document.querySelector(".sound-heading")
const soundHeadingScrollContainer = document.querySelector(".section-container")

const soundHeadingObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
        if(entry.isIntersecting){
            entry.target.classList.add("on")
        }else{
            entry.target.classList.remove("on")
        }
    })
},{
    root: soundHeadingScrollContainer || null,
    threshold : .3
})

if (soundHeading) {
    soundHeadingObserver.observe(soundHeading)
}

function SoundFlowSteps__init() {
  const scrollContainer = document.querySelector(".section-container");
  const soundSection = document.querySelector(".sound-section");
  const soundFlow = soundSection?.querySelector(".sound-flow");
  const soundFlowImage = soundSection?.querySelector(".sound-flow > img");

  if (!scrollContainer || !soundSection || !soundFlow) return;

  const steps = [
    {
      sectionClass: "sound-step-origin",
      label: soundSection.querySelector(".sound-origin"),
      focusPoint: 1 / 3
    },
    {
      sectionClass: "sound-step-node",
      label: soundSection.querySelector(".sound-node"),
      focusPoint: 2 / 3
    },
    {
      sectionClass: "sound-step-destination",
      label: soundSection.querySelector(".sound-destination"),
      focusPoint: 0.9
    },
    {
      sectionClass: "sound-step-closing",
      label: soundSection.querySelector(".sound-closing"),
      focusPoint: 0.9
    }
  ];

  function setActiveStep(activeIndex) {
    steps.forEach(function(step, index) {
      const isDestinationHeld = activeIndex === 3 && index === 2;
      const isActive = index === activeIndex || isDestinationHeld;

      soundSection.classList.toggle(step.sectionClass, isActive);

      if (step.label) {
        step.label.classList.toggle("active", isActive);
      }
    });

    if (activeIndex < 0) return;

    const activeStep = steps[activeIndex];
    const flowRect = soundFlow.getBoundingClientRect();
    const currentShift = parseFloat(getComputedStyle(soundFlow).getPropertyValue("--sound-flow-shift")) || 0;
    const stickyTop = parseFloat(getComputedStyle(soundFlow).top);
    const flowTop = Number.isNaN(stickyTop) ? flowRect.top - currentShift : stickyTop;
    const imageHeight = soundFlow.offsetHeight || flowRect.height;
    const viewportCenter = window.innerHeight / 2;
    const nextShift = viewportCenter - flowTop - imageHeight * activeStep.focusPoint;

    soundFlow.style.setProperty("--sound-flow-shift", nextShift + "px");
  }

  function updateSoundStep() {
    const sectionTop = soundSection.offsetTop;
    const sectionScrollable = Math.max(soundSection.offsetHeight - window.innerHeight, 1);
    const rawProgress = (scrollContainer.scrollTop - sectionTop) / sectionScrollable;

    if (rawProgress < 0 || rawProgress > 1) {
      setActiveStep(-1);
      return;
    }

    const progress = Math.min(Math.max(rawProgress, 0), 0.999);
    const nodeProgress = 0.25;
    const destinationProgress = 0.5;
    const closingProgress = 0.75;
    let activeIndex = 0;

    if (progress >= closingProgress) {
      activeIndex = 3;
    } else if (progress >= destinationProgress) {
      activeIndex = 2;
    } else if (progress >= nodeProgress) {
      activeIndex = 1;
    }

    setActiveStep(activeIndex);
  }

  scrollContainer.addEventListener("scroll", updateSoundStep, { passive: true });
  window.addEventListener("resize", updateSoundStep);
  soundFlowImage?.addEventListener("load", updateSoundStep);

  updateSoundStep();
}

SoundFlowSteps__init();

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
const searchScrollContainer = document.querySelector(".section-container")
const sectionCopyItems = document.querySelectorAll(".search-copy, .artist-heading")

const observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
        if(entry.isIntersecting){
            entry.target.classList.add("on")
        }else{
            entry.target.classList.remove("on")
        }
    })
},{
    root: searchScrollContainer || null,
    threshold : .3
})

sectionCopyItems.forEach(function(box){
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

// 여섯번째 섹션 애니메이션 구현
const gallery = document.querySelector(".artist-gallery");

let isMoving = false;
const pointTime = 4000; // 점이 한 바퀴 도는 시간
const slideTime = 800; // 슬라이드 이동 시간

function setCenterItem() {
  const items = document.querySelectorAll(".artist-item");

  items.forEach((item) => {
    item.classList.remove("active");

    const point = item.querySelector(".artist-point");
    if (point) {
      point.style.animation = "none";
    }
  });

  const centerItem = items[2];
  centerItem.classList.add("active");

  const activePhoto = centerItem.querySelector(".artist-photo");
  const activePoint = centerItem.querySelector(".artist-point");

  if (activePhoto && activePoint) {
    const radius = activePhoto.offsetWidth / 2 + activePoint.offsetWidth + 52;

    activePoint.style.setProperty("--point-radius", `${radius}px`);

    activePoint.style.animation = "none";
    activePoint.offsetHeight;
    activePoint.style.animation = `artistPointRotate ${pointTime}ms linear forwards`;
  }
}

function moveNextArtist() {
  if (isMoving) return;
  isMoving = true;

  const firstItem = gallery.firstElementChild;
  const firstItemWidth = firstItem.offsetWidth;
  const gap = parseInt(getComputedStyle(gallery).gap);

  gallery.style.transition = `transform ${slideTime}ms ease`;
  gallery.style.transform = `translateX(-${firstItemWidth + gap}px)`;

  setTimeout(() => {
    gallery.appendChild(firstItem);

    gallery.style.transition = "none";
    gallery.style.transform = "translateX(0)";

    setCenterItem();

    isMoving = false;
  }, slideTime);
}

setCenterItem();

setInterval(() => {
  moveNextArtist();
}, pointTime);

// 일곱번째 캔버스 구현
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
