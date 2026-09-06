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

// Reveal-on-scroll Intersection Observer
const revealTargets = document.querySelectorAll(
  ".project-card, .skill-card, .contact-item, .about-card, .education-card, .portrait-wrap, .highlight-card, .flagship-banner, .timeline-item, .code-playground, .hero-visual, .ml-graphics-card"
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

// Ambient Background Canvas Particle Animation
const canvas = document.getElementById("ambient-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null };

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.8 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw(isLight) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "rgba(2, 132, 199, 0.65)" : "rgba(56, 189, 248, 0.45)";
      ctx.fill();
    }
  }

  for (let i = 0; i < 35; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(isLight);

      // Connect background particles to mouse cursor if near
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 170) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          const mAlpha = (isLight ? 0.38 : 0.3) * (1 - mdist / 170);
          ctx.strokeStyle = isLight
            ? `rgba(2, 132, 199, ${mAlpha})`
            : `rgba(56, 189, 248, ${mAlpha})`;
          ctx.lineWidth = isLight ? 1.2 : 0.9;
          ctx.stroke();
        }
      }

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const strokeAlpha = (isLight ? 0.28 : 0.18) * (1 - dist / 120);
          ctx.strokeStyle = isLight
            ? `rgba(79, 70, 229, ${strokeAlpha})`
            : `rgba(56, 189, 248, ${strokeAlpha})`;
          ctx.lineWidth = isLight ? 0.8 : 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  };

  animate();
}

