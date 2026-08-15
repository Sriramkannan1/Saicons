import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export function StaggerContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-white selection:bg-primary/30">
      <Header />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
      <motion.div 
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-4xl text-center flex flex-col items-center"
      >
        {eyebrow ? (
          <motion.p variants={staggerItemVariants} className="font-display text-xs tracking-[0.36em] text-primary uppercase">{eyebrow}</motion.p>
        ) : null}
        <motion.h1 variants={staggerItemVariants} className="mt-4 font-display text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl text-white tracking-tight">
          {title}
        </motion.h1>
        {description ? (
          <motion.p variants={staggerItemVariants} className="mx-auto mt-5 max-w-2xl text-sm text-white/60 sm:text-base leading-relaxed">
            {description}
          </motion.p>
        ) : null}
        <motion.div variants={staggerItemVariants} className="w-full">
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string | undefined;
  id?: string | undefined;
}) {
  return (
    <motion.section 
      id={id} 
      className={`relative px-6 py-8 sm:py-12 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 70, damping: 20 }}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="mb-10 max-w-3xl"
    >
      {eyebrow ? (
        <p className="font-display text-xs tracking-[0.32em] text-primary uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 font-display text-2xl font-bold sm:text-4xl text-white tracking-tight">{title}</h2>
      {description ? <p className="mt-3 text-sm text-white/50">{description}</p> : null}
    </motion.div>
  );
}
