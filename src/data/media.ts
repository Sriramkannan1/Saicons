export interface MediaAsset {
  id: string;
  original_url: string;
  resolved_url?: string;
  provider: "drive" | "external";
  alt_text: string;
  title?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Sentinel used in data files when a real Drive URL has not yet been supplied. */
export const DRIVE_IMAGE_URL_REQUIRED = "DRIVE_IMAGE_URL_REQUIRED";

/**
 * Central media registry.
 * Replace DRIVE_IMAGE_URL_REQUIRED values with real Google Drive share links
 * (e.g. https://drive.google.com/file/d/FILE_ID/view) once available.
 *
 * The media-resolver.ts utility will extract the file ID and produce
 * a renderable lh3.googleusercontent.com URL automatically.
 */
export const mediaAssets = {
  homeAbout: {
    id: "home-about",
    original_url: "/image.png",
    provider: "external" as const,
    alt_text: "SAICONS members at a community service project",
  } satisfies MediaAsset,
  joinHero: {
    id: "join-hero",
    original_url: DRIVE_IMAGE_URL_REQUIRED,
    provider: "drive" as const,
    alt_text: "Join Team Saicons — Rotaract Club of Saibaba Colony",
  } satisfies MediaAsset,
  sahayam: {
    id: "sahayam",
    original_url: DRIVE_IMAGE_URL_REQUIRED,
    provider: "drive" as const,
    alt_text: "SAHAYAM — cultural and literary extravaganza for gifted individuals",
  } satisfies MediaAsset,
  illusions: {
    id: "illusions",
    original_url: DRIVE_IMAGE_URL_REQUIRED,
    provider: "drive" as const,
    alt_text: "ILLUSIONS — district-level cultural competition for school students",
  } satisfies MediaAsset,
  theatre: {
    id: "theatre",
    original_url: DRIVE_IMAGE_URL_REQUIRED,
    provider: "drive" as const,
    alt_text: "SAICONS Theatre — Movies & Memories community initiative",
  } satisfies MediaAsset,
};

/**
 * Resolve a MediaAsset into a renderable URL.
 * Drive assets are passed through media-resolver; external assets are returned as-is.
 * Returns null when the URL is the DRIVE_IMAGE_URL_REQUIRED sentinel.
 */
export function resolveAsset(asset: MediaAsset): MediaAsset | null {
  if (!asset.original_url || asset.original_url === DRIVE_IMAGE_URL_REQUIRED) {
    return null;
  }

  if (asset.provider === "drive") {
    // If it's already a resolved thumbnail or view URL, just use it
    if (asset.original_url.includes('drive.google.com/thumbnail') || asset.original_url.includes('drive.google.com/uc')) {
      return { ...asset, resolved_url: asset.original_url };
    }

    const patterns = [
      /\/d\/([a-zA-Z0-9_-]{10,})/,
      /open\?id=([a-zA-Z0-9_-]{10,})/,
      /uc\?id=([a-zA-Z0-9_-]{10,})/
    ];

    for (const pattern of patterns) {
      const match = asset.original_url.match(pattern);
      if (match && match[1]) {
        return {
          ...asset,
          resolved_url: `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`,
        };
      }
    }
    // If we can't parse a Drive ID, try to just pass the original url through
    return { ...asset, resolved_url: asset.original_url };
  }

  return { ...asset, resolved_url: asset.original_url };
}
