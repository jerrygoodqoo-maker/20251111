function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
(() => {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let particles = [];
  let count = 0;
  const MAX_LINK_DIST = 140; // 連線的最大距離（像素）
  // 將密度降低以增加粒子數；並放寬上下限
  const BASE_PART_DENSITY = 18000; // 每多少像素放一個粒子（越小粒子越多）
  // 將最少/最多粒子放寬，視窗大時會有更多粒子
  const MIN_PARTICLES = 100;
  const MAX_PARTICLES = 500;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '1';
    canvas.style.display = 'block';

    // 根據視窗大小決定粒子數量
    count = Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.floor((W * H) / BASE_PART_DENSITY)));
    // 初始化或重調粒子數
    if (particles.length < count) {
      for (let i = particles.length; i < count; i++) particles.push(new Particle());
    } else if (particles.length > count) {
      particles.length = count;
    }
  }

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      const speed = 0.2 + Math.random() * 0.9;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.r = 1 + Math.random() * 2; // radius for drawing
      // small jitter to avoid sync on resize
      if (!init) {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
      }
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Simple wrap-around so particles re-enter nicely
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      ctx.fillStyle = 'rgba(230,240,255,0.9)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLinks() {
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < MAX_LINK_DIST) {
          const t = 1 - d / MAX_LINK_DIST; // 0..1, 1 = very close
          // make the line thicker/stronger when closer
          ctx.strokeStyle = `rgba(180,210,255,${0.08 + 0.6 * t})`;
          ctx.lineWidth = 0.6 + 1.4 * t;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawCenterText() {
    const title = '教育科技學系';
    const idName = '414730399 朱俊圻';

    // responsive font sizes
    const base = Math.max(14, Math.min(36, Math.floor(W / 32)));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // subtle glow/shadow
    ctx.save();
    ctx.fillStyle = 'rgba(240,248,255,0.95)';
    ctx.font = `bold ${Math.floor(base + 6)}px "Segoe UI", Roboto, Arial, sans-serif`;
    ctx.shadowColor = 'rgba(50,80,160,0.18)';
    ctx.shadowBlur = 22;
    ctx.fillText(title, W / 2, H / 2 - (base * 0.6));
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(220,230,245,0.95)';
    ctx.font = `${Math.floor(base)}px "Segoe UI", Roboto, Arial, sans-serif`;
    ctx.fillText(idName, W / 2, H / 2 + (base * 0.7));
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // subtle background overlay on canvas to blend with CSS blobs
    ctx.fillStyle = 'rgba(6,10,20,0.08)';
    ctx.fillRect(0, 0, W, H);

    // update & draw particles
    for (let p of particles) {
      p.update();
      p.draw();
    }

    // draw connecting lines
    drawLinks();

    // center text above particles (draw last)
    drawCenterText();

    requestAnimationFrame(frame);
  }

  // handle high-DPI
  function pixelRatioResize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    resize(); // re-init particle count / positions if needed
  }

  window.addEventListener('resize', pixelRatioResize);
  // init
  pixelRatioResize();
  // start animation loop
  requestAnimationFrame(frame);
})();
