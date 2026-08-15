/**
 * ROTARACT SAIBABA COLONY - GOOGLE APPS SCRIPT CMS BACKEND
 * 
 * Instructions:
 * 1. Paste this into Apps Script editor.
 * 2. Add Script Properties: SPREADSHEET_ID, ADMIN_PASSWORD
 * 3. Run setupDatabase().
 * 4. Deploy as Web App (Execute as: Me, Access: Anyone).
 */

const SCRIPT_PROPS = PropertiesService.getScriptProperties();

// Helpers for responses
function jsonResponse(success, dataOrError) {
  const result = { success };
  if (success) {
    result.data = dataOrError;
  } else {
    result.error = dataOrError;
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Ensure preflight requests (OPTIONS) are handled gracefully (usually Apps Script handles this automatically, but just in case)
function doOptions(e) {
  return jsonResponse(true, {});
}

// ---------------------------------------------------------
// HTTP Handlers
// ---------------------------------------------------------

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case "projects":
        return jsonResponse(true, getPublicProjects());
      case "project":
        return jsonResponse(true, getProjectBySlug(e.parameter.slug));
      case "blogs":
        return jsonResponse(true, getPublicBlogs());
      case "blog":
        return jsonResponse(true, getBlogBySlug(e.parameter.slug));
      case "team":
        return jsonResponse(true, getPublicTeam());
      case "teamRoles":
        return jsonResponse(true, getPublicTeamRoles());
      case "announcements":
        return jsonResponse(true, getPublicAnnouncements());
      case "faq":
        return jsonResponse(true, getPublicFAQ());
      case "socialLinks":
        return jsonResponse(true, getPublicSocialLinks());
      case "siteSettings":
        return jsonResponse(true, getPublicSiteSettings());
      case "media":
        return jsonResponse(true, getPublicMedia());
      default:
        return jsonResponse(false, "Invalid GET action");
    }
  } catch (error) {
    return jsonResponse(false, error.message || String(error));
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // Login action doesn't require existing token
    if (action === "login") {
      return handleLogin(body.password);
    }

    // All other POST actions require a valid auth token
    const token = body.authToken;
    if (!verifyToken(token)) {
      return jsonResponse(false, "Unauthorized or expired session.");
    }

    const data = body.data;
    
    switch (action) {
      case "dashboard":
        return jsonResponse(true, getDashboardData());
        
      case "createProject":
        return jsonResponse(true, createRecord("projects", data, "Administrator", "Project"));
      case "updateProject":
        return jsonResponse(true, updateRecord("projects", data.id, data, "Administrator", "Project"));
      case "deleteProject":
        return jsonResponse(true, deleteRecord("projects", data.id, "Administrator", "Project"));
        
      case "createBlog":
        return jsonResponse(true, createRecord("blogs", data, "Administrator", "Blog Post"));
      case "updateBlog":
        return jsonResponse(true, updateRecord("blogs", data.id, data, "Administrator", "Blog Post"));
      case "deleteBlog":
        return jsonResponse(true, deleteRecord("blogs", data.id, "Administrator", "Blog Post"));
        
      case "createTeamMember":
        return jsonResponse(true, createRecord("team", data, "Administrator", "Team Member"));
      case "updateTeamMember":
        return jsonResponse(true, updateRecord("team", data.id, data, "Administrator", "Team Member"));
      case "deleteTeamMember":
        return jsonResponse(true, deleteRecord("team", data.id, "Administrator", "Team Member"));
        
      case "createTeamRole":
        return jsonResponse(true, createRecord("team_roles", data, "Administrator", "Team Role"));
      case "updateTeamRole":
        return jsonResponse(true, updateRecord("team_roles", data.id, data, "Administrator", "Team Role"));
      case "deleteTeamRole":
        return jsonResponse(true, deleteTeamRole(data.id, "Administrator")); // Specialized deletion to check member usage
        
      case "createAnnouncement":
        return jsonResponse(true, createRecord("announcements", data, "Administrator", "Announcement"));
      case "updateAnnouncement":
        return jsonResponse(true, updateRecord("announcements", data.id, data, "Administrator", "Announcement"));
      case "deleteAnnouncement":
        return jsonResponse(true, deleteRecord("announcements", data.id, "Administrator", "Announcement"));
        
      case "createFAQ":
        return jsonResponse(true, createRecord("faq", data, "Administrator", "FAQ"));
      case "updateFAQ":
        return jsonResponse(true, updateRecord("faq", data.id, data, "Administrator", "FAQ"));
      case "deleteFAQ":
        return jsonResponse(true, deleteRecord("faq", data.id, "Administrator", "FAQ"));
        
      case "createMedia":
        return jsonResponse(true, handleMediaCreate(data, "Administrator"));
      case "updateMedia":
        return jsonResponse(true, handleMediaUpdate(data.id, data, "Administrator"));
      case "deleteMedia":
        return jsonResponse(true, deleteRecord("media", data.id, "Administrator", "Media"));
        
      case "updateSiteSetting":
        return jsonResponse(true, updateSiteSetting(data.key, data.value, "Administrator"));
        
      case "createSocialLink":
        return jsonResponse(true, createRecord("social_links", data, "Administrator", "Social Link"));
      case "updateSocialLink":
        return jsonResponse(true, updateRecord("social_links", data.id, data, "Administrator", "Social Link"));
      case "deleteSocialLink":
        return jsonResponse(true, deleteRecord("social_links", data.id, "Administrator", "Social Link"));

      case "getAdminData":
        return jsonResponse(true, getAdminData(data.sheet)); // Allows fetching unfiltered lists for admin tables
        
      default:
        return jsonResponse(false, "Invalid POST action");
    }
  } catch (error) {
    return jsonResponse(false, error.message || String(error));
  }
}

