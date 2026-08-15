import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageContainer, PageHero, Section } from "@/components/layout/PageContainer";
import { ContactForm } from "@/components/sections";
import { siteData } from "@/lib/data";

const ICON_MAP: Record<string, typeof Phone> = { Phone, Mail, MapPin, Clock };

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Rotaract Club of Saibaba Colony — SAICONS" },
      {
        name: "description",
        content:
          "Get in touch with SAICONS — Rotaract Club of Saibaba Colony, Coimbatore. Partnerships, community support and collaborations.",
      },
      { property: "og:title", content: "Contact SAICONS | Rotaract Club of Saibaba Colony" },
      {
        property: "og:description",
        content: "Reach the club by phone, email or our contact form.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: site } = useQuery({
    queryKey: ["site-settings"],
    queryFn: siteData.getSettings,
  });

  const contactInfo = site || {
    phone: "",
    email: "",
    location: "Saibaba Colony, Coimbatore, Tamil Nadu, India",
    mapQuery: "Saibaba Colony, Coimbatore"
  };

  const cards = [
    {
      icon: "Phone",
      label: "Phone",
      value: contactInfo.phones && contactInfo.phones.length > 0 
        ? contactInfo.phones 
        : (contactInfo.phone ? [{ name: "", number: contactInfo.phone }] : "Coming soon"),
      href: null,
    },
    {
      icon: "Mail",
      label: "Email",
      value: contactInfo.email || "Coming soon",
      href: contactInfo.email ? `mailto:${contactInfo.email}` : null,
    },
    {
      icon: "MapPin",
      label: "Location",
      value: contactInfo.location,
      href: null,
    },
    {
      icon: "Clock",
      label: "Response time",
      value: "Within 24 hours",
      href: null,
    },
  ];

  return (
    <PageContainer>
      <PageHero
        eyebrow="Get in touch"
        title="WE'RE HERE TO CONNECT."
        description="Questions, collaborations or community support — reach out and Team Saicons will respond."
      />
      <Section className="pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Mail;
            return (
              <div key={c.label} className="border border-white/10 bg-black transition-all hover:-translate-y-1 hover:border-white/20 rounded-2xl p-6">
                <Icon className="h-5 w-5 text-white" aria-hidden />
                <p className="mt-4 font-display text-[0.62rem] tracking-[0.2em] text-white/50 uppercase">
                  {c.label}
                </p>
                {Array.isArray(c.value) ? (
                  <div className="mt-2 space-y-2">
                    {c.value.map((p: any, i: number) => (
                      <div key={i} className="text-sm text-foreground">
                        {p.name && <span className="text-xs text-muted-foreground block mb-0.5">{p.name}</span>}
                        <a href={`tel:${p.number}`} className="hover:text-white/80 transition-colors">
                          {p.number}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : c.href ? (
                    <a
                      href={c.href}
                      className="mt-1 block text-sm text-foreground hover:text-white/80 whitespace-pre-line"
                    >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-foreground whitespace-pre-line">{c.value as string}</p>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-2">
          <ContactForm />
          <div className="border border-white/10 bg-black overflow-hidden rounded-2xl">
            {(() => {
              const query = contactInfo.mapQuery;
              let finalSrc = "";
              
              if (query.includes("<iframe") && query.includes("src=")) {
                // User pasted the full HTML embed code
                const match = query.match(/src="([^"]+)"/);
                finalSrc = match ? match[1] : "";
              } else if (query.includes("google.com/maps/embed")) {
                // User pasted the raw embed URL
                finalSrc = query;
              } else {
                // If it's a short link or regular URL, it can't be embedded directly.
                // Fallback to searching the physical text address instead to guarantee a map shows up.
                const searchQuery = query.startsWith("http") ? contactInfo.location : query;
                finalSrc = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
              }

              return (
                <iframe
                  title="Map of Saibaba Colony, Coimbatore"
                  src={finalSrc}
                  className="h-full min-h-96 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              );
            })()}
          </div>
        </div>
      </Section>
    </PageContainer>
  );
}
