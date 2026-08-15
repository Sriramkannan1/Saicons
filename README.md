# Rotaract Club of Saibaba Colony — SAICONS

Welcome to the frontend application for the Rotaract Club of Saibaba Colony (SAICONS).

This is a modern, responsive React web application built with TanStack Start, designed to showcase the club's history, initiatives, events, and community impact.

## Architecture & Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (SSR-first React framework)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: Tailwind CSS with custom CSS variables and glassmorphism UI
- **Data Layer**: Local, statically typed data layer (`src/data/`) wrapped behind a unified abstraction (`src/lib/data.ts`).
- **Media**: A centralized media registry (`src/data/media.ts`) supporting direct image URLs or Google Drive Share URLs.

## Development Setup

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Content Management (Pre-CMS Phase)

Currently, the application runs entirely on static data managed directly in code. This provides a robust, fast, and easily deployable frontend before a backend CMS is introduced.

All content is managed in the `src/data/` directory:

- `site.ts`: Club identity, global constants, and social links.
- `home.ts`, `about.ts`, `join.ts`, `contact.ts`: Page-specific copy and sections.
- `events.ts`, `blogs.ts`: Event and blog post collections.
- `team.ts`: Current year's board and directors.
- `faqs.ts`: Frequently asked questions.
- `announcements.ts`: Global announcement bar text.

### Media Registry

To add an image to the site without hardcoding URLs deep in the component tree:

1. Upload the image to Google Drive and set sharing to **"Anyone with the link can view"**.
2. Add an entry to `src/data/media.ts` under the `ASSETS` registry.
3. Reference the asset anywhere in the code.

```typescript
// In src/data/media.ts
export const ASSETS = {
  // ...
  "my-new-image": {
    url: "https://drive.google.com/file/d/YOUR_DRIVE_ID/view?usp=sharing",
    alt_text: "Description of the image",
  },
} as const;
```

## Legacy Infrastructure Removal

This project has been intentionally cleaned of platform-specific infrastructure:

- **No Supabase**: The `src/integrations/supabase/` and all database hooks have been removed.
- **No Lovable**: Platform error wrappers and proprietary build configs have been removed.
- **No Authentication**: The application is strictly a public-facing website.

To re-introduce a CMS in the future, simply update `src/lib/data.ts` to fetch from your new backend, leaving the UI components largely untouched.
