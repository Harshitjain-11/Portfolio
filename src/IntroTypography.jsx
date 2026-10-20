import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"]
};

function createWord(word, material) {
  const group = new THREE.Group();
  let cursor = 0;
  [...word].forEach((letter) => {
    if (letter === " ") {
      cursor += 0.8;
      return;
    }
    const pattern = GLYPHS[letter];
    if (!pattern) return;
    pattern.forEach((row, rowIndex) => {
      [...row].forEach((cell, columnIndex) => {
        if (cell !== "1") return;
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.18), material);
        block.position.set(cursor + columnIndex * 0.25, (6 - rowIndex) * 0.25, 0);
        group.add(block);
      });
    });
    cursor += 1.55;
  });
  group.userData.width = cursor;
  group.position.x = -cursor / 2;
  group.position.y = -0.8;
  return group;
}

export default function IntroTypography({ onComplete }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    let frame = 0;
    let disposed = false;
    let finishTimer;
    let completionScheduled = false;

    const finish = () => {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(frame);
      onComplete();
    };

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x050506, 1);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.z = 10;
      const material = new THREE.MeshStandardMaterial({
        color: 0xd9deeb,
        metalness: 0.85,
        roughness: 0.24
      });
      const word = createWord("PORTFOLIO", material);
      scene.add(word);
      scene.add(new THREE.HemisphereLight(0xb8c7ff, 0x11131c, 1.8));
      const key = new THREE.DirectionalLight(0xffffff, 3);
      key.position.set(-3, 4, 7);
      scene.add(key);

      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      const startedAt = performance.now();
      const animate = (now) => {
        if (disposed) return;
        frame = window.requestAnimationFrame(animate);
        const elapsed = now - startedAt;
        const progress = Math.min(1, elapsed / (reducedMotion ? 120 : 2500));
        const eased = progress * progress * (3 - 2 * progress);
        word.rotation.y = (1 - eased) * 0.8 + Math.sin(now * 0.0008) * 0.03;
        word.rotation.x = Math.sin(now * 0.0005) * 0.025;
        word.position.z = (1 - eased) * -1.2;
        word.scale.setScalar(0.72 + eased * 0.42);
        renderer.render(scene, camera);
        if (progress === 1 && !completionScheduled) {
          completionScheduled = true;
          finishTimer = window.setTimeout(finish, 420);
        }
      };
      window.addEventListener("resize", resize);
      frame = window.requestAnimationFrame(animate);

      return () => {
        disposed = true;
        window.cancelAnimationFrame(frame);
        window.clearTimeout(finishTimer);
        window.removeEventListener("resize", resize);
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        });
        renderer.dispose();
        if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      };
    } catch (error) {
      console.error("Typography intro failed to initialize:", error);
      finishTimer = window.setTimeout(finish, reducedMotion ? 80 : 500);
      return () => window.clearTimeout(finishTimer);
    }
  }, [onComplete]);

  return (
    <div className="intro-typography" ref={hostRef}>
      <button className="intro-skip" type="button" onClick={onComplete}>SKIP INTRO</button>
      <div className="intro-typography-copy">
        <span>HARSHIT JAIN</span>
        <small>AI & MACHINE LEARNING / DEVELOPER</small>
      </div>
    </div>
  );
}
