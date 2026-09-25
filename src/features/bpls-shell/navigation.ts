import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  ScrollText,
} from "lucide-react";

export type NavChild = {
  label: string;
  path: string;
};

export type NavItem = {
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavChild[];
  badge?: number;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

const pages = (base: string, entries: Array<[string, string]>): NavChild[] =>
  entries.map(([label, suffix]) => ({
    label,
    path: suffix ? `${base}/${suffix}` : base,
  }));

export const HOME_ITEM: NavItem = {
  label: "Dashboard",
  icon: LayoutDashboard,
  path: "/",
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main Menu",
    items: [
      {
        label: "Applications",
        icon: FileText,
        children: pages("/applications", [
          ["All applications", ""],
          ["New registration", "new"],
          ["Renewals", "renewals"],
        ]),
      },
      {
        label: "Businesses",
        icon: Building2,
        children: pages("/businesses", [
          ["Business registry", ""],
          ["Map view", "map"],
        ]),
      },
      {
        label: "Assessment",
        icon: CircleDollarSign,
        children: pages("/assessment", [
          ["Fee computation", ""],
          ["Statements of account", "statements"],
        ]),
      },
      {
        label: "Payments",
        icon: CreditCard,
        children: pages("/payments", [
          ["Payment records", ""],
          ["Order of payment", "order"],
        ]),
      },
      {
        label: "Reviews",
        icon: ClipboardCheck,
        children: pages("/reviews", [
          ["Review queue", ""],
          ["Departmental clearances", "clearances"],
          ["Inspections", "inspections"],
        ]),
      },
      {
        label: "Permits",
        icon: ScrollText,
        children: pages("/permits", [
          ["For release", ""],
          ["Issued permits", "issued"],
          ["Mayor's permit", "mayors-permit"],
        ]),
      },
      {
        label: "Compliance",
        icon: BadgeCheck,
        path: "/compliance",
      },
    ],
  },
];
