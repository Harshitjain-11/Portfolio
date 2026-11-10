import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail, MoveUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroSequence from "./IntroSequence.jsx";
import TechPortrait from "./TechPortrait.jsx";
import ProjectConstellation from "./ProjectConstellation.jsx";
import TechConstellation from "./TechConstellation.jsx";
import { IDENTITY, SOCIAL_LINKS, PROJECTS, SKILLS, CREDENTIALS } from "./portfolioData.js";

function Index({ children }) { return <p className="eyebrow" data-reveal><span className="eyebrow-mark" />{children}</p>; }

function SkillTree() {
  const [active, setActive] = useState({ title: "AI & Machine Learning", items: SKILLS[0].items, evidence: SKILLS[0].evidence });
  return <div className="skill-tree-layout">
    <div className="skill-tree" role="tree" aria-label="Skills connected to project experience">
      <div className="tree-root"><span className="tree-root-pulse"/> Harshit’s toolkit</div>
      <div className="tree-branches">{SKILLS.map((group, index) => <section className="tree-branch" key={group.title} role="treeitem" aria-expanded="true">
        <button className={`tree-category ${active.title === group.title ? "is-active" : ""}`} onMouseEnter={() => setActive(group)} onFocus={() => setActive(group)} onClick={() => setActive(group)}><span className="tree-node-dot"/>{group.title}<i>0{index + 1}</i></button>
        <div className="tree-leaves" role="group">{group.items.split(" · ").map((item) => <button key={item} className={`tree-leaf ${active.skill === item ? "is-active" : ""}`} onMouseEnter={() => setActive({ ...group, skill: item })} onFocus={() => setActive({ ...group, skill: item })} onClick={() => setActive({ ...group, skill: item })}><span/>{item}</button>)}</div>
      </section>)}</div>
    </div>
    <aside className="skill-readout" aria-live="polite"><span className="readout-index">SELECTED NODE / {active.skill || active.title}</span><h3>{active.skill || active.title}</h3><p>{active.evidence}</p><div className="readout-link">CONNECTED TO <span>{active.evidence.split(",")[0]}</span><ArrowUpRight size={15}/></div></aside>
  </div>;
}

function CredentialTree() {
  const credentials = [...CREDENTIALS.certifications, ...CREDENTIALS.internships, ...CREDENTIALS.badges];
  const [selected, setSelected] = useState(credentials[0]);
  const getProfileUrl = (item) => {
    const issuer = item.issuer.toLowerCase();
    if (issuer.includes("google")) return SOCIAL_LINKS.googleSkills;
    if (issuer.includes("salesforce")) return SOCIAL_LINKS.salesforce;
    if (issuer.includes("oracle") || issuer.includes("uipath")) return SOCIAL_LINKS.credly;
    return SOCIAL_LINKS.linkedin;
  };
  return <div className="credential-tree-layout">
    <div className="credential-nodes" role="list" aria-label="Certificates and badges. Select an item to view its scan.">
      {credentials.map((item, i) => <button type="button" role="listitem" key={item.title} className={`credential-node ${selected.title === item.title ? "is-active" : ""}`} onMouseEnter={() => setSelected(item)} onFocus={() => setSelected(item)} onClick={() => setSelected(item)}><img className="credential-node-thumb" src={item.image} alt="" loading="lazy"/><span className="credential-node-text"><small>{item.type} / {item.issuer}</small><strong>{item.title}</strong><em>{item.date}</em></span><span className="credential-node-number">{String(i + 1).padStart(2,"0")}</span></button>)}
    </div>
    <aside className="credential-preview" aria-live="polite">
      <div className="credential-scan-label"><span>ORIGINAL SCAN</span><span>{selected.type.toUpperCase()}</span></div>
      <div className="credential-document-stage"><img key={selected.image} src={selected.image} alt={`Original ${selected.type} for ${selected.title}`} /></div>
      <div className="credential-preview-caption"><strong>{selected.title}</strong><span>{selected.issuer} · {selected.date}</span></div>
      <a href={selected.verifyUrl || getProfileUrl(selected)} target="_blank" rel="noreferrer">VIEW PROFILE RECORD <ArrowUpRight size={14}/></a>
    </aside>
  </div>;
}

function ProjectVisual({ project, index }) {
  return <div className={`project-visual visual-${index + 1}`} aria-hidden="true">
    <div className="visual-topline"><span>FIELD NOTES / 0{index + 1}</span><span>HJ—{String(index + 24).padStart(2, "0")}</span></div>
    <div className="visual-art">
      {index === 0 && <><div className="assist-orbit orbit-a"/><div className="assist-orbit orbit-b"/><div className="assist-core">CA<span>CHAT / 01</span></div><div className="data-chip chip-a">intent → answer</div><div className="data-chip chip-b">TF–IDF</div></>}
      {index === 1 && <><div className="food-ring ring-a"/><div className="food-ring ring-b"/><div className="food-center">DINE<span>ORDER / CONNECT</span></div><div className="signal signal-a"/><div className="signal signal-b"/></>}
      {index === 2 && <><div className="face-frame"><i/><b/><em/></div><div className="face-scan"/><div className="face-readout">LBPH <span>VISION / LIVE</span></div></>}
    </div>
    <span className="visual-title">{project.name}</span>
  </div>;
}

