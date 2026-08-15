import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, MouseEvent, ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: any;
  href?: string;
  to?: string;
  intensity?: number;
  [key: string]: any; // pass-through props for Link/a
}

export function MagneticButton({
  children,
  className = "",
  onClick,
  as: Component = "button",
  intensity = 0.3,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Calculate distance from center (scaled by intensity)
    x.set((clientX - centerX) * intensity);
    y.set((clientY - centerY) * intensity);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
      style={{ x: xSpring, y: ySpring }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <Component {...props} className="w-full h-full block">
        {children}
      </Component>
    </motion.div>
  );
}
