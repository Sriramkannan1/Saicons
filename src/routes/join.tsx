import { createFileRoute } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import {
  PageContainer,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout/PageContainer";
import { joinContent } from "@/data/join";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join SAICONS | Rotaract Club of Saibaba Colony" },
      {
        name: "description",
        content:
          "Join Team Saicons and be part of a 30+ year tradition of service, leadership and fellowship. Rotaract Club of Saibaba Colony, Coimbatore.",
      },
      { property: "og:title", content: "Join Team Saicons | Rotaract Club of Saibaba Colony" },
      { property: "og:description", content: "More than a club — it's a legacy. Join SAICONS." },
    ],
  }),
  component: JoinPage,
});

function DynamicIcon({ name }: { name?: string | null }) {
  const Icon =
    (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || Icons.Sparkles;
  return <Icon className="h-5 w-5 text-primary" aria-hidden />;
}

function JoinPage() {
  const { hero, benefits, activities, qr } = joinContent;

  return (
    <PageContainer>
      <PageHero
        eyebrow={qr.recruitment_open ? "Recruitment live" : "Join Team Saicons"}
        title={hero.title}
        description={hero.body}
      >
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {hero.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-3 py-1 text-xs text-primary"
            >
              {t}
            </span>
          ))}
        </div>
      </PageHero>

      <Section>
        <SectionHeading eyebrow="Why join" title="What you get" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.id} className="glass-panel hover-lift rounded-2xl p-6">
              <DynamicIcon name={b.icon} />
              <h3 className="mt-4 font-display text-base font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Activities" title="What we do together" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <div key={a.id} className="glass-panel hover-lift rounded-2xl p-6">
              <DynamicIcon name={a.icon} />
              <h3 className="mt-4 font-display text-base font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="glass-panel grid items-center gap-8 rounded-3xl p-8 sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">SCAN TO JOIN THE CREW</h2>
            <p className="mt-3 text-sm text-muted-foreground">{qr.description}</p>
            {qr.registration_url ? (
              <a
                href={qr.registration_url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-block rounded-full px-7 py-3 font-display text-xs tracking-[0.18em] text-primary-foreground uppercase"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
              >
                {qr.button_text}
              </a>
            ) : (
              <p className="mt-6 text-xs text-muted-foreground">
                A registration link will be available when recruitment opens.
              </p>
            )}
          </div>
          <div className="glass-panel mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-2xl">
            <p className="text-center text-xs text-muted-foreground px-4">
              QR code — add a Google Drive image to the media registry
            </p>
          </div>
        </div>
      </Section>
    </PageContainer>
  );
}
