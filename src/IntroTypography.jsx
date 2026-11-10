import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const GLYPHS = {
  A: ["01110","10001","10001","11111","10001","10001","10001"],
  H: ["10001","10001","10001","11111","10001","10001","10001"],
  I: ["11111","00100","00100","00100","00100","00100","11111"],
  M: ["10001","11011","10101","10101","10001","10001","10001"],
  L: ["10000","10000","10000","10000","10000","10000","11111"],
  P: ["11110","10001","10001","11110","10000","10000","10000"],
  O: ["01110","10001","10001","10001","10001","10001","01110"],
  R: ["11110","10001","10001","11110","10100","10010","10001"],
  T: ["11111","00100","00100","00100","00100","00100","00100"],
  F: ["11111","10000","10000","11110","10000","10000","10000"],
  N: ["10001","11001","11001","10101","10011","10011","10001"],
};

function buildWord(word, mat) {
  const g = new THREE.Group();
  let cx = 0;
  for (const ch of word) {
    if (ch === " ") { cx += 0.8; continue; }
    const rows = GLYPHS[ch];
    if (!rows) continue;
    rows.forEach((row, r) => {
      [...row].forEach((cell, c) => {
        if (cell !== "1") return;
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.18), mat);
        m.position.set(cx + c * 0.25, (6 - r) * 0.25, 0);
        g.add(m);
      });
    });
    cx += 1.55;
  }
  g.userData.w = cx;
  g.position.x = -cx / 2;
  g.position.y = -0.8;
  return g;
}

export default function IntroTypography({ onComplete }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, disposed = false, timer;

    const finish = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      onComplete();
    };

    // For reduced-motion users — skip immediately after a short flash
    if (reduced) { timer = setTimeout(finish, 80); return () => clearTimeout(timer); }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x050506, 1);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      cam.position.z = 10;

      const mat = new THREE.MeshStandardMaterial({ color: 0xd4daf0, metalness: 0.82, roughness: 0.26 });
      const word = buildWord("PORTFOLIO", mat);
      scene.add(word);
      scene.add(new THREE.HemisphereLight(0x8899ff, 0x111318, 1.6));
      const key = new THREE.DirectionalLight(0xffffff, 2.8);
      key.position.set(-3, 4, 7);
      scene.add(key);

      const resize = () => {
        const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
        renderer.setSize(w, h);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      const t0 = performance.now();
      let done = false;
      const tick = (now) => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        const elapsed = now - t0;
        const p = Math.min(1, elapsed / 2400);
        const e = p * p * (3 - 2 * p);
        word.rotation.y = (1 - e) * 0.8 + Math.sin(now * 0.0007) * 0.03;
        word.rotation.x = Math.sin(now * 0.0004) * 0.022;
        word.position.z = (1 - e) * -1.2;
        word.scale.setScalar(0.7 + e * 0.44);
        renderer.render(scene, cam);
        if (p >= 1 && !done) {
          done = true;
          timer = setTimeout(finish, 380);
        }
      };
      raf = requestAnimationFrame(tick);

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        clearTimeout(timer);
        window.removeEventListener("resize", resize);
        scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
        renderer.dispose();
        if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      };
    } catch {
      timer = setTimeout(finish, 500);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="intro-wrap" ref={hostRef}>
      <button className="intro-skip" type="button" onClick={onComplete}>
        SKIP INTRO
      </button>
      <div className="intro-copy">
        <span className="intro-copy-name">HARSHIT JAIN</span>
        <span className="intro-copy-role">AI &amp; MACHINE LEARNING / DEVELOPER</span>
      </div>
    </div>
  );
}
