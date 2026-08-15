import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock } from "lucide-react";
import { PageContainer, Section } from "@/components/layout/PageContainer";
import { MediaImage } from "@/components/media/MediaImage";
import { BlogCard, formatDate } from "@/components/cards";
import { blogsData } from "@/lib/data";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Article | Rotaract Club of Saibaba Colony" },
      { name: "description", content: "An article from the SAICONS Rotaract Club blog." },
      { property: "og:title", content: "Article | SAICONS Rotaract Club" },
      { property: "og:description", content: "Stories that inspire change from Team Saicons." },
    ],
  }),
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => blogsData.bySlug(slug),
  });
  const { data: all } = useQuery({
    queryKey: ["blog", "published"],
    queryFn: blogsData.listPublished,
  });

  const related = (all ?? [])
    .filter((p) => p.id !== post?.id && p.category_id === post?.category_id)
    .slice(0, 3);

  return (
    <PageContainer>
      <Section className="pt-32">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to blog
        </Link>

        {isLoading ? (
          <div className="glass-panel mt-6 h-96 animate-pulse rounded-3xl" />
        ) : !post ? (
          <div className="glass-panel mt-6 rounded-3xl p-10 text-center text-sm text-muted-foreground">
            This article could not be found.
          </div>
        ) : (
          <article className="mt-6">
            <div className="glass-panel aspect-21/9 overflow-hidden rounded-3xl">
              <MediaImage
                media={post.cover}
                eager
                className="h-full w-full object-cover"
                fallbackLabel="Cover image coming soon"
              />
            </div>
            <h1 className="neon-text mt-8 font-display text-3xl font-bold sm:text-5xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {post.author ? <span>By {post.author}</span> : null}
              <span>{formatDate(post.published_at)}</span>
              {post.category ? (
                <span className="font-display tracking-[0.16em] text-primary uppercase">
                  {post.category.name}
                </span>
              ) : null}
              {post.reading_time ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden /> {post.reading_time} min read
                </span>
              ) : null}
            </div>
            <div className="mt-8 max-w-3xl text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {post.content ?? post.excerpt}
            </div>

            {related.length > 0 ? (
              <div className="mt-14">
                <h2 className="font-display text-xl font-bold">Related articles</h2>
                <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((p) => (
                    <BlogCard key={p.id} post={p} />
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        )}
      </Section>
    </PageContainer>
  );
}
