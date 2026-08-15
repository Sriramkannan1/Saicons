import { createFileRoute } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  PageContainer,
  PageHero,
  Section,
  SectionHeading,
  StaggerContainer,
  StaggerItem,
} from "@/components/layout/PageContainer";
import { aboutSections } from "@/data/about";
import { siteData, teamData } from "@/lib/data";
import { TeamCard } from "@/components/cards";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SAICONS | Rotaract Club of Saibaba Colony" },
      {
        name: "description",
        content:
          "The story of SAICONS — established in 1990–91, Rotaract Club of Saibaba Colony has spent over three decades serving communities, developing leaders and building fellowship in Coimbatore.",
      },
      { property: "og:title", content: "About SAICONS | Rotaract Club of Saibaba Colony" },
      {
        property: "og:description",
        content: "Mission, vision, core values and the club journey since 1990.",
      },
    ],
  }),
  component: AboutPage,
});

function DynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon =
    (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Icons.Sparkles;
  return <Icon className={className || "h-5 w-5 text-white"} aria-hidden />;
}

function AboutPage() {
  const { hero, mission, vision, rotaract, impact, values, journey } = aboutSections;

  const { data: site } = useQuery({
    queryKey: ["site-settings"],
    queryFn: siteData.getSettings,
  });

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["team", "active"],
    queryFn: teamData.listActive,
  });

  const siteInfo = site || {
    group: "Group 1",
    currentDistrict: "RI District 3206",
    established: "1990-91",
  };

  // If we have team members, prioritize showing Board members, otherwise show the first 4 members.
  const boardMembers = team?.filter(m => m.role.category?.toLowerCase().includes("board") || m.role.category?.toLowerCase().includes("executive")) || [];
  const displayTeam = boardMembers.length > 0 ? boardMembers.slice(0, 4) : (team || []).slice(0, 4);

  return (
    <PageContainer>
      <Section className="!pt-40 !pb-20 border-b border-white/10">
        <StaggerContainer className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <StaggerItem className="lg:col-span-8">
            <h1 className="font-display text-5xl sm:text-7xl lg:text-[6rem] font-bold leading-[1.05] tracking-tighter text-white">
              <span className="block text-primary">Three decades</span>
              <span className="block">of service &</span>
              <span className="block text-white/40">leadership.</span>
            </h1>
          </StaggerItem>
          <StaggerItem className="lg:col-span-4 flex flex-col gap-8 lg:border-l lg:border-white/10 lg:pl-12">
            <p className="text-lg text-white/60 leading-relaxed font-light">
              {hero.body}
            </p>
            <div className="flex flex-col gap-4 pt-8 border-t border-white/10">
              {[siteInfo.group, siteInfo.currentDistrict, `Est. ${siteInfo.established}`].map((m) => (
                <div key={m} className="flex items-center gap-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-display text-xs tracking-[0.25em] text-white/80 uppercase font-semibold">{m}</span>
                </div>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>
      </Section>



      <Section>
        <StaggerContainer className="grid gap-6 lg:grid-cols-2">
          {[mission, vision].map((s) => (
            <StaggerItem key={s.title}>
              <div className="group relative border border-white/10 bg-background transition-all hover:bg-white/[0.02] rounded-[2.5rem] p-10 sm:p-14 overflow-hidden min-h-[400px] flex flex-col justify-end">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 font-display text-[8rem] sm:text-[10rem] font-bold text-white/[0.02] transition-transform duration-700 group-hover:scale-110 pointer-events-none select-none uppercase tracking-tighter">
                  {s.title}
                </div>
                <h2 className="relative z-10 font-display text-3xl font-bold text-white mb-6">{s.title}</h2>
                <p className="relative z-10 text-lg leading-relaxed text-white/60 max-w-lg">{s.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      <Section>
        <SectionHeading eyebrow="Our impact" title="Where we make a difference" />
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {impact.map((item) => (
            <StaggerItem key={item.id} className="h-full">
              <div className="group relative overflow-hidden border border-white/10 bg-background hover:bg-white/[0.02] transition-colors rounded-[2rem] p-8 sm:p-10 flex flex-col min-h-[300px] h-full">
                {/* Massive background icon */}
                <div className="absolute -right-12 -bottom-12 text-white/[0.02] transition-transform duration-700 group-hover:scale-110 group-hover:text-white/[0.04]">
                  <DynamicIcon name={item.icon} className="h-64 w-64" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-8">
                    <DynamicIcon name={item.icon} className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/50">{item.body}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      <Section>
        <SectionHeading eyebrow="Core values" title="What we stand for" />
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((item) => (
            <StaggerItem key={item.id} className="h-full">
              <div className="group relative overflow-hidden border border-white/10 bg-background hover:bg-white/[0.02] transition-colors rounded-[2rem] p-8 sm:p-10 flex flex-col min-h-[300px] h-full">
                {/* Massive background icon */}
                <div className="absolute -right-12 -bottom-12 text-white/[0.02] transition-transform duration-700 group-hover:scale-110 group-hover:text-white/[0.04]">
                  <DynamicIcon name={item.icon} className="h-64 w-64" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-8">
                    <DynamicIcon name={item.icon} className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/50">{item.body}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      <Section>
        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 sm:p-14 lg:p-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none transition-opacity duration-700 group-hover:opacity-[0.05]">
             <img src="/rotary-wheel.png" alt="" className="w-[30rem] h-[30rem] -mr-32 -mt-32 object-contain" aria-hidden />
          </div>
          <h2 className="relative z-10 font-display text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-2xl">
            {rotaract.title}
          </h2>
          <p className="relative z-10 mt-8 text-lg sm:text-xl leading-relaxed text-white/60 max-w-4xl">
            {rotaract.body}
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Club journey" title="Milestones so far" />
        <StaggerContainer className="relative space-y-6 border-l border-border pl-6">
          {journey.map((m) => (
            <StaggerItem key={m.id} className="relative">
              <div className="relative flex items-center justify-center">
                <span
                  className="absolute -left-[1.95rem] top-2 h-4 w-4 rounded-full border-4 border-black bg-white"
                  aria-hidden
                />
              </div>
              <p className="font-display text-2xl font-bold text-white">{m.title}</p>
              <p className="font-display text-sm tracking-[0.2em] uppercase text-white/40 mt-1 mb-3">{m.subtitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/50">{m.body}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>



      {/* NEW: Leadership Team */}
      <Section>
        <SectionHeading eyebrow="Leadership" title="Board of Directors" />
        
        {teamLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-primary" />
          </div>
        ) : displayTeam.length === 0 ? (
          <div className="py-12 text-center text-white/50">
            <Icons.Users className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <p>Board of directors will be updated soon.</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayTeam.map((member) => (
               <StaggerItem key={member.id} className="h-full">
                 <TeamCard member={member} />
               </StaggerItem>
            ))}
          </StaggerContainer>
        )}
        
        <div className="mt-12 flex justify-center">
           <button className="rounded-full border border-white/20 bg-transparent px-8 py-4 font-display text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/10">
             View Full Team
           </button>
        </div>
      </Section>
    </PageContainer>
  );
}
