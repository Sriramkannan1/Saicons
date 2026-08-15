import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function useMouseParallax() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
}

/** Canvas star field — one animation loop instead of hundreds of DOM nodes. */
function StarField({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.innerWidth < 768;
    const count = Math.round((isMobile ? 70 : 190) * density);

    let stars = [] as Array<{ x: number; y: number; r: number; a: number; s: number }>;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 1.3 + 0.25) * dpr,
        a: Math.random() * 0.6 + 0.25,
        s: Math.random() * 0.16 + 0.02,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        const twinkle = reduced ? star.a : star.a + Math.sin(t / 900 + star.x) * 0.22;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,235,255,${Math.max(0.08, twinkle)})`;
        ctx.fill();
        if (!reduced) {
          star.y += star.s * dpr;
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [density, reduced]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

function NebulaLayer({ mouseX, mouseY }: { mouseX?: any, mouseY?: any }) {
  // subtle movement based on mouse
  const x1 = useTransform(mouseX || useMotionValue(0), [-1000, 1000], [-30, 30]);
  const y1 = useTransform(mouseY || useMotionValue(0), [-1000, 1000], [-30, 30]);
  const x2 = useTransform(mouseX || useMotionValue(0), [-1000, 1000], [20, -20]);
  const y2 = useTransform(mouseY || useMotionValue(0), [-1000, 1000], [20, -20]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div
        className="animate-pulse-glow absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full blur-[120px]"
        style={{ 
          background: "color-mix(in oklab, var(--primary) 15%, transparent)",
          x: x1, y: y1 
        }}
      />
      <motion.div
        className="animate-pulse-glow absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full blur-[130px]"
        style={{
          background: "color-mix(in oklab, var(--accent) 12%, transparent)",
          animationDelay: "1.6s",
          x: x2, y: y2
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[26rem] w-[70rem] -translate-x-1/2 rounded-[50%] blur-[110px]"
        style={{ background: "color-mix(in oklab, var(--secondary) 12%, transparent)" }}
      />
    </div>
  );
}

function FloatingParticles({ count = 8, mouseX, mouseY }: { count?: number, mouseX?: any, mouseY?: any }) {
  const [items, setItems] = useState<
    Array<{ left: number; top: number; d: number; delay: number }>
  >([]);
  useEffect(() => {
    const n = window.innerWidth < 768 ? Math.round(count / 2) : count;
    setItems(
      Array.from({ length: n }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        d: Math.random() * 5 + 5,
        delay: Math.random() * 5,
      })),
    );
  }, [count]);

  const x = useTransform(mouseX || useMotionValue(0), [-1000, 1000], [-50, 50]);
  const y = useTransform(mouseY || useMotionValue(0), [-1000, 1000], [-50, 50]);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  return (
    <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ x: springX, y: springY }}>
      {items.map((p, i) => (
        <span
          key={i}
          className="animate-float-slow absolute block h-1 w-1 rounded-full bg-accent"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: "0 0 12px color-mix(in oklab, var(--accent) 70%, transparent)",
          }}
        />
      ))}
    </motion.div>
  );
}

/** Blue planetary horizon anchored to the bottom of the section. */
export function PlanetLayer() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden">
      <div
        className="mx-auto h-[26rem] w-[160%] max-w-none translate-y-[65%] rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--primary) 35%, transparent), color-mix(in oklab, var(--background) 95%, transparent) 62%)",
          boxShadow: "0 -20px 80px color-mix(in oklab, var(--primary) 25%, transparent)",
          borderTop: "1px solid color-mix(in oklab, var(--accent) 35%, transparent)",
        }}
      />
    </div>
  );
}

export function OrbitalRings({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <div
        className="animate-spin-slow absolute top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)" }}
      />
      <div
        className="animate-spin-slow absolute top-1/2 left-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: "color-mix(in oklab, var(--accent) 26%, transparent)",
          animationDirection: "reverse",
          animationDuration: "38s",
        }}
      />
    </div>
  );
}

export function SpaceBackground({
  planet = false,
  density = 1,
  className = "",
}: {
  planet?: boolean;
  density?: number;
  className?: string;
}) {
  const { mouseX, mouseY } = useMouseParallax();
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ background: "var(--gradient-hero)", y: yOffset }}
    >
      <NebulaLayer mouseX={mouseX} mouseY={mouseY} />
      <motion.div 
        className="absolute inset-0"
        style={{ 
          x: useSpring(useTransform(mouseX, [-1000, 1000], [-15, 15]), { stiffness: 50 }),
          y: useSpring(useTransform(mouseY, [-1000, 1000], [-15, 15]), { stiffness: 50 })
        }}
      >
        <StarField density={density} />
      </motion.div>
      <FloatingParticles mouseX={mouseX} mouseY={mouseY} />
      {planet ? <PlanetLayer /> : null}
    </motion.div>
  );
}

export { StarField, NebulaLayer, FloatingParticles };
