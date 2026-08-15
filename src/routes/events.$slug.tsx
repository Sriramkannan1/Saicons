import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, MapPin, Tag } from "lucide-react";
import { PageContainer, Section } from "@/components/layout/PageContainer";
import { MediaImage } from "@/components/media/MediaImage";
import { formatDate } from "@/components/cards";
import { eventsData } from "@/lib/data";

export const Route = createFileRoute("/events/$slug")({
  head: () => ({
    meta: [
      { title: "Event Details | Rotaract Club of Saibaba Colony" },
      {
        name: "description",
        content: "Full details for this SAICONS Rotaract Club event.",
      },
      { property: "og:title", content: "Event | SAICONS Rotaract Club" },
      {
        property: "og:description",
        content: "Event details from the Rotaract Club of Saibaba Colony.",
      },
    ],
  }),
  component: EventDetailPage,
});

function EventDetailPage() {
  const { slug } = Route.useParams();
  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => eventsData.bySlug(slug),
  });

  return (
    <PageContainer>
      <Section className="pt-32">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to events
        </Link>

        {isLoading ? (
          <div className="glass-panel mt-6 h-96 animate-pulse rounded-3xl" />
        ) : !event ? (
          <div className="glass-panel mt-6 rounded-3xl p-10 text-center text-sm text-muted-foreground">
            This event could not be found.
          </div>
        ) : (
          <>
            <div className="glass-panel mt-6 aspect-21/9 overflow-hidden rounded-3xl">
              <MediaImage
                media={event.cover}
                eager
                className="h-full w-full object-cover"
                fallbackLabel="Event image coming soon"
              />
            </div>
            <h1 className="neon-text mt-8 font-display text-3xl font-bold sm:text-5xl">
              {event.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                {formatDate(event.event_date)}
              </span>
              {event.start_time ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" aria-hidden />
                  {event.start_time}
                  {event.end_time ? ` – ${event.end_time}` : ""}
                </span>
              ) : null}
              {event.venue ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden />
                  {event.venue}
                </span>
              ) : null}
              {event.category ? (
                <span className="inline-flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" aria-hidden />
                  {event.category.name}
                </span>
              ) : null}
            </div>

            <p className="mt-8 max-w-3xl text-sm whitespace-pre-line text-muted-foreground">
              {event.description ?? event.summary}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {event.organizers ? (
                <div className="glass-panel rounded-2xl p-5">
                  <h2 className="font-display text-xs tracking-[0.2em] text-primary uppercase">
                    Organizers
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{event.organizers}</p>
                </div>
              ) : null}
              {event.partners ? (
                <div className="glass-panel rounded-2xl p-5">
                  <h2 className="font-display text-xs tracking-[0.2em] text-primary uppercase">
                    Partners
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{event.partners}</p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </Section>
    </PageContainer>
  );
}
