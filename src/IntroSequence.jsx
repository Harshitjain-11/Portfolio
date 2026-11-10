import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

export default function IntroSequence({ onComplete }) {
  const rootRef = useRef(null);
  const orbHostRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const orbHost = orbHostRef.current;
    if (!root || !orbHost) return undefined;
    let renderer;
    let frame = 0;
    let disposed = false;
    let timeline;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
    camera.position.z = 7;
    const orb = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.2, 48, 48), new THREE.MeshPhysicalMaterial({ color: 0x94baff, metalness: .82, roughness: .18, clearcoat: 1, emissive: 0x254bff, emissiveIntensity: .7, transparent: true, opacity: .96 }));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(.34, 40, 40), new THREE.MeshBasicMaterial({ color: 0x9fb4ff, transparent: true, opacity: .09, side: THREE.BackSide }));
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xc8d7ff, transparent: true, opacity: .68 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(.3, .008, 8, 96), ringMaterial);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(.37, .004, 8, 96), ringMaterial.clone());
    ringA.rotation.set(.75, .2, -.3);
    ringB.rotation.set(-.55, .5, .4);
    orb.add(ball, halo, ringA, ringB);
    scene.add(orb);
    scene.add(new THREE.PointLight(0xb9c8ff, 3.5, 5));
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      orbHost.appendChild(renderer.domElement);
    } catch (error) {
      console.warn("3D intro orb unavailable; continuing with the text sequence.", error);
    }

    const resize = () => {
      if (!renderer) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    const render = () => {
      if (disposed) return;
      frame = requestAnimationFrame(render);
      orb.rotation.y += .012;
      orb.rotation.x += .004;
      ringA.rotation.z += .009;
      ringB.rotation.y -= .006;
      if (renderer) renderer.render(scene, camera);
    };
    window.addEventListener("resize", resize);
    render();

    const q = (selector) => root.querySelector(selector);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => onCompleteRef.current?.(),
    });
    if (reduced) {
      timeline.set([q(".intro-light-streak"), q(".intro-name"), q(".intro-keywords"), q(".intro-portfolio")], { autoAlpha: 1 })
        .to(root, { autoAlpha: 0, duration: .2, delay: .25 });
    } else {
      timeline.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2 })
        .fromTo(orb.scale, { x: .01, y: .01, z: .01 }, { x: 1, y: 1, z: 1, duration: .5, ease: "back.out(2)" }, .15)
        .to(orb.position, { y: 1.05, duration: .7, ease: "power2.inOut" }, .75)
        .to(q(".intro-light-streak"), { scaleX: 1, duration: .58, ease: "power2.out" }, 1.15)
        .fromTo(q(".intro-name"), { autoAlpha: 0, y: 32, rotateX: -24, letterSpacing: ".32em" }, { autoAlpha: 1, y: 0, rotateX: 0, letterSpacing: ".12em", duration: .72, ease: "power3.out" }, 1.58)
        .fromTo(q(".intro-keywords"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .42 }, 2.05)
        .to(q(".intro-name"), { autoAlpha: 0, y: -24, filter: "blur(8px)", duration: .35 }, 2.65)
        .fromTo(q(".intro-portfolio"), { autoAlpha: 0, scale: 1.12, letterSpacing: ".38em", filter: "blur(9px)" }, { autoAlpha: 1, scale: 1, letterSpacing: ".2em", filter: "blur(0px)", duration: .55 }, 2.78)
        .to(root, { autoAlpha: 0, duration: .42, ease: "power2.in" }, 3.5);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      timeline?.kill();
      orb.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      renderer?.dispose();
      if (renderer?.domElement.parentNode === orbHost) orbHost.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="cinematic-intro" ref={rootRef} aria-label="Portfolio opening sequence">
    <div className="intro-orb-scene" ref={orbHostRef}/>
    <div className="intro-light-streak"/>
    <div className="intro-copy-block"><h2 className="intro-name">HARSHIT JAIN</h2><p className="intro-keywords">AI / MACHINE LEARNING <i/> COMPUTER VISION <i/> NLP</p></div>
    <div className="intro-portfolio">PORTFOLIO</div>
    <button className="cinematic-skip" type="button" onClick={onComplete}>SKIP INTRO <span>↗</span></button>
  </div>;
}
