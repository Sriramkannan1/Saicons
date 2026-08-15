import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import DotField from "../ui/DotField";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  life: number; maxLife: number;
  hue: number; layer: number;
}

interface NeuralNode {
  x: number; y: number;
  vx: number; vy: number;
  connections: number[];
  pulsePhase: number;
  size: number;
}

interface OrbitalRing {
  cx: number; cy: number;
  rx: number; ry: number;
  rotation: number; speed: number;
  opacity: number; tilt: number;
  color: string;
}

/* ─────────────────────────────────────────────
   Canvas Engine
───────────────────────────────────────────── */
function CinematicCanvas({ mx, my, scrollY }: { mx: number; my: number; scrollY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);
  const t = useRef(0);
  const particles = useRef<Particle[]>([]);
  const nodes = useRef<NeuralNode[]>([]);
  const orbitals = useRef<OrbitalRing[]>([]);
  const prefersReduced = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 40 : 80;
  const NODE_COUNT = isMobile ? 8 : 16;

  const initParticle = useCallback((w: number, h: number, layer = 0): Particle => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -Math.random() * 0.3 - 0.05,
    size: layer === 0 ? Math.random() * 1.2 + 0.3 : Math.random() * 0.7 + 0.2,
    opacity: Math.random() * 0.5 + 0.1,
    life: Math.floor(Math.random() * 500),
    maxLife: Math.random() * 400 + 300,
    hue: 210 + Math.random() * 40,
    layer,
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Init particles across 3 layers
    particles.current = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
      initParticle(canvas.width, canvas.height, i % 3)
    );

    // Init neural nodes
    nodes.current = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.12,
      connections: [],
      pulsePhase: Math.random() * Math.PI * 2,
      size: Math.random() * 2 + 1,
    }));

    // Build connections (within distance threshold)
    const CONNECTION_DIST = Math.min(canvas.width, canvas.height) * 0.28;
    nodes.current.forEach((node, i) => {
      nodes.current.forEach((other, j) => {
        if (i !== j) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          if (Math.sqrt(dx * dx + dy * dy) < CONNECTION_DIST) {
            node.connections.push(j);
          }
        }
      });
    });

    // Init orbitals
    orbitals.current = Array.from({ length: isMobile ? 2 : 4 }, (_, i) => ({
      cx: canvas.width * (0.15 + Math.random() * 0.7),
      cy: canvas.height * (0.15 + Math.random() * 0.7),
      rx: 80 + Math.random() * 160,
      ry: 40 + Math.random() * 80,
      rotation: Math.random() * Math.PI * 2,
      speed: 0.0003 + Math.random() * 0.0004,
      opacity: 0.03 + Math.random() * 0.04,
      tilt: (Math.random() - 0.5) * 0.6,
      color: i % 2 === 0 ? "100, 150, 255" : "80, 180, 220",
    }));

    const draw = () => {
      t.current += prefersReduced.current ? 0 : 1;
      const T = t.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      /* ── Energy Flow Lines ── */
      const lineCount = isMobile ? 3 : 6;
      for (let l = 0; l < lineCount; l++) {
        const phase = T * 0.004 + l * 1.05;
        const yBase = H * (0.15 + l * 0.12);
        const amp = H * 0.08;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = yBase + Math.sin(x * 0.005 + phase) * amp + Math.sin(x * 0.002 - phase * 0.7) * amp * 0.5;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const alpha = 0.012 + Math.sin(T * 0.015 + l) * 0.006;
        ctx.strokeStyle = `rgba(80, 140, 220, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      /* ── Dynamic Grid (perspective) ── */
      const gridOff = (T * 0.15) % 60;
      ctx.strokeStyle = "rgba(60, 100, 180, 0.015)";
      ctx.lineWidth = 0.5;
      for (let x = -60 + (gridOff % 60); x < W + 60; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + H * 0.1 + mx * 0.02, H);
        ctx.stroke();
      }
      for (let y = -60 + (gridOff % 60); y < H + 60; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y + my * 0.01);
        ctx.lineTo(W, y - my * 0.01);
        ctx.stroke();
      }

      /* ── Neural Network Nodes & Connections ── */
      nodes.current.forEach((node, i) => {
        node.x += node.vx + (mx - W / 2) * 0.00005;
        node.y += node.vy + (my - H / 2) * 0.00005;
        if (node.x < 0 || node.x > W) node.vx *= -1;
        if (node.y < 0 || node.y > H) node.vy *= -1;
        node.x = Math.max(0, Math.min(W, node.x));
        node.y = Math.max(0, Math.min(H, node.y));

        const pulse = (Math.sin(T * 0.02 + node.pulsePhase) + 1) / 2;

        // Draw connections
        node.connections.slice(0, 3).forEach(j => {
          const other = nodes.current[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const distFade = 1 - dist / (Math.min(W, H) * 0.3);
          if (distFade > 0) {
            const connAlpha = distFade * 0.025 * (0.5 + pulse * 0.5);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            // Wave the connection slightly
            const midX = (node.x + other.x) / 2 + Math.sin(T * 0.01 + i) * 15;
            const midY = (node.y + other.y) / 2 + Math.cos(T * 0.008 + j) * 10;
            ctx.quadraticCurveTo(midX, midY, other.x, other.y);
            ctx.strokeStyle = `rgba(100, 160, 240, ${connAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Node dot
        const nodeAlpha = 0.04 + pulse * 0.06;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 180, 255, ${nodeAlpha})`;
        ctx.fill();
      });

      /* ── Orbital Rings ── */
      orbitals.current.forEach(orb => {
        orb.rotation += orb.speed;
        ctx.save();
        ctx.translate(orb.cx, orb.cy);
        ctx.rotate(orb.tilt);
        ctx.scale(1, orb.ry / orb.rx);
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.rx, orb.rotation, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${orb.color}, ${orb.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Orbiting particle on the ring
        const px = Math.cos(orb.rotation) * orb.rx;
        const py = Math.sin(orb.rotation) * orb.rx;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${orb.color}, ${orb.opacity * 3})`;
        ctx.fill();
        ctx.restore();
      });

      /* ── Particles (3 layers, different speeds & sizes) ── */
      particles.current.forEach((p, i) => {
        p.life += 1;
        if (p.life > p.maxLife) {
          particles.current[i] = initParticle(W, H, p.layer);
          return;
        }

        // Mouse influence (subtle)
        const pdx = mx - p.x;
        const pdy = my - p.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < 150) {
          p.vx += (pdx / pdist) * 0.008;
          p.vy += (pdy / pdist) * 0.008;
        }

        // Layer speed multiplier
        const layerMul = p.layer === 0 ? 1.2 : p.layer === 1 ? 0.7 : 0.35;
        p.x += p.vx * layerMul;
        p.y += p.vy * layerMul;
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Wrap
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        const lifeRatio = p.life / p.maxLife;
        const fadeMul = lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.85 ? (1 - lifeRatio) / 0.15 : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 75%, ${p.opacity * fadeMul * 0.6})`;
        ctx.fill();
      });

      /* ── Light Pulse Event (slow, ~every 8s) ── */
      const pulseT = T * 0.002;
      const pulsePhase = (pulseT % (Math.PI * 4));
      if (pulsePhase < Math.PI * 0.5) {
        const pulseAlpha = Math.sin(pulsePhase * 2) * 0.015;
        const pulseCx = W * (0.3 + Math.sin(T * 0.001) * 0.2);
        const pulseCy = H * (0.3 + Math.cos(T * 0.0008) * 0.2);
        const grad = ctx.createRadialGradient(pulseCx, pulseCy, 0, pulseCx, pulseCy, W * 0.4);
        grad.addColorStop(0, `rgba(100, 160, 255, ${pulseAlpha})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      /* ── Scroll-based wave ── */
      const scrollWave = scrollY * 0.4;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const y = H * 0.5 + Math.sin(x * 0.004 + T * 0.006 + scrollWave * 0.05) * H * 0.12;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(70, 120, 200, 0.018)";
      ctx.lineWidth = 1;
      ctx.stroke();

      frame.current = requestAnimationFrame(draw);
    };

    frame.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", resize);
    };
  }, [PARTICLE_COUNT, NODE_COUNT, isMobile, initParticle]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ─────────────────────────────────────────────
   CSS / Framer-Motion Abstract Shapes
