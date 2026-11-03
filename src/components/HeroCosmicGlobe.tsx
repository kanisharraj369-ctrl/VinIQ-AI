import React, { useEffect, useRef } from "react";

interface HeroEcoCanvasProps {
  className?: string;
}

export const HeroCosmicGlobe: React.FC<HeroEcoCanvasProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse coordinates for gentle interactive breeze effect
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Clean eco-particles (minimal, crisp seed/leaf nodes)
    const nodeCount = 28;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3 - 0.1, // gentle upward drift
      radius: Math.random() * 2 + 1.2,
      baseAlpha: Math.random() * 0.4 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    let step = 0;

    const render = () => {
      step += 0.008;
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      ctx.clearRect(0, 0, width, height);

      // Clean Eco-Friendly Deep Evergreen Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#051610");
      bgGrad.addColorStop(0.5, "#081f17");
      bgGrad.addColorStop(1, "#04120d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Soft serene central emerald radial aura
      const auraGrad = ctx.createRadialGradient(
        width * 0.5 + (mouseX - width / 2) * 0.04,
        height * 0.45 + (mouseY - height / 2) * 0.04,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.65
      );
      auraGrad.addColorStop(0, "rgba(16, 185, 129, 0.12)");
      auraGrad.addColorStop(0.4, "rgba(5, 150, 105, 0.06)");
      auraGrad.addColorStop(0.8, "rgba(4, 120, 87, 0.02)");
      auraGrad.addColorStop(1, "rgba(4, 18, 13, 0)");
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // Clean, Sharp Eco Harmonic Waves (Mathematical sine curves with mint/emerald strokes)
      const waveCount = 3;
      const baseFreqs = [0.002, 0.0035, 0.0018];
      const amplitudes = [35, 25, 45];
      const colors = [
        "rgba(52, 211, 153, 0.35)", // Mint
        "rgba(16, 185, 129, 0.25)", // Emerald
        "rgba(167, 243, 208, 0.18)", // Soft Sage
      ];

      for (let w = 0; w < waveCount; w++) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = w === 0 ? 1.8 : 1.2;
        ctx.strokeStyle = colors[w];

        const yBase = height * 0.65 + w * 25 + Math.sin(step + w) * 10;

        for (let x = 0; x <= width; x += 6) {
          const wave1 = Math.sin(x * baseFreqs[w] + step * (w + 1) * 0.7) * amplitudes[w];
          const wave2 = Math.cos(x * 0.004 - step * 0.5) * (amplitudes[w] * 0.4);
          const mouseInfluence = Math.exp(-Math.pow((x - mouseX) / 180, 2)) * 15;
          const y = yBase + wave1 + wave2 - mouseInfluence;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // Interconnected Knowledge Nodes & Connections (Clean and uncluttered)
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        node.phase += node.pulseSpeed;

        // Wrap around gently
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        // Draw connections to nearby nodes (only if close)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw crisp eco node circle
        const currentAlpha = node.baseAlpha + Math.sin(node.phase) * 0.15;
        ctx.fillStyle = `rgba(167, 243, 208, ${Math.max(0.1, currentAlpha)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle crisp green glow
        ctx.fillStyle = `rgba(16, 185, 129, ${Math.max(0.05, currentAlpha * 0.5)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle bottom fade to blend into the main app container seamlessly
      const bottomFade = ctx.createLinearGradient(0, height - 80, 0, height);
      bottomFade.addColorStop(0, "rgba(4, 18, 13, 0)");
      bottomFade.addColorStop(1, "#05140d");
      ctx.fillStyle = bottomFade;
      ctx.fillRect(0, height - 80, width, 80);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
