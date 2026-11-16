import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

const NAME = "HARSHITJAIN";

function addPanel(group, width, height, depth, material, position, rotation = [0, 0, 0]) {
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  panel.position.set(...position);
  panel.rotation.set(...rotation);
  group.add(panel);
  return panel;
}

export default function IntroSequence({ onComplete }) {
  const rootRef = useRef(null);
  const roomRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const host = roomRef.current;
    if (!root || !host) return undefined;

    let renderer;
    let frame = 0;
    let timeline;
    let scene;
    let resize;
    let disposed = false;

    scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, window.innerWidth / window.innerHeight, 0.1, 90);
    camera.position.set(0, 0.45, 10.5);
    const room = new THREE.Group();
    scene.add(room);

    const back = new THREE.MeshStandardMaterial({ color: 0x171719, roughness: 0.62, metalness: 0.48, side: THREE.DoubleSide });
    const wall = new THREE.MeshStandardMaterial({ color: 0x111416, roughness: 0.72, metalness: 0.28, side: THREE.DoubleSide });
    const floor = new THREE.MeshStandardMaterial({ color: 0x171716, roughness: 0.34, metalness: 0.72, side: THREE.DoubleSide });
    const trimCoral = new THREE.MeshStandardMaterial({ color: 0xc77a5f, emissive: 0x693d30, emissiveIntensity: 0.7, metalness: 0.52, roughness: 0.28 });
    const trimLime = new THREE.MeshStandardMaterial({ color: 0xc7aa72, emissive: 0x6c5b36, emissiveIntensity: 0.5, metalness: 0.48, roughness: 0.32 });
    const softTrim = new THREE.MeshStandardMaterial({ color: 0x625750, emissive: 0x3d2018, emissiveIntensity: 0.4, metalness: 0.55, roughness: 0.42 });

    addPanel(room, 19, 11, 0.18, back, [0, 0, -7.7]);
    addPanel(room, 15.5, 11, 0.18, wall, [-9.25, 0, 0], [0, Math.PI / 2, 0]);
    addPanel(room, 15.5, 11, 0.18, wall, [9.25, 0, 0], [0, -Math.PI / 2, 0]);
    addPanel(room, 19, 15.5, 0.18, floor, [0, -5.35, 0], [-Math.PI / 2, 0, 0]);
    addPanel(room, 19, 15.5, 0.18, wall, [0, 5.35, 0], [Math.PI / 2, 0, 0]);

    const grid = new THREE.GridHelper(18, 30, 0x705941, 0x302820);
    grid.position.set(0, -5.23, 0);
    grid.material.transparent = true;
    grid.material.opacity = 0.34;
    room.add(grid);

    for (let i = -6; i <= 6; i += 1) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.035, 9.1, 0.04), i % 3 === 0 ? softTrim : wall);
      rib.position.set(i * 1.25, 0.02, -7.58);
      room.add(rib);
    }

    for (let i = 0; i < 5; i += 1) {
      const x = -7.1 + i * 3.55;
      const color = i === 1 || i === 4 ? trimCoral : i === 2 ? trimLime : softTrim;
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.035, 3.35 + (i % 2) * 0.6, 0.05), color);
      vertical.position.set(x, 0.32, -7.48);
      room.add(vertical);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.06), color);
      cap.position.set(x, 2.12, -7.45);
      room.add(cap);
    }

    const portal = new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.032, 8, 112), trimCoral);
    portal.position.set(0, 0.12, -7.48);
    room.add(portal);
    const portalInner = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.012, 6, 96), trimLime);
    portalInner.position.set(0, 0.12, -7.46);
    room.add(portalInner);

    const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.028, 10.3, 0.04), trimCoral);
    railLeft.position.set(-8.95, 0, 0);
    room.add(railLeft);
    const railRight = new THREE.Mesh(new THREE.BoxGeometry(0.028, 10.3, 0.04), trimLime);
    railRight.position.set(8.95, 0, -0.1);
    room.add(railRight);

    scene.add(new THREE.HemisphereLight(0xd7d2c6, 0x171516, 1.55));
    const key = new THREE.PointLight(0xc77a5f, 30, 38, 1.75);
    key.position.set(-5.5, 3.2, 2.6);
    scene.add(key);
    const fill = new THREE.PointLight(0xc7aa72, 16, 32, 1.9);
    fill.position.set(6, -0.4, -1.5);
    scene.add(fill);
    const sweep = new THREE.PointLight(0xd0a17c, 12, 23, 2);
    sweep.position.set(-6, 1.5, 0);
    scene.add(sweep);

    const cameraTrack = { x: -1.35 };
    camera.lookAt(0, 0, -2.1);
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      host.appendChild(renderer.domElement);
    } catch (error) {
      console.warn("3D room intro unavailable; continuing with the title reveal.", error);
    }

    resize = () => {
      if (!renderer) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    const render = () => {
      if (disposed) return;
      frame = requestAnimationFrame(render);
      camera.position.x = cameraTrack.x;
      camera.lookAt(0, -0.15, -2.25);
      if (renderer) renderer.render(scene, camera);
    };
    window.addEventListener("resize", resize);
    render();

    const letters = [...root.querySelectorAll(".orbit-letter")];
    const title = root.querySelector(".film-title");
    const center = { x: window.innerWidth / 2, y: window.innerHeight * 0.51 };
    const orbitRadiusX = Math.min(window.innerWidth * 0.28, 265);
    const orbitRadiusY = Math.min(window.innerHeight * 0.25, 205);
    const letterPaths = letters.map((element, index) => {
      const bounds = element.getBoundingClientRect();
      return {
        element,
        centerX: bounds.left + bounds.width / 2,
        centerY: bounds.top + bounds.height / 2,
        angle: -Math.PI / 2 + (index / letters.length) * Math.PI * 2,
      };
    });
    const paths = letterPaths.map(() => ({ progress: 0 }));
    const updateLetterOrbits = () => {
      letterPaths.forEach((path, index) => {
        const progress = Math.min(1, paths[index].progress);
        const lap = Math.min(1, progress / 0.78);
        const angle = path.angle + Math.PI * 2 * lap;
        const settle = progress <= 0.78 ? 0 : (progress - 0.78) / 0.22;
        const orbitX = center.x + Math.cos(angle) * orbitRadiusX - path.centerX;
        const orbitY = center.y + Math.sin(angle) * orbitRadiusY - path.centerY;
        const x = orbitX * (1 - settle);
        const y = orbitY * (1 - settle);
        const z = Math.sin(angle) * 190 * (1 - settle);
        const spinY = 360 * lap * (1 - settle) + 14 * Math.sin(angle) * (1 - settle);
        const opacity = Math.min(1, Math.max(0, progress * 6, settle * 1.3));
        path.element.style.opacity = String(opacity);
        path.element.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${spinY}deg) rotateX(${Math.cos(angle) * 12 * (1 - settle)}deg)`;
      });
    };

    timeline = gsap.timeline({ onComplete: () => onCompleteRef.current?.() });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      timeline.set(root.querySelectorAll(".film-header, .film-title, .film-role, .film-footer"), { autoAlpha: 1 })
        .set(letters, { autoAlpha: 1, clearProps: "transform" })
        .to(root, { autoAlpha: 0, duration: 0.2, delay: 0.25 });
    } else {
      timeline.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.34, ease: "power1.out" })
        .fromTo(root.querySelector(".film-header"), { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.08)
        .fromTo(root.querySelector(".film-room-meta"), { autoAlpha: 0, y: 10 }, { autoAlpha: 0.78, y: 0, duration: 0.46, ease: "power3.out" }, 0.3)
        .fromTo(room.rotation, { y: -0.34, x: 0.025 }, { y: 0.28, x: -0.012, duration: 1.55, ease: "power2.inOut" }, 0.12)
        .to(room.rotation, { y: 0, x: 0, duration: 1.35, ease: "power3.out" }, 1.5)
        .to(cameraTrack, { x: 1.45, duration: 1.35, ease: "power1.inOut" }, 0.12)
        .to(cameraTrack, { x: -1.05, duration: 1.25, ease: "power1.inOut" }, 1.48)
        .to(cameraTrack, { x: 0, duration: 0.88, ease: "power3.out" }, 2.75)
        .to(sweep.position, { x: 6.5, duration: 2.4, ease: "power1.inOut" }, 0.22)
        .to(paths, { progress: 1, duration: 2.7, stagger: { each: 0.045, from: "center" }, ease: "power1.inOut", onUpdate: updateLetterOrbits }, 0.35)
        .fromTo(title, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.52)
        .fromTo(root.querySelector(".film-kicker"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" }, 2.6)
        .fromTo(root.querySelector(".film-role"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" }, 3.02)
        .fromTo(root.querySelector(".film-footer"), { autoAlpha: 0, y: 9 }, { autoAlpha: 0.82, y: 0, duration: 0.42, ease: "power3.out" }, 3.12)
        .to(root, { scale: 1.035, autoAlpha: 0, filter: "blur(7px)", duration: 0.62, ease: "power2.in" }, 5.15);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      timeline?.kill();
      scene?.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      renderer?.dispose();
      if (renderer?.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="intro-film" ref={rootRef} aria-label="Harshit Jain portfolio introduction">
    <div className="film-atmosphere" aria-hidden="true" />
    <div className="film-room" ref={roomRef} aria-hidden="true" />
    <div className="film-glass" aria-hidden="true" />
    <header className="film-header">
      <span className="film-mark">HJ<span>.</span></span>
      <span className="film-edition">PORTFOLIO <i /> 2026</span>
      <span className="film-status"><i /> GWALIOR, INDIA</span>
    </header>
    <div className="film-room-meta"><span>ROOM 01</span><i /> <span>IDEAS IN MOTION</span></div>
    <main className="film-copy">
      <p className="film-kicker"><i /> SOFTWARE <b>×</b> ARTIFICIAL INTELLIGENCE <i /></p>
      <h1 className="film-title" aria-label="Harshit Jain">
        {NAME.split("").map((letter, index) => <span className={`orbit-letter${index === 7 ? " orbit-word-gap" : ""}${index > 6 ? " orbit-accent" : ""}`} aria-hidden="true" key={`${letter}-${index}`}>{letter}</span>)}
      </h1>
      <p className="film-role">Building useful things with <strong>AI &amp; code.</strong></p>
    </main>
    <footer className="film-footer"><span>ENGINEER / AI + ML</span><span className="film-footer-center">A DIGITAL PORTFOLIO</span><span>SCENE <b>01</b></span></footer>
    <button className="film-skip" type="button" onClick={() => onCompleteRef.current?.()}>SKIP <span>↗</span></button>
  </div>;
}
