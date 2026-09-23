"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bell,
  BookOpenText,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Search,
  Settings2,
  WalletCards,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

import styles from "./bpls-shell.module.css";
import { BPLS_NAVIGATION } from "./navigation";

const NAVIGATION_ICONS = {
  dashboard: LayoutDashboard,
  applications: FileText,
  businesses: Building2,
  reviews: ClipboardCheck,
  payments: WalletCards,
  permits: FileCheck2,
  reports: ChartNoAxesCombined,
  administration: Settings2,
} as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BplsTopNavigation() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <div className={styles.headerInner}>
        <Link aria-label="Matnog BPLS dashboard" className={styles.brand} href="/">
          <span className={styles.brandMark}>M</span>
          <span className={styles.brandCopy}>
            <strong>matnog</strong>
            <small>Business licensing</small>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className={styles.desktopNavigation}>
          {BPLS_NAVIGATION.map((item) => {
            const Icon = NAVIGATION_ICONS[item.key];
            const active = isActive(pathname, item.href);

            if (!item.children) {
              return (
                <Link
                  className={`${styles.navigationItem} ${active ? styles.navigationItemActive : ""}`}
                  href={item.href}
                  key={item.key}
                >
                  <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <DropdownMenu key={item.key}>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-current={active ? "page" : undefined}
                    className={`${styles.navigationItem} ${active ? styles.navigationItemActive : ""}`}
                    type="button"
                  >
                    <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                    <span>{item.label}</span>
                    <ChevronDown aria-hidden="true" className={styles.chevron} size={13} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={styles.dropdown} sideOffset={10}>
                  <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {item.children.map((child) => (
                    <DropdownMenuItem asChild className={styles.dropdownItem} key={child.href}>
                      <Link href={child.href}>{child.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <Button aria-label="Search" className={styles.actionButton} size="icon" title="Search" variant="ghost">
            <Search size={19} />
          </Button>
          <Button
            aria-label="Messages"
            className={`${styles.actionButton} ${styles.secondaryAction}`}
            size="icon"
            title="Messages"
            variant="ghost"
          >
            <MessageSquareText size={19} />
          </Button>
          <Button
            aria-label="Notifications"
            className={`${styles.actionButton} ${styles.notificationButton}`}
            size="icon"
            title="Notifications"
            variant="ghost"
          >
            <Bell size={19} />
            <span aria-hidden="true" className={styles.notificationDot} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Open user menu" className={styles.profileButton} type="button">
                <span className={styles.avatar}>BP</span>
                <span className={styles.profileCopy}>
                  <strong>BPLO Staff</strong>
                  <small>Administrator</small>
                </span>
                <ChevronDown aria-hidden="true" size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={styles.profileDropdown} sideOffset={10}>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className={styles.dropdownItem}>My profile</DropdownMenuItem>
              <DropdownMenuItem className={styles.dropdownItem}>Account security</DropdownMenuItem>
              <DropdownMenuItem className={styles.dropdownItem}>Switch role or office</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className={styles.dropdownItem}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button aria-label="Open navigation" className={styles.mobileMenuButton} size="icon" variant="ghost">
                <Menu size={21} />
              </Button>
            </SheetTrigger>
            <SheetContent className={styles.mobileSheet}>
              <SheetHeader className={styles.mobileSheetHeader}>
                <SheetTitle>Matnog BPLS</SheetTitle>
                <SheetDescription>Business licensing workspace</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className={styles.mobileNavigation}>
                {BPLS_NAVIGATION.map((item) => {
                  const Icon = NAVIGATION_ICONS[item.key];

                  if (!item.children) {
                    return (
                      <Link className={styles.mobileDirectLink} href={item.href} key={item.key}>
                        <Icon aria-hidden="true" size={18} />
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <details className={styles.mobileGroup} key={item.key}>
                      <summary>
                        <span>
                          <Icon aria-hidden="true" size={18} />
                          {item.label}
                        </span>
                        <ChevronDown aria-hidden="true" size={15} />
                      </summary>
                      <div className={styles.mobileSubmenu}>
                        {item.children.map((child) => (
                          <Link href={child.href} key={child.href}>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </nav>
              <div className={styles.mobileHelp}>
                <BookOpenText aria-hidden="true" size={18} />
                <span className={styles.mobileHelpCopy}>
                  <strong>Need help?</strong>
                  <small>Open the BPLS user guide</small>
                </span>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
