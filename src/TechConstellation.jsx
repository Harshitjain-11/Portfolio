import React, { useMemo, useState } from "react";
import siPython from "simple-icons/icons/python.svg?raw";
import siFlask from "simple-icons/icons/flask.svg?raw";
import siNodedotjs from "simple-icons/icons/nodedotjs.svg?raw";
import siExpress from "simple-icons/icons/express.svg?raw";
import siMysql from "simple-icons/icons/mysql.svg?raw";
import siSocketdotio from "simple-icons/icons/socketdotio.svg?raw";
import siOpencv from "simple-icons/icons/opencv.svg?raw";
import siScikitlearn from "simple-icons/icons/scikitlearn.svg?raw";
import siJavascript from "simple-icons/icons/javascript.svg?raw";
import siGit from "simple-icons/icons/git.svg?raw";
import siGithub from "simple-icons/icons/github.svg?raw";
import siHtml5 from "simple-icons/icons/html5.svg?raw";
import siCss3 from "simple-icons/icons/css.svg?raw";

const iconByName = {
  Python: siPython, Flask: siFlask, "Node.js": siNodedotjs, Express: siExpress,
  MySQL: siMysql, "Socket.IO": siSocketdotio, OpenCV: siOpencv,
  "scikit-learn": siScikitlearn, JavaScript: siJavascript, Git: siGit,
  GitHub: siGithub, HTML: siHtml5, CSS: siCss3,
};
const iconColor = { Python: "#3776ab", Flask: "#f1f2f4", "Node.js": "#78c257", Express: "#d2d5df", MySQL: "#4b9bd5", "Socket.IO": "#d8dced", OpenCV: "#77d3a8", "scikit-learn": "#f39b66", JavaScript: "#f0d44b", Git: "#f06c55", GitHub: "#e9ebf4", HTML: "#e87952", CSS: "#6098e7" };
const positions = [
  [9, 25], [25, 17], [42, 27], [59, 16], [76, 29], [91, 17], [17, 70], [37, 80], [57, 65], [77, 78], [92, 64], [6, 49], [84, 50],
];

function BrandIcon({ source, label, color }) {
  const viewBox = source.match(/viewBox="([^"]+)"/)?.[1] || "0 0 24 24";
  const path = source.match(/<path[^>]*d="([^"]+)"[^>]*\/?\s*>/)?.[1];
  return <svg viewBox={viewBox} role="img" aria-label={`${label} logo`}><path d={path} fill={color}/></svg>;
}

export default function TechConstellation({ projects }) {
  const techs = useMemo(() => {
    const all = new Set(projects.flatMap((project) => project.stack));
    ["JavaScript", "Git", "GitHub", "HTML", "CSS"].forEach((tech) => all.add(tech));
    return [...all].filter((name) => iconByName[name]);
  }, [projects]);
  const [activeTech, setActiveTech] = useState(null);
  const related = activeTech ? projects.filter((project) => project.stack.includes(activeTech) || ["Git", "GitHub", "HTML", "CSS", "JavaScript"].includes(activeTech) && project.name === "DINEaus") : [];
  return <div className="tech-constellation">
    <div className="tech-constellation-map" aria-label="Technology logos linked to project experience">
      <svg viewBox="0 0 1000 480" preserveAspectRatio="none" aria-hidden="true">
        <path d="M82 118 C210 38 260 156 391 125 S557 56 643 131 S807 175 915 99"/><path d="M82 118 C151 246 246 316 366 336 S521 391 583 303 S730 237 833 325 S908 290 915 99"/><path d="M391 125 C394 225 424 268 583 303 M643 131 C642 204 618 237 583 303"/>
      </svg>
      {techs.map((name, index) => {
        const [x, y] = positions[index % positions.length];
        const connected = !activeTech || name === activeTech || related.some((project) => project.stack.includes(name));
        return <button key={name} className={`tech-node ${activeTech === name ? "is-active" : ""} ${connected ? "is-connected" : "is-dimmed"}`} style={{ left: `${x}%`, top: `${y}%` }} type="button" onMouseEnter={() => setActiveTech(name)} onFocus={() => setActiveTech(name)} onClick={() => setActiveTech(activeTech === name ? null : name)} aria-pressed={activeTech === name}>
          <span className="tech-logo"><BrandIcon source={iconByName[name]} label={name} color={iconColor[name]}/></span><span className="tech-label">{name}</span>
        </button>;
      })}
      <div className="tech-center-mark"><span>HJ</span><small>TOOLS IN USE</small></div>
    </div>
    <aside className="tech-constellation-readout" aria-live="polite">
      <span>{activeTech ? "SELECTED TECHNOLOGY" : "EVIDENCE, NOT SCORES"}</span>
      <strong>{activeTech || "Every node connects to work."}</strong>
      <p>{activeTech ? related.length ? `Used in ${related.map((project) => project.name).join(" · ")}. Select a linked project above to follow the implementation.` : "Listed in the portfolio toolkit; project-level evidence is not attached yet." : "Explore a logo to trace it to the projects where it appears in the documented stack."}</p>
      {activeTech && <div className="tech-related-projects">{related.map((project) => <button key={project.name} type="button" onClick={() => document.querySelector(`#work`)?.scrollIntoView({ behavior: "smooth" })}>{project.name}<span>IN PROJECT PATH ↗</span></button>)}</div>}
    </aside>
  </div>;
}
