// ── portfolioData.js ──────────────────────────────────────────────
// Single source of truth for all portfolio content.
// Edit this file to update projects, credentials, skills and links.
// ──────────────────────────────────────────────────────────────────

export const IDENTITY = {
  name: "Harshit Jain",
  role: "B.Tech CSE (AI & ML) · ITM Gwalior",
  tagline: "I build applied AI systems and full-stack software — from NLP chatbots and computer-vision pipelines to production web platforms.",
  email: "harshitjainp887@gmail.com",
  location: "Gwalior, India",
  availability: "Open to opportunities",
  education: "B.Tech Computer Science & Engineering (AI & ML), ITM Gwalior, 2023–2027",
};

export const SOCIAL_LINKS = {
  github: "https://github.com/Harshitjain-11",
  linkedin: "https://www.linkedin.com/in/harshit-jain-7561a1347/",
  credly: "https://www.credly.com/users/harshit-jain.e4f4d44f",
  googleSkills: "https://www.skills.google/public_profiles/c3f52d19-cd90-4b88-afe7-a5c51c832c07",
  salesforce: "https://www.salesforce.com/trailblazer/axfmwjrwqq65w32p4s",
};

export const PROJECTS = [
  {
    number: "01",
    name: "CampusAssist",
    subtitle: "Intelligent College Enquiry Chatbot",
    type: "APPLIED NLP · FULL-STACK",
    problem: "Prospective students need quick answers about admissions, courses, fees and campus life — but college staff can't respond 24/7.",
    solution: "Built an NLP chatbot that classifies student queries using a hybrid TF-IDF cosine-similarity + exact-match + keyword-boosting pipeline, extracts entities (dates, categories) via regex and NLTK, and responds from a structured intents knowledge base. Deployed live on Railway with Gunicorn.",
    challenge: "Designing intent classification that works across casual, Hinglish and formal queries without a large training corpus — solved with a multi-strategy scoring approach rather than a single model.",
    stack: ["Python", "Flask", "NLTK", "scikit-learn", "TF-IDF", "SQLite", "Gunicorn"],
    github: "https://github.com/Harshitjain-11/College-Enquiry-Chatbot",
    demo: "https://college-enquiry-chatbot-production.up.railway.app/",
    preview: "https://raw.githubusercontent.com/Harshitjain-11/College-Enquiry-Chatbot/main/architecture.png",
    architecture: [
      { name: "Browser", kind: "INTERFACE", detail: "The repository documents a vanilla HTML, CSS and JavaScript interface that sends student questions to the Flask application." },
      { name: "Flask", kind: "WEB SERVER", detail: "app.py serves the chatbot and routes user messages into the modular NLP and response flow." },
      { name: "NLP pipeline", kind: "INTENT + ENTITIES", detail: "Exact matches, keyword boosts and TF-IDF cosine similarity classify intent; extraction and context handling are separate modules." },
      { name: "Knowledge base", kind: "JSON DATA", detail: "Structured JSON files supply intents, FAQs and college information for response generation." },
      { name: "SQLite", kind: "PERSISTENCE", detail: "The repository documents SQLite storage for appointments, leads and conversation logs." },
    ],
    individual: true,
  },
  {
    number: "02",
    name: "DINEaus",
    subtitle: "Food Ordering & Table Reservation Platform",
    type: "FULL-STACK · AI CHATBOT",
    problem: "Restaurants need a unified system for food ordering, table reservations and real-time communication — not three separate tools.",
    solution: "Built a full-stack platform with Node.js/Express serving the web app (EJS, Socket.IO for real-time order tracking) backed by MySQL, plus DineBot — an independent Flask chatbot microservice using scikit-learn for intent classification with Groq API / Llama-3.1 fallback for open-ended queries, and spaCy for entity extraction (dishes, quantities, dates, guest counts).",
    challenge: "Bridging two runtime environments (Node.js web server + Python AI service) into a seamless chatbot UX — achieved through internal REST API calls between microservices.",
    stack: ["Node.js", "Express", "Flask", "MySQL", "Socket.IO", "spaCy", "scikit-learn", "Groq / Llama-3.1"],
    github: "https://github.com/Harshitjain-11/DINEaus",
    demo: null,
    preview: "https://raw.githubusercontent.com/Harshitjain-11/DINEaus/main/docs/screenshots/home.png",
    architecture: [
      { name: "Customer UI", kind: "EJS WEB APP", detail: "DINEaus serves customer ordering, reservations and restaurant operations through a Node.js and Express web application rendered with EJS." },
      { name: "Express", kind: "WEB SERVER", detail: "The README describes Express routes for the web product and internal REST calls to the separate DineBot service." },
      { name: "MySQL", kind: "APPLICATION DATA", detail: "The web application uses a configured MySQL database for its restaurant, menu, order and reservation flows." },
      { name: "Socket.IO", kind: "LIVE EVENTS", detail: "Socket.IO connects real-time parts of the product, including order progress updates." },
      { name: "DineBot", kind: "FLASK SERVICE", detail: "A separate Python Flask service handles the food assistant; it uses NLP and a Groq/Llama fallback for open-ended queries." },
    ],
    individual: true,
  },
  {
    number: "03",
    name: "FaceVault",
    subtitle: "Real-Time Face Recognition System",
    type: "COMPUTER VISION · FLASK",
    problem: "Building a face-recognition system that works reliably in a browser with live video, handles low-light conditions, and resists basic spoofing attempts.",
    solution: "Built a Flask web app that streams live MJPEG video from the webcam, detects faces using Haar Cascade classifiers, and recognises enrolled identities using the LBPH algorithm. Includes face enrollment, model training, a gallery view, and anti-spoofing checks via eye-cascade liveness detection. Uses CLAHE preprocessing for low-light conditions and thread-safe camera/model locks for concurrent access.",
    challenge: "Achieving acceptable recognition accuracy and anti-spoofing without deep learning — solved with CLAHE preprocessing, multi-cascade liveness checks and configurable confidence thresholds.",
    stack: ["Python", "Flask", "OpenCV", "Haar Cascade", "LBPH", "NumPy"],
    github: "https://github.com/Harshitjain-11/FaceVault-Face-Recognition-System",
    demo: null,
    architecture: [
      { name: "Browser", kind: "DASHBOARD", detail: "The README describes a browser dashboard for enrollment, gallery review, training controls and live recognition feedback." },
      { name: "Flask", kind: "WEB APP", detail: "Flask coordinates enrollment, gallery, training and MJPEG stream routes in the application." },
      { name: "Camera workers", kind: "THREADS + LOCKS", detail: "Background camera workers and decoupled locks reduce frame contention in the live stream." },
      { name: "OpenCV", kind: "DETECTION + PREPROCESS", detail: "Haar cascades locate faces; the pipeline crops and normalizes face regions and applies CLAHE for contrast." },
      { name: "LBPH", kind: "RECOGNITION", detail: "The local LBPH recognizer is retrained from enrolled samples and used for live identity predictions." },
    ],
    individual: true,
    note: "Uses classical computer vision (Haar + LBPH), not deep learning.",
  },
];

