// Year & UI Navigation Handlers
const yearEl = document.getElementById("year");
const navLinks = document.querySelector(".nav-links");
const menuToggle = document.querySelector(".menu-toggle");
const themeToggle = document.querySelector(".theme-toggle");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// Theme Management
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }
};

applyTheme(savedTheme || (prefersDark ? "dark" : "dark"));

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });
}

// Scroll progress bar
const progress = document.createElement("div");
progress.className = "progress-bar";
document.body.appendChild(progress);

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = height > 0 ? (scrollTop / height) * 100 : 0;
  progress.style.width = `${ratio}%`;
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Back to top button
const backToTop = document.createElement("button");
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "Back to top");
backToTop.innerHTML = "↑";
document.body.appendChild(backToTop);

const toggleBackToTop = () => {
  backToTop.classList.toggle("show", window.scrollY > 260);
};
window.addEventListener("scroll", toggleBackToTop, { passive: true });
toggleBackToTop();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Reveal-on-scroll Intersection Observer (Excludes hero section components so they render instantly without delay)
const revealTargets = document.querySelectorAll(
  ".project-card, .skill-card, .contact-item, .about-card, .education-card, .highlight-card, .flagship-banner, .timeline-item"
);

revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("in"));
}

// Theme shortcut: 'T' key
window.addEventListener("keydown", (event) => {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
  if (event.key.toLowerCase() === "t" && !event.metaKey && !event.ctrlKey) {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  }
});

// Clipboard toast notification
const toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("role", "status");
toast.setAttribute("aria-live", "polite");
document.body.appendChild(toast);

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1600);
};

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const value = btn.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(value);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Unable to copy");
    }
  });
});

// Dynamic Project Search and Category Filter Handler
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("project-search");
const projectCards = document.querySelectorAll(".project-card[data-category]");
const countBadge = document.getElementById("project-count");

let activeFilter = "all";
let searchQuery = "";

const filterProjects = () => {
  if (projectCards.length === 0) return;
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const category = card.getAttribute("data-category") || "";
    const titleText = card.querySelector("h3") ? card.querySelector("h3").textContent.toLowerCase() : "";
    const descText = card.querySelector("p") ? card.querySelector("p").textContent.toLowerCase() : "";
    const tagText = card.querySelector(".tech-tags") ? card.querySelector(".tech-tags").textContent.toLowerCase() : "";
    const combinedText = `${titleText} ${descText} ${tagText}`;

    const matchesCategory = activeFilter === "all" || category === activeFilter;
    const matchesSearch = searchQuery === "" || combinedText.includes(searchQuery);

    if (matchesCategory && matchesSearch) {
      card.style.display = "flex";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  if (countBadge) {
    countBadge.textContent = `${visibleCount} ${visibleCount === 1 ? 'Project' : 'Projects'}`;
  }
};

if (filterBtns.length > 0) {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter") || "all";
      filterProjects();
    });
  });
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    filterProjects();
  });
}