export default function App() {
  const mainRef = useRef(null);
  const [activeSection, setActiveSection] = useState(() => window.location.hash.slice(1) || "top");
  const [introActive, setIntroActive] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function finishIntro() {
    setIntroActive(false);
  }
  useEffect(() => {
    const sectionIds = ["top", "work", "about", "credentials"];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActiveSection(current.target.id);
    }, { rootMargin: "-28% 0px -58% 0px", threshold: [0, .15, .35, .6] });
    sections.forEach((section) => observer.observe(section));
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      document.documentElement.style.setProperty("--scroll-progress", progress);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((element, index) => {
        const heroItem = element.closest(".hero");
        gsap.fromTo(element,
          { autoAlpha: 0, y: heroItem ? 22 : 30, filter: "blur(7px)" },
          {
            autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .82,
            delay: heroItem ? index * .09 : 0, ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", toggleActions: "play none none reverse" },
          },
        );
      });
    }, root);
    return () => context.revert();
  }, []);

  return <main ref={mainRef}>
    {introActive && <IntroSequence onComplete={finishIntro}/>}
    <header className="site-header wrap">
      <span className="nav-progress" aria-hidden="true"/>
      <a className="wordmark" href="#top" aria-label="Harshit Jain, home">HJ<span>.</span></a>
      <nav aria-label="Main navigation"><a href="#work" aria-current={activeSection === "work" ? "location" : undefined}>Work <sup>03</sup></a><a href="#about" aria-current={activeSection === "about" ? "location" : undefined}>About</a><a href="#credentials" aria-current={activeSection === "credentials" ? "location" : undefined}>Credentials</a></nav>
      <a className="header-contact" href={`mailto:${IDENTITY.email}`}>Let’s talk <MoveUpRight size={15}/></a>
    </header>

    <section className="hero wrap" id="top">
      <div className="hero-copy">
        <p className="hero-kicker" data-reveal><span className="availability-dot"/> {IDENTITY.location} <i/> B.TECH CSE · AI & ML</p>
        <h1 data-reveal>Ideas into<br/><span>intelligence.</span></h1>
        <div className="hero-bottomline" data-reveal>
          <p>I’m <strong>Harshit Jain</strong> — a developer building useful software across applied AI, computer vision and the web.</p>
          <a className="round-cta" href="#work" aria-label="Explore selected work"><ArrowDownRight/></a>
        </div>
        <div className="hero-index" data-reveal>PORTFOLIO / 2026</div>
      </div>
      <div className="portrait-scene">
        <TechPortrait active={!introActive}/>
        <p className="portrait-caption"><span>01 / 03</span> BUILDING AT THE INTERSECTION OF PEOPLE & SYSTEMS</p>
      </div>
      <a className="scroll-cue" href="#work" data-reveal><span>SCROLL TO EXPLORE</span><ArrowDown size={14}/></a>
    </section>

    <section className="manifesto wrap" id="about">
      <Index>THE SHORT VERSION</Index>
      <div><h2 data-reveal>Curiosity is the<br/><span>starting point.</span></h2><p data-reveal>I learn by making things real: a chatbot that can guide a student, a computer-vision system that works with a webcam, a platform that connects a restaurant’s moving parts. I’m a B.Tech AI & Machine Learning student at ITM Gwalior, growing across applied ML and full-stack engineering.</p><a className="inline-link" data-reveal href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">A little more about me <ArrowUpRight size={15}/></a></div>
    </section>

    <section className="work wrap" id="work">
      <div className="section-top"><div><Index>SELECTED WORK / 2025—26</Index><h2 data-reveal>Made to work<br/><span>in the real world.</span></h2></div><p data-reveal>Three projects. Three different problems. One habit: follow the details all the way through.</p></div>
      <div data-reveal><ProjectConstellation projects={PROJECTS}/></div>
    </section>

    <section className="toolkit wrap">
      <div className="toolkit-intro"><Index>TOOLS I REACH FOR</Index><h2 data-reveal>Learn it.<br/><span>Build with it.</span></h2><p data-reveal>No scorecards. Just the work where I’ve used these tools.</p></div>
      <div data-reveal><TechConstellation projects={PROJECTS}/></div>
    </section>

    <section className="credentials wrap" id="credentials">
      <div className="section-top credential-heading"><div><Index>LEARNING IN PUBLIC</Index><h2 data-reveal>Progress, with<br/><span>receipts.</span></h2></div><p data-reveal>Choose a credential to view its original certificate or badge scan.</p></div>
      <div className="credential-profile-links">{CREDENTIALS.profiles.map((profile) => <a key={profile.platform} href={profile.url} target="_blank" rel="noreferrer">{profile.platform}<ArrowUpRight size={13}/></a>)}</div>
      <div data-reveal><CredentialTree/></div>
    </section>

    <footer className="footer">
      <div className="footer-atmosphere" aria-hidden="true"><svg viewBox="0 0 1440 520" preserveAspectRatio="none"><path d="M-80 410 C170 290 300 490 520 370 S850 270 1030 355 S1270 460 1520 250"/><path d="M-30 470 C230 340 340 500 600 410 S870 330 1070 410 S1330 390 1490 330"/><path d="M200 540 C390 410 500 490 760 440 S1090 350 1270 410"/></svg></div>
      <div className="footer-inner wrap"><Index>HAVE A GOOD PROBLEM?</Index><h2 data-reveal>Let’s build<br/><span>something useful.</span></h2><div className="footer-bottom"><a className="footer-email" data-reveal href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}<ArrowUpRight size={17}/></a><div className="footer-social" data-reveal><a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer"><Github size={16}/> GitHub <ArrowUpRight size={12}/></a><a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16}/> LinkedIn <ArrowUpRight size={12}/></a></div><span className="copyright">© {new Date().getFullYear()} HARSHIT JAIN</span></div></div>
    </footer>
  </main>;
}
