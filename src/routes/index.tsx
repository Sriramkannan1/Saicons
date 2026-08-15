import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import {
  PageContainer,
  Section,
  SectionHeading,
  StaggerContainer,
  StaggerItem,
} from "@/components/layout/PageContainer";
import { PlanetLayer } from "@/components/space/SpaceBackground";
import { AnnouncementBar, ContactForm, FAQSection } from "@/components/sections";
import { EmptyState, EventCard, LoadingGrid, StatCard } from "@/components/cards";
import { eventsData } from "@/lib/data";
import { homeSections } from "@/data/home";
import { motion, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.5 },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rotaract Club of Saibaba Colony | SAICONS — Youth Service in Coimbatore" },
      {
        name: "description",
        content:
          "SAICONS — Rotaract Club of Saibaba Colony, Coimbatore. Established 1990–91. Youth leadership, community service and fellowship. RI District 3206, Group 1.",
      },
      { property: "og:title", content: "Rotaract Club of Saibaba Colony | SAICONS" },
      {
        property: "og:description",
        content: "Three decades of service, leadership and fellowship in Coimbatore.",
      },
    ],
  }),
  component: HomePage,
} as Parameters<typeof createFileRoute<"/">>[0]);

function DynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon =
    (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Icons.Sparkles;
  return <Icon className={className || "h-5 w-5 text-white"} aria-hidden />;
}

