/**
 * Priyanshu AI Assistant - Dynamic Knowledge Base Chatbot
 * Strictly answers questions about Priyanshu Raj based on priyanshu_knowledge_base.txt
 */

(function () {
  let knowledgeBaseRaw = "";
  let isLoaded = false;
  let chatHistory = [];

  // -------------------------------------------------------------
  // 1. INJECT CHATBOT DOM STRUCTURE
  // -------------------------------------------------------------
  function injectChatbotUI() {
    if (document.getElementById("chatbot-fab")) return;

    // Create FAB Trigger Button
    const fab = document.createElement("button");
    fab.id = "chatbot-fab";
    fab.className = "chatbot-fab";
    fab.setAttribute("aria-label", "Open Priyanshu AI Chatbot");
    fab.innerHTML = `
      <div class="chatbot-fab-icon">
        <i class="bi bi-robot" aria-hidden="true"></i>
        <span class="chatbot-status-dot"></span>
      </div>
      <span class="chatbot-fab-text">Ask Priyanshu AI</span>
    `;
    document.body.appendChild(fab);

    // Create Chatbot Drawer Window
    const windowEl = document.createElement("div");
    windowEl.id = "chatbot-window";
    windowEl.className = "chatbot-window";
    windowEl.setAttribute("aria-hidden", "true");
    windowEl.innerHTML = `
      <div class="chatbot-header">
        <div class="chatbot-brand">
          <div class="chatbot-avatar">
            <i class="bi bi-cpu-fill"></i>
          </div>
          <div class="chatbot-info">
            <h4>Priyanshu AI</h4>
            <span>Online · Knowledge Base Active</span>
          </div>
        </div>
        <div class="chatbot-controls">
          <button class="chatbot-ctrl-btn" id="chatbot-clear-btn" title="Clear Chat History">
            <i class="bi bi-trash3"></i>
          </button>
          <button class="chatbot-ctrl-btn" id="chatbot-close-btn" title="Close Chatbot">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <div class="chatbot-messages" id="chatbot-messages"></div>

      <div class="chatbot-chips">
        <button class="chip-btn" data-query="Tell me about Priyanshu's education">🎓 Education</button>
        <button class="chip-btn" data-query="What are Priyanshu's top projects?">🚀 Projects</button>
        <button class="chip-btn" data-query="What skills and technologies does Priyanshu know?">💻 Tech Stack</button>
        <button class="chip-btn" data-query="What are Priyanshu's hobbies and interests?">⚽ Hobbies</button>
        <button class="chip-btn" data-query="How can I contact Priyanshu?">📬 Contact</button>
      </div>

      <form class="chatbot-input-wrap" id="chatbot-form">
        <input 
          type="text" 
          id="chatbot-input" 
          class="chatbot-input" 
          placeholder="Ask anything about Priyanshu Raj..." 
          autocomplete="off" 
          required
        />
        <button type="submit" class="chatbot-send-btn" aria-label="Send Message">
          <i class="bi bi-send-fill"></i>
        </button>
      </form>
    `;
    document.body.appendChild(windowEl);

    // Initial Welcome Message
    appendBotMessage(
      `👋 **Hello! I am Priyanshu's AI Assistant.**\n\nI can strictly answer questions about **Priyanshu Raj**—his education at **IIT Madras**, projects, technical skills, experience, hobbies, and contact details.\n\nHow can I help you today?`
    );

    // Event Listeners
    fab.addEventListener("click", toggleChatbot);
    document.getElementById("chatbot-close-btn").addEventListener("click", closeChatbot);
    document.getElementById("chatbot-clear-btn").addEventListener("click", clearChat);
    document.getElementById("chatbot-form").addEventListener("submit", handleUserSubmit);

    // Chip click delegation
    document.querySelectorAll(".chip-btn").forEach((chip) => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        if (query) {
          processQuery(query);
        }
      });
    });
  }

  // -------------------------------------------------------------
  // 2. DYNAMICALLY LOAD KNOWLEDGE BASE FROM TEXT FILE
  // -------------------------------------------------------------
  async function loadKnowledgeBase() {
    try {
      const response = await fetch("priyanshu_knowledge_base.txt?t=" + Date.now());
      if (response.ok) {
        knowledgeBaseRaw = await response.text();
        isLoaded = true;
        console.log("Priyanshu AI: Knowledge base loaded successfully.");
      } else {
        console.warn("Priyanshu AI: Unable to fetch priyanshu_knowledge_base.txt.");
      }
    } catch (err) {
      console.error("Priyanshu AI: Error loading knowledge base.", err);
    }
  }

  // -------------------------------------------------------------
  // 3. UI TOGGLE & NAVIGATION HANDLERS
  // -------------------------------------------------------------
  function toggleChatbot() {
    const windowEl = document.getElementById("chatbot-window");
    if (!windowEl) return;
    const isOpen = windowEl.classList.contains("open");
    if (isOpen) {
      closeChatbot();
    } else {
      openChatbot();
    }
  }

  function openChatbot() {
    const windowEl = document.getElementById("chatbot-window");
    if (!windowEl) return;
    windowEl.classList.add("open");
    windowEl.setAttribute("aria-hidden", "false");
    document.getElementById("chatbot-input").focus();

    // Re-fetch knowledge base to ensure latest updates are active
    loadKnowledgeBase();
  }

  function closeChatbot() {
    const windowEl = document.getElementById("chatbot-window");
    if (!windowEl) return;
    windowEl.classList.remove("open");
    windowEl.setAttribute("aria-hidden", "true");
  }

  function clearChat() {
    const msgContainer = document.getElementById("chatbot-messages");
    if (!msgContainer) return;
    msgContainer.innerHTML = "";
    chatHistory = [];
    appendBotMessage(
      `Chat history cleared. Feel free to ask any question about Priyanshu Raj's academics, projects, skills, experience, or hobbies!`
    );
  }

  // -------------------------------------------------------------
  // 4. USER SUBMISSION & RESPONSE ENGINE
  // -------------------------------------------------------------
  function handleUserSubmit(e) {
    e.preventDefault();
    const inputEl = document.getElementById("chatbot-input");
    const query = inputEl.value.trim();
    if (!query) return;

    inputEl.value = "";
    processQuery(query);
  }

  function processQuery(userQuery) {
    appendUserMessage(userQuery);
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const botResponse = generateAIResponse(userQuery);
      appendBotMessage(botResponse);
    }, 600 + Math.random() * 400);
  }

  function appendUserMessage(text) {
    const container = document.getElementById("chatbot-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg user";
    msgDiv.innerHTML = `
      <div class="msg-bubble">${escapeHTML(text)}</div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }

  function appendBotMessage(markdownText) {
    const container = document.getElementById("chatbot-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg bot";
    msgDiv.innerHTML = `
      <div class="msg-avatar"><i class="bi bi-robot"></i></div>
      <div class="msg-bubble">${formatMarkdown(markdownText)}</div>
    `;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }

  function showTypingIndicator() {
    const container = document.getElementById("chatbot-messages");
    let typingEl = document.getElementById("typing-indicator-msg");
    if (typingEl) return;

    typingEl = document.createElement("div");
    typingEl.id = "typing-indicator-msg";
    typingEl.className = "chat-msg bot";
    typingEl.innerHTML = `
      <div class="msg-avatar"><i class="bi bi-robot"></i></div>
      <div class="msg-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingEl = document.getElementById("typing-indicator-msg");
    if (typingEl) typingEl.remove();
  }

  // -------------------------------------------------------------
  // 5. STRICT SCOPE GUARD & ANSWER GENERATOR
  // -------------------------------------------------------------
  function generateAIResponse(query) {
    const q = query.toLowerCase().trim();

    // 1. Check if Query is In-Scope for Priyanshu Raj
    const inScopeKeywords = [
      "priyanshu", "raj", "who", "about", "bio", "education", "academics", "iit", "madras",
      "degree", "bs", "data science", "college", "study", "graduate", "grad", "school",
      "project", "projects", "repo", "github", "cicd", "pipeline", "handguard", "traffic",
      "gtsrb", "distraction", "driver", "log", "logging", "pneumonia", "xray", "parking",
      "placement", "portal", "skill", "skills", "tech", "stack", "python", "c++", "java",
      "javascript", "typescript", "rust", "bash", "pytorch", "opencv", "aws", "jenkins",
      "devops", "cloud", "docker", "flask", "vue", "sql", "sqlite", "cnn", "hobbies", "hobby",
      "interest", "interests", "game", "gaming", "tinkering", "iot", "blog", "paper", "experience",
      "work", "contact", "email", "phone", "mobile", "gmail", "linkedin", "instagram", "hire",
      "connect", "reach", "status", "hi", "hello", "hey", "help", "who are you"
    ];

    const isRelated = inScopeKeywords.some((kw) => q.includes(kw));

    // Refusal Policy for Out-of-Scope Queries
    if (!isRelated) {
      return `⚠️ **Out of Scope Query**\n\nI am Priyanshu's AI Assistant created strictly to answer questions about **Priyanshu Raj** (his education at IIT Madras, technical projects, skills, experience, hobbies, and contact details).\n\nPlease ask a question related to Priyanshu!`;
    }

    // 2. Greetings
    if (/^(hi|hello|hey|greetings|hola|namaste)/i.test(q)) {
      return `Hello! How can I assist you today regarding **Priyanshu Raj's** background, IIT Madras academics, computer vision & DevOps projects, technical skills, or hobbies?`;
    }

    // 3. Contact Details
    if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("mobile") || q.includes("gmail") || q.includes("linkedin") || q.includes("reach") || q.includes("hire")) {
      return `📬 **Contact Priyanshu Raj:**\n\n` +
        `• **Email:** [priyanshuanubis33@gmail.com](mailto:priyanshuanubis33@gmail.com)\n` +
        `• **Mobile:** [+91 9990206348](tel:+919990206348)\n` +
        `• **LinkedIn:** [priyanshu-raj-05633831b](https://linkedin.com/in/priyanshu-raj-05633831b)\n` +
        `• **GitHub:** [priyanshuanubis](https://github.com/priyanshuanubis)\n` +
        `• **Instagram:** [@priyanshuanubis](https://www.instagram.com/priyanshuanubis?igsh=MTlmbnZ1bDB3cDIzNg==)\n\n` +
        `Priyanshu is open to **Software Engineering, Computer Vision, and DevOps** opportunities!`;
    }

    // 4. Education & Academics
    if (q.includes("education") || q.includes("academic") || q.includes("iit") || q.includes("madras") || q.includes("degree") || q.includes("bs") || q.includes("college") || q.includes("study")) {
      return `🎓 **Academics & Education:**\n\n` +
        `• **Degree:** Bachelor of Science (BS) in Data Science & Applications\n` +
        `• **Institution:** **IIT Madras** (Indian Institute of Technology Madras)\n` +
        `• **Timeline:** 2024 - Present (Expected Graduation: **2027**)\n\n` +
        `**Key Focus Areas:** Machine Learning algorithms, Computer Vision, Statistical Data Analysis, Deep Learning, SQL Databases, and Software Engineering foundations.`;
    }

    // 5. Projects
    if (q.includes("project") || q.includes("repo") || q.includes("build") || q.includes("portfolio")) {
      if (q.includes("cicd") || q.includes("pipeline") || q.includes("flagship") || q.includes("devops")) {
        return `⭐ **Flagship Project: Automated CI/CD Deployment Pipeline**\n\n` +
          `An end-to-end continuous integration & deployment pipeline linking GitHub, Jenkins, and AWS cloud infrastructure for automated testing, artifact creation, and zero-downtime server deployments.\n\n` +
          `• **Tech:** AWS, Jenkins, GitHub Actions, DevOps, Shell Scripting\n` +
          `• **Repo:** [GitHub Repository](https://github.com/priyanshuanubis/Automated-CI-CD-Pipeline)`;
      }

      if (q.includes("handguard") || q.includes("vision")) {
        return `🛡️ **HandGuardCV Project**\n\n` +
          `Real-time virtual boundary protection and workspace perimeter safety system engineered using classical computer vision algorithms and hand tracking in Python & OpenCV.\n\n` +
          `• **Tech:** Python, OpenCV, Computer Vision, NumPy\n` +
          `• **Repo:** [GitHub Repository](https://github.com/priyanshuanubis/HandGuardCV)`;
      }

      if (q.includes("traffic") || q.includes("sign") || q.includes("gtsrb")) {
        return `🚦 **Traffic Sign Recognition Benchmark**\n\n` +
          `Classification pipeline evaluating PyTorch Deep CNNs against HOG feature extractions and SVM baselines using the German Traffic Sign Recognition Benchmark dataset.\n\n` +
          `• **Tech:** PyTorch, CNN, OpenCV, HOG + SVM, Python\n` +
          `• **Repo:** [GitHub Repository](https://github.com/priyanshuanubis/traffic-sign-recognition-benchmark)`;
      }

      if (q.includes("log") || q.includes("monitoring")) {
        return `📊 **Distributed Log Monitoring System**\n\n` +
          `Distributed system architecture for real-time log generation, secure remote transfer, centralized log aggregation, and automated incident alerting.\n\n` +
          `• **Tech:** JavaScript, Node.js, Bash Scripting, System Logging\n` +
          `• **Repo:** [GitHub Repository](https://github.com/priyanshuanubis/log-monitoring-system)`;
      }

      return `🚀 **Priyanshu's Top Projects (8 Repositories):**\n\n` +
        `1. **Automated CI/CD Pipeline** (AWS, Jenkins, GitHub Actions)\n` +
        `2. **HandGuardCV** (Python, OpenCV, Computer Vision)\n` +
        `3. **Traffic Sign Recognition Benchmark** (PyTorch, CNN, GTSRB)\n` +
        `4. **Distributed Log Monitoring System** (Node.js, Bash, Logging)\n` +
        `5. **Driver Distraction Detection System** (PyTorch, Edge CV)\n` +
        `6. **Placement Portal App** (Vue.js, Flask, REST APIs, SQLite)\n` +
        `7. **Pneumonia Detection CNN** (TensorFlow, Keras, Chest X-Rays)\n` +
        `8. **Vehicle Parking App** (Python, Flask, SQLite, Bootstrap)\n\n` +
        `Explore all projects on Priyanshu's [GitHub Profile](https://github.com/priyanshuanubis)!`;
    }

    // 6. Technical Skills
    if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("language") || q.includes("tool") || q.includes("python") || q.includes("pytorch")) {
      return `💻 **Priyanshu's Technical Toolkit:**\n\n` +
        `• **Languages:** Python, C++, Java, JavaScript (ES6+), TypeScript, SQL, Rust, Bash Scripting\n` +
        `• **AI & Computer Vision:** PyTorch, OpenCV, CNNs, HOG Features, Multi-Modal Models, TensorFlow, Keras\n` +
        `• **DevOps & Cloud:** AWS Services, Jenkins CI/CD, GitHub Actions, Docker, Automated Pipelines\n` +
        `• **Linux & Systems:** Distributed Log Generation, Remote Transfer & Alerting, Process Control, Systemd\n` +
        `• **Web & Databases:** Vue.js, Flask, RESTful APIs, HTML5/CSS3, SQLite`;
    }

    // 7. Experience & Focus Areas
    if (q.includes("experience") || q.includes("work") || q.includes("domain") || q.includes("role")) {
      return `💼 **Professional Domains & Focus Areas:**\n\n` +
        `• **AI & Computer Vision:** Real-time deep neural networks, image classification, perimeter protection, edge detection models.\n` +
        `• **Cloud Infrastructure & DevOps:** Building CI/CD deployment pipelines on AWS with Jenkins and GitHub Actions.\n` +
        `• **Distributed Systems:** Log generation, remote shipping, monitoring, and automated incident response.\n` +
        `• **Full-Stack Engineering:** Scalable Web APIs, Vue.js frontends, and Flask backends.`;
    }

    // 8. Hobbies & Interests
    if (q.includes("hobby") || q.includes("hobbies") || q.includes("interest") || q.includes("passions") || q.includes("game") || q.includes("free time") || q.includes("tinkering")) {
      return `⚽ **Hobbies & Personal Interests:**\n\n` +
        `• **Autonomous AI Research:** Designing edge AI models, computer vision systems, and autonomous agents.\n` +
        `• **Open Source Building:** Crafting open-source software and tools on GitHub.\n` +
        `• **Competitive Problem Solving:** Algorithmic challenges and performance optimization in C++ & Python.\n` +
        `• **Tech Reading:** Following preprints (arXiv) on CV and transformer architectures.\n` +
        `• **Hardware & IoT Tinkering:** Experimenting with Raspberry Pi & edge compute devices.\n` +
        `• **Gaming & Community:** Playing strategy games and participating in developer hackathons.`;
    }

    // 9. Bio / Overview
    if (q.includes("who") || q.includes("about") || q.includes("priyanshu")) {
      return `👤 **About Priyanshu Raj:**\n\n` +
        `Priyanshu Raj is a **Software Engineer, Computer Vision Developer, and Data Science student at IIT Madras**.\n\n` +
        `He specializes in PyTorch deep learning, OpenCV computer vision, AWS & Jenkins automated DevOps deployment pipelines, and full-stack software development. Currently open to Software Engineering and AI roles!`;
    }

    // 10. Dynamic Fallback Search inside knowledgeBaseRaw
    if (isLoaded && knowledgeBaseRaw) {
      const lines = knowledgeBaseRaw.split("\n");
      const matchedLines = lines.filter((line) => {
        const lineLower = line.toLowerCase();
        const keywords = q.split(" ").filter((w) => w.length > 3);
        return keywords.some((kw) => lineLower.includes(kw));
      });

      if (matchedLines.length > 0) {
        const cleanSnippet = matchedLines.slice(0, 5).join("\n• ").replace(/^[•\s-]+/, "");
        return `📄 **Here is what I found in Priyanshu's Profile Document:**\n\n• ${cleanSnippet}\n\nFeel free to ask for more specific details!`;
      }
    }

    // Default Fallback
    return `Priyanshu Raj is a BS Data Science student at IIT Madras specializing in Computer Vision (PyTorch/OpenCV), Cloud DevOps (AWS/Jenkins), and Full-Stack development. Ask me about his **projects**, **skills**, **academics**, **hobbies**, or **contact info**!`;
  }

  // -------------------------------------------------------------
  // HELPER FORMATTING FUNCTIONS
  // -------------------------------------------------------------
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatMarkdown(text) {
    let formatted = escapeHTML(text);

    // Bold text **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Markdown Links [text](url)
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1 <i class="bi bi-box-arrow-up-right" style="font-size: 0.78em;"></i></a>'
    );

    // Newlines to <br>
    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
  }

  // Initialize on DOM load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectChatbotUI();
      loadKnowledgeBase();
    });
  } else {
    injectChatbotUI();
    loadKnowledgeBase();
  }
})();
