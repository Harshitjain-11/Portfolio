import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeInOut = (value) => value * value * (3 - 2 * value);

function seededRandom(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export default function ParticlePortrait({ introComplete = true }) {
  const hostRef = useRef(null);
  const introCompleteRef = useRef(introComplete);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const hero = host.closest(".hero");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    let scene;
    let camera;
    let mesh;
    let glowMesh;
    let geometry;
    let material;
    let glowMaterial;
    let resizeObserver;
    let animationFrame = 0;
    let disposed = false;
    let currentProgress = 0;
    let targetProgress = introComplete ? 0 : 1;

    const originalPositions = [];
    const scatteredPositions = [];
    const particleColors = [];
    const particleSizes = [];
    const particlePhases = [];
    const particleSpeeds = [];
    let count = 0;

    const showFallback = (error) => {
      if (error) console.error("Particle portrait initialization failed:", error);
      host.classList.add("portrait-fallback");
    };

    const updateScrollProgress = () => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const scrollDistance = Math.max(1, rect.height - window.innerHeight);
      const documentTop = rect.top + window.scrollY;
      const scrollProgress = clamp((window.scrollY - documentTop) / scrollDistance);
      targetProgress = introCompleteRef.current ? scrollProgress : 1;
      host.dataset.scrollProgress = targetProgress.toFixed(3);
    };

    const onScroll = () => {
      updateScrollProgress();
    };

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power"
      });
    } catch (error) {
      showFallback(error);
      return undefined;
    }

    const width = Math.max(1, host.clientWidth || 480);
    const height = Math.max(1, host.clientHeight || 440);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute("aria-label", "Portrait formed from animated square light particles");
    renderer.domElement.setAttribute("role", "img");
    host.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(37, width / height, 0.1, 100);
    camera.position.set(0, 0, width < 520 ? 9.4 : 8.3);

    const ambientMaterial = new THREE.PointsMaterial({
      color: 0xd9deeb,
      size: 0.026,
      transparent: true,
      opacity: 0.62,
      toneMapped: false
    });
    const ambientCount = window.innerWidth < 650 ? 420 : 760;
    const ambientPositions = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount; i += 1) {
      ambientPositions[i * 3] = (seededRandom(i + 1) - 0.5) * 9;
      ambientPositions[i * 3 + 1] = (seededRandom(i + 2) - 0.5) * 7;
      ambientPositions[i * 3 + 2] = -1 - seededRandom(i + 3) * 3;
    }
    const ambientGeometry = new THREE.BufferGeometry();
    ambientGeometry.setAttribute("position", new THREE.BufferAttribute(ambientPositions, 3));
    const ambientStars = new THREE.Points(ambientGeometry, ambientMaterial);
    scene.add(ambientStars);

    const image = new Image();
    image.src = "/portrait.jpg";
    image.onload = () => {
      if (disposed) return;

      try {
        const crop = document.createElement("canvas");
        const context = crop.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("The browser could not create a 2D canvas context.");

        const cropX = Math.round(image.naturalWidth * 0.05);
        const cropY = 0;
        const cropW = Math.round(image.naturalWidth * 0.9);
        const cropH = image.naturalHeight;
        const sampleW = window.innerWidth < 650 ? 210 : 300;
        const sampleH = Math.round(sampleW * (cropH / cropW));
        const step = window.innerWidth < 650 ? 2 : 2;
        crop.width = sampleW;
        crop.height = sampleH;
        context.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, sampleW, sampleH);

        const pixels = context.getImageData(0, 0, sampleW, sampleH).data;
        const sceneWidth = 6.25;
        const sceneHeight = sceneWidth * (sampleH / sampleW);

        for (let y = 0; y < sampleH; y += step) {
          for (let x = 0; x < sampleW; x += step) {
            const pixelIndex = (y * sampleW + x) * 4;
            const red = pixels[pixelIndex];
            const green = pixels[pixelIndex + 1];
            const blue = pixels[pixelIndex + 2];
            const alpha = pixels[pixelIndex + 3];
            const brightness = (red + green + blue) / 3;
            const spread = Math.max(red, green, blue) - Math.min(red, green, blue);

            // Remove only the white studio backdrop; retain all darker facial, hair, and shirt pixels.
            if ((brightness > 246 && spread < 12) || (brightness < 18 && spread < 14)) continue;
            if (alpha < 30) continue;

            const seed = x * 0.7 + y * 1.3;
            originalPositions.push(
              (x / (sampleW - 1) - 0.5) * sceneWidth,
              (0.5 - y / (sampleH - 1)) * sceneHeight,
              (seededRandom(seed) - 0.5) * 0.06
            );
            particleColors.push(
              red / 255,
              green / 255,
              blue / 255
            );
            particleSizes.push(0.017 + seededRandom(x + y * sampleW) * 0.005);
            particlePhases.push(seededRandom(seed + 41) * Math.PI * 2);
            particleSpeeds.push(0.65 + seededRandom(seed + 83) * 0.8);
          }
        }

        count = originalPositions.length / 3;
        if (!count) throw new Error("The portrait did not contain any sampleable pixels.");

        const viewportAspect = Math.max(1, window.innerWidth / Math.max(1, window.innerHeight));
        const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(37) / 2) * camera.position.z;
        const visibleWidth = visibleHeight * viewportAspect;
        const scatterWidth = Math.max(sceneWidth * 1.15, visibleWidth * 0.96);
        const scatterHeight = Math.max(sceneHeight * 1.35, visibleHeight * 0.96);
        for (let i = 0; i < count; i += 1) {
          const index = i * 3;
          const seed = i + 1;
          const horizontal = (seededRandom(seed * 1.7) - 0.5) * scatterWidth;
          const vertical = (seededRandom(seed * 2.1) - 0.5) * scatterHeight;
          scatteredPositions.push(
            originalPositions[index] * 0.12 + horizontal,
            originalPositions[index + 1] * 0.12 + vertical,
            originalPositions[index + 2] + (seededRandom(seed + 7) - 0.5) * 4.8
          );
        }

        geometry = new THREE.PlaneGeometry(1, 1);
        const particleVertexShader = `
          varying vec3 vInstanceColor;
          void main() {
            vInstanceColor = instanceColor;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          }
        `;
        const particleFragmentShader = `
          varying vec3 vInstanceColor;
          uniform float opacity;
          void main() {
            gl_FragColor = vec4(vInstanceColor, opacity);
          }
        `;
        material = new THREE.ShaderMaterial({
          uniforms: { opacity: { value: 0.96 } },
          vertexShader: particleVertexShader,
          fragmentShader: particleFragmentShader,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        mesh = new THREE.InstancedMesh(geometry, material, count);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        const colorArray = new Float32Array(particleColors);
        mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
        mesh.instanceColor.needsUpdate = true;
        scene.add(mesh);

        glowMaterial = new THREE.ShaderMaterial({
          uniforms: { opacity: { value: 0.012 } },
          vertexShader: particleVertexShader,
          fragmentShader: particleFragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        glowMesh = new THREE.InstancedMesh(geometry, glowMaterial, count);
        glowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        glowMesh.frustumCulled = false;
        const glowColors = new Float32Array(particleColors.length);
        for (let i = 0; i < glowColors.length; i += 1) {
          glowColors[i] = particleColors[i];
        }
        glowMesh.instanceColor = new THREE.InstancedBufferAttribute(glowColors, 3);
        glowMesh.instanceColor.needsUpdate = true;
        scene.add(glowMesh);
        updateScrollProgress();
      } catch (error) {
        showFallback(error);
      }
    };
    image.onerror = () => showFallback(new Error("The portrait image could not be loaded."));

    const dummy = new THREE.Object3D();
    const animate = (now) => {
      if (disposed) return;
      animationFrame = requestAnimationFrame(animate);
      currentProgress += (targetProgress - currentProgress) * (reducedMotion ? 0.22 : 0.09);
      const easedProgress = easeInOut(currentProgress);
      const elapsed = now * 0.001;

      if (mesh && glowMesh && count) {
        for (let i = 0; i < count; i += 1) {
          const index = i * 3;
          const phase = particlePhases[i];
          const speed = particleSpeeds[i];
          const drift = reducedMotion ? 0.002 : 0.012 + easedProgress * 0.014;
          const shimmer = reducedMotion ? 1 : 1 + Math.sin(elapsed * speed + phase) * 0.045;
          const x = THREE.MathUtils.lerp(originalPositions[index], scatteredPositions[index], easedProgress);
          const y = THREE.MathUtils.lerp(originalPositions[index + 1], scatteredPositions[index + 1], easedProgress);
          const z = THREE.MathUtils.lerp(originalPositions[index + 2], scatteredPositions[index + 2], easedProgress);
          const offsetX = Math.sin(elapsed * speed * 0.72 + phase) * drift;
          const offsetY = Math.cos(elapsed * speed * 0.58 + phase * 1.2) * drift;
          const offsetZ = Math.sin(elapsed * speed * 0.43 + phase * 0.7) * drift * 1.8;

          dummy.position.set(x + offsetX, y + offsetY, z + offsetZ);
          dummy.rotation.z = reducedMotion ? 0 : Math.sin(elapsed * speed * 0.5 + phase) * 0.12 * easedProgress;
          const size = particleSizes[i] * shimmer;
          dummy.scale.set(size, size, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          dummy.scale.set(size * 1.7, size * 1.7, 1);
          dummy.updateMatrix();
          glowMesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        glowMesh.instanceMatrix.needsUpdate = true;
      }

      ambientStars.rotation.z = reducedMotion ? 0 : Math.sin(elapsed * 0.08) * 0.025;
      try {
        renderer.render(scene, camera);
      } catch (error) {
        showFallback(error);
        cancelAnimationFrame(animationFrame);
      }
    };

    const resize = () => {
      const nextWidth = Math.max(1, host.clientWidth);
      const nextHeight = Math.max(1, host.clientHeight);
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.position.z = nextWidth < 520 ? 9.4 : 8.3;
      camera.updateProjectionMatrix();
    };

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollProgress();
    animationFrame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      geometry?.dispose();
      material?.dispose();
      glowMaterial?.dispose();
      ambientGeometry.dispose();
      ambientMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    introCompleteRef.current = introComplete;
    if (introComplete) {
      const event = new Event("scroll");
      window.dispatchEvent(event);
    }
  }, [introComplete]);

  return (
    <div className="particle-portrait" ref={hostRef}>
      <img className="portrait-fallback-image" src="/portrait.jpg" alt="Portrait of Harshit Jain" />
      <div className="portrait-halo" aria-hidden="true" />
    </div>
  );
}
