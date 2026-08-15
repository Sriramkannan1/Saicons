import type { MediaAsset } from "@/data/media";

export type BlogStatus = "published" | "draft";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  published_at: string | null;
  reading_time: number | null;
  status: BlogStatus;
  featured: boolean;
  cover: MediaAsset | null;
  category: BlogCategory | null;
  category_id: string | null;
  created_at: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: "bcat-service", name: "Community Service", slug: "community-service", sort_order: 1 },
  { id: "bcat-leadership", name: "Leadership", slug: "leadership", sort_order: 2 },
  { id: "bcat-fellowship", name: "Fellowship", slug: "fellowship", sort_order: 3 },
  { id: "bcat-stories", name: "Stories", slug: "stories", sort_order: 4 },
];

/**
 * Blog posts. Add real articles here or leave empty — the UI handles the empty state gracefully.
 * Do not publish fictional articles.
 */
export const BLOG_POSTS: BlogPost[] = [];
