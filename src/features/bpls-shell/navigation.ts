export type NavigationChild = {
  label: string;
  href: string;
};

export type NavigationKey =
  | "dashboard"
  | "applications"
  | "businesses"
  | "reviews"
  | "payments"
  | "permits"
  | "reports"
  | "administration";

export type NavigationItem = {
  key: NavigationKey;
  label: string;
  href: string;
  children?: readonly NavigationChild[];
};

export const BPLS_NAVIGATION: readonly NavigationItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/" },
  {
    key: "applications",
    label: "Applications",
    href: "/applications",
    children: [
      { label: "All applications", href: "/applications" },
      { label: "New registrations", href: "/applications/new-registrations" },
      { label: "Renewals", href: "/applications/renewals" },
      { label: "Amendments", href: "/applications/amendments" },
      { label: "Closure and retirement", href: "/applications/closures" },
      { label: "Corrections required", href: "/applications/corrections" },
      { label: "Archived applications", href: "/applications/archive" },
    ],
  },
  {
    key: "businesses",
    label: "Businesses",
    href: "/businesses",
    children: [
      { label: "Business registry", href: "/businesses" },
      { label: "Establishments and branches", href: "/businesses/establishments" },
      { label: "Business activities", href: "/businesses/activities" },
      { label: "Expiring permits", href: "/businesses/expiring-permits" },
      { label: "GIS business map", href: "/businesses/map" },
    ],
  },
  {
    key: "reviews",
    label: "Reviews",
    href: "/reviews",
    children: [
      { label: "Review queue", href: "/reviews" },
      { label: "Zoning and locational", href: "/reviews/zoning" },
      { label: "Health and sanitary", href: "/reviews/health" },
      { label: "Fire safety and FSIC", href: "/reviews/fire-safety" },
      { label: "Other office reviews", href: "/reviews/other-offices" },
      { label: "Inspection schedule", href: "/reviews/inspections" },
      { label: "Findings and reinspection", href: "/reviews/findings" },
      { label: "Compliance monitoring", href: "/reviews/compliance" },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    href: "/payments",
    children: [
      { label: "Assessments", href: "/payments/assessments" },
      { label: "Statements of account", href: "/payments/statements" },
      { label: "Cashier and collections", href: "/payments/collections" },
      { label: "Online payments", href: "/payments/online" },
      { label: "Official receipts", href: "/payments/receipts" },
      { label: "Reconciliation", href: "/payments/reconciliation" },
      { label: "Adjustments and refunds", href: "/payments/adjustments" },
      { label: "Payment exceptions", href: "/payments/exceptions" },
    ],
  },
  {
    key: "permits",
    label: "Permits",
    href: "/permits",
    children: [
      { label: "For final approval", href: "/permits/final-approval" },
      { label: "For signature", href: "/permits/signature" },
      { label: "For release", href: "/permits/release" },
      { label: "Issued permits", href: "/permits/issued" },
      { label: "Suspended or revoked", href: "/permits/restricted" },
      { label: "Permit verification", href: "/permits/verification" },
      { label: "Permit templates", href: "/permits/templates" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    href: "/reports",
    children: [
      { label: "Executive dashboard", href: "/reports" },
      { label: "Revenue collection", href: "/reports/revenue" },
      { label: "Permit issuance", href: "/reports/permits" },
      { label: "Processing performance", href: "/reports/performance" },
      { label: "Compliance reports", href: "/reports/compliance" },
      { label: "Inspection reports", href: "/reports/inspections" },
      { label: "GIS and barangay statistics", href: "/reports/gis" },
      { label: "Report builder", href: "/reports/builder" },
      { label: "Scheduled reports", href: "/reports/scheduled" },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    href: "/administration",
    children: [
      { label: "Users and roles", href: "/administration/users" },
      { label: "Offices and reviewers", href: "/administration/offices" },
      { label: "Requirements matrix", href: "/administration/requirements" },
      { label: "Fee and ordinance rules", href: "/administration/fees" },
      { label: "Workflow configuration", href: "/administration/workflows" },
      { label: "Inspection checklists", href: "/administration/inspections" },
      { label: "Signatories and delegation", href: "/administration/signatories" },
      { label: "Notification templates", href: "/administration/notifications" },
      { label: "Integrations", href: "/administration/integrations" },
      { label: "Audit trail", href: "/administration/audit" },
      { label: "System settings", href: "/administration/settings" },
    ],
  },
] as const;