function HomePage() {
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["events", "published"],
    queryFn: eventsData.listPublished,
  });

  const { hero, about, stats, join, community, initiatives } = homeSections;
  const featured = (events ?? []).filter((e) => e.featured);
  const shown = (featured.length > 0 ? featured : (events ?? [])).slice(0, 6);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, 100]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const indicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  return (
    <PageContainer>
      {/* HERO */}
      <motion.section
        className="relative overflow-hidden px-6 pt-40 pb-24 sm:pt-56 flex flex-col justify-center items-center"
        style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
      >

        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center gap-8 mb-12 z-10">
          <motion.div
            className="z-10 flex flex-col items-center w-full"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Subtitle / Welcome To */}
            <motion.div className="mb-6 flex flex-col items-center overflow-hidden">
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4"
              >
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary"></div>
                <span className="font-sans text-[0.85rem] font-semibold tracking-[0.4em] text-primary uppercase">
                  {hero.subtitle}
                </span>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary"></div>
              </motion.div>
            </motion.div>

            {/* Main Headline (Cinematic Mask Reveal) */}
            <motion.div className="flex flex-col items-center">
              <h1 className="font-sans text-[3.5rem] sm:text-[5rem] lg:text-[6.5rem] leading-[1] font-semibold tracking-[-0.03em] text-white flex flex-col items-center">
                <span className="block"><motion.span variants={wordVariants} className="block">Rotaract Club of</motion.span></span>
                <span className="block"><motion.span variants={wordVariants} className="block text-white/70">Saibaba Colony</motion.span></span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.div variants={itemVariants} className="mt-8 overflow-hidden">
              <p className="font-sans text-[0.85rem] font-semibold tracking-[0.3em] text-primary uppercase">
                SERVICE • LEADERSHIP • FELLOWSHIP
              </p>
            </motion.div>

            {/* Subheadline */}
            <motion.p variants={itemVariants} className="mt-6 max-w-[650px] text-[1.1rem] leading-[1.6] text-white/50 font-sans font-light">
              Dive into youth leadership, where innovative community service meets global fellowship. Established in 1990.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={itemVariants} className="mt-12 flex flex-wrap justify-center gap-6">
              <Link
                to="/about"
                className="group flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-8 py-3.5 text-[0.85rem] font-medium text-white transition-all hover:bg-primary text-primary-foreground/10"
                data-cursor="explore"
              >
                {hero.cta_secondary}
                <ArrowRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
              </Link>
              <Link
                to="/join"
                className="rounded-full px-9 py-3.5 text-[0.85rem] font-medium text-black bg-primary text-primary-foreground transition-all hover:bg-primary text-primary-foreground/90"
                data-cursor="explore"
              >
                {hero.cta_primary}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        >
          <span className="text-[0.55rem] font-bold tracking-[0.3em] text-white/40 uppercase">Scroll to explore</span>
          <motion.div
            className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent"
            animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.section>

      <AnnouncementBar />

      {/* STATS */}
      <Section className="!pt-0">
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-y border-white/10 py-12 lg:py-16">
          {[
            { value: "10+", label: "Years In Service" },
            { value: "150+", label: "Projects Completed" },
            { value: "120+", label: "Active Members" },
            { value: "200K+", label: "Lives Impacted" },
          ].map((stat, i) => (
            <StaggerItem key={i} className="flex flex-col items-center justify-center py-10 px-6 text-center group overflow-hidden relative">
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <div className="font-display text-6xl sm:text-7xl font-bold tracking-tighter text-white mb-6 transition-all duration-700 group-hover:-translate-y-2 group-hover:text-white/90">
                {stat.value}
              </div>
              <div className="text-xs text-white/40 tracking-[0.3em] uppercase font-semibold">
                {stat.label}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      {/* ABOUT */}
      <motion.div
        className="mx-auto max-w-7xl px-6 py-8 sm:py-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main About Block */}
          <div className="lg:col-span-7 rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 sm:p-14 lg:p-16 flex flex-col justify-center relative overflow-hidden group">
            {/* Massive background watermark */}
            <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none transition-opacity duration-700 group-hover:opacity-[0.05]">
               <img src="/rotary-wheel.png" alt="" className="w-96 h-96 -mr-32 -mt-32 object-contain" aria-hidden />
            </div>
            
            <h2 className="relative z-10 font-display text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              {about.title}
            </h2>
            <p className="relative z-10 mt-8 text-lg leading-relaxed text-white/60 max-w-xl">
              {about.body}
            </p>
            <div className="relative z-10 mt-12">
               <Link to="/about" className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-white/90 px-8 py-4 rounded-full font-semibold hover:bg-primary text-primary-foreground/90 transition-transform hover:scale-105 active:scale-95">
                 {about.cta} <ArrowRight className="h-5 w-5" />
               </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
             {/* Photo block */}
             <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-white/[0.05] relative overflow-hidden min-h-[300px] flex items-center justify-center">
                 <p className="px-6 text-center text-xs text-white/30 uppercase tracking-widest font-semibold">
                   Club photo — add a Google Drive image to the media registry
                 </p>
             </div>
             
             {/* Quote block */}
             <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-background p-10 sm:p-12 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute -top-4 left-6 font-display text-[10rem] leading-none font-bold text-white/5 select-none pointer-events-none">
                  "
                </div>
                <blockquote className="relative z-10 font-display text-xl sm:text-2xl font-medium italic leading-relaxed text-white">
                  {about.quote.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </blockquote>
             </div>
          </div>
          
        </div>
      </motion.div>

      {/* INITIATIVES */}
      <Section>
        <SectionHeading eyebrow="Signature Initiatives" title="What SAICONS is Known For" />
        <StaggerContainer className="grid gap-6 lg:grid-cols-3">
          {initiatives.map((init) => (
            <StaggerItem key={init.id}>
              <div className="group relative overflow-hidden border border-white/10 bg-background hover:bg-white/[0.02] transition-colors rounded-[2rem] p-8 sm:p-10 flex flex-col min-h-[320px] h-full">
                {/* Massive background icon */}
                <div className="absolute -right-12 -bottom-12 text-primary/[0.05] transition-transform duration-700 group-hover:scale-110 group-hover:text-white/[0.04]">
                  <DynamicIcon name={init.icon} className="h-64 w-64" />
                </div>

                {/* Foreground content */}
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-8">
                    <DynamicIcon name={init.icon} className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">{init.title}</h3>
                  <p className="mt-2 font-display text-[0.65rem] tracking-[0.2em] text-white/50 uppercase">
                    {init.subtitle}
                  </p>
                </div>
                <div className="relative z-10 mt-auto pt-8">
                  <p className="text-sm leading-relaxed text-white/60">{init.body}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      {/* EVENTS */}
      <Section>
        <SectionHeading eyebrow="What's happening" title="Our Events & Initiatives" />
        {eventsLoading ? (
          <LoadingGrid />
        ) : shown.length === 0 ? (
          <EmptyState message="Events will be updated here soon." />
        ) : (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((e) => (
              <StaggerItem key={e.id}>
                <EventCard event={e} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </Section>

      {/* JOIN CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-white/10 bg-background">
          <h2 className="font-display text-2xl font-bold sm:text-4xl">{join.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">{join.body}</p>
          <Link
            to="/join"
            className="mt-7 inline-block rounded-full px-7 py-3 font-display text-xs tracking-[0.18em] text-white bg-primary uppercase transition-colors hover:bg-primary/90"
          >
            {join.cta}
          </Link>
        </div>
      </Section>

      {/* COMMUNITY CONNECT */}
      <Section>
        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col justify-center">
              <SectionHeading
                eyebrow="Community connect"
                title={community.title}
                description={community.body}
              />
            </div>
            <div>
              <ContactForm withSubject={false} />
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
        <FAQSection />
      </Section>
    </PageContainer>
  );
}
