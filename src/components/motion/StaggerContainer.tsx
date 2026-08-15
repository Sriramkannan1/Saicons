import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
  margin?: string;
}

export function StaggerContainer({
  children,
  className = "",
  delayChildren = 0,
  staggerChildren = 0.1,
  once = true,
  margin = "-50px"
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as any });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren,
        staggerChildren,
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

// Helper for individual items within the stagger container
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  effect?: "fade-up" | "blur" | "scale" | "fade";
}

export function StaggerItem({ children, className = "", effect = "fade-up" }: StaggerItemProps) {
  const getVariants = (): Variants => {
    switch (effect) {
      case "blur":
        return {
          hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
        };
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.6 } },
        };
      case "fade-up":
      default:
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
        };
    }
  };

  return (
    <motion.div className={className} variants={getVariants()}>
      {children}
    </motion.div>
  );
}
