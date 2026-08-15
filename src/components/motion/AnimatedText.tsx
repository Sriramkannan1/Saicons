import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  el?: keyof JSX.IntrinsicElements;
  once?: boolean;
  delay?: number;
}

export function AnimatedText({
  text,
  className = "",
  el: Wrapper = "p",
  once = true,
  delay = 0,
}: AnimatedTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  const textArray = Array.isArray(text) ? text : text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(8px)",
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <Wrapper className={className} ref={ref}>
      <span className="sr-only">{text}</span>
      <motion.span
        variants={container}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        aria-hidden
        className="inline-block"
      >
        {textArray.map((word, index) => (
          <span key={index} className="inline-block overflow-hidden mr-[0.25em]">
            <motion.span variants={child} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Wrapper>
  );
}