// ---------------------------------------------------------
// Auth & Security
// ---------------------------------------------------------

function handleLogin(password) {
  const adminPassword = SCRIPT_PROPS.getProperty("ADMIN_PASSWORD");
  if (!adminPassword) {
    throw new Error("Server not configured properly. Missing ADMIN_PASSWORD.");
  }
  
  if (password === adminPassword) {
    const token = generateToken();
    return jsonResponse(true, { token: token });
  } else {
    return jsonResponse(false, "Invalid password");
  }
}

function generateToken() {
  const secret = SCRIPT_PROPS.getProperty("ADMIN_PASSWORD");
  const now = new Date().getTime();
  const expires = now + (2 * 60 * 60 * 1000); // 2 hours
  const payload = {
    id: Utilities.getUuid(),
    iat: now,
    exp: expires
  };
  const payloadStr = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const signature = Utilities.computeHmacSha256Signature(payloadStr, secret);
  const signatureStr = Utilities.base64EncodeWebSafe(signature);
  return `${payloadStr}.${signatureStr}`;
}

function verifyToken(token) {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    
    const secret = SCRIPT_PROPS.getProperty("ADMIN_PASSWORD");
    const payloadStr = parts[0];
    const signatureStr = parts[1];
    
    const expectedSignature = Utilities.computeHmacSha256Signature(payloadStr, secret);
    const expectedSignatureStr = Utilities.base64EncodeWebSafe(expectedSignature);
    
    if (signatureStr !== expectedSignatureStr) return false;
    
    const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(payloadStr)).getDataAsString());
    const now = new Date().getTime();
    
    if (now > payload.exp) return false;
    return true;
  } catch (e) {
    return false;
  }
}

// ---------------------------------------------------------
// Spreadsheet Abstractions
// ---------------------------------------------------------

