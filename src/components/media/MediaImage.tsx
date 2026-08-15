import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { MediaAsset } from "@/data/media";
import { resolveAsset } from "@/data/media";

/**
 * The only way images from the media registry reach the page.
 * Falls back gracefully when a Drive URL has not been configured yet.
 * Never renders broken images or raw DRIVE_IMAGE_URL_REQUIRED strings.
 */
export function MediaImage({
  media,
  className = "",
  fallbackLabel = "Image unavailable",
  eager = false,
}: {
  media?: MediaAsset | null | undefined;
  className?: string | undefined;
  fallbackLabel?: string | undefined;
  eager?: boolean | undefined;
}) {
  const [failed, setFailed] = useState(false);

  const resolved = media ? resolveAsset(media) : null;

  if (!resolved?.resolved_url || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground ${className}`}
        role="img"
        aria-label={fallbackLabel}
      >
        <ImageOff className="h-6 w-6 opacity-70" aria-hidden />
        <span className="text-xs">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={resolved.resolved_url}
      alt={resolved.alt_text || resolved.title || ""}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
