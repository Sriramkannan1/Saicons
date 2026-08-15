/**
 * Central data access layer for the public website.
 *
 * This now uses the live Google Apps Script API via src/lib/api.ts.
 */

import { api } from "./api";

function resolveDriveImage(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?id=([^&]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Use thumbnail for robust frontend rendering of Drive images
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
  }
  return url;
}

// We keep the types for backwards compatibility with the UI components
export type Event = any;
export type EventCategory = string;
export type BlogPost = any;
export type BlogCategory = string;
export type TeamMember = any;
export type Faq = any;
export type Announcement = any;

/* --------------------------------- events ---------------------------------- */

export const eventsData = {
  listPublished: async (): Promise<Event[]> => {
    try {
      const projects = await api.getProjects();
      return projects.filter((p: any) => p.status === "published").map(mapProjectToEvent);
    } catch (e) {
      console.error("Failed to load events", e);
      return [];
    }
  },

  bySlug: async (slug: string): Promise<Event | null> => {
    try {
      const project = await api.getProject(slug);
      return project ? mapProjectToEvent(project) : null;
    } catch (e) {
      console.error("Failed to load event", e);
      return null;
    }
  },

  categories: async (): Promise<EventCategory[]> => {
    return [
      { id: "cat-1", name: "Community Service", slug: "community-service" },
      { id: "cat-2", name: "Professional Development", slug: "professional-development" },
      { id: "cat-3", name: "Club Service", slug: "club-service" },
      { id: "cat-4", name: "International Service", slug: "international-service" }
    ] as any;
  },

  gallery: async (_eventId: string): Promise<never[]> => {
    return [];
  },
};

function mapProjectToEvent(p: any): Event {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    summary: p.short_description || null,
    description: p.full_description || null,
    event_date: p.date || null,
    start_time: p.start_time || null,
    end_time: p.end_time || null,
    venue: p.venue || null,
    organizers: p.organizers || null,
    partners: null,
    status: p.status,
    featured: String(p.featured) === "true",
    cover: p.cover_image ? { id: "img", original_url: p.cover_image, provider: "drive" } : null,
    category: p.category ? { id: p.category, name: p.category, slug: p.category.toLowerCase().replace(/\s+/g, '-') } : null,
    category_id: p.category || null,
    created_at: p.timestamp || new Date().toISOString()
  };
}

/* ---------------------------------- blog ----------------------------------- */

export const blogsData = {
  listPublished: async (): Promise<BlogPost[]> => {
    try {
      const blogs = await api.getBlogs();
      return blogs.filter((b: any) => b.status === "published").map(mapBlog);
    } catch (e) {
      console.error("Failed to load blogs", e);
      return [];
    }
  },

  bySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      const blog = await api.getBlog(slug);
      return blog ? mapBlog(blog) : null;
    } catch (e) {
      console.error("Failed to load blog", e);
      return null;
    }
  },

  categories: async (): Promise<BlogCategory[]> => {
    return [] as any;
  },
};

function mapBlog(b: any): BlogPost {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt || "",
    content: b.content || "",
    published_at: b.published_date || b.timestamp,
    author: b.author ? { name: b.author } : { name: "SAICONS Admin" },
    status: b.status,
    featured: String(b.featured) === "true",
    cover: b.cover_image ? { id: "img", original_url: b.cover_image, provider: "drive" } : null,
    category: b.category ? { id: b.category, name: b.category, slug: b.category.toLowerCase() } : null
  };
}

/* ---------------------------------- team ----------------------------------- */

export const teamData = {
  listActive: async (): Promise<TeamMember[]> => {
    try {
      const members = await api.getTeam();
      const roles = await api.getTeamRoles();
      
      return members
        .filter((m: any) => m.status === "active" || m.status === "published")
        .map((m: any) => {
          const role = roles.find((r: any) => String(r.id) === String(m.role_id));
          return {
            id: m.id,
            name: m.name,
            role: role ? { name: role.role_name, category: role.role_category } : { name: m.role_id, category: "General" },
            image: m.photo ? { id: "img", original_url: resolveDriveImage(m.photo) || m.photo, provider: "drive" } : null,
            bio: m.bio || m.short_description || "",
            socialLinks: [
              ...(m.linkedin ? [{ platform: "linkedin", url: m.linkedin }] : []),
              ...(m.instagram ? [{ platform: "instagram", url: m.instagram }] : [])
            ],
            active: true
          };
      });
    } catch (e) {
      console.error("Failed to load team", e);
      return [];
    }
  },
};