function getSpreadsheet() {
  const ssId = SCRIPT_PROPS.getProperty("SPREADSHEET_ID") || "1E6EuqOgNDlaJbuPD-3Bhit-S4Gc_ihDTJVsOZ4N8niI";
  if (!ssId) throw new Error("SPREADSHEET_ID is not configured.");
  return SpreadsheetApp.openById(ssId);
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found.`);
  return sheet;
}

function getHeaders(sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  return range.getValues()[0];
}

function getRecords(sheetName) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow <= 1) return []; // Only headers
  
  const headers = getHeaders(sheet);
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  return data.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] === "" ? null : row[i];
    });
    return obj;
  });
}

function findRecordById(sheetName, id) {
  const records = getRecords(sheetName);
  return records.find(r => String(r.id) === String(id)) || null;
}

function findRecordBySlug(sheetName, slug) {
  const records = getRecords(sheetName);
  return records.find(r => String(r.slug) === String(slug)) || null;
}

function createRecord(sheetName, data, admin, entityType) {
  const sheet = getSheet(sheetName);
  const headers = getHeaders(sheet);
  
  if (!data.id) data.id = Utilities.getUuid();
  data.created_at = new Date().toISOString();
  data.updated_at = data.created_at;

  // Auto-slugify if title exists and slug doesn't (or is empty)
  if (data.title && !data.slug) {
    data.slug = slugify(data.title);
  }
  
  // Check duplicate slugs
  if (data.slug) {
    const existing = findRecordBySlug(sheetName, data.slug);
    if (existing) throw new Error("Slug already exists. Please choose a unique slug.");
  }

  const row = headers.map(h => data[h] !== undefined ? data[h] : "");
  sheet.appendRow(row);
  
  logActivity(admin, "Created", entityType, data.title || data.name || data.id);
  
  return data;
}

function updateRecord(sheetName, id, data, admin, entityType) {
  const sheet = getSheet(sheetName);
  const headers = getHeaders(sheet);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow <= 1) throw new Error("Record not found.");
  
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const rowIndex = ids.findIndex(val => String(val) === String(id));
  
  if (rowIndex === -1) throw new Error("Record not found.");
  
  data.updated_at = new Date().toISOString();

  // Check duplicate slugs on update
  if (data.slug) {
    const existing = findRecordBySlug(sheetName, data.slug);
    if (existing && String(existing.id) !== String(id)) {
      throw new Error("Slug already exists. Please choose a unique slug.");
    }
  }

  // Get current record to preserve unmodified fields
  const currentRecord = findRecordById(sheetName, id);
  const updatedData = { ...currentRecord, ...data };

  const row = headers.map(h => updatedData[h] !== undefined ? updatedData[h] : "");
  sheet.getRange(rowIndex + 2, 1, 1, lastCol).setValues([row]);
  
  logActivity(admin, "Updated", entityType, data.title || data.name || id);
  
  return updatedData;
}

function deleteRecord(sheetName, id, admin, entityType) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) throw new Error("Record not found.");
  
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const rowIndex = ids.findIndex(val => String(val) === String(id));
  
  if (rowIndex === -1) throw new Error("Record not found.");
  
  const currentRecord = findRecordById(sheetName, id);
  const identifier = currentRecord.title || currentRecord.name || id;

  sheet.deleteRow(rowIndex + 2);
  
  logActivity(admin, "Deleted", entityType, identifier);
  
  return { id, deleted: true };
}

// ---------------------------------------------------------
// Specific Logic Operations
// ---------------------------------------------------------

function deleteTeamRole(roleId, admin) {
  // Check if role is used by any team members
  const teamMembers = getRecords("team");
  const usersWithRole = teamMembers.filter(m => String(m.role_id) === String(roleId));
  
  if (usersWithRole.length > 0) {
    throw new Error(`This role is currently assigned to ${usersWithRole.length} team members. Reassign them before deleting.`);
  }
  
  return deleteRecord("team_roles", roleId, admin, "Team Role");
}

function handleMediaCreate(data, admin) {
  if (data.original_url && data.original_url.includes("drive.google.com")) {
    const fileId = extractGoogleDriveId(data.original_url);
    if (fileId) {
      data.file_id = fileId;
      data.provider = "drive";
    } else {
      throw new Error("Invalid Google Drive URL.");
    }
  }
  return createRecord("media", data, admin, "Media");
}

function handleMediaUpdate(id, data, admin) {
  if (data.original_url && data.original_url.includes("drive.google.com")) {
    const fileId = extractGoogleDriveId(data.original_url);
    if (fileId) {
      data.file_id = fileId;
      data.provider = "drive";
    } else {
      throw new Error("Invalid Google Drive URL.");
    }
  }
  return updateRecord("media", id, data, admin, "Media");
}

function updateSiteSetting(key, value, admin) {
  const sheet = getSheet("site_settings");
  const lastRow = sheet.getLastRow();
  
  let rowIndex = -1;
  if (lastRow > 1) {
    const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    rowIndex = keys.findIndex(val => String(val) === String(key));
  }
  
  const updated_at = new Date().toISOString();

  if (rowIndex > -1) {
    sheet.getRange(rowIndex + 2, 2, 1, 1).setValue(value);
    sheet.getRange(rowIndex + 2, 4, 1, 1).setValue(updated_at);
  } else {
    sheet.appendRow([key, value, "", updated_at]);
  }
  
  logActivity(admin, "Updated", "Site Setting", key);
  return { key, value };
}

function logActivity(admin, action, entity, entityId) {
  try {
    const sheet = getSheet("activity_logs");
    sheet.appendRow([
      Utilities.getUuid(),
      admin,
      action,
      entity,
      entityId,
      new Date().toISOString()
    ]);
  } catch (e) {
    // Silently fail activity logging if there's an issue
  }
}

// ---------------------------------------------------------
// Public API Readers (Filtered for "published" usually)
// ---------------------------------------------------------

function getPublicProjects() {
  const all = getRecords("projects");
  return all.filter(p => p.status === "published");
}

function getProjectBySlug(slug) {
  const record = findRecordBySlug("projects", slug);
  if (!record || record.status !== "published") throw new Error("Project not found");
  return record;
}

function getPublicBlogs() {
  const all = getRecords("blogs");
  return all.filter(b => b.status === "published");
}

function getBlogBySlug(slug) {
  const record = findRecordBySlug("blogs", slug);
  if (!record || record.status !== "published") throw new Error("Blog not found");
  return record;
}

function getPublicTeam() {
  const all = getRecords("team");
  return all.filter(t => t.status === "published" || t.status === "active").sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
}

function getPublicTeamRoles() {
  const all = getRecords("team_roles");
  return all.filter(tr => String(tr.active) !== "false" && String(tr.active) !== "FALSE").sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
}

function getPublicAnnouncements() {
  const all = getRecords("announcements");
  return all.filter(a => String(a.published) === "true" || String(a.published) === "TRUE").sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
}

function getPublicFAQ() {
  const all = getRecords("faq");
  return all.filter(f => String(f.published) === "true" || String(f.published) === "TRUE").sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
}

function getPublicSocialLinks() {
  const all = getRecords("social_links");
  return all.filter(s => String(s.active) !== "false" && String(s.active) !== "FALSE").sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
}

function getPublicMedia() {
  return getRecords("media");
}

function getPublicSiteSettings() {
  const records = getRecords("site_settings");
  const settings = {};
  records.forEach(r => {
    if (r.key) settings[r.key] = r.value;
  });
  return settings;
}

// ---------------------------------------------------------
// Admin Readers
// ---------------------------------------------------------

function getAdminData(sheetName) {
  return getRecords(sheetName);
}

function getDashboardData() {
  const projects = getRecords("projects");
  const blogs = getRecords("blogs");
  const team = getRecords("team");
  const activity = getRecords("activity_logs").slice(-5).reverse(); // Last 5

  return {
    metrics: {
      totalProjects: projects.length,
      publishedProjects: projects.filter(p => p.status === "published").length,
      totalBlogs: blogs.length,
      totalTeam: team.length
    },
    activity
  };
}


// ---------------------------------------------------------
// Utils
// ---------------------------------------------------------

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function extractGoogleDriveId(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?id=([^&]+)/
  ];
  for (let pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// ---------------------------------------------------------
// Database Setup
// ---------------------------------------------------------

function setupDatabase() {
  const ssId = SCRIPT_PROPS.getProperty("SPREADSHEET_ID") || "1E6EuqOgNDlaJbuPD-3Bhit-S4Gc_ihDTJVsOZ4N8niI";
  if (!ssId) {
    Logger.log("Please set SPREADSHEET_ID in Script Properties before running setupDatabase.");
    return;
  }
  const ss = SpreadsheetApp.openById(ssId);
  
  const requiredSheets = {
    "projects": ["id","slug","title","category","project_type","short_description","full_description","date","start_time","end_time","venue","location","year","cover_image","gallery_images","organizers","partners","featured","status","created_at","updated_at"],
    "blogs": ["id","slug","title","category","author","excerpt","content","cover_image","inline_images","reading_time","published_date","featured","status","seo_title","seo_description","created_at","updated_at"],
    "team": ["id","name","role_id","year","short_description","bio","photo","email","phone","linkedin","instagram","display_order","featured","status","created_at","updated_at"],
    "team_roles": ["id","role_name","role_description","role_category","display_order","active"],
    "announcements": ["id","title","message","priority","start_date","end_date","published","display_order","created_at","updated_at"],
    "faq": ["id","question","answer","category","display_order","published"],
    "social_links": ["id","platform","url","icon","display_order","active"],
    "media": ["id","title","original_url","file_id","provider","alt_text","width","height","category","created_at","updated_at"],
    "site_settings": ["key","value","description","updated_at"],
    "activity_logs": ["id","admin","action","entity","entity_id","timestamp"]
  };

  for (const [sheetName, headers] of Object.entries(requiredSheets)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log(`Created sheet: ${sheetName}`);
    } else {
      // Check headers
      const lastCol = sheet.getLastColumn() || 1;
      const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      if (existingHeaders.length === 0 || existingHeaders[0] === "") {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        Logger.log(`Added headers to existing sheet: ${sheetName}`);
      }
    }
  }
  
  Logger.log("Database setup complete.");
}
