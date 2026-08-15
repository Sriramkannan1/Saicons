import { OrbitalRings } from "@/components/space/SpaceBackground";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Rotaract emblem mark — the classic cogwheel ring with the club initial.
 * Rendered in the club's neon-blue identity using currentColor so it can be
 * dropped anywhere in the design system.
 */
export function RotaractLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/rotary-wheel.png"
      alt="Rotaract Club of Saibaba Colony"
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

/**
 * Floating, slowly rotating, glowing 3D-style logo used as the hero anchor.
 * CSS 3D transforms keep this smooth on low-end devices (no WebGL cost).
 */
export function Rotaract3DLogo({
  size = "22rem",
  withRings = true,
}: {
  size?: string;
  withRings?: boolean;
}) {
  const { scrollY } = useScroll();
  const scaleScroll = useTransform(scrollY, [0, 400], [1, 0.7]);
  const yScroll = useTransform(scrollY, [0, 400], [0, 100]);
  const opacityScroll = useTransform(scrollY, [0, 400], [1, 0.2]);

  return (
    <motion.div
      className="relative mx-auto grid place-items-center"
      style={{ width: size, height: size, perspective: "1000px", scale: scaleScroll, y: yScroll, opacity: opacityScroll }}
      initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      {withRings ? <OrbitalRings /> : null}
      <div
        className="absolute inset-[20%] rounded-full blur-3xl"
        style={{ background: "color-mix(in oklab, var(--primary) 35%, transparent)" }}
        aria-hidden
      />
      <div
        className="animate-float-slow relative grid h-[75%] w-[75%] place-items-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        <RotaractLogo className="h-full w-full drop-shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_60%,transparent)]" />
      </div>
    </motion.div>
  );
}

export function RotaractWordmark() {
  return (
    <span className="flex flex-col">
      <span className="font-display text-[0.68rem] leading-tight font-bold tracking-[0.18em] sm:text-xs">
        <span className="block text-muted-foreground">ROTARACT CLUB OF</span>
        <span className="text-gradient-primary block">SAIBABA COLONY</span>
      </span>
      <span className="mt-0.5 block font-display text-[0.45rem] tracking-[0.15em] text-muted-foreground/80 sm:text-[0.5rem]">
        GROUP 1 | RI DISTRICT 3206 | EST. 1990–91
      </span>
    </span>
  );
}
