/**
 * Priyanshu AI Assistant - Dynamic Knowledge Base Chatbot Engine
 * Reads priyanshu_knowledge_base.txt dynamically at runtime.
 * ALL ANSWERS ARE DERIVED DIRECTLY FROM THE KNOWLEDGE BASE DOCUMENT.
 */

(function () {
  let rawText = "";
  let isLoaded = false;
  let parsedFacts = {};
  let parsedSections = [];

  const defaultFallbackText = `
1. PERSONAL DETAILS & BIOGRAPHICAL INFO
- Full Name: Priyanshu Raj
- Preferred Name: Priyanshu
- Age: 23 Years Old
- Gender: Male
- Title: Software Engineer, Computer Vision Engineer & AI Builder
- Current Status: Open to Software Engineering, Computer Vision, and DevOps Roles
- Location: India
- Email: priyanshuanubis33@gmail.com
- Mobile Phone: +91 9990206348
- LinkedIn Profile: https://linkedin.com/in/priyanshu-raj-05633831b
- GitHub Profile: https://github.com/priyanshuanubis
- Instagram Profile: https://www.instagram.com/priyanshuanubis?igsh=MTlmbnZ1bDB3cDIzNg==
- Core Focus Areas: AI Systems, Computer Vision (PyTorch & OpenCV), DevOps & Cloud Pipelines (AWS & Jenkins), Distributed Log Systems, Full-Stack Web Development.

2. ACADEMICS & EDUCATION
- Degree Program: Bachelor of Science (BS) in Data Science & Applications
- Institution: Indian Institute of Technology Madras (IIT Madras)
- Duration / Timeline: 2024 - Present (Expected Completion: 2027)

3. CERTIFICATIONS & PROFESSIONAL CREDENTIALS
1. IIT Madras Data Science & Applications Credentials
2. Computer Vision & PyTorch Certification
3. AWS Cloud Infrastructure & Jenkins Automation Certification
4. Applied Machine Learning & Data Science Certification
`;

  // -------------------------------------------------------------
  // 1. INJECT CHATBOT UI
  // -------------------------------------------------------------
  function injectChatbotUI() {
    if (document.getElementById("chatbot-fab")) return;

    // Launcher FAB Button
    const fab = document.createElement("button");
    fab.id = "chatbot-fab";
    fab.className = "chatbot-fab";
    fab.setAttribute("aria-label", "Open Priyanshu AI Assistant");
    fab.innerHTML = `
      <div class="chatbot-fab-icon">
        <i class="bi bi-chat-left-text-fill" aria-hidden="true"></i>
        <span class="chatbot-status-dot"></span>
      </div>
      <span class="chatbot-fab-text">Ask Priyanshu AI</span>
    `;
    document.body.appendChild(fab);

    // Popup Dropdown Drawer
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
            <span>Online · AI Assistant</span>
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
        <button class="chip-btn" data-query="Tell me about Priyanshu's education and age">🎓 Education & Age</button>
        <button class="chip-btn" data-query="What certifications does Priyanshu have?">🏆 Certifications</button>
        <button class="chip-btn" data-query="What are Priyanshu's top projects?">🚀 Projects</button>
        <button class="chip-btn" data-query="What skills and technologies does he know?">💻 Tech Stack</button>
        <button class="chip-btn" data-query="What extracurricular experience does he have?">⚽ Extracurriculars</button>
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

    // Welcome Message (Clean Public Tone)
    appendBotMessage(
      `👋 **Hello! I am Priyanshu's AI Assistant.**\n\nI can answer questions about **Priyanshu Raj** (his education at **IIT Madras**, certifications, computer vision & DevOps projects, skills, experience, extracurriculars, and contact details).\n\nHow can I help you today?`
    );

    // Listeners
    fab.addEventListener("click", toggleChatbot);
    document.getElementById("chatbot-close-btn").addEventListener("click", closeChatbot);
    document.getElementById("chatbot-clear-btn").addEventListener("click", clearChat);
    document.getElementById("chatbot-form").addEventListener("submit", handleUserSubmit);

    document.querySelectorAll(".chip-btn").forEach((chip) => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        if (query) processQuery(query);
      });
    });
  }

  // -------------------------------------------------------------
  // 2. DYNAMICALLY PARSE KNOWLEDGE BASE TEXT CONTENT
  // -------------------------------------------------------------
  function parseKnowledgeBase(text) {
    rawText = text;
    parsedFacts = {};
    parsedSections = [];

    const lines = text.split("\n");
    let currentSection = { title: "General", lines: [], content: "" };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("===") || line.startsWith("---") || line.startsWith("Note:")) continue;

      const factMatch = line.match(/^[-*]\s*([^:]+):\s*(.+)$/);
      if (factMatch) {
        const key = factMatch[1].trim().toLowerCase();
        const value = factMatch[2].trim();
        parsedFacts[key] = value;
      }

      if (/^\d+\.\s+[A-Z\s&]+/.test(line)) {
        if (currentSection.lines.length > 0) {
          currentSection.content = currentSection.lines.join("\n");
          parsedSections.push(currentSection);
        }
        currentSection = { title: line, lines: [], content: "" };
      } else {
        currentSection.lines.push(line);
      }
    }

    if (currentSection.lines.length > 0) {
      currentSection.content = currentSection.lines.join("\n");
      parsedSections.push(currentSection);
    }

    isLoaded = true;
  }

  async function fetchKnowledgeBase() {
    const paths = [
      "priyanshu_knowledge_base.txt?t=" + Date.now(),
      "./priyanshu_knowledge_base.txt?t=" + Date.now(),
      "/priyanshu_knowledge_base.txt?t=" + Date.now()
    ];

    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          const txt = await res.text();
          parseKnowledgeBase(txt);
          return;
        }
      } catch (e) {
        // try next path
      }
    }

    parseKnowledgeBase(defaultFallbackText);
  }

  // -------------------------------------------------------------
  // 3. UI HANDLERS
  // -------------------------------------------------------------
  function toggleChatbot() {
    const windowEl = document.getElementById("chatbot-window");
    if (!windowEl) return;
    windowEl.classList.contains("open") ? closeChatbot() : openChatbot();
  }

  function openChatbot() {
    const windowEl = document.getElementById("chatbot-window");
    if (!windowEl) return;
    windowEl.classList.add("open");
    windowEl.setAttribute("aria-hidden", "false");
    document.getElementById("chatbot-input").focus();
    fetchKnowledgeBase();
  }

  function closeChatbot() {
    const windowEl = document.getElementById("chatbot-window");
    if (!windowEl) return;
    windowEl.classList.remove("open");
    windowEl.setAttribute("aria-hidden", "true");
  }

  function clearChat() {
    const msgContainer = document.getElementById("chatbot-messages");
    if (msgContainer) msgContainer.innerHTML = "";
    appendBotMessage(`Chat history cleared. Feel free to ask anything about Priyanshu Raj!`);
  }

  function handleUserSubmit(e) {
    e.preventDefault();
    const inputEl = document.getElementById("chatbot-input");
    const query = inputEl.value.trim();
    if (!query) return;

    inputEl.value = "";
    processQuery(query);
  }

  async function queryFreeAIModel(userQuery) {
    const kbContent = rawText && rawText.trim().length > 50 ? rawText : defaultFallbackText;
    const systemPrompt = `You are Priyanshu Raj's AI Portfolio Assistant. You strictly answer questions about Priyanshu Raj (his education at IIT Madras BS Data Science, age 23, male, certifications, PyTorch & OpenCV computer vision projects, AWS & Jenkins DevOps skills, experience, leadership, and contact details). Be professional, helpful, concise, and friendly. Use formatting like bold text and bullet points when appropriate. Answer based on this knowledge base background information:\n\n${kbContent}`;

    try {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
          ],
          model: "openai"
        })
      });

      if (response.ok) {
        const reply = await response.text();
        if (reply && reply.trim().length > 0) {
          return reply.trim();
        }
      }
    } catch (err) {
      console.warn("Pollinations Free AI endpoint error, utilizing dynamic parser fallback:", err);
    }

    return generateDynamicAIResponse(userQuery);
  }

  async function processQuery(userQuery) {
    appendUserMessage(userQuery);
    showTypingIndicator();

    try {
      const aiResponse = await queryFreeAIModel(userQuery);
      removeTypingIndicator();
      appendBotMessage(aiResponse);
    } catch (e) {
      removeTypingIndicator();
      const fallbackResponse = generateDynamicAIResponse(userQuery);
      appendBotMessage(fallbackResponse);
    }
  }

  function appendUserMessage(text) {
    const container = document.getElementById("chatbot-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg user";
    msgDiv.innerHTML = `<div class="msg-bubble">${escapeHTML(text)}</div>`;
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
    if (document.getElementById("typing-indicator-msg")) return;

    const typingEl = document.createElement("div");
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
  // 4. DYNAMIC KNOWLEDGE BASE SEARCH & RESPONSE GENERATOR
  // -------------------------------------------------------------
  function generateDynamicAIResponse(query) {
    const q = query.toLowerCase().trim();

    const inScopeTerms = [
      "priyanshu", "raj", "who", "about", "bio", "age", "old", "gender", "male", "female",
      "education", "academics", "iit", "madras", "degree", "bs", "data science", "college",
      "cert", "certs", "certification", "certifications", "credential", "extracurricular",
      "extracurriculars", "leadership", "project", "projects", "repo", "github", "cicd",
      "pipeline", "handguard", "traffic", "distraction", "driver", "log", "pneumonia",
      "parking", "placement", "skill", "skills", "tech", "stack", "python", "pytorch",
      "opencv", "aws", "jenkins", "devops", "cloud", "docker", "flask", "vue", "sql",
      "hobby", "hobbies", "interest", "experience", "work", "contact", "email", "phone",
      "mobile", "linkedin", "instagram", "hire", "hi", "hello", "hey", "help", "what", "where", "how"
    ];

    const isRelated = inScopeTerms.some((term) => q.includes(term));

    if (!isRelated) {
      return `⚠️ **Out of Scope Query**\n\nI am Priyanshu's AI Assistant created strictly to answer questions about **Priyanshu Raj** (his background, education at IIT Madras, certifications, projects, skills, experience, extracurriculars, and contact details).\n\nPlease ask a question related to Priyanshu!`;
    }

    if (/^(hi|hello|hey|greetings|hola|namaste)/i.test(q)) {
      const name = parsedFacts["full name"] || "Priyanshu Raj";
      const title = parsedFacts["title"] || "Software Engineer & AI Builder";
      return `Hello! How can I assist you today regarding **${name}** (${title})?`;
    }

    if (q.includes("age") || q.includes("how old")) {
      const age = parsedFacts["age"] || extractFactFromText(rawText, "Age");
      if (age) return `👤 Priyanshu Raj is **${age}**.`;
    }

    if (q.includes("gender") || q.includes("sex")) {
      const gender = parsedFacts["gender"] || extractFactFromText(rawText, "Gender");
      if (gender) return `👤 Priyanshu Raj's gender is **${gender}**.`;
    }

    if (q.includes("email") || q.includes("mail") || q.includes("contact") || q.includes("phone") || q.includes("mobile") || q.includes("reach") || q.includes("linkedin") || q.includes("github")) {
      const email = parsedFacts["email"] || "priyanshuanubis33@gmail.com";
      const phone = parsedFacts["mobile phone"] || "+91 9990206348";
      const linkedin = parsedFacts["linkedin profile"] || "https://linkedin.com/in/priyanshu-raj-05633831b";
      const github = parsedFacts["github profile"] || "https://github.com/priyanshuanubis";
      const insta = parsedFacts["instagram profile"] || "";

      return `📬 **Contact Priyanshu Raj:**\n\n` +
        `• **Email:** [${email}](mailto:${email})\n` +
        `• **Mobile Phone:** [${phone}](tel:${phone})\n` +
        `• **LinkedIn:** [LinkedIn Profile](${linkedin})\n` +
        `• **GitHub:** [GitHub Profile](${github})\n` +
        (insta ? `• **Instagram:** [Instagram Profile](${insta})\n` : "") +
        `\nPriyanshu is open to Software Engineering, Computer Vision, and DevOps opportunities!`;
    }

    const sectionMatch = findMatchingSection(q, parsedSections);
    if (sectionMatch) return sectionMatch;

    const lineMatches = findMatchingLines(q, rawText);
    if (lineMatches) return `📄 **Details regarding Priyanshu Raj:**\n\n${lineMatches}`;

    const name = parsedFacts["full name"] || "Priyanshu Raj";
    const status = parsedFacts["current status"] || "BS Data Science Student @ IIT Madras";
    return `👤 **${name}**\n\n${status}\n\nAsk me about his **age**, **academics**, **certifications**, **projects**, **skills**, **extracurriculars**, or **contact info**!`;
  }

  function extractFactFromText(text, label) {
    const regex = new RegExp(`[-*]\\s*${label}:\\s*(.+)`, "i");
    const m = text.match(regex);
    return m ? m[1].trim() : null;
  }

  function findMatchingSection(query, sections) {
    const q = query.toLowerCase();

    if (q.includes("cert") || q.includes("credential")) {
      const certSec = sections.find((s) => s.title.toLowerCase().includes("certification"));
      if (certSec) return `🏆 **${certSec.title.replace(/^[\d.-]+\s*/, "")}:**\n\n${formatBullets(certSec.content)}`;
    }

    if (q.includes("education") || q.includes("academic") || q.includes("iit") || q.includes("madras") || q.includes("degree") || q.includes("study") || q.includes("college")) {
      const eduSec = sections.find((s) => s.title.toLowerCase().includes("academic") || s.title.toLowerCase().includes("education"));
      if (eduSec) return `🎓 **${eduSec.title.replace(/^[\d.-]+\s*/, "")}:**\n\n${formatBullets(eduSec.content)}`;
    }

    if (q.includes("extracurricular") || q.includes("leadership") || q.includes("activity") || q.includes("hackathon")) {
      const extraSec = sections.find((s) => s.title.toLowerCase().includes("extracurricular"));
      if (extraSec) return `⚽ **${extraSec.title.replace(/^[\d.-]+\s*/, "")}:**\n\n${formatBullets(extraSec.content)}`;
    }

    if (q.includes("project") || q.includes("repo") || q.includes("cicd") || q.includes("handguard") || q.includes("traffic") || q.includes("parking") || q.includes("log")) {
      const projSec = sections.find((s) => s.title.toLowerCase().includes("project"));
      if (projSec) return `🚀 **${projSec.title.replace(/^[\d.-]+\s*/, "")}:**\n\n${formatBullets(projSec.content)}`;
    }

    if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("language") || q.includes("python") || q.includes("pytorch")) {
      const skillSec = sections.find((s) => s.title.toLowerCase().includes("skill") || s.title.toLowerCase().includes("toolkit"));
      if (skillSec) return `💻 **${skillSec.title.replace(/^[\d.-]+\s*/, "")}:**\n\n${formatBullets(skillSec.content)}`;
    }

    if (q.includes("experience") || q.includes("work") || q.includes("domain")) {
      const workSec = sections.find((s) => s.title.toLowerCase().includes("work") || s.title.toLowerCase().includes("domain"));
      if (workSec) return `💼 **${workSec.title.replace(/^[\d.-]+\s*/, "")}:**\n\n${formatBullets(workSec.content)}`;
    }

    return null;
  }

  function findMatchingLines(query, text) {
    if (!text) return null;
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !["what", "is", "his", "the", "are", "tell", "about", "he", "does", "have", "you"].includes(w));
    if (words.length === 0) return null;

    const lines = text.split("\n");
    const scoredLines = [];

    for (let line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith("===") || cleanLine.startsWith("---")) continue;

      const lowerLine = cleanLine.toLowerCase();
      let score = 0;
      for (let word of words) {
        if (lowerLine.includes(word)) score += 1;
      }
      if (score > 0) scoredLines.push({ line: cleanLine, score });
    }

    if (scoredLines.length === 0) return null;

    scoredLines.sort((a, b) => b.score - a.score);
    const topLines = scoredLines.slice(0, 5).map((item) => "• " + item.line.replace(/^[-*]\s*/, ""));
    return topLines.join("\n");
  }

  function formatBullets(content) {
    return content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => (l.startsWith("-") || l.startsWith("*") ? "• " + l.substring(1).trim() : l))
      .join("\n");
  }

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatMarkdown(text) {
    let formatted = escapeHTML(text);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1 <i class="bi bi-box-arrow-up-right" style="font-size: 0.78em;"></i></a>'
    );
    formatted = formatted.replace(/\n/g, "<br>");
    return formatted;
  }

  // Init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectChatbotUI();
      fetchKnowledgeBase();
    });
  } else {
    injectChatbotUI();
    fetchKnowledgeBase();
  }
})();
