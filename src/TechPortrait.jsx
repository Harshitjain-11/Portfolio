import React, { useEffect, useRef, useState } from "react";

const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const easeOut = (value) => 1 - (1 - value) ** 3;

export default function TechPortrait({ active }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const [impacted, setImpacted] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!active) return undefined;

    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!stage || !canvas || !context) {
      setComplete(true);
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setComplete(true);
      return undefined;
    }

    let disposed = false;
    let frame = 0;
    let impactShown = false;
    let particles = [];
    let canvasWidth = 0;
    let canvasHeight = 0;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
    const image = new Image();
    const pointSource = document.createElement("canvas");
    pointSource.width = 150;
    pointSource.height = 150;
    const sourceContext = pointSource.getContext("2d", { willReadFrequently: true });

    const buildParticles = () => {
      const bounds = stage.getBoundingClientRect();
      canvasWidth = Math.max(1, bounds.width);
      canvasHeight = Math.max(1, bounds.height);
      canvas.width = Math.round(canvasWidth * pixelRatio);
      canvas.height = Math.round(canvasHeight * pixelRatio);
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      sourceContext.clearRect(0, 0, pointSource.width, pointSource.height);
      sourceContext.drawImage(image, 0, 0, pointSource.width, pointSource.height);

      const pixels = sourceContext.getImageData(0, 0, pointSource.width, pointSource.height).data;
      const displaySize = Math.min(canvasWidth * .98, canvasHeight * .98);
      const displayX = (canvasWidth - displaySize) / 2;
      const displayY = canvasHeight - displaySize;
      const step = canvasWidth < 450 ? 3 : 2;
      particles = [];
      for (let y = 0; y < pointSource.height; y += step) {
        for (let x = 0; x < pointSource.width; x += step) {
          const pixelIndex = (y * pointSource.width + x) * 4;
          const alpha = pixels[pixelIndex + 3] / 255;
          if (alpha < .25) continue;
          const angle = Math.atan2(y - pointSource.height * .42, x - pointSource.width * .5);
          const radius = 45 + Math.random() * Math.min(canvasWidth * .34, 180);
          particles.push({
            x: displayX + ((x + .5) / pointSource.width) * displaySize,
            y: displayY + ((y + .5) / pointSource.height) * displaySize,
            color: `rgb(${pixels[pixelIndex]}, ${pixels[pixelIndex + 1]}, ${pixels[pixelIndex + 2]})`,
            size: .65 + Math.random() * 1.35,
            delay: Math.random() * .2,
            ray: angle,
            distance: radius,
          });
        }
      }
    };

    const draw = (now, startedAt) => {
      if (disposed) return;
      frame = requestAnimationFrame((time) => draw(time, startedAt));
      const elapsed = now - startedAt;
      const assembleProgress = clamp((elapsed - 650) / 1900);
      const rayProgress = clamp(elapsed / 1250);
      const rayFade = 1 - clamp((elapsed - 700) / 750);
      const photoProgress = easeOut(clamp((elapsed - 2050) / 820));
      const originX = canvasWidth * .5;
      const originY = canvasHeight * .25;

      if (!impactShown && elapsed > 720) {
        impactShown = true;
        setImpacted(true);
      }

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      if (rayFade > 0) {
        context.save();
        context.lineWidth = .55;
        for (let i = 0; i < particles.length; i += 7) {
          const particle = particles[i];
          const progress = easeOut(clamp((rayProgress - particle.delay) / .8));
          const radius = Math.min(canvasWidth * .45, 245) * progress;
          const endX = originX + Math.cos(particle.ray) * radius;
          const endY = originY + Math.sin(particle.ray) * radius;
          context.strokeStyle = `rgba(135, 181, 255, ${rayFade * .12})`;
          context.beginPath();
          context.moveTo(originX, originY);
          context.lineTo(endX, endY);
          context.stroke();
        }
        context.restore();
      }

      const fadeParticles = 1 - photoProgress;
      if (fadeParticles > .01) {
        context.save();
        context.globalAlpha = fadeParticles;
        context.shadowColor = "rgba(147, 183, 255, .72)";
        context.shadowBlur = 5;
        for (const particle of particles) {
          const progress = easeOut(clamp((assembleProgress - particle.delay) / .85));
          const startRadius = particle.distance * (1 - progress);
          const x = particle.x + Math.cos(particle.ray) * startRadius;
          const y = particle.y + Math.sin(particle.ray) * startRadius;
          context.fillStyle = particle.color;
          context.globalAlpha = fadeParticles * clamp((assembleProgress - particle.delay) * 3);
          context.fillRect(x, y, particle.size, particle.size);
        }
        context.restore();
      }

      stage.style.setProperty("--portrait-reveal", String(photoProgress));
      if (elapsed >= 3000) {
        cancelAnimationFrame(frame);
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        setComplete(true);
      }
    };

    image.onload = () => {
      if (disposed) return;
      try {
        buildParticles();
        frame = requestAnimationFrame((time) => draw(time, time));
      } catch {
        setComplete(true);
      }
    };
    image.onerror = () => setComplete(true);
    image.src = "/portfolio-image.png";

    const resizeObserver = new ResizeObserver(() => {
      if (image.complete && image.naturalWidth) {
        try { buildParticles(); } catch { setComplete(true); }
      }
    });
    resizeObserver.observe(stage);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      image.onload = null;
      image.onerror = null;
    };
  }, [active]);

  return <div
    className={`portrait-backdrop tech-portrait ${active ? "is-active" : ""} ${impacted ? "is-impacted" : ""} ${complete ? "is-complete" : ""}`}
    ref={stageRef}
  >
    <span className="portrait-orbit orbit-one"/><span className="portrait-orbit orbit-two"/><span className="portrait-orbit orbit-three"/>
    <span className="portrait-spark spark-one"/><span className="portrait-spark spark-two"/><span className="portrait-spark spark-three"/>
    <canvas ref={canvasRef} className="tech-portrait-particles" aria-hidden="true"/>
    <img className="hero-portrait-image" src="/portfolio-image.png" alt="Portrait of Harshit Jain"/>
    <div className="tech-impact-ring" aria-hidden="true"/>
    <div className="tech-orb" aria-hidden="true"><span className="tech-orb-aura"/><span className="tech-orb-core"/><span className="tech-orb-ring orb-ring-one"/><span className="tech-orb-ring orb-ring-two"/><span className="tech-orb-node orb-node-one"/><span className="tech-orb-node orb-node-two"/></div>
    <span className="portrait-crosshair">+</span><span className="portrait-watermark">HJ / 01<br/>AI + ML</span>
  </div>;
}
