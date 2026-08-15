export const getApiUrl = () => {
  const url = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!url) {
    console.error("VITE_APPS_SCRIPT_URL is not configured.");
    // Return empty so it fails cleanly without crashing the module load
    return "";
  }
  return url;
};

async function fetchPublic(action: string, params: Record<string, string> = {}) {
  const baseUrl = getApiUrl();
  if (!baseUrl) {
    throw new Error("API URL is not configured. Please set VITE_APPS_SCRIPT_URL.");
  }

  const url = new URL(baseUrl);
  url.searchParams.append("action", action);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    // We use a POST request with method=GET in body? No, for Apps Script doGet handles GETs properly, but we can't always control CORS easily.
    // Actually, simple GET requests to Apps Script Web Apps handle CORS well.
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Unknown API error");
    }

    return data.data;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
}

export const api = {
  getProjects: () => fetchPublic("projects"),
  getProject: (slug: string) => fetchPublic("project", { slug }),
  
  getBlogs: () => fetchPublic("blogs"),
  getBlog: (slug: string) => fetchPublic("blog", { slug }),
  
  getTeam: () => fetchPublic("team"),
  getTeamRoles: () => fetchPublic("teamRoles"),
  
  getAnnouncements: () => fetchPublic("announcements"),
  getFaq: () => fetchPublic("faq"),
  
  getSocialLinks: () => fetchPublic("socialLinks"),
  getSiteSettings: () => fetchPublic("siteSettings"),
  
  getMedia: () => fetchPublic("media"),
};
