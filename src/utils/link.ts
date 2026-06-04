// Helper to clean up typos and ensure absolute paths have leading slashes
export const normalizeLink = (link?: string, defaultLink = "/") => {
  if (!link) return defaultLink;
  let normalized = link.trim();
  
  if (
    normalized.startsWith("http://") || 
    normalized.startsWith("https://") || 
    normalized.startsWith("mailto:") || 
    normalized.startsWith("tel:")
  ) {
    return normalized;
  }
  
  // Clean trailing slash
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  
  // Map common misspelled or wrong paths to the correct ones
  const path = normalized.toLowerCase().replace(/^\/+/, "");
  if (path === "acadimc" || path === "academies" || path === "academy") {
    return "/academies";
  }
  if (path === "trips" || path === "trip") {
    return "/trips";
  }
  if (path === "store" || path === "shop" || path === "products") {
    return "/store";
  }
  if (path === "programs" || path === "program") {
    return "/programs";
  }
  if (path === "about" || path === "our-story") {
    return "/about";
  }
  
  // Ensure leading slash
  if (!normalized.startsWith("/") && !normalized.startsWith("#")) {
    normalized = "/" + normalized;
  }
  
  return normalized;
};
