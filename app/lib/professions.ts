export const HANDYMAN_PROFESSIONS = [
  "Plumber",
  "Electrician",
  "Painter",
  "Carpenter",
  "HVAC Technician",
  "Locksmith",
  "General Handyman",
  "Tile Installer",
  "Drywall Repair",
  "Flooring Installer"
] as const;

export type HandymanProfession = (typeof HANDYMAN_PROFESSIONS)[number];