// ── Credentials ──────────────────────────────────────────────────
// Grouped by type. Only items with corroborating public evidence.
// "verifyUrl" points to the issuer profile or certificate where available.
export const CREDENTIALS = {
  certifications: [
    { title: "Oracle Certified AI Foundations Associate", issuer: "Oracle University", date: "Dec 2025", type: "certification", image: "/certificates/credential-05.png" },
    { title: "Workflow Analyzer in Studio (v2024.10)", issuer: "UiPath", date: "Feb 2026", type: "course certificate", image: "/certificates/credential-01.png" },
    { title: "C++ Internship", issuer: "ITM Gwalior", date: "Nov–Dec 2023", type: "internship certificate", image: "/certificates/credential-08.png" },
    { title: "Campus Recruitment Training", issuer: "ITM Gwalior", date: "Feb 2026", type: "course certificate", image: "/certificates/credential-09.png" },
  ],
  internships: [
    { title: "ServiceNow Virtual Internship Program", issuer: "ServiceNow / AICTE SmartBridge", date: "Apr 2026", type: "internship", image: "/certificates/credential-02.png" },
    { title: "MERN Full Stack Development With Project", issuer: "AICTE EduSkills", date: "Mar 2026", type: "internship", image: "/certificates/credential-03.png" },
    { title: "SQL and Database Management Systems With Project", issuer: "AICTE EduSkills", date: "Jul 2026", type: "internship", image: "/certificates/credential-04.png" },
    { title: "Python Full Stack Developer Virtual Internship", issuer: "AICTE EduSkills", date: "Oct–Dec 2024", type: "internship", image: "/certificates/credential-06.png" },
    { title: "Networking Virtual Internship", issuer: "EduSkills / Juniper Networks", date: "Jan–Mar 2025", type: "internship", image: "/certificates/credential-07.png" },
    { title: "Generative AI Virtual Internship", issuer: "Google Cloud / EduSkills", date: "Jul–Sep 2025", type: "internship", image: "/certificates/credential-10.png" },
    { title: "Java Full Stack Developer Virtual Internship", issuer: "AICTE EduSkills", date: "Oct–Dec 2025", type: "internship", image: "/certificates/credential-11.png" },
    { title: "AI-ML Virtual Internship", issuer: "Google for Developers / EduSkills", date: "Apr–Jun 2025", type: "internship", image: "/certificates/credential-12.png" },
  ],
  badges: [
    { title: "Salesforce Agentblazer Champion 2026", issuer: "Salesforce", date: "2026", type: "badge", image: "/certificates/salesforce-agentblazer-champion.png" },
    { title: "Student Automation Developer Associate", issuer: "UiPath Academic Alliance", date: "2026", type: "badge", image: "/certificates/uipath-academic-alliance.png" },
  ],
  profiles: [
    { platform: "Credly", url: "https://www.credly.com/users/harshit-jain.e4f4d44f", description: "Digital badges & credentials" },
    { platform: "Google Skills", url: "https://www.skills.google/public_profiles/c3f52d19-cd90-4b88-afe7-a5c51c832c07", description: "Google Cloud & AI skill badges" },
    { platform: "Salesforce Trailblazer", url: "https://www.salesforce.com/trailblazer/axfmwjrwqq65w32p4s", description: "Explorer rank · Learning badges" },
  ],
};

// ── Skills (evidence-based, tied to projects) ────────────────────
export const SKILLS = [
  {
    title: "AI & Machine Learning",
    items: "NLP · TF-IDF / Cosine Similarity · Intent Classification · scikit-learn · NLTK · spaCy · Groq / LLM APIs",
    evidence: "CampusAssist hybrid intent pipeline, DINEaus DineBot with Groq/Llama fallback",
  },
  {
    title: "Computer Vision",
    items: "OpenCV · Haar Cascade · LBPH · CLAHE · MJPEG Streaming · Anti-spoofing",
    evidence: "FaceVault real-time recognition with liveness detection",
  },
  {
    title: "Full-Stack Development",
    items: "Python · Flask · Node.js · Express · EJS · Socket.IO · REST APIs · MySQL · SQLite",
    evidence: "DINEaus microservice architecture, CampusAssist Railway deployment",
  },
  {
    title: "Languages & Tools",
    items: "Python · JavaScript · Java · SQL · Git · GitHub · HTML · CSS",
    evidence: "Used across all three projects",
  },
];