// Interactive Neural Network Graphic Visualizer (Machine Learning Engine)
const mlCanvas = document.getElementById("ml-canvas");
if (mlCanvas) {
  const mlCtx = mlCanvas.getContext("2d");
  let mlWidth, mlHeight;
  let packets = [];
  let mlMouse = { x: null, y: null };
  let shockwaves = [];

  const mlResize = () => {
    if (!mlCanvas.parentElement) return;
    mlWidth = mlCanvas.width = mlCanvas.parentElement.clientWidth;
    mlHeight = mlCanvas.height = mlCanvas.parentElement.clientHeight;
  };
  window.addEventListener("resize", mlResize);
  mlResize();

  mlCanvas.addEventListener("mousemove", (e) => {
    const rect = mlCanvas.getBoundingClientRect();
    mlMouse.x = e.clientX - rect.left;
    mlMouse.y = e.clientY - rect.top;

    const tensorBadge = document.querySelector(".ml-hud-badge");
    if (tensorBadge) {
      tensorBadge.innerHTML = `<i class="bi bi-eye-fill"></i> Tensor: [${Math.round(mlMouse.x)}, ${Math.round(mlMouse.y)}, 224, 224]`;
    }
  });

  mlCanvas.addEventListener("mouseleave", () => {
    mlMouse.x = null;
    mlMouse.y = null;
    const tensorBadge = document.querySelector(".ml-hud-badge");
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
      maxRadius: 75,
      alpha: 1
    });
  });

  // Define 4 Neural Network Layers (Input, Hidden 1, Hidden 2, Output)
  const layerCounts = [3, 4, 4, 3];

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
    constructor(fromNode, toNode) {
      this.from = fromNode;
      this.to = toNode;
      this.progress = 0;
      this.speed = 0.015 + Math.random() * 0.015;
    }

    update() {
      this.progress += this.speed;
    }

    draw(isLight) {
      const x = this.from.x + (this.to.x - this.from.x) * this.progress;
      const y = this.from.y + (this.to.y - this.from.y) * this.progress;
      mlCtx.beginPath();
      mlCtx.arc(x, y, 3.5, 0, Math.PI * 2);
      mlCtx.fillStyle = isLight ? "rgba(79, 70, 229, 0.95)" : "rgba(56, 189, 248, 0.95)";
      mlCtx.fill();
    }
  }

  const spawnPacket = () => {
    const fromLayers = nodes.filter((n) => n.layer < layerCounts.length - 1);
    if (fromLayers.length === 0) return;
    const fromNode = fromLayers[Math.floor(Math.random() * fromLayers.length)];
    const toNodes = nodes.filter((n) => n.layer === fromNode.layer + 1);
    if (toNodes.length === 0) return;
    const toNode = toNodes[Math.floor(Math.random() * toNodes.length)];
    packets.push(new SynapsePacket(fromNode, toNode));
  };

  const animateML = () => {
    mlCtx.clearRect(0, 0, mlWidth, mlHeight);
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    if (Math.random() < 0.28 && packets.length < 20) {
      spawnPacket();
    }

    // Draw Synapse Connection Lines between Layers
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].layer === nodes[i].layer + 1) {
          mlCtx.beginPath();
          mlCtx.moveTo(nodes[i].x, nodes[i].y);
          mlCtx.lineTo(nodes[j].x, nodes[j].y);
          mlCtx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.16)" : "rgba(255, 255, 255, 0.15)";
          mlCtx.lineWidth = 1;
          mlCtx.stroke();
        }
      }
    }

    // Draw Cursor Interactive Synapses when hovering over canvas
    if (mlMouse.x !== null && mlMouse.y !== null) {
      for (let i = 0; i < nodes.length; i++) {
        const dx = nodes[i].x - mlMouse.x;
        const dy = nodes[i].y - mlMouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          mlCtx.beginPath();
          mlCtx.moveTo(nodes[i].x, nodes[i].y);
          mlCtx.lineTo(mlMouse.x, mlMouse.y);
          const alpha = (1 - dist / 140);
          mlCtx.strokeStyle = isLight
            ? `rgba(79, 70, 229, ${alpha * 0.8})`
            : `rgba(56, 189, 248, ${alpha * 0.85})`;
          mlCtx.lineWidth = 1.5;
          mlCtx.stroke();
        }
      }

      // Cursor Node Indicator
      mlCtx.beginPath();
      mlCtx.arc(mlMouse.x, mlMouse.y, 6, 0, Math.PI * 2);
      mlCtx.fillStyle = isLight ? "rgba(79, 70, 229, 0.95)" : "rgba(168, 85, 247, 0.95)";
      mlCtx.fill();

      mlCtx.beginPath();
      mlCtx.arc(mlMouse.x, mlMouse.y, 12, 0, Math.PI * 2);
      mlCtx.strokeStyle = isLight ? "rgba(2, 132, 199, 0.6)" : "rgba(56, 189, 248, 0.6)";
      mlCtx.lineWidth = 1.2;
      mlCtx.stroke();
    }

    // Update & Draw Click Shockwaves
    for (let s = shockwaves.length - 1; s >= 0; s--) {
      const sw = shockwaves[s];
      sw.radius += 2.5;
      sw.alpha -= 0.025;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        shockwaves.splice(s, 1);
        continue;
      }
      mlCtx.beginPath();
      mlCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      mlCtx.strokeStyle = isLight
        ? `rgba(79, 70, 229, ${sw.alpha})`
        : `rgba(56, 189, 248, ${sw.alpha})`;
      mlCtx.lineWidth = 2;
      mlCtx.stroke();
    }

    // Update & Draw Synapse Data Packets
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
      const glowScale = Math.sin(n.pulse) * 1.5 + 5;

      mlCtx.beginPath();
      mlCtx.arc(n.x, n.y, glowScale, 0, Math.PI * 2);
      mlCtx.fillStyle = isLight ? "rgba(2, 132, 199, 0.95)" : "rgba(56, 189, 248, 0.95)";
      mlCtx.fill();

      // Outer activation pulse ring
      mlCtx.beginPath();
      mlCtx.arc(n.x, n.y, glowScale + 3.5, 0, Math.PI * 2);
      mlCtx.strokeStyle = isLight ? "rgba(79, 70, 229, 0.45)" : "rgba(168, 85, 247, 0.5)";
      mlCtx.lineWidth = 1.2;
      mlCtx.stroke();
    }

    requestAnimationFrame(animateML);
  };

  animateML();
}
