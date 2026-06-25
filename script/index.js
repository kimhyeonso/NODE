
// 첫번째 섹션 구현



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
