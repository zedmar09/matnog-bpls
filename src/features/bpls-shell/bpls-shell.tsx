"use client";

import { type ReactNode, useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import styles from "./bpls-shell.module.css";
import { HOME_ITEM, NAV_SECTIONS } from "./navigation";

function pathIsActive(pathname: string, path: string) {
  return pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
}

export function BplsShell({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.children?.some((child) => pathIsActive(pathname, child.path))) {
          setOpenModules((current) => new Set(current).add(item.label));
          return;
        }
      }
    }
  }, [pathname]);

  const toggleModule = (label: string) =>
    setOpenModules((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  const sidebarContent = (
    <>
      <div className={styles.sidebarHeader}>
        <Link className={styles.brand} href="/" aria-label="Matnog BPLS home">
          <span className={styles.brandMark} aria-hidden="true">M</span>
          <strong>Matnog BPLS</strong>
        </Link>
        <button
          className={styles.mobileClose}
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <nav className={styles.nav}>
        <Link
          className={`${styles.navItem} ${pathname === HOME_ITEM.path ? styles.navItemActive : ""}`}
          href={HOME_ITEM.path ?? "/"}
          aria-current={pathname === HOME_ITEM.path ? "page" : undefined}
          onClick={() => setMobileOpen(false)}
        >
          <HOME_ITEM.icon size={17} strokeWidth={1.8} aria-hidden="true" />
          <span>{HOME_ITEM.label}</span>
        </Link>

        {NAV_SECTIONS.map((section) => (
          <div className={styles.section} key={section.label}>
            <h2 className={styles.sectionLabel}>{section.label}</h2>
            {section.items.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const parentActive = item.children?.some((child) => pathIsActive(pathname, child.path)) ?? false;
              const activeChildPath = item.children
                ?.filter((child) => pathIsActive(pathname, child.path))
                .sort((a, b) => b.path.length - a.path.length)[0]?.path;
              const expanded = openModules.has(item.label);

              if (hasChildren) {
                return (
                  <div key={item.label}>
                    <button
                      className={`${styles.navItem} ${parentActive ? styles.navItemActive : ""}`}
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => toggleModule(item.label)}
                    >
                      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                      <span>{item.label}</span>
                      {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                      <ChevronRight
                        className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
                        size={14}
                        aria-hidden="true"
                      />
                    </button>
                    {expanded ? (
                      <div className={styles.subItems}>
                        {item.children!.map((child) => {
                          const active = child.path === activeChildPath;
                          return (
                            <Link
                              key={child.path}
                              href={child.path}
                              className={`${styles.subItem} ${active ? styles.subItemActive : ""}`}
                              aria-current={active ? "page" : undefined}
                              onClick={() => setMobileOpen(false)}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              }

              const active = item.path ? pathIsActive(pathname, item.path) : false;
              return (
                <Link
                  key={item.label}
                  href={item.path ?? "/"}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <span className={styles.userAvatar} aria-hidden="true">
            <UserRound size={16} strokeWidth={1.8} />
          </span>
          <div className={styles.userInfo}>
            <strong>BPLO Staff</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Main navigation">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <>
          <button
            className={styles.scrim}
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={`${styles.sidebar} ${styles.sidebarMobile}`} aria-label="Main navigation">
            {sidebarContent}
          </aside>
        </>
      ) : null}

      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <button
            className={styles.mobileMenuBtn}
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className={styles.topbarSearch}>
            <Search size={15} aria-hidden="true" />
            <input type="text" placeholder="Search..." className={styles.topbarSearchInput} />
          </div>
          <div style={{ flex: 1 }} />
          <div className={styles.topbarActions}>
            <button className={styles.topbarBtn} type="button" aria-label="Settings" title="Settings">
              <Settings size={17} aria-hidden="true" />
            </button>
            <button className={styles.topbarBtn} type="button" aria-label="Log out" title="Log out">
              <LogOut size={17} aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className={styles.workspace} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
