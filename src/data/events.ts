import type { MediaAsset } from "@/data/media";

export type EventStatus = "published" | "draft";

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  organizers: string | null;
  partners: string | null;
  status: EventStatus;
  featured: boolean;
  cover: MediaAsset | null;
  category: EventCategory | null;
  category_id: string | null;
  created_at: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: "cat-community", name: "Community Service", slug: "community-service", sort_order: 1 },
  { id: "cat-cultural", name: "Cultural", slug: "cultural", sort_order: 2 },
  { id: "cat-leadership", name: "Leadership", slug: "leadership", sort_order: 3 },
  { id: "cat-fellowship", name: "Fellowship", slug: "fellowship", sort_order: 4 },
];

/**
 * Events list. Add real events here or leave empty — the UI handles the empty state gracefully.
 * Landmark SAICONS initiatives are listed below as permanent fixtures.
 */
export const EVENTS: Event[] = [
  {
    id: "evt-sahayam",
    title: "SAHAYAM",
    slug: "sahayam",
    summary:
      "A cultural and literary extravaganza curated specially for gifted individuals — one of SAICONS' most celebrated signature initiatives.",
    description:
      "SAHAYAM is a flagship cultural and literary extravaganza organized by the Rotaract Club of Saibaba Colony (SAICONS). It is curated specially for gifted individuals, celebrating talent, creativity and expression. A signature initiative that brings together participants from across the community.",
    event_date: null,
    start_time: null,
    end_time: null,
    venue: "Coimbatore",
    organizers: "Rotaract Club of Saibaba Colony — SAICONS",
    partners: null,
    status: "published",
    featured: true,
    cover: null,
    category: EVENT_CATEGORIES[1] ?? null,
    category_id: "cat-cultural",
    created_at: new Date().toISOString(),
  },
  {
    id: "evt-illusions",
    title: "ILLUSIONS",
    slug: "illusions",
    summary:
      "A district-level cultural and literary competition designed for school students — SAICONS' commitment to nurturing young talent.",
    description:
      "ILLUSIONS is a district-level cultural and literary competition organised by SAICONS for school students across the region. It gives young minds a platform to showcase their talent in literature, arts and culture — nurturing the next generation of leaders.",
    event_date: null,
    start_time: null,
    end_time: null,
    venue: "Coimbatore",
    organizers: "Rotaract Club of Saibaba Colony — SAICONS",
    partners: null,
    status: "published",
    featured: true,
    cover: null,
    category: EVENT_CATEGORIES[1] ?? null,
    category_id: "cat-cultural",
    created_at: new Date().toISOString(),
  },
  {
    id: "evt-movies-memories",
    title: "Movies & Memories",
    slug: "movies-and-memories",
    summary:
      "A SAICONS Theatre initiative that brings different generations together — elders and children — through the shared joy of cinema.",
    description:
      "Movies & Memories is a community-driven initiative under the SAICONS Theatre banner. It brings elders and children together for shared cinematic experiences, fostering intergenerational connection, nostalgia and warmth. A testament to SAICONS' commitment to community and fellowship beyond service projects.",
    event_date: null,
    start_time: null,
    end_time: null,
    venue: "Coimbatore",
    organizers: "Rotaract Club of Saibaba Colony — SAICONS",
    partners: null,
    status: "published",
    featured: false,
    cover: null,
    category: EVENT_CATEGORIES[0] ?? null,
    category_id: "cat-community",
    created_at: new Date().toISOString(),
  },
];
