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
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 40);
    camera.position.z = 7;
    const orb = new THREE.Group();
    const ballMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 n = normalize(vNormal);
          vec3 lightDir = normalize(vec3(-0.48, 0.72, 0.82));
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float diffuse = max(dot(n, lightDir), 0.0);
          float facing = max(dot(n, viewDir), 0.0);
          float fresnel = pow(1.0 - facing, 2.7);
          float flow = sin(vPosition.x * 7.0 + vPosition.y * 8.0 + uTime * 1.25
            + sin(vPosition.z * 9.0 - uTime * 0.8) * 0.55);
          float vein = pow(max(0.0, 0.5 + 0.5 * sin(vPosition.y * 17.0
            + vPosition.x * 3.5 - uTime * 1.8 + sin(vPosition.z * 12.0) * 0.5)), 5.0);
          float seam = exp(-abs(sin(vPosition.y * 24.0 + vPosition.x * 2.0
            + sin(vPosition.z * 8.0 - uTime) * 0.4 + uTime * 1.9)) * 28.0);
          vec3 deep = vec3(0.012, 0.026, 0.095);
          vec3 cobalt = vec3(0.035, 0.13, 0.43);
          vec3 azure = vec3(0.10, 0.42, 0.92);
          vec3 color = mix(deep, cobalt, smoothstep(-0.72, 0.82, flow));
          color = mix(color, azure, vein * 0.6);
          color *= 0.34 + diffuse * 0.82;
          color += pow(max(dot(n, normalize(lightDir + viewDir)), 0.0), 46.0) * vec3(0.72, 0.88, 1.0) * 1.35;
          color += fresnel * vec3(0.12, 0.43, 0.92) * 0.95;
          color += seam * vec3(0.22, 0.62, 1.0) * 0.35;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.29, 64, 64), ballMaterial);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(.46, 48, 48), new THREE.MeshBasicMaterial({ color: 0x79a5ff, transparent: true, opacity: .08, side: THREE.BackSide }));
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd5eaff, transparent: true, opacity: .82 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(.43, .009, 8, 128), ringMaterial);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(.52, .004, 8, 128), ringMaterial.clone());
    const shellGeometry = new THREE.BufferGeometry();
    const shellPoints = new Float32Array(540 * 3);
    for (let i = 0; i < 540; i += 1) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const radius = .64 + Math.random() * .44;
      shellPoints[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      shellPoints[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      shellPoints[i * 3 + 2] = radius * Math.cos(phi);
    }
    shellGeometry.setAttribute("position", new THREE.BufferAttribute(shellPoints, 3));
    const shell = new THREE.Points(shellGeometry, new THREE.PointsMaterial({ color: 0xa9c8ff, size: .013, transparent: true, opacity: .68, depthWrite: false, sizeAttenuation: true }));
    ringA.rotation.set(.75, .2, -.3);
    ringB.rotation.set(-.55, .5, .4);
    orb.add(ball, halo, ringA, ringB, shell);
    scene.add(orb);
    const keyLight = new THREE.PointLight(0xaacaff, 5, 6);
    keyLight.position.set(-1.2, 1.4, 2.2);
    scene.add(keyLight, new THREE.AmbientLight(0x566bba, 1.4));
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
      orb.rotation.y += .009;
      orb.rotation.x += .003;
      ringA.rotation.z += .012;
      ringB.rotation.y -= .008;
      shell.rotation.y -= .004;
      ballMaterial.uniforms.uTime.value = performance.now() * .001;
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
      timeline.set([q(".intro-topline"), q(".intro-kicker"), q(".intro-name"), q(".intro-tagline"), q(".intro-bottomline")], { autoAlpha: 1 })
        .to(root, { autoAlpha: 0, duration: .2, delay: .25 });
    } else {
      timeline.set(orb.scale, { x: .001, y: .001, z: .001 })
        .fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 })
        .fromTo(q(".intro-topline"), { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: .45 }, .1)
        .fromTo(orb.scale, { x: .001, y: .001, z: .001 }, { x: 1.4, y: 1.4, z: 1.4, duration: .85, ease: "elastic.out(1,.52)" }, .18)
        .fromTo(q(".intro-core-glow"), { autoAlpha: 0, scale: .2 }, { autoAlpha: 1, scale: 1, duration: .8, ease: "power3.out" }, .2)
        .to(orb.position, { y: .72, duration: .9, ease: "power2.inOut" }, .42)
        .to(q(".intro-light-streak"), { scaleX: 1, duration: .72, ease: "expo.out" }, .8)
        .fromTo(q(".intro-kicker"), { autoAlpha: 0, y: 13, letterSpacing: ".38em" }, { autoAlpha: 1, y: 0, letterSpacing: ".22em", duration: .48, ease: "power3.out" }, 1.22)
        .fromTo(q(".intro-name"), { autoAlpha: 0, y: 45, scale: .96, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: .82, ease: "power4.out" }, 1.34)
        .fromTo(q(".intro-tagline"), { autoAlpha: 0, y: 14, filter: "blur(4px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .5, ease: "power3.out" }, 1.83)
        .fromTo(q(".intro-bottomline"), { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: .5 }, 1.75)
        .to(q(".intro-progress-fill"), { scaleX: 1, duration: 1.55, ease: "none" }, 2.1)
        .to(q(".intro-flash"), { autoAlpha: .9, duration: .08 }, 3.72)
        .to(q(".intro-flash"), { autoAlpha: 0, duration: .34, ease: "power2.out" }, 3.8)
        .to(root, { scale: 1.035, autoAlpha: 0, filter: "blur(8px)", duration: .48, ease: "power2.in" }, 3.78);
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
    <div className="intro-core-glow" aria-hidden="true"/>
    <div className="intro-light-streak" aria-hidden="true"/>
    <div className="intro-vignette" aria-hidden="true"/>
    <header className="intro-topline"><span className="intro-mark">HJ<span>.</span></span><span className="intro-edition">DIGITAL PORTFOLIO <i/> 2026</span></header>
    <div className="intro-copy-block"><p className="intro-kicker"><i/> ENGINEER / AI + MOTION <i/></p><h1 className="intro-name">HARSHIT <span>JAIN</span></h1><p className="intro-tagline">Building <em>intelligence</em> into useful things.</p></div>
    <footer className="intro-bottomline"><span>SOFTWARE <i/> INTELLIGENCE <i/> DESIGN</span><div className="intro-progress"><i className="intro-progress-fill"/></div><span>01 <b>/</b> 03</span></footer>
    <div className="intro-flash" aria-hidden="true"/>
    <button className="cinematic-skip" type="button" onClick={onComplete}>SKIP <span>↗</span></button>
  </div>;
}
