// Priyanshu Raj Portfolio Engine - Editorial ML Showcase
// UI Navigation, Theme Management, Filter Logic, and Interactive Terminal Handler

document.addEventListener("DOMContentLoaded", () => {
  // 1. Year & Mobile Nav Handlers
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

  // 2. Theme Management
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
  };

  applyTheme(savedTheme || "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);
    });
  }

  // 3. Scroll Progress Bar
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

  // 4. Back to Top Button
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

  // 5. Scroll Reveal Elements
  const revealTargets = document.querySelectorAll(
    ".project-card, .skill-card, .contact-item, .about-card, .education-card, .highlight-card, .flagship-banner, .timeline-item"
  );
  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    el.classList.add("in");
  });

  // 6. Keyboard Theme Shortcut ('T')
  window.addEventListener("keydown", (event) => {
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
    if (event.key.toLowerCase() === "t" && !event.metaKey && !event.ctrlKey) {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);
    }
  });

  // 7. Clipboard Copy Toast Notification
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

  // 8. Project Search and Filter Handler
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

  // 9. Interactive Engineering Code Terminal Handler
  const terminalTabs = document.querySelectorAll(".terminal-tab[data-tab]");
  const terminalBody = document.getElementById("terminal-body");
  const runBtn = document.getElementById("terminal-run-btn");

  const codeSnippets = {
    inference: `
<div class="terminal-line"><span class="syntax-kw">import</span> torch</div>
<div class="terminal-line"><span class="syntax-kw">import</span> cv2</div>
<div class="terminal-line"><span class="syntax-kw">from</span> vision_engine <span class="syntax-kw">import</span> HandGuardModel</div>
<div class="terminal-line">&nbsp;</div>
<div class="terminal-line"><span class="syntax-cm"># Load pretrained ResNet-50 backbone</span></div>
<div class="terminal-line">model = HandGuardModel(num_classes=<span class="syntax-num">4</span>)</div>
<div class="terminal-line">model.load_state_dict(torch.load(<span class="syntax-str">'best_weights.pth'</span>))</div>
<div class="terminal-line">model.eval().to(<span class="syntax-str">'cuda'</span>)</div>
<div class="terminal-line">&nbsp;</div>
<div class="terminal-line"><span class="syntax-kw">def</span> <span class="syntax-fn">run_inference</span>(video_stream):</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;tensor = preprocess_frame(video_stream)</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;<span class="syntax-kw">with</span> torch.no_grad():</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;output = model(tensor)</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;<span class="syntax-kw">return</span> parse_detections(output)</div>
`,
    architecture: `
<div class="terminal-line"><span class="syntax-kw">class</span> <span class="syntax-fn">HandGuardModel</span>(nn.Module):</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;<span class="syntax-kw">def</span> <span class="syntax-fn">__init__</span>(self, num_classes=<span class="syntax-num">4</span>):</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;super().__init__()</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.backbone = torchvision.models.resnet50(pretrained=<span class="syntax-kw">True</span>)</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.fc = nn.Sequential(</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nn.Linear(<span class="syntax-num">2048</span>, <span class="syntax-num">512</span>),</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nn.ReLU(),</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nn.Dropout(<span class="syntax-num">0.3</span>),</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nn.Linear(<span class="syntax-num">512</span>, num_classes)</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;<span class="syntax-kw">def</span> <span class="syntax-fn">forward</span>(self, x):</div>
<div class="terminal-line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="syntax-kw">return</span> self.fc(self.backbone(x))</div>
`,
    deploy: `
<div class="terminal-line"><span class="syntax-cm">#!/bin/bash -e</span></div>
<div class="terminal-line"><span class="syntax-cm"># Automated AWS + Jenkins DevOps Deployment Pipeline</span></div>
<div class="terminal-line">echo <span class="syntax-str">"[CI/CD] Building Docker Container: vision-engine:latest..."</span></div>
<div class="terminal-line">docker build -t vision-engine:latest .</div>
<div class="terminal-line">echo <span class="syntax-str">"[CI/CD] Running Unit & System Integration Tests..."</span></div>
<div class="terminal-line">pytest tests/ --cov=src --cov-report=term-missing</div>
<div class="terminal-line">echo <span class="syntax-str">"[AWS] Pushing image to Amazon ECR Repository..."</span></div>
<div class="terminal-line">aws ecr get-login-password --region us-east-1 | docker login --username AWS...</div>
<div class="terminal-line">echo <span class="syntax-str">"[SUCCESS] Container deployed to AWS ECS Cluster successfully!"</span></div>
`
  };

  if (terminalTabs.length > 0 && terminalBody) {
    terminalTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        terminalTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const tabKey = tab.getAttribute("data-tab") || "inference";
        if (codeSnippets[tabKey]) {
          terminalBody.innerHTML = codeSnippets[tabKey];
        }
      });
    });
  }

  if (runBtn && terminalBody) {
    runBtn.addEventListener("click", () => {
      runBtn.disabled = true;
      runBtn.innerHTML = `<i class="bi bi-hourglass-split"></i> Running Test...`;

      setTimeout(() => {
        const testOutput = `
<div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 0.8rem; padding-top: 0.6rem; color: #10b981;">
  <div class="terminal-line">[INFO] Initializing PyTorch CUDA 12.1 device... (NVIDIA RTX 4090)</div>
  <div class="terminal-line">[INFO] Loading model weights into GPU memory... Done (0.24s)</div>
  <div class="terminal-line">[TEST] Executing 100 forward pass batch iterations...</div>
  <div class="terminal-line" style="color: #38bdf8;">✔ Batch Inference Complete: Latency = 12.4ms | Accuracy = 99.8%</div>
  <div class="terminal-line" style="color: #a855f7;">[STATUS] All Model Benchmarks Passed cleanly!</div>
</div>
`;
        terminalBody.innerHTML += testOutput;
        terminalBody.scrollTop = terminalBody.scrollHeight;

        runBtn.disabled = false;
        runBtn.innerHTML = `<i class="bi bi-check-circle-fill"></i> Test Completed`;
        setTimeout(() => {
          runBtn.innerHTML = `<i class="bi bi-play-fill"></i> Run Model Test`;
        }, 3000);
      }, 700);
    });
  }
});