───────────────────────────────────────────── */
function AbstractGeometry({ scrollY, mx, my }: { scrollY: number; mx: number; my: number }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  if (isMobile) return null;

  return (
    <>
      {/* Giant blurred sphere – deep background */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "70vw", height: "70vw",
          left: "15%", top: "-20%",
          background: "radial-gradient(circle at 40% 40%, rgba(40, 80, 160, 0.07) 0%, rgba(20, 50, 100, 0.04) 50%, transparent 75%)",
          filter: "blur(80px)",
          y: scrollY * -0.12,
          x: mx * 0.012,
        }}
        animate={{ scale: [1, 1.04, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary deep sphere */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "50vw", height: "50vw",
          right: "-10%", bottom: "10%",
          background: "radial-gradient(circle at 60% 60%, rgba(30, 70, 140, 0.06) 0%, transparent 70%)",
          filter: "blur(100px)",
          y: scrollY * -0.07,
          x: mx * -0.008,
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Midground – thin rotating wireframe ring SVG */}
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute pointer-events-none opacity-[0.035]"
        style={{ width: "55vw", left: "-12%", top: "20%", y: scrollY * -0.2, x: mx * 0.018 }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        <ellipse cx="200" cy="200" rx="190" ry="80" fill="none" stroke="rgba(100,160,255,0.7)" strokeWidth="0.5" />
        <ellipse cx="200" cy="200" rx="150" ry="60" fill="none" stroke="rgba(80,140,220,0.5)" strokeWidth="0.4" />
        <ellipse cx="200" cy="200" rx="100" ry="40" fill="none" stroke="rgba(120,180,255,0.4)" strokeWidth="0.3" />
        <circle cx="200" cy="200" r="5" fill="rgba(140,200,255,0.5)" />
        {/* spokes */}
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <line
            key={angle}
            x1="200" y1="200"
            x2={200 + 190 * Math.cos((angle * Math.PI) / 180)}
            y2={200 + 80 * Math.sin((angle * Math.PI) / 180)}
            stroke="rgba(100,160,255,0.15)" strokeWidth="0.3"
          />
        ))}
      </motion.svg>

      {/* Right-side wireframe torus-like structure */}
      <motion.svg
        viewBox="0 0 300 300"
        className="absolute pointer-events-none opacity-[0.03]"
        style={{ width: "40vw", right: "-8%", top: "35%", y: scrollY * -0.15, x: mx * -0.015 }}
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      >
        <ellipse cx="150" cy="150" rx="140" ry="55" fill="none" stroke="rgba(80,160,220,0.8)" strokeWidth="0.6" />
        <ellipse cx="150" cy="150" rx="100" ry="38" fill="none" stroke="rgba(100,180,240,0.5)" strokeWidth="0.4" />
        <ellipse cx="150" cy="150" rx="55" ry="20" fill="none" stroke="rgba(120,200,255,0.4)" strokeWidth="0.3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <circle
            key={a}
            cx={150 + 140 * Math.cos((a * Math.PI) / 180)}
            cy={150 + 55 * Math.sin((a * Math.PI) / 180)}
            r="2" fill="rgba(120,200,255,0.3)"
          />
        ))}
      </motion.svg>

      {/* Center abstract rotating polygon */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute pointer-events-none opacity-[0.025]"
        style={{ width: "30vw", left: "35%", top: "55%", y: scrollY * -0.25, x: mx * 0.006 }}
        animate={{ rotate: [0, 360], scale: [1, 1.08, 1] }}
        transition={{ rotate: { duration: 50, repeat: Infinity, ease: "linear" }, scale: { duration: 15, repeat: Infinity, ease: "easeInOut" } }}
      >
        {/* Hexagon */}
        <polygon
          points={[0,1,2,3,4,5].map(i => {
            const a = (i * 60 - 30) * Math.PI / 180;
            return `${100 + 90 * Math.cos(a)},${100 + 90 * Math.sin(a)}`;
          }).join(" ")}
          fill="none" stroke="rgba(100,160,255,0.6)" strokeWidth="0.5"
        />
        <polygon
          points={[0,1,2,3,4,5].map(i => {
            const a = (i * 60 - 30) * Math.PI / 180;
            return `${100 + 60 * Math.cos(a)},${100 + 60 * Math.sin(a)}`;
          }).join(" ")}
          fill="none" stroke="rgba(80,140,220,0.4)" strokeWidth="0.4"
        />
        {/* Inner web */}
        {[0,1,2,3,4,5].map(i => {
          const a = (i * 60 - 30) * Math.PI / 180;
          return <line key={i} x1="100" y1="100" x2={100 + 90 * Math.cos(a)} y2={100 + 90 * Math.sin(a)} stroke="rgba(100,160,255,0.15)" strokeWidth="0.3" />;
        })}
      </motion.svg>

      {/* Floating curved ribbon */}
      <motion.svg
        viewBox="0 0 800 200"
        className="absolute pointer-events-none opacity-[0.025]"
        style={{ width: "90vw", left: "5%", top: "70%", y: scrollY * -0.18 }}
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M0,100 C200,20 400,180 600,80 S800,140 800,100"
          fill="none" stroke="rgba(100,160,240,0.5)" strokeWidth="0.7"
        />
        <path
          d="M0,120 C200,40 400,200 600,100 S800,160 800,120"
          fill="none" stroke="rgba(80,140,210,0.3)" strokeWidth="0.4"
        />
      </motion.svg>

      {/* Tiny floating fragments */}
      {[...Array(isMobile ? 0 : 8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 3) * 25}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: `rgba(${100 + i * 8}, ${150 + i * 5}, 255, 0.4)`,
            borderRadius: i % 2 === 0 ? "50%" : "0",
            y: scrollY * (-0.05 - i * 0.02),
            x: mx * (i % 2 === 0 ? 0.01 : -0.01),
          }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i * 1.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.7,
          }}
        />
      ))}

      {/* ── LARGE GLOWING DIAMOND ── */}
      <motion.svg
        viewBox="0 0 300 300"
        className="absolute pointer-events-none"
        style={{ width: "22vw", right: "5%", top: "10%", y: scrollY * -0.22, x: mx * -0.02, opacity: 0.12 }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <filter id="glow-diamond">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <polygon points="150,10 290,150 150,290 10,150" fill="none" stroke="rgba(100,180,255,0.9)" strokeWidth="1" filter="url(#glow-diamond)" />
        <polygon points="150,50 250,150 150,250 50,150" fill="none" stroke="rgba(80,160,240,0.6)" strokeWidth="0.8" />
        <polygon points="150,90 210,150 150,210 90,150" fill="none" stroke="rgba(120,200,255,0.5)" strokeWidth="0.6" />
        <circle cx="150" cy="150" r="6" fill="rgba(140,210,255,0.7)" filter="url(#glow-diamond)" />
        {[0,90,180,270].map(a => (
          <circle key={a} cx={150 + 140 * Math.cos(a * Math.PI / 180)} cy={150 + 140 * Math.sin(a * Math.PI / 180)} r="3" fill="rgba(100,180,255,0.6)" />
        ))}
      </motion.svg>

      {/* ── DOUBLE HELIX / SPIRAL ── */}
      <motion.svg
        viewBox="0 0 120 600"
        className="absolute pointer-events-none"
        style={{ width: "8vw", minWidth: 70, left: "3%", top: "15%", opacity: 0.15, y: scrollY * -0.3 }}
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        {Array.from({ length: 30 }).map((_, i) => {
          const y = i * 20;
          const x1 = 60 + 45 * Math.sin((i / 30) * Math.PI * 4);
          const x2 = 60 + 45 * Math.sin((i / 30) * Math.PI * 4 + Math.PI);
          return (
            <g key={i}>
              <circle cx={x1} cy={y} r={3} fill="rgba(100,180,255,0.7)" />
              <circle cx={x2} cy={y} r={3} fill="rgba(80,220,180,0.6)" />
              {i < 29 && (
                <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(120,180,240,0.25)" strokeWidth="0.8" />
              )}
            </g>
          );
        })}
      </motion.svg>

      {/* ── HOLOGRAPHIC FLOATING PANELS ── */}
      {[
        { left: "60%", top: "8%", w: "14vw", h: "9vw", delay: 0, dir: 1 },
        { left: "2%",  top: "60%", w: "12vw", h: "7vw", delay: 2, dir: -1 },
        { left: "75%", top: "55%", w: "10vw", h: "6vw", delay: 4, dir: 1 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none border rounded-lg"
          style={{
            left: p.left, top: p.top,
            width: p.w, height: p.h,
            borderColor: "rgba(80,160,240,0.2)",
            background: "linear-gradient(135deg, rgba(40,80,160,0.06) 0%, rgba(20,60,120,0.03) 100%)",
            backdropFilter: "blur(2px)",
            y: scrollY * -0.1 * p.dir,
            x: mx * 0.008 * p.dir,
          }}
          animate={{ y: [0, p.dir * -15, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        >
          {/* Scan line inside panel */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(100,180,255,0.4), transparent)" }}
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
          {/* Corner accents */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-blue-400/40" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-blue-400/40" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-blue-400/40" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-blue-400/40" />
        </motion.div>
      ))}

      {/* ── STAR CLUSTER / CONSTELLATION ── */}
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute pointer-events-none"
        style={{ width: "40vw", right: "15%", top: "30%", opacity: 0.14, y: scrollY * -0.14, x: mx * -0.01 }}
        animate={{ rotate: [0, 8, 0, -8, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <filter id="star-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Constellation lines */}
        {[[80,60,160,130],[160,130,280,90],[280,90,340,200],[160,130,200,260],[200,260,120,310],[120,310,80,60],[280,90,200,260]].map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(140,200,255,0.3)" strokeWidth="0.6" />
        ))}
        {/* Stars */}
        {[[80,60,4],[160,130,5],[280,90,3],[340,200,4],[200,260,3],[120,310,4],[60,200,2],[320,320,2],[200,40,3]].map(([cx,cy,r],i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="rgba(180,220,255,0.9)" filter="url(#star-glow)" />
        ))}
      </motion.svg>

      {/* ── LARGE CONCENTRIC RINGS (bottom-left) ── */}
      <motion.svg
        viewBox="0 0 500 500"
        className="absolute pointer-events-none"
        style={{ width: "45vw", left: "-15%", bottom: "-5%", opacity: 0.1, y: scrollY * -0.08, x: mx * 0.015 }}
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {[240, 200, 155, 110, 65].map((r, i) => (
          <circle key={i} cx="250" cy="250" r={r} fill="none" stroke={`rgba(${80 + i * 10}, ${140 + i * 8}, 240, ${0.35 - i * 0.04})`} strokeWidth={1 - i * 0.12} strokeDasharray={i % 2 === 0 ? "none" : `${r * 0.3} ${r * 0.1}`} />
        ))}
        <circle cx="250" cy="250" r="8" fill="rgba(120,190,255,0.5)" />
      </motion.svg>

      {/* ── NEON CORNER ACCENT (top-right) ── */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute pointer-events-none"
        style={{ width: "15vw", right: "0", top: "0", opacity: 0.18 }}
        animate={{ opacity: [0.1, 0.22, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <filter id="neon">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M200,0 L200,60 L160,60" fill="none" stroke="rgba(100,200,255,0.9)" strokeWidth="1" filter="url(#neon)" />
        <path d="M200,0 L130,0 L130,30" fill="none" stroke="rgba(80,180,240,0.6)" strokeWidth="0.7" />
        <circle cx="200" cy="0" r="4" fill="rgba(140,210,255,0.8)" filter="url(#neon)" />
      </motion.svg>

      {/* ── NEON CORNER ACCENT (bottom-left) ── */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute pointer-events-none"
        style={{ width: "12vw", left: "0", bottom: "0", opacity: 0.15 }}
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      >
        <path d="M0,200 L0,140 L40,140" fill="none" stroke="rgba(80,180,240,0.8)" strokeWidth="1" />
        <path d="M0,200 L70,200 L70,170" fill="none" stroke="rgba(100,200,255,0.5)" strokeWidth="0.7" />
        <circle cx="0" cy="200" r="3" fill="rgba(120,200,255,0.7)" />
      </motion.svg>

      {/* ── FLOATING TRIANGLE SHARDS ── */}
      {[
        { left: "30%", top: "20%", size: 30, delay: 0 },
        { left: "55%", top: "75%", size: 20, delay: 1.5 },
        { left: "85%", top: "40%", size: 25, delay: 3 },
        { left: "18%", top: "45%", size: 18, delay: 2 },
      ].map((s, i) => (
        <motion.svg
          key={i} viewBox="0 0 100 100"
          className="absolute pointer-events-none"
          style={{ width: s.size, height: s.size, left: s.left, top: s.top, opacity: 0.2, y: scrollY * -0.12, x: mx * (i % 2 === 0 ? 0.01 : -0.012) }}
          animate={{ rotate: [0, 360], y: [0, -20, 0], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >
          <polygon points="50,5 95,90 5,90" fill="none" stroke="rgba(100,180,255,0.8)" strokeWidth="2" />
        </motion.svg>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Light Sweep
───────────────────────────────────────────── */
function LightSweep() {
  return (
    <>
      {/* Horizontal sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(100deg, transparent 0%, transparent 35%, rgba(100,160,255,0.025) 48%, rgba(140,190,255,0.04) 50%, rgba(100,160,255,0.025) 52%, transparent 65%, transparent 100%)",
          backgroundSize: "400% 100%",
        }}
        animate={{ backgroundPosition: ["300% 0%", "-300% 0%"] }}
        transition={{ duration: 14, repeat: Infinity, repeatDelay: 10, ease: "easeInOut" }}
      />
      {/* Diagonal lens bloom */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 30% at 80% 20%, rgba(80,130,200,0.04) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 8, repeat: Infinity, repeatDelay: 15, ease: "easeInOut" }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   Cursor Atmospheric Glow
───────────────────────────────────────────── */
function CursorGlow({ mx, my }: { mx: number; my: number }) {
  const x = useMotionValue(mx);
  const y = useMotionValue(my);
  const smoothX = useSpring(x, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 40, damping: 20 });

  useEffect(() => { x.set(mx); }, [mx, x]);
  useEffect(() => { y.set(my); }, [my, y]);

  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        width: 400, height: 400,
        x: smoothX, y: smoothY,
        translateX: "-50%", translateY: "-50%",
        background: "radial-gradient(circle, rgba(80,140,220,0.04) 0%, transparent 70%)",
        filter: "blur(40px)",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Volumetric Light Columns
───────────────────────────────────────────── */
function VolumetricLight({ scrollY }: { scrollY: number }) {
  return (
    <>
      {/* Left column */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: "8%", top: 0,
          width: "18vw", height: "100vh",
          background: "linear-gradient(to bottom, transparent 0%, rgba(60,110,200,0.03) 20%, rgba(60,110,200,0.05) 50%, rgba(60,110,200,0.02) 80%, transparent 100%)",
          filter: "blur(30px)",
          y: scrollY * -0.08,
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Right column */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          right: "12%", top: 0,
          width: "14vw", height: "100vh",
          background: "linear-gradient(to bottom, transparent 0%, rgba(50,100,180,0.03) 30%, rgba(70,130,210,0.04) 60%, transparent 100%)",
          filter: "blur(25px)",
          y: scrollY * -0.05,
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   Main Export
───────────────────────────────────────────── */
export function AmbientBackground() {
  const { scrollY } = useScroll();
  const scrollVal = useTransform(scrollY, v => v);
  const [scroll, setScroll] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => scrollVal.onChange(v => setScroll(v)), [scrollVal]);

  const handleMouse = useCallback((e: MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) {
      window.addEventListener("mousemove", handleMouse, { passive: true });
    }
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [handleMouse]);

  const mx = mouse.x;
  const my = mouse.y;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020812]">

      {/* ── Deepest: Atmospheric gradient base ── */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(25,55,120,0.12),transparent_65%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_80%_110%,rgba(15,45,100,0.08),transparent_60%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_40%_at_0%_60%,rgba(20,50,110,0.06),transparent_60%)]" />

      {/* ── Dot Field Interactive Background ── */}
      <div className="absolute inset-0 opacity-40">
        <DotField
          dotRadius={1.5}
          dotSpacing={20}
          bulgeStrength={42}
          glowRadius={110}
          sparkle
          waveAmplitude={2}
          cursorRadius={200}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="#141374"
          gradientTo="#9391da"
          glowColor="#5a5b61"
        />
      </div>

      {/* ── Abstract CSS + SVG Geometry ── */}
      <AbstractGeometry scrollY={scroll} mx={mx} my={my} />

      {/* ── Volumetric Light ── */}
      <VolumetricLight scrollY={scroll} />

      {/* ── Canvas: particles, neural net, orbitals, waves ── */}
      <CinematicCanvas mx={mx} my={my} scrollY={scroll} />

      {/* ── Cursor atmospheric glow ── */}
      <CursorGlow mx={mx} my={my} />

      {/* ── Light Sweep events ── */}
      <LightSweep />

      {/* ── Atmospheric fog overlays (depth) ── */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#020812] via-transparent to-transparent opacity-70" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020812] via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#020812] via-transparent to-[#020812] opacity-30" />

      {/* ── Film grain / noise ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
