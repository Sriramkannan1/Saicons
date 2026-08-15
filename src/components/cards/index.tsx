import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock, Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import { MediaImage } from "@/components/media/MediaImage";
import type { Event, BlogPost, TeamMember } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function formatDate(value?: string | null) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-black p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
      <p className="text-gradient-primary font-display text-4xl font-bold sm:text-5xl">{value}</p>
      <p className="mt-3 text-[0.8rem] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  );
}

export function EventCard({ event }: { event: Event }) {
  return (
    <article className="border border-white/10 bg-black group flex flex-col overflow-hidden rounded-2xl transition-all hover:border-white/20 hover:-translate-y-1">
      <div className="relative aspect-[3/4] overflow-hidden">
        <MediaImage
          media={event.cover}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackLabel="Event image coming soon"
        />
        {event.category ? (
          <span className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/80 px-3 py-1 font-display text-[0.6rem] tracking-[0.18em] text-white uppercase backdrop-blur">
            {event.category.name}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
          {formatDate(event.event_date)}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold">{event.title}</h3>
        {event.venue ? (
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
            {event.venue}
          </p>
        ) : null}
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {event.summary ?? event.description ?? ""}
        </p>
        <Link
          to="/events/$slug"
          params={{ slug: event.slug }}
          className="mt-4 inline-flex items-center gap-2 font-display text-xs tracking-[0.16em] text-primary uppercase transition-colors hover:text-accent"
        >
          View Details <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article
      className={`border border-white/10 bg-black group overflow-hidden rounded-2xl transition-all hover:border-white/20 hover:-translate-y-1 ${
        featured ? "grid md:grid-cols-2" : "flex flex-col"
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "min-h-56" : "aspect-16/9"}`}>
        <MediaImage
          media={post.cover}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackLabel="Cover image coming soon"
        />
        {featured ? (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 font-display text-[0.6rem] tracking-[0.18em] text-primary-foreground uppercase">
            Featured
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {post.category ? (
            <span className="font-display tracking-[0.16em] text-primary uppercase">
              {post.category.name}
            </span>
          ) : null}
          <span>{formatDate(post.published_at)}</span>
          {post.reading_time ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {post.reading_time} min read
            </span>
          ) : null}
        </div>
        <h3 className={`mt-2 font-display font-semibold ${featured ? "text-2xl" : "text-lg"}`}>
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {post.excerpt ?? ""}
        </p>
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="mt-4 inline-flex items-center gap-2 font-display text-xs tracking-[0.16em] text-primary uppercase transition-colors hover:text-accent"
        >
          {featured ? "Read Full Story" : "Read More"}{" "}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function TeamCard({ member }: { member: TeamMember }) {
  const getSocialUrl = (platform: string) => {
    return member.socialLinks?.find((s: any) => s.platform === platform)?.url;
  };

  const linkedin = getSocialUrl("linkedin");
  const instagram = getSocialUrl("instagram");

  return (
    <Dialog>
      <article className="border border-white/10 bg-black overflow-hidden rounded-2xl text-center transition-all hover:border-white/20 hover:-translate-y-1 flex flex-col h-full">
        <DialogTrigger asChild>
          <div className="aspect-[1/1.414] overflow-hidden cursor-pointer relative group">
            <MediaImage
              media={member.image}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackLabel="Photo coming soon"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
               <span className="text-white font-display text-sm tracking-widest uppercase border border-white/20 rounded-full px-4 py-2 bg-black/50">View Info</span>
            </div>
          </div>
        </DialogTrigger>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-display text-base font-semibold">{member.name}</h3>
          <p className="mt-1 font-display text-[0.65rem] tracking-[0.18em] text-primary uppercase">
            {member.role?.name || member.role}
          </p>
          <div className="mt-4 flex justify-center gap-3 mt-auto pt-4 border-t border-white/5">
            {linkedin ? (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${member.name} on LinkedIn`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Linkedin className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${member.name} on Instagram`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Instagram className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
            {member.email ? (
              <a
                href={`mailto:${member.email}`}
                aria-label={`Email ${member.name}`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
      </article>

      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] border-white/10 bg-black/95 backdrop-blur-xl p-0 overflow-hidden gap-0">
        <div className="flex flex-col sm:flex-row max-h-[85vh] overflow-y-auto">
          <div className="w-full sm:w-1/2 md:w-[45%] aspect-[1/1.2] sm:aspect-[3/4] shrink-0">
             <MediaImage
              media={member.image}
              className="h-full w-full object-cover"
              fallbackLabel="Photo coming soon"
            />
          </div>
          <div className="p-6 sm:p-8 md:p-10 flex-1 flex flex-col">
            <DialogHeader className="text-left mb-6">
              <DialogTitle className="font-display text-2xl font-bold text-white mb-1">{member.name}</DialogTitle>
              <DialogDescription className="font-display text-xs tracking-[0.2em] text-primary uppercase">
                {member.role?.name || member.role}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 text-sm text-white/70 leading-relaxed space-y-4">
              {member.bio ? (
                <p>{member.bio}</p>
              ) : (
                <p className="italic text-white/40">No biography available.</p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
              {linkedin ? (
                <a href={linkedin} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              ) : null}
              {instagram ? (
                <a href={instagram} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              ) : null}
              {member.email ? (
                <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-white/10 bg-black rounded-2xl p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-white/10 bg-white/5 h-72 animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}
