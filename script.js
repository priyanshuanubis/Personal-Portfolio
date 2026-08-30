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

const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }
};

applyTheme(savedTheme || (prefersDark ? "dark" : "dark")); // Default to dark for premium aesthetic

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });
}

// Scroll progress indicator
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

// Reveal-on-scroll for cards/sections
const revealTargets = document.querySelectorAll(
  ".project-card, .skill-card, .contact-item, .about-card, .education-card, .portrait-wrap, .highlight-card"
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

// Quick theme shortcut: press "T" to toggle theme
window.addEventListener("keydown", (event) => {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;
  if (event.key.toLowerCase() === "t" && !event.metaKey && !event.ctrlKey) {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  }
});

// Copy-to-clipboard for contact details
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

// Interactive Project Filter & Keyword Search
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("project-search");
const projectCards = document.querySelectorAll(".project-card[data-category]");

let activeFilter = "all";
let searchQuery = "";

const filterProjects = () => {
  if (projectCards.length === 0) return;
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
    } else {
      card.style.display = "none";
    }
  });
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
