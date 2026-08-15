import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
  duration?: number;
  effect?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "blur" | "scale" | "fade";
  once?: boolean;
  margin?: string;
}

export function Reveal({ 
  children, 
  width = "100%", 
  className = "", 
  delay = 0, 
  duration = 0.8,
  effect = "fade-up",
  once = true,
  margin = "-100px"
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as any });
  const shouldReduceMotion = useReducedMotion();

  const getVariants = (): Variants => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration, delay } },
      };
    }

    switch (effect) {
      case "fade-up":
        return {
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
        };
      case "fade-down":
        return {
          hidden: { opacity: 0, y: -40 },
          visible: { opacity: 1, y: 0, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
        };
      case "fade-left":
        return {
          hidden: { opacity: 0, x: 40 },
          visible: { opacity: 1, x: 0, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
        };
      case "fade-right":
        return {
          hidden: { opacity: 0, x: -40 },
          visible: { opacity: 1, x: 0, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
        };
      case "blur":
        return {
          hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
        };
      case "fade":
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
        };
    }
  };

  return (
    <div ref={ref} style={{ width }} className={className}>
      <motion.div
        variants={getVariants()}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    </div>
  );
}
