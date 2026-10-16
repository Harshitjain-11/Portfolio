import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Samples the supplied portrait in the browser and builds a pointillist
 * portrait from thousands of small, individually animated square planes.
 * No pre-rendered or generated image is used for the effect.
 */
export default function ParticlePortrait() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const showFallback = (error) => {
      if (error) console.error("Particle portrait initialization failed:", error);
      host.classList.add("portrait-fallback");
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer, scene, camera, mesh, glowMesh, geometry, material, glowMaterial;
    let raf = 0;
    let disposed = false;
    let resizeObserver;
    let startTime = performance.now();
    let targetPositions = [];
    let scatteredPositions = [];
    let particleColors = [];
    let particleSizes = [];
    let count = 0;

    const sceneWidth = 4.35;
    const sceneHeight = 3.72;

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch (error) {
      showFallback(error);
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(host.clientWidth || 480, host.clientHeight || 440);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "Portrait formed from animated square light particles");
    renderer.domElement.setAttribute("role", "img");
    host.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(37, (host.clientWidth || 480) / (host.clientHeight || 440), 0.1, 100);
    camera.position.set(0, 0, 8.3);

    const ambient = new THREE.PointsMaterial({ color: 0xb6c5ff, size: 0.018, transparent: true, opacity: 0.48 });
    const ambientPositions = new Float32Array(190 * 3);
    for (let i = 0; i < 190; i++) {
      ambientPositions[i * 3] = (Math.random() - 0.5) * 9;
      ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      ambientPositions[i * 3 + 2] = -1 - Math.random() * 3;
    }
    const ambientGeometry = new THREE.BufferGeometry();
    ambientGeometry.setAttribute("position", new THREE.BufferAttribute(ambientPositions, 3));
    const ambientStars = new THREE.Points(ambientGeometry, ambient);
    scene.add(ambientStars);

    const image = new Image();
    image.src = "/portrait.jpg";
    image.onload = () => {
      if (disposed) return;

      try {
        // Crop the blank top margin while keeping the full hairstyle, face and upper body.
        const crop = document.createElement("canvas");
        const ctx = crop.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("The browser could not create a 2D canvas context.");
        const sw = image.naturalWidth;
        const sh = image.naturalHeight;
        const cropX = Math.round(sw * 0.105);
        const cropY = Math.round(sh * 0.245);
        const cropW = Math.round(sw * 0.79);
        const cropH = Math.round(sh * 0.705);
        const sampleW = 240;
        const sampleH = 218;
        crop.width = sampleW;
        crop.height = sampleH;
        ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, sampleW, sampleH);

        const pixels = ctx.getImageData(0, 0, sampleW, sampleH).data;
      const step = 2;
      const points = [];
      const colors = [];
      const sizes = [];
      const rng = (seed) => {
        let x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
      };

      for (let y = 0; y < sampleH; y += step) {
        for (let x = 0; x < sampleW; x += step) {
          const i = (y * sampleW + x) * 4;
          const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
          const brightness = (r + g + b) / 3;
          const spread = Math.max(r, g, b) - Math.min(r, g, b);

          // Remove the near-white studio backdrop, but retain much of the shirt.
          if (brightness > 246 && spread < 12) continue;
          if (a < 30) continue;

          const px = (x / (sampleW - 1) - 0.5) * sceneWidth;
          const py = (0.5 - y / (sampleH - 1)) * sceneHeight;
          points.push(px, py, (rng(x * 0.7 + y * 1.3) - 0.5) * 0.06);

          // Slightly lift the original photo colours so the pixels read as light.
          colors.push(
            Math.min(1, (r / 255) * 1.08 + 0.025),
            Math.min(1, (g / 255) * 1.08 + 0.025),
            Math.min(1, (b / 255) * 1.08 + 0.025)
          );
          sizes.push(0.029 + rng(x + y * sampleW) * 0.009);
        }
      }

        count = points.length / 3;
        if (!count) throw new Error("The portrait did not contain any sampleable pixels.");
      targetPositions = points;
      particleColors = colors;
      particleSizes = sizes;
      scatteredPositions = new Array(points.length);
      for (let i = 0; i < points.length; i += 3) {
        const angle = rng(i + 1) * Math.PI * 2;
        const radius = 2.2 + rng(i + 9) * 4.2;
        scatteredPositions[i] = Math.cos(angle) * radius + (rng(i + 3) - 0.5) * 2.5;
        scatteredPositions[i + 1] = Math.sin(angle) * radius + (rng(i + 5) - 0.5) * 2.5;
        scatteredPositions[i + 2] = -1.4 + rng(i + 7) * 5.2;
      }

      geometry = new THREE.PlaneGeometry(1, 1);
      material = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      mesh = new THREE.InstancedMesh(geometry, material, count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      const colorArray = new Float32Array(count * 3);
      colorArray.set(particleColors);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
      scene.add(mesh);

      // A second, soft layer gives the squares a restrained glow.
      glowMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      glowMesh = new THREE.InstancedMesh(geometry, glowMaterial, count);
      glowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      glowMesh.frustumCulled = false;
      const glowColors = new Float32Array(count * 3);
      for (let i = 0; i < glowColors.length; i++) glowColors[i] = Math.min(1, particleColors[i] * 1.2);
      geometry.setAttribute("glowColor", new THREE.InstancedBufferAttribute(glowColors, 3));
      // MeshBasicMaterial uses instanceColor, so set it on this mesh explicitly.
      glowMesh.instanceColor = new THREE.InstancedBufferAttribute(glowColors, 3);
      scene.add(glowMesh);

      const dummy = new THREE.Object3D();
      for (let i = 0; i < count; i++) {
        const p = reducedMotion ? targetPositions : scatteredPositions;
        dummy.position.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
        dummy.rotation.set(0, 0, 0);
        const s = particleSizes[i];
        dummy.scale.set(s, s, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        dummy.scale.set(s * 2.7, s * 2.7, 1);
        dummy.updateMatrix();
        glowMesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      glowMesh.instanceMatrix.needsUpdate = true;
        startTime = performance.now() - (reducedMotion ? 4000 : 0);
      } catch (error) {
        showFallback(error);
      }
    };

    image.onerror = () => showFallback(new Error("The portrait image could not be loaded."));

    const dummy = new THREE.Object3D();
    const animate = (now) => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const elapsed = (now - startTime) / 1000;
      const progress = reducedMotion ? 1 : Math.min(1, elapsed / 2.65);
      const eased = 1 - Math.pow(1 - progress, 3);

      if (mesh && glowMesh && count) {
        for (let i = 0; i < count; i++) {
          const j = i * 3;
          const x = scatteredPositions[j] + (targetPositions[j] - scatteredPositions[j]) * eased;
          const y = scatteredPositions[j + 1] + (targetPositions[j + 1] - scatteredPositions[j + 1]) * eased;
          const z = scatteredPositions[j + 2] + (targetPositions[j + 2] - scatteredPositions[j + 2]) * eased;
          const shimmer = reducedMotion ? 1 : 1 + Math.sin(now * 0.0012 + i * 0.17) * 0.045;
          const driftX = progress >= 1 && !reducedMotion ? Math.sin(now * 0.00035 + i * 0.03) * 0.008 : 0;
          const driftY = progress >= 1 && !reducedMotion ? Math.cos(now * 0.00032 + i * 0.04) * 0.008 : 0;

          dummy.position.set(x + driftX, y + driftY, z);
          dummy.rotation.set(0, 0, progress < 1 ? Math.sin(i * 0.1 + now * 0.001) * (1 - eased) * 0.8 : 0);
          const s = particleSizes[i] * shimmer;
          dummy.scale.set(s, s, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);

          dummy.scale.set(s * 2.7, s * 2.7, 1);
          dummy.updateMatrix();
          glowMesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        glowMesh.instanceMatrix.needsUpdate = true;
      }

      if (!reducedMotion) {
        ambientStars.rotation.z = Math.sin(now * 0.00008) * 0.025;
      }
      try {
        renderer.render(scene, camera);
      } catch (error) {
        showFallback(error);
        cancelAnimationFrame(raf);
      }
    };
    raf = requestAnimationFrame(animate);

    const resize = () => {
      if (!host || !renderer || !camera) return;
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = w < 520 ? 9.4 : 8.3;
      camera.updateProjectionMatrix();
    };
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      geometry?.dispose();
      material?.dispose();
      glowMaterial?.dispose();
      ambientGeometry.dispose();
      ambient.dispose();
      renderer?.dispose();
      if (renderer?.domElement?.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="particle-portrait" ref={hostRef}>
      <img className="portrait-fallback-image" src="/portrait.jpg" alt="Portrait of Harshit Jain" />
      <div className="portrait-halo" aria-hidden="true" />
    </div>
  );
}