/* ---------------------------------- faqs ----------------------------------- */

export const faqData = {
  list: async (): Promise<Faq[]> => {
    try {
      const faqs = await api.getFaq();
      return faqs.filter((f: any) => String(f.published) !== "false").map((f: any) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category || "General"
      }));
    } catch (e) {
      console.error("Failed to load FAQs", e);
      return [];
    }
  },
};

/* ------------------------------- announcements ----------------------------- */

export const announcementsData = {
  listActive: async (): Promise<Announcement[]> => {
    try {
      const anns = await api.getAnnouncements();
      return anns.filter((a: any) => String(a.published) !== "false").map((a: any) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        priority: a.priority || "normal",
        startDate: a.start_date || null,
        endDate: a.end_date || null
      }));
    } catch (e) {
      console.error("Failed to load announcements", e);
      return [];
    }
  },
};

/* ------------------------------- site settings ----------------------------- */

export const siteData = {
  getSettings: async () => {
    try {
      const raw = await api.getSiteSettings();
      const settingsMap: Record<string, string> = raw || {};
      
      const parsedPhones: {name: string, number: string}[] = [];
      const phoneIndices = Object.keys(settingsMap)
        .filter(k => k.startsWith('phone_number_'))
        .map(k => parseInt(k.split('_')[2]))
        .sort((a,b) => a - b);
        
      phoneIndices.forEach(idx => {
        if (settingsMap[`phone_number_${idx}`]) {
          parsedPhones.push({
            name: settingsMap[`phone_name_${idx}`] || "",
            number: settingsMap[`phone_number_${idx}`]
          });
        }
      });

      // Maintain legacy phone property for the contact form, and add phones array
      const legacyPhone = parsedPhones.length > 0 ? parsedPhones[0].number : (settingsMap.phone || "");

      return {
        clubName: settingsMap.club_name || "Rotaract Club of Saibaba Colony",
        shortName: settingsMap.short_name || "SAICONS",
        communityName: "Team " + (settingsMap.short_name || "SAICONS"),
        established: settingsMap.established || "1990-91",
        currentDistrict: settingsMap.ri_district || "RI District 3206",
        group: settingsMap.group || "Group 1",
        tagline: settingsMap.tagline || "Service · Leadership · Fellowship",
        location: settingsMap.address || "Coimbatore, Tamil Nadu, India",
        mapQuery: settingsMap.map_location || settingsMap.address || "Saibaba Colony, Coimbatore",
        phone: legacyPhone,
        phones: parsedPhones,
        email: settingsMap.email || "",
        footerText: settingsMap.footer_text || "Rotaract Club of Saibaba Colony",
        logoUrl: settingsMap.logo_url || "",
      };
    } catch (e) {
      console.error("Failed to load site settings", e);
      return {
        clubName: "Rotaract Club of Saibaba Colony",
        shortName: "SAICONS",
        communityName: "Team SAICONS",
        established: "1990-91",
        currentDistrict: "RI District 3206",
        group: "Group 1",
        tagline: "Service · Leadership · Fellowship",
        location: "Saibaba Colony, Coimbatore, Tamil Nadu, India",
        mapQuery: "Saibaba Colony, Coimbatore",
        phone: "",
        phones: [],
        email: "",
        footerText: "Rotaract Club of Saibaba Colony",
        logoUrl: "",
      };
    }
  },
  
  getSocialLinks: async () => {
    try {
      const links = await api.getSocialLinks();
      return links.filter((l: any) => String(l.active) !== "false").map((l: any) => ({
        platform: l.platform.toLowerCase(),
        label: l.platform,
        url: l.url,
        icon: l.icon || l.platform
      }));
    } catch (e) {
      console.error("Failed to load social links", e);
      return [];
    }
  }
};
