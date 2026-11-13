import React, { useRef, useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";

const coordinates = [
  { left: "12%", top: "39%" },
  { left: "50%", top: "69%" },
  { left: "87%", top: "36%" },
];

function Architecture({ project }) {
  const [active, setActive] = useState(0);
  const nodes = project.architecture || [];
  return <div className="architecture-explorer">
    <div className="architecture-flow" aria-label={`${project.name} implementation flow`}>
      <svg viewBox="0 0 900 140" preserveAspectRatio="none" aria-hidden="true">
        <path d="M40 73 C150 12 200 132 315 73 S480 15 590 73 S750 130 860 64" />
      </svg>
      {nodes.map((node, index) => <button type="button" key={node.name} className={`architecture-node ${active === index ? "is-active" : ""}`} style={{ left: `${4.5 + index * (91 / Math.max(nodes.length - 1, 1))}%` }} onClick={() => setActive(index)} aria-pressed={active === index}>
        <span className="architecture-dot"/><strong>{node.name}</strong><small>{node.kind}</small>
      </button>)}
    </div>
    {nodes[active] && <p className="architecture-note" aria-live="polite"><span>IMPLEMENTATION NOTE / {String(active + 1).padStart(2, "0")}</span>{nodes[active].detail}</p>}
  </div>;
}

export default function ProjectConstellation({ projects }) {
  const [selected, setSelected] = useState(0);
  const detailRef = useRef(null);
  const project = projects[selected];
  const trackSpotlight = (event) => {
    if (event.pointerType !== "mouse" || !detailRef.current) return;
    const bounds = detailRef.current.getBoundingClientRect();
    detailRef.current.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
    detailRef.current.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
    detailRef.current.classList.add("has-pointer-spotlight");
  };
  const clearSpotlight = () => detailRef.current?.classList.remove("has-pointer-spotlight");
  return <div className="project-constellation">
    <div className="constellation-map" aria-label="Three connected project nodes">
      <svg className="constellation-path" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="project-path-gradient"><stop stopColor="#788fff"/><stop offset=".52" stopColor="#a6b4ff"/><stop offset="1" stopColor="#c7fa62"/></linearGradient></defs>
        <path className="path-ghost" d="M90 186 C222 15 326 346 510 260 S787 48 1006 169 S1094 264 1130 170"/>
        <path className="path-main" d="M90 186 C222 15 326 346 510 260 S787 48 1006 169 S1094 264 1130 170"/>
      </svg>
      {projects.map((item, index) => <button type="button" key={item.name} style={coordinates[index]} className={`constellation-project-node node-${index + 1} ${selected === index ? "is-active" : ""}`} onClick={() => setSelected(index)} aria-pressed={selected === index}>
        <span className="project-node-orbit"/><span className="project-node-core">{item.number}</span><span className="project-node-label"><small>{item.type}</small><strong>{item.name}</strong></span>
      </button>)}
      <div className="constellation-coordinate coordinate-a">FIELD / 01</div><div className="constellation-coordinate coordinate-b">SYSTEMS IN MOTION</div>
    </div>

    <article ref={detailRef} className="constellation-detail" key={project.name} onPointerMove={trackSpotlight} onPointerLeave={clearSpotlight}>
      <div className="project-detail-visual">
        {project.preview ? <img src={project.preview} alt={`${project.name} project screenshot from its GitHub README`} loading="lazy" /> : <div className="project-detail-placeholder"><span>IMPLEMENTATION MAP</span><b>{project.name}</b><i>{project.architecture.map((node) => node.name).join("  →  ")}</i></div>}
        <span className="preview-source">{project.preview ? "REPOSITORY SCREENSHOT" : "REPOSITORY ARCHITECTURE"}</span>
      </div>
      <div className="project-detail-copy">
        <div className="project-detail-index"><span>0{selected + 1} / {project.type}</span><span>SELECTED SYSTEM</span></div>
        <h3>{project.name}<small>{project.subtitle}</small></h3>
        <p className="project-detail-problem">{project.problem}</p>
        <p className="project-detail-solution">{project.solution}</p>
        <div className="project-detail-challenge"><span>ENGINEERING QUESTION</span>{project.challenge}</div>
        <div className="project-detail-tags">{project.stack.map((tech) => <span key={tech}>{tech}</span>)}</div>
        <div className="project-detail-links"><a href={project.github} target="_blank" rel="noreferrer"><Github size={15}/> Explore source <ArrowUpRight size={13}/></a>{project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Open live deployment <ArrowUpRight size={13}/></a>}</div>
      </div>
      <div className="architecture-panel"><div className="architecture-heading"><span>UNDER THE SURFACE</span><strong>Explore implementation</strong><a href={project.github} target="_blank" rel="noreferrer">SOURCE README <ArrowUpRight size={12}/></a></div><Architecture project={project}/></div>
    </article>
  </div>;
}
