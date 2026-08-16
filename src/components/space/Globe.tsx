import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useSpring } from "framer-motion";

export function InteractiveGlobe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const spring = useSpring(0, {
    stiffness: 280,
    damping: 40,
    mass: 1,
  });

  useEffect(() => {
    let phi = 0;
    let width = 0;
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1], // Pure white dots so they are visible with mix-blend-screen
      markerColor: [0, 0.66, 1], // electric blue
      glowColor: [0, 0, 0], // Pure black glow so the background sphere is transparent in screen mode
      markers: [
        // Coimbatore location
        { location: [11.0168, 76.9558], size: 0.1 },
      ],
      // @ts-expect-error - onRender is missing from cobe typings
      onRender: (state: Record<string, any>) => {
        if (pointerInteracting.current === null) {
          phi += 0.003;
        }
        state.phi = phi + spring.get();
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [spring]);

  return (
    <div
      className={`relative w-full aspect-square ${className}`}
      style={{ cursor: "grab" }}
      onPointerDown={(e) => {
        pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
        if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
      }}
      onPointerUp={() => {
        pointerInteracting.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      }}
      onPointerOut={() => {
        pointerInteracting.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      }}
      onPointerMove={(e) => {
        if (pointerInteracting.current !== null) {
          const delta = e.clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta;
          spring.set(delta / 200);
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full mix-blend-screen opacity-90"
        style={{
          contain: "layout paint size",
        }}
      />
    </div>
  );
}
