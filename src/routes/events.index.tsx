import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageContainer, PageHero, Section } from "@/components/layout/PageContainer";
import { EmptyState, EventCard, LoadingGrid } from "@/components/cards";
import { eventsData } from "@/lib/data";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events | Rotaract Club of Saibaba Colony — SAICONS" },
      {
        name: "description",
        content:
          "Events, initiatives and projects from SAICONS — Rotaract Club of Saibaba Colony, Coimbatore.",
      },
      { property: "og:title", content: "Our Events | SAICONS Rotaract Club" },
      {
        property: "og:description",
        content: "Explore our events and signature initiatives.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events", "published"],
    queryFn: eventsData.listPublished,
  });
  const { data: categories } = useQuery({
    queryKey: ["event-categories"],
    queryFn: eventsData.categories,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("all");
  const [timing, setTiming] = useState("all");

  const years = useMemo(
    () =>
      Array.from(
        new Set((events ?? []).map((e) => e.event_date?.slice(0, 4)).filter(Boolean) as string[]),
      ).sort((a, b) => b.localeCompare(a)),
    [events],
  );

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const q = search.trim().toLowerCase();
    return (events ?? []).filter((e) => {
      if (category !== "all" && e.category?.slug !== category) return false;
      if (year !== "all" && e.event_date?.slice(0, 4) !== year) return false;
      if (timing === "upcoming" && (!e.event_date || e.event_date < today)) return false;
      if (timing === "completed" && (!e.event_date || e.event_date >= today)) return false;
      if (!q) return true;
      return [e.title, e.summary, e.description, e.venue, e.category?.name]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [events, search, category, year, timing]);

  const select =
    "rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-foreground outline-none focus:border-primary";

  return (
    <PageContainer>
      <PageHero
        eyebrow="What's happening"
        title="OUR EVENTS"
        description="Explore our events, initiatives and signature projects."
      />
      <Section>
        <div className="glass-panel mb-8 flex flex-wrap items-center gap-3 rounded-2xl p-4">
          <div className="relative min-w-56 flex-1">
            <Search
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              aria-label="Search events"
              className="w-full rounded-lg border border-border bg-background/60 py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            aria-label="Category"
            className={select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Events</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            className={select}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            aria-label="Status"
            className={select}
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
          >
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {isLoading ? (
          <LoadingGrid count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState message="Events will be updated here soon." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
