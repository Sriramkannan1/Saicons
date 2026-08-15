/**
 * MediaResolver — single source of truth for turning a pasted image URL into a
 * usable, renderable image URL.
 *
 * Supported providers:
 *   - "drive"    Google Drive share links
 *   - "external" any direct image URL
 *
 * No UI component may parse image URLs itself; always go through resolveMedia().
 */

export type MediaProvider = "drive" | "external";
export type MediaStatus = "valid" | "invalid" | "pending";

export interface ResolvedMedia {
  originalUrl: string;
  resolvedUrl: string;
  provider: MediaProvider;
  fileId?: string;
  error?: string;
}

const DRIVE_HOSTS = ["drive.google.com", "docs.google.com", "drive.usercontent.google.com"];

/** Extract a Google Drive file id from any of the common Drive URL shapes. */
export function extractDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/,
    /\/d\/([a-zA-Z0-9_-]{10,})/,
    /[?&]id=([a-zA-Z0-9_-]{10,})/,
    /\/uc\?export=\w+&id=([a-zA-Z0-9_-]{10,})/,
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function detectProvider(url: string): MediaProvider {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (DRIVE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return "drive";
  } catch {
    /* fall through */
  }
  return "external";
}

/** Google Drive → a URL that renders inside an <img> tag. */
export function driveImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
}

/** DriveResolver */
function resolveDrive(url: string): ResolvedMedia {
  const fileId = extractDriveFileId(url);
  if (!fileId) {
    return {
      originalUrl: url,
      resolvedUrl: url,
      provider: "drive",
      error:
        "Could not find a file ID in this Google Drive link. Use a link like https://drive.google.com/file/d/FILE_ID/view",
    };
  }
  return {
    originalUrl: url,
    resolvedUrl: driveImageUrl(fileId),
    provider: "drive",
    fileId,
  };
}

/** DirectImageResolver */
function resolveDirect(url: string): ResolvedMedia {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      originalUrl: url,
      resolvedUrl: url,
      provider: "external",
      error: "This is not a valid URL.",
    };
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return {
      originalUrl: url,
      resolvedUrl: url,
      provider: "external",
      error: "Only http(s) image URLs are supported.",
    };
  }
  return { originalUrl: url, resolvedUrl: parsed.toString(), provider: "external" };
}

/** Provider detector → resolver. */
export function resolveMedia(rawUrl: string): ResolvedMedia {
  const url = rawUrl.trim();
  if (!url) {
    return {
      originalUrl: url,
      resolvedUrl: url,
      provider: "external",
      error: "Please paste an image URL.",
    };
  }
  return detectProvider(url) === "drive" ? resolveDrive(url) : resolveDirect(url);
}
