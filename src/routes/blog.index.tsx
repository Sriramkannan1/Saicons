import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageContainer, PageHero, Section } from "@/components/layout/PageContainer";
import { BlogCard, EmptyState, LoadingGrid } from "@/components/cards";
import { blogsData } from "@/lib/data";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog | Rotaract Club of Saibaba Colony — SAICONS" },
      {
        name: "description",
        content: "Stories, updates and reflections from SAICONS — Rotaract Club of Saibaba Colony.",
      },
      { property: "og:title", content: "Our Blog | SAICONS Rotaract Club" },
      { property: "og:description", content: "Stories that inspire change from Team Saicons." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog", "published"],
    queryFn: blogsData.listPublished,
  });
  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: blogsData.categories,
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (posts ?? []).filter((p) => {
      if (category !== "all" && p.category?.slug !== category) return false;
      if (!q) return true;
      return [p.title, p.excerpt, p.content, p.category?.name]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [posts, search, category]);

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <PageContainer>
      <PageHero
        eyebrow="Our blog"
        title="STORIES THAT INSPIRE CHANGE"
        description="Club updates, project stories and reflections from Team Saicons."
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
              placeholder="Search articles..."
              aria-label="Search articles"
              className="w-full rounded-lg border border-border bg-background/60 py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="all">All Posts</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <LoadingGrid count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState message="Articles will be published here soon." />
        ) : (
          <div className="space-y-8">
            {featured ? <BlogCard post={featured} featured /> : null}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
