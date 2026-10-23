import React, { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail, Sparkles } from "lucide-react";
import ParticlePortrait from "./ParticlePortrait.jsx";
import IntroTypography from "./IntroTypography.jsx";

const NAME = "Harshit Jain"; // Edit this if needed.
const ROLE = "B.Tech AI & Machine Learning Student"; // Edit this if needed.
const CONTACT_EMAIL = "harshitjainp887@gmail.com"; // Replace with your email before publishing.

const projects = [
  {
    number: "01",
    name: "DINEaus",
    type: "FULL-STACK · AI / NLP",
    description: "A restaurant discovery and table-booking platform with real-time interactions and an AI-assisted conversational experience.",
    stack: ["Node.js", "Express", "EJS", "MySQL", "Socket.IO", "Flask"],
    link: "https://github.com/Harshitjain-11/DINEaus.git",
    linkLabel: "View repository"
  },
  {
    number: "02",
    name: "CampusAssist",
    type: "APPLIED NLP · BACKEND",
    description: "A college enquiry chatbot built to answer common student questions and support campus-visit scheduling through a structured conversational flow.",
    stack: ["Python", "Flask", "NLTK", "scikit-learn", "TF-IDF", "SQLite"],
    link: "",
    linkLabel: ""
  },
  {
    number: "03",
    name: "FaceVault",
    type: "COMPUTER VISION",
    description: "A face-detection and recognition web app using OpenCV, with tools to capture faces, train a local recognizer, and identify faces in real time.",
    stack: ["Python", "Flask", "OpenCV", "LBPH"],
    link: "https://github.com/Harshitjain-11/face-detection-project-pbl.git",
    linkLabel: "View repository"
  }
];

const skills = [
  { title: "Languages", items: "Python · JavaScript · Java · SQL" },
  { title: "Web & backend", items: "HTML · CSS · Node.js · Express · Flask · REST APIs" },
  { title: "AI & data", items: "Machine Learning · NLP · scikit-learn · NLTK · spaCy · OpenCV" },
  { title: "Tools", items: "Git · GitHub · MySQL · SQLite · Socket.IO" }
];

const capabilities = [
  "Full-stack web development",
  "Applied AI and machine learning",
  "Natural language processing",
  "Computer vision",
  "REST APIs and backend systems",
  "Responsive interface design"
];

function SectionLabel({ children }) {
  return <div className="section-label"><span className="label-dot" />{children}</div>;
}

class ParticleErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Particle portrait failed to render:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="particle-portrait portrait-fallback">
          <img className="portrait-fallback-image" src="/portrait.jpg" alt="Portrait of Harshit Jain" />
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const completeIntro = React.useCallback(() => setIntroComplete(true), []);

  return (
    <main className={introComplete ? "intro-finished" : "intro-playing"}>
      {!introComplete && <IntroTypography onComplete={completeIntro} />}
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Harshit Jain home"><span className="brand-word">HARSHIT JAIN</span><span className="brand-mark">H</span><i>.</i></a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="nav-status" href="#contact"><span className="status-pulse" /> Open to opportunities</a>
        <span className="menu-mark" aria-hidden="true"><i /><i /></span>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow reveal reveal-one"><Sparkles size={14} strokeWidth={1.8} /> AI / ML · COMPUTER VISION · NLP <span className="eyebrow-year">2026 / 27</span></div>
          <h1 className="portfolio-title reveal reveal-two">PORTFOLIO</h1>
          <div className="hero-rule reveal reveal-three"><span /></div>
          <div className="intro reveal reveal-four">
            <p className="intro-kicker">HEY, I'M</p>
            <h2>{NAME}</h2>
            <p className="role">{ROLE}</p>
            <p className="hero-description">I’m an AI & Machine Learning student building practical computer-vision, NLP, and full-stack experiences — from the first interface to the logic behind it.</p>
          </div>
          <div className="hero-actions reveal reveal-five">
            <a className="reference-arrow" href="#work" aria-label="Explore my work"><ArrowDownRight size={17} /></a>
            <a className="reference-contact" href="#contact">Contact</a>
            <a className="button button-primary" href="#contact">Let’s connect <ArrowUpRight size={16} /></a>
            <a className="text-link" href="#work">Explore my work <ArrowDownRight size={16} /></a>
          </div>
          <div className="hero-meta reveal reveal-five"><span>BASED IN INDIA</span><span className="meta-line" /><span>BUILDING · LEARNING · ITERATING</span></div>
        </div>
        <div className="hero-visual-stage">
          <div className="hero-visual" aria-label="Portrait particle animation">
            <div className="visual-index"><span>01</span> / THE HUMAN BEHIND THE CODE</div>
            <ParticleErrorBoundary>
              <ParticlePortrait introComplete={introComplete} />
            </ParticleErrorBoundary>
            <div className="visual-caption"><span className="caption-line" /> Pixels into perspective.</div>
            <div className="vertical-note">CREATIVE CODE / HUMAN-CENTRED BUILDING</div>
          </div>
        </div>
        <a className="scroll-cue" href="#work"><span className="scroll-line" /> SCROLL TO EXPLORE</a>
      </section>

      <section className="resume-intro shell" id="resume">
        <div className="resume-intro-heading">
          <SectionLabel>PROFILE / 01</SectionLabel>
          <h2>Build useful things.<br /><span>Keep learning.</span></h2>
        </div>
        <div className="resume-intro-card">
          <p><strong>Hey, I’m Harshit.</strong> I’m a B.Tech AI & Machine Learning student who enjoys turning ideas into practical software. My work sits between thoughtful interfaces, dependable backend systems, and applied AI.</p>
          <a className="text-link" href="#contact">Let’s work together <ArrowUpRight size={16} /></a>
        </div>
      </section>

      <section className="capabilities-section shell" aria-labelledby="capabilities-title">
        <div className="capabilities-heading">
          <SectionLabel>WHAT I CAN DO</SectionLabel>
          <h2 id="capabilities-title">Useful systems,<br /><span>carefully made.</span></h2>
        </div>
        <div className="capability-list">
          {capabilities.map((capability, index) => (
            <div className="capability-row" key={capability}>
              <span>0{index + 1}</span>
              <strong>{capability}</strong>
              <ArrowUpRight size={15} />
            </div>
          ))}
        </div>
      </section>

      <section className="work-section section shell" id="work">
        <div className="section-heading">
          <div><SectionLabel>SELECTED WORK</SectionLabel><h2>Curiosity, made<br /><span>functional.</span></h2></div>
          <p className="section-aside">A selection of academic and personal builds exploring interfaces, intelligent systems, and practical software.</p>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <article className="project-row" key={project.number}>
              <div className="project-number">{project.number}</div>
              <div className="project-main">
                <div className="project-type">{project.type}</div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="tag-list">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
              <div className="project-action">
                {project.link ? (
                  <a href={project.link} target="_blank" rel="noreferrer" aria-label={`${project.name} repository`} className="round-link"><ArrowUpRight size={19} /></a>
                ) : <span className="round-link disabled" aria-label="Repository link not added"><ArrowUpRight size={19} /></span>}
                {project.link && <a className="repo-text" href={project.link} target="_blank" rel="noreferrer">{project.linkLabel}</a>}
              </div>
            </article>
          ))}
        </div>
        <p className="project-footnote">Project descriptions are concise summaries. Open each repository for implementation details where a public link is available.</p>
      </section>

      <section className="about-section section shell" id="about">
        <div className="about-intro">
          <SectionLabel>A LITTLE ABOUT ME</SectionLabel>
          <h2>Code with intent.<br /><span>Learn by building.</span></h2>
          <p>I’m a B.Tech student focused on AI and Machine Learning, with a strong interest in software engineering and full-stack product development. I enjoy connecting thoughtful UI with reliable backend systems and practical AI features.</p>
          <a className="text-link" href="https://www.linkedin.com/in/harshit-jain-7561a1347/" target="_blank" rel="noreferrer">More on LinkedIn <ArrowUpRight size={16} /></a>
        </div>
        <div className="skills-panel">
          <div className="skills-panel-top"><span>TOOLKIT</span><span>01 — 04</span></div>
          {skills.map((skill, index) => (
            <div className="skill-row" key={skill.title}>
              <span className="skill-index">0{index + 1}</span>
              <div><h3>{skill.title}</h3><p>{skill.items}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section shell" id="contact">
        <div className="contact-top"><SectionLabel>HAVE A GOOD PROBLEM?</SectionLabel><span className="contact-coordinate">INDIA · AVAILABLE FOR THE NEXT CHALLENGE</span></div>
        <h2>Let’s make<br /><span>something matter.</span></h2>
        <div className="contact-bottom">
          <p>Open to learning opportunities, internships, and collaborations where I can contribute, grow, and ship thoughtful work.</p>
          <a className="button button-primary contact-button" href={`mailto:${CONTACT_EMAIL}`}>Start a conversation <Mail size={16} /></a>
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand footer-brand" href="#top"><span className="brand-word">HARSHIT JAIN</span><span className="brand-mark">H</span><i>.</i></a>
        <p>DESIGNED & BUILT WITH CURIOSITY <span>© {new Date().getFullYear()}</span></p>
        <div className="social-links">
          <a href="https://github.com/Harshitjain-11" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>
          <a href="https://www.linkedin.com/in/harshit-jain-7561a1347/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
        </div>
      </footer>
    </main>
  );
}
