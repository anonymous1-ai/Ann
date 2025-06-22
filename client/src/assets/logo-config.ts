// Logo configuration
// To use your own logo, follow these steps:

// 1. Add your logo file to this assets folder (e.g., logo.png, logo.svg)
// 2. Update the CUSTOM_LOGO_PATH below to point to your logo file
// 3. Set USE_CUSTOM_LOGO to true

export const USE_CUSTOM_LOGO = false;
export const CUSTOM_LOGO_PATH = "/src/assets/your-logo.png";

// Current logo (will be replaced when USE_CUSTOM_LOGO is true)
export const DEFAULT_LOGO_PATH =
  "/attached_assets/20250622_1244_Silently AI Emblem_simple_compose_01jyb7s2hme26ajk4rcxbpe3se_1750587992544.png";

export const getLogoPath = () => {
  return USE_CUSTOM_LOGO ? CUSTOM_LOGO_PATH : DEFAULT_LOGO_PATH;
};