// -------------------------------------------------------------
// 1. GLOBAL INTERACTIVE CURSOR & PHYSICS CANVAS (#ambient-canvas)
// -------------------------------------------------------------
const canvas = document.getElementById("ambient-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  let stardust = [];
  let shockwaves = [];
  let mouse = { x: null, y: null, active: false };

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;

    // Spawn 1-2 star dust energy particles on cursor movement
    if (Math.random() < 0.6) {
      stardust.push({
        x: mouse.x + (Math.random() - 0.5) * 16,
        y: mouse.y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2.5 + 1,
        alpha: 1,
        life: 0
      });
    }
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
    mouse.active = false;
  });

  window.addEventListener("click", (e) => {
    shockwaves.push({
      x: e.clientX,
      y: e.clientY,
      radius: 5,
      maxRadius: 180,
      alpha: 1
    });

    // Push nearby particles outward with click impulse
    for (let p of particles) {
      const dx = p.x - e.clientX;
      const dy = p.y - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180 && dist > 0) {
        const force = (180 - dist) / 180 * 6;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }
  });

  class NodeParticle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.originVx = (Math.random() - 0.5) * 0.6;
      this.originVy = (Math.random() - 0.5) * 0.6;
      this.vx = this.originVx;
      this.vy = this.originVy;
      this.radius = Math.random() * 2.2 + 1.2;
      this.phase = Math.random() * Math.PI * 2;
    }

    update() {
      // Damping speed back to origin velocity
      this.vx += (this.originVx - this.vx) * 0.05;
      this.vy += (this.originVy - this.vy) * 0.05;

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) { this.vx *= -1; this.originVx *= -1; }
      if (this.y < 0 || this.y > height) { this.vy *= -1; this.originVy *= -1; }

      // Cursor Magnetism: Pull gently toward mouse if within 220px
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220 && dist > 0) {
          const pull = (220 - dist) / 220 * 0.025;
          this.vx += dx * pull * 0.1;
          this.vy += dy * pull * 0.1;
        }
      }

      this.phase += 0.04;
    }

    draw(isLight) {
      const pulseSize = this.radius + Math.sin(this.phase) * 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, pulseSize), 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "rgba(2, 132, 199, 0.85)" : "rgba(56, 189, 248, 0.75)";
      ctx.fill();
    }
  }

  // Create 65 Nodes for rich density
  for (let i = 0; i < 65; i++) {
    particles.push(new NodeParticle());
  }

  const animateAmbient = () => {
    ctx.clearRect(0, 0, width, height);
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    // 1. Update and Draw Background Node Particles & Connections
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(isLight);

      // Connect Node to Cursor if nearby
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 220) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          const mAlpha = (1 - mdist / 220) * (isLight ? 0.65 : 0.55);
          ctx.strokeStyle = isLight
            ? `rgba(79, 70, 229, ${mAlpha})`
            : `rgba(56, 189, 248, ${mAlpha})`;
          ctx.lineWidth = isLight ? 1.5 : 1.1;
          ctx.stroke();
        }
      }

      // Connect Node to Inter-Node Neighbors
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 135) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const strokeAlpha = (1 - dist / 135) * (isLight ? 0.38 : 0.25);
          ctx.strokeStyle = isLight
            ? `rgba(2, 132, 199, ${strokeAlpha})`
            : `rgba(56, 189, 248, ${strokeAlpha})`;
          ctx.lineWidth = isLight ? 1.0 : 0.7;
          ctx.stroke();
        }
      }
    }

    // 2. Update & Draw Stardust Particles (Cursor Trail)
    for (let s = stardust.length - 1; s >= 0; s--) {
      const p = stardust[s];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha -= 0.035;

      if (p.alpha <= 0 || p.life > 35) {
        stardust.splice(s, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = isLight
        ? `rgba(79, 70, 229, ${p.alpha})`
        : `rgba(168, 85, 247, ${p.alpha})`;
      ctx.fill();
    }

    // 3. Update & Draw Click Shockwave Rings
    for (let w = shockwaves.length - 1; w >= 0; w--) {
      const sw = shockwaves[w];
      sw.radius += 4.5;
      sw.alpha -= 0.022;

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        shockwaves.splice(w, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = isLight
        ? `rgba(2, 132, 199, ${sw.alpha * 0.8})`
        : `rgba(56, 189, 248, ${sw.alpha * 0.85})`;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    // 4. Draw Cursor Futuristic AI Target HUD Reticle when active
    if (mouse.x !== null && mouse.y !== null) {
      const mx = mouse.x;
      const my = mouse.y;

      // Soft ambient glow under cursor
      const radGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 80);
      radGrad.addColorStop(0, isLight ? "rgba(2, 132, 199, 0.18)" : "rgba(56, 189, 248, 0.15)");
      radGrad.addColorStop(1, "transparent");
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(mx, my, 80, 0, Math.PI * 2);
      ctx.fill();

      // Target Crosshair Reticle Brackets
      ctx.strokeStyle = isLight ? "rgba(79, 70, 229, 0.7)" : "rgba(56, 189, 248, 0.75)";
      ctx.lineWidth = 1.4;
      const rSize = 14;

      // Top Left Corner
      ctx.beginPath(); ctx.moveTo(mx - rSize, my - rSize + 5); ctx.lineTo(mx - rSize, my - rSize); ctx.lineTo(mx - rSize + 5, my - rSize); ctx.stroke();
      // Top Right Corner
      ctx.beginPath(); ctx.moveTo(mx + rSize - 5, my - rSize); ctx.lineTo(mx + rSize, my - rSize); ctx.lineTo(mx + rSize, my - rSize + 5); ctx.stroke();
      // Bottom Left Corner
      ctx.beginPath(); ctx.moveTo(mx - rSize, my + rSize - 5); ctx.lineTo(mx - rSize, my + rSize); ctx.lineTo(mx - rSize + 5, my + rSize); ctx.stroke();
      // Bottom Right Corner
      ctx.beginPath(); ctx.moveTo(mx + rSize - 5, my + rSize); ctx.lineTo(mx + rSize, my + rSize); ctx.lineTo(mx + rSize, my + rSize - 5); ctx.stroke();
    }

    requestAnimationFrame(animateAmbient);
  };

  animateAmbient();
}

// -------------------------------------------------------------
// 2. HERO INTERACTIVE MACHINE LEARNING ENGINE (#ml-canvas)
// -------------------------------------------------------------
const mlCanvas = document.getElementById("ml-canvas");
if (mlCanvas) {
  const mlCtx = mlCanvas.getContext("2d");
  let mlWidth, mlHeight;
  let packets = [];
  let mlMouse = { x: null, y: null };
  let shockwaves = [];
  let currentMode = "neural"; // 'neural', 'vision', 'attention'
  let epochCounter = 200;

  const mlResize = () => {
    if (!mlCanvas.parentElement) return;
    mlWidth = mlCanvas.width = mlCanvas.parentElement.clientWidth;
    mlHeight = mlCanvas.height = mlCanvas.parentElement.clientHeight;
  };
  window.addEventListener("resize", mlResize);
  mlResize();

  // Handle Mode Switcher Buttons
  const modeBtns = document.querySelectorAll(".ml-mode-btn[data-mode]");
  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-mode") || "neural";

      // Update Architecture Stat
      const archStat = document.getElementById("ml-stat-arch");
      if (archStat) {
        if (currentMode === "neural") archStat.textContent = "ResNet + OpenCV";
        else if (currentMode === "vision") archStat.textContent = "YOLOv8 + ConvNet";
        else if (currentMode === "attention") archStat.textContent = "Transformer MultiHead";
      }
    });
  });

  // Handle Impulse Button
  const pulseBtn = document.getElementById("ml-pulse-btn");
  if (pulseBtn) {
    pulseBtn.addEventListener("click", () => {
      // Fire 14 rapid packets
      for (let k = 0; k < 14; k++) {
        spawnPacket(true);
      }
      epochCounter += 5;
      const epochEl = document.getElementById("ml-stat-epoch");
      if (epochEl) epochEl.textContent = `Epoch ${epochCounter}/200+`;

      const lossBadge = document.getElementById("ml-loss-badge");
      if (lossBadge) {
        const newLoss = (Math.random() * 0.002 + 0.001).toFixed(4);
        lossBadge.innerHTML = `<i class="bi bi-activity"></i> Loss: ${newLoss}`;
      }
    });
  }

  mlCanvas.addEventListener("mousemove", (e) => {
    const rect = mlCanvas.getBoundingClientRect();
    mlMouse.x = e.clientX - rect.left;
    mlMouse.y = e.clientY - rect.top;

    const tensorBadge = document.getElementById("ml-tensor-badge");
    if (tensorBadge) {
      tensorBadge.innerHTML = `<i class="bi bi-eye-fill"></i> Tensor: [${Math.round(mlMouse.x)}, ${Math.round(mlMouse.y)}, 224, 224]`;
    }

    // Dynamic Inference Speed variation
    const speedEl = document.getElementById("ml-stat-speed");
    if (speedEl && Math.random() < 0.15) {
      speedEl.textContent = `${(Math.random() * 0.8 + 1.1).toFixed(1)} ms`;
    }
  });

  mlCanvas.addEventListener("mouseleave", () => {
    mlMouse.x = null;
    mlMouse.y = null;
    const tensorBadge = document.getElementById("ml-tensor-badge");
    if (tensorBadge) {
      tensorBadge.innerHTML = `<i class="bi bi-eye-fill"></i> Vision Tensor: [64, 3, 224, 224]`;
    }
  });

  mlCanvas.addEventListener("click", (e) => {
    const rect = mlCanvas.getBoundingClientRect();
    shockwaves.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      radius: 4,
      maxRadius: 85,
      alpha: 1
    });

    for (let k = 0; k < 6; k++) spawnPacket(true);
  });

  // Neural Network Layer Definitions
  const layerCounts = [3, 5, 5, 3];

  const getNodes = () => {
    const nodes = [];
    const layerSpacing = mlWidth / (layerCounts.length + 1);
    for (let l = 0; l < layerCounts.length; l++) {
      const count = layerCounts[l];
      const nodeSpacing = mlHeight / (count + 1);
      const x = layerSpacing * (l + 1);
      for (let i = 0; i < count; i++) {
        const y = nodeSpacing * (i + 1);
        nodes.push({ layer: l, index: i, x, y, pulse: Math.random() * Math.PI * 2 });
      }
    }
    return nodes;
  };

  let nodes = getNodes();
  window.addEventListener("resize", () => {
    mlResize();
    nodes = getNodes();
  });

  class SynapsePacket {
    constructor(fromNode, toNode, isBurst = false) {
      this.from = fromNode;
      this.to = toNode;
      this.progress = 0;
      this.speed = (isBurst ? 0.035 : 0.015) + Math.random() * 0.015;
    }

    update() {
      this.progress += this.speed;
    }

    draw(isLight) {
      const x = this.from.x + (this.to.x - this.from.x) * this.progress;
      const y = this.from.y + (this.to.y - this.from.y) * this.progress;
      mlCtx.beginPath();
      mlCtx.arc(x, y, 4, 0, Math.PI * 2);
      mlCtx.fillStyle = isLight ? "rgba(79, 70, 229, 0.95)" : "rgba(56, 189, 248, 0.95)";
      mlCtx.fill();
    }
  }

  const spawnPacket = (isBurst = false) => {
    const fromLayers = nodes.filter((n) => n.layer < layerCounts.length - 1);
    if (fromLayers.length === 0) return;
    const fromNode = fromLayers[Math.floor(Math.random() * fromLayers.length)];
    const toNodes = nodes.filter((n) => n.layer === fromNode.layer + 1);
    if (toNodes.length === 0) return;
    const toNode = toNodes[Math.floor(Math.random() * toNodes.length)];
    packets.push(new SynapsePacket(fromNode, toNode, isBurst));
  };

  const animateML = () => {
    mlCtx.clearRect(0, 0, mlWidth, mlHeight);
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    // ---------------------------------------------------------
    // MODE 1: NEURAL NETWORK PIPELINE
    // ---------------------------------------------------------
    if (currentMode === "neural") {
      if (Math.random() < 0.35 && packets.length < 24) {
        spawnPacket();
      }

      // Draw Synapse Lines between Network Layers
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
          if (nodes[j].layer === nodes[i].layer + 1) {
            mlCtx.beginPath();
            mlCtx.moveTo(nodes[i].x, nodes[i].y);
            mlCtx.lineTo(nodes[j].x, nodes[j].y);
            mlCtx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.14)" : "rgba(255, 255, 255, 0.15)";
            mlCtx.lineWidth = 1;
            mlCtx.stroke();
          }
        }
      }

      // Cursor Synapses when hovering over canvas
      if (mlMouse.x !== null && mlMouse.y !== null) {
        for (let i = 0; i < nodes.length; i++) {
          const dx = nodes[i].x - mlMouse.x;
          const dy = nodes[i].y - mlMouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            mlCtx.beginPath();
            mlCtx.moveTo(nodes[i].x, nodes[i].y);
            mlCtx.lineTo(mlMouse.x, mlMouse.y);
            const alpha = (1 - dist / 150);
            mlCtx.strokeStyle = isLight
              ? `rgba(79, 70, 229, ${alpha * 0.85})`
              : `rgba(56, 189, 248, ${alpha * 0.9})`;
            mlCtx.lineWidth = 1.6;
            mlCtx.stroke();
          }
        }

        // Mouse Node indicator
        mlCtx.beginPath();
        mlCtx.arc(mlMouse.x, mlMouse.y, 6.5, 0, Math.PI * 2);
        mlCtx.fillStyle = isLight ? "rgba(79, 70, 229, 0.95)" : "rgba(168, 85, 247, 0.95)";
        mlCtx.fill();

        mlCtx.beginPath();
        mlCtx.arc(mlMouse.x, mlMouse.y, 14, 0, Math.PI * 2);
        mlCtx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.65)" : "rgba(56, 189, 248, 0.65)";
        mlCtx.lineWidth = 1.4;
        mlCtx.stroke();
      }

      // Update & Draw Synapse Packets
      for (let p = packets.length - 1; p >= 0; p--) {
        packets[p].update();
        packets[p].draw(isLight);
        if (packets[p].progress >= 1) {
          packets.splice(p, 1);
        }
      }

      // Draw Neural Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulse += 0.05;
        const glowScale = Math.sin(n.pulse) * 1.5 + 5.5;

        mlCtx.beginPath();
        mlCtx.arc(n.x, n.y, glowScale, 0, Math.PI * 2);
        mlCtx.fillStyle = isLight ? "rgba(2, 132, 199, 0.95)" : "rgba(56, 189, 248, 0.95)";
        mlCtx.fill();

        mlCtx.beginPath();
        mlCtx.arc(n.x, n.y, glowScale + 3.5, 0, Math.PI * 2);
        mlCtx.strokeStyle = isLight ? "rgba(79, 70, 229, 0.5)" : "rgba(168, 85, 247, 0.55)";
        mlCtx.lineWidth = 1.3;
        mlCtx.stroke();
      }
    }

    // ---------------------------------------------------------
    // MODE 2: VISION COMPUTER CONVNET & OBJECT DETECTOR
    // ---------------------------------------------------------
    else if (currentMode === "vision") {
      // Draw Feature Grid Maps
      const cols = 5;
      const rows = 3;
      const cellW = mlWidth / cols;
      const cellH = mlHeight / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellW;
          const y = r * cellH;

          mlCtx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)";
          mlCtx.strokeRect(x + 4, y + 4, cellW - 8, cellH - 8);

          // Glowing activation dots in cells
          const act = Math.sin(Date.now() * 0.003 + (r * cols + c)) * 0.5 + 0.5;
          if (act > 0.4) {
            mlCtx.beginPath();
            mlCtx.arc(x + cellW / 2, y + cellH / 2, act * 5 + 2, 0, Math.PI * 2);
            mlCtx.fillStyle = isLight
              ? `rgba(2, 132, 199, ${act * 0.7})`
              : `rgba(56, 189, 248, ${act * 0.7})`;
            mlCtx.fill();
          }
        }
      }

      // Computer Vision Bounding Box tracking Mouse
      if (mlMouse.x !== null && mlMouse.y !== null) {
        const boxW = 90;
        const boxH = 70;
        const bx = Math.max(5, Math.min(mlWidth - boxW - 5, mlMouse.x - boxW / 2));
        const by = Math.max(5, Math.min(mlHeight - boxH - 5, mlMouse.y - boxH / 2));

        mlCtx.strokeStyle = isLight ? "#0284c7" : "#38bdf8";
        mlCtx.lineWidth = 2;
        mlCtx.strokeRect(bx, by, boxW, boxH);

        // Bounding Box Label Pill
        mlCtx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
        mlCtx.fillRect(bx, by - 20, 110, 20);

        mlCtx.fillStyle = "#ffffff";
        mlCtx.font = "bold 10px 'Fira Code', monospace";
        mlCtx.fillText("AI_OBJECT: 99.8%", bx + 5, by - 6);
      }
    }

    // ---------------------------------------------------------
    // MODE 3: TRANSFORMER MULTI-HEAD ATTENTION MATRIX
    // ---------------------------------------------------------
    else if (currentMode === "attention") {
      const centerX = mlWidth / 2;
      const centerY = mlHeight / 2;
      const attRadius = Math.min(mlWidth, mlHeight) * 0.35;
      const numAttNodes = 8;
      const attNodes = [];

      for (let a = 0; a < numAttNodes; a++) {
        const angle = (a / numAttNodes) * Math.PI * 2;
        attNodes.push({
          x: centerX + Math.cos(angle) * attRadius,
          y: centerY + Math.sin(angle) * attRadius,
          id: a
        });
      }

      // Draw Attention Chord Links
      for (let i = 0; i < attNodes.length; i++) {
        for (let j = i + 1; j < attNodes.length; j++) {
          const w = Math.sin(Date.now() * 0.002 + i + j) * 0.5 + 0.5;
          mlCtx.beginPath();
          mlCtx.moveTo(attNodes[i].x, attNodes[i].y);
          mlCtx.lineTo(attNodes[j].x, attNodes[j].y);
          mlCtx.strokeStyle = isLight
            ? `rgba(79, 70, 229, ${w * 0.35})`
            : `rgba(168, 85, 247, ${w * 0.35})`;
          mlCtx.lineWidth = w * 2.2 + 0.5;
          mlCtx.stroke();
        }
      }

      // Mouse Query Vector Q Link
      if (mlMouse.x !== null && mlMouse.y !== null) {
        for (let i = 0; i < attNodes.length; i++) {
          mlCtx.beginPath();
          mlCtx.moveTo(attNodes[i].x, attNodes[i].y);
          mlCtx.lineTo(mlMouse.x, mlMouse.y);
          mlCtx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.75)" : "rgba(56, 189, 248, 0.85)";
          mlCtx.lineWidth = 1.8;
          mlCtx.stroke();
        }

        mlCtx.beginPath();
        mlCtx.arc(mlMouse.x, mlMouse.y, 7, 0, Math.PI * 2);
        mlCtx.fillStyle = isLight ? "#4f46e5" : "#a855f7";
        mlCtx.fill();
      }

      // Draw Attention Nodes
      for (let n of attNodes) {
        mlCtx.beginPath();
        mlCtx.arc(n.x, n.y, 6, 0, Math.PI * 2);
        mlCtx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
        mlCtx.fill();
      }
    }

    // ---------------------------------------------------------
    // CLICK SHOCKWAVES IN ML CANVAS
    // ---------------------------------------------------------
    for (let s = shockwaves.length - 1; s >= 0; s--) {
      const sw = shockwaves[s];
      sw.radius += 3;
      sw.alpha -= 0.03;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        shockwaves.splice(s, 1);
        continue;
      }
      mlCtx.beginPath();
      mlCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      mlCtx.strokeStyle = isLight
        ? `rgba(79, 70, 229, ${sw.alpha})`
        : `rgba(56, 189, 248, ${sw.alpha})`;
      mlCtx.lineWidth = 2.2;
      mlCtx.stroke();
    }

    requestAnimationFrame(animateML);
  };

  animateML();
}

