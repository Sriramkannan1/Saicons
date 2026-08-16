import { getApiUrl } from "./api";

// Simple in-memory token store for the client session.
// In a real app, this might be in sessionStorage or a secure HttpOnly cookie managed by a proxy,
// but for a purely client-side interaction with Apps Script without a proxy, we use a global variable / sessionStorage.
let sessionToken = "";

export const setAdminToken = (token: string) => {
  sessionToken = token;
  if (typeof window !== "undefined") {
    sessionStorage.setItem("admin_token", token);
  }
};

export const getAdminToken = () => {
  if (!sessionToken && typeof window !== "undefined") {
    sessionToken = sessionStorage.getItem("admin_token") || "";
  }
  return sessionToken;
};

export const clearAdminToken = () => {
  sessionToken = "";
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("admin_token");
  }
};

async function fetchAdmin(action: string, data: any = {}) {
  const baseUrl = getApiUrl();
  if (!baseUrl) {
    throw new Error("API URL is not configured. Please set VITE_APPS_SCRIPT_URL.");
  }

  // Login action doesn't require token
  const token = action === "login" ? "" : getAdminToken();
  if (action !== "login" && !token) {
    throw new Error("Unauthorized: Please log in.");
  }

  const payload: Record<string, any> = {
    action,
    authToken: token,
    data,
  };
  
  if (action === "login") {
    payload.password = data.password;
    delete payload.data;
  }

  try {
    // Note: Apps Script expects POST requests for doPost to be either form data or text/plain if we want to avoid CORS preflight issues on some setups, 
    // but typically fetch with text/plain is safest for cross-origin without preflight.
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain", // Avoids CORS preflight that Apps Script sometimes fails
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      if (result.error === "Unauthorized or expired session.") {
        clearAdminToken();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
      throw new Error(result.error || "Unknown API error");
    }

    return result.data;
  } catch (error) {
    console.error(`Admin API Error (${action}):`, error);
    throw error;
  }
}

export const adminApi = {
  login: (password: string) => fetchAdmin("login", { password }),
  
  getDashboard: () => fetchAdmin("dashboard"),
  getAdminData: (sheet: string) => fetchAdmin("getAdminData", { sheet }), // Raw data for admin tables
  
  createProject: (data: any) => fetchAdmin("createProject", data),
  updateProject: (data: any) => fetchAdmin("updateProject", data),
  deleteProject: (id: string) => fetchAdmin("deleteProject", { id }),
  
  createBlog: (data: any) => fetchAdmin("createBlog", data),
  updateBlog: (data: any) => fetchAdmin("updateBlog", data),
  deleteBlog: (id: string) => fetchAdmin("deleteBlog", { id }),
  
  createTeamMember: (data: any) => fetchAdmin("createTeamMember", data),
  updateTeamMember: (data: any) => fetchAdmin("updateTeamMember", data),
  deleteTeamMember: (id: string) => fetchAdmin("deleteTeamMember", { id }),
  
  createTeamRole: (data: any) => fetchAdmin("createTeamRole", data),
  updateTeamRole: (data: any) => fetchAdmin("updateTeamRole", data),
  deleteTeamRole: (id: string) => fetchAdmin("deleteTeamRole", { id }),
  
  createAnnouncement: (data: any) => fetchAdmin("createAnnouncement", data),
  updateAnnouncement: (data: any) => fetchAdmin("updateAnnouncement", data),
  deleteAnnouncement: (id: string) => fetchAdmin("deleteAnnouncement", { id }),
  
  createFAQ: (data: any) => fetchAdmin("createFAQ", data),
  updateFAQ: (data: any) => fetchAdmin("updateFAQ", data),
  deleteFAQ: (id: string) => fetchAdmin("deleteFAQ", { id }),
  
  createMedia: (data: any) => fetchAdmin("createMedia", data),
  updateMedia: (data: any) => fetchAdmin("updateMedia", data),
  deleteMedia: (id: string) => fetchAdmin("deleteMedia", { id }),
  
  updateSiteSetting: (key: string, value: string) => fetchAdmin("updateSiteSetting", { key, value }),
  
  createSocialLink: (data: any) => fetchAdmin("createSocialLink", data),
  updateSocialLink: (data: any) => fetchAdmin("updateSocialLink", data),
  deleteSocialLink: (id: string) => fetchAdmin("deleteSocialLink", { id }),
};
