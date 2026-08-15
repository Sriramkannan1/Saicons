import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  className = "",
  prefix = "",
  suffix = "",
  duration = 2000,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const springValue = useSpring(0, {
    damping: 60,
    stiffness: 100,
    duration,
  });

  const displayValue = useTransform(springValue, (current) => {
    return Math.floor(current).toLocaleString();
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  return (
    <span ref={ref} className={`inline-flex items-center ${className}`}>
      {prefix && <span>{prefix}</span>}
      <motion.span>{displayValue}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
