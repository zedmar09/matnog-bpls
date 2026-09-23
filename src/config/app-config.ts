export const APP_CONFIG = {
  name: "Matnog BPLS",
  municipality: "Matnog, Sorsogon",
  description:
    "Business registration, licensing, assessment, payment, permit issuance, and compliance for Matnog, Sorsogon.",
  preview: true,
} as const;
export const PUBLIC_NAVIGATION = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Visit Matnog", href: "/visit" },
  { label: "Advisories", href: "/advisories" },
  { label: "Projects", href: "/projects" },
  { label: "Transparency", href: "/transparency" },
] as const;
