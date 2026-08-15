import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContainer, PageHero, Section } from "@/components/layout/PageContainer";
import { EmptyState, LoadingGrid, TeamCard } from "@/components/cards";
import { teamData, siteData } from "@/lib/data";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team | Rotaract Club of Saibaba Colony — SAICONS" },
      {
        name: "description",
        content:
          "Meet the current team driving every avenue of service at SAICONS — Rotaract Club of Saibaba Colony, Coimbatore.",
      },
      { property: "og:title", content: "Meet Team Saicons | Rotaract Club of Saibaba Colony" },
      {
        property: "og:description",
        content: "The current year's board, directors and committee chairs.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { data: members, isLoading } = useQuery({
    queryKey: ["team", "active"],
    queryFn: teamData.listActive,
  });

  const { data: site } = useQuery({
    queryKey: ["site-settings"],
    queryFn: siteData.getSettings,
  });

  const clubName = site?.clubName || "Rotaract Club of Saibaba Colony";

  return (
    <PageContainer>
      <PageHero
        eyebrow="Meet the crew"
        title="TEAM SAICONS"
        description={`The current year's team driving every avenue of service at ${clubName}.`}
      />
      <Section className="pt-0">
        {isLoading ? (
          <LoadingGrid count={6} />
        ) : (members ?? []).length === 0 ? (
          <EmptyState message="Current team information will be updated soon." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(members ?? []).map((m) => (
              <TeamCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
