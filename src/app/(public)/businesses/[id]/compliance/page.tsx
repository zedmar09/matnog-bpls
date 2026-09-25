"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, FileText, Flame, HeartPulse, Landmark, ShieldCheck, Store, WalletCards } from "lucide-react";

import { formatDate, getBusinessById } from "@/features/business-registry/business-data";

import styles from "../../../applications/[id]/application-detail.module.css";

function statusClass(status: string) {
  if (["Compliant", "Passed", "Cleared", "No arrears"].includes(status)) return styles.success;
  if (["For monitoring", "With deficiency", "Pending"].includes(status)) return styles.warning;
  if (["Failed", "Overdue", "Suspended"].includes(status)) return styles.danger;
  return styles.info;
}

export default function BusinessCompliancePage() {
  const params = useParams<{ id: string }>();
  const business = getBusinessById(params.id);
  const checks = [
    { office: "BPLO", icon: <Store size={17} />, status: business.status === "With Deficiency" ? "With deficiency" : "Compliant", date: business.lastInspection, notes: business.remarks },
    { office: "Zoning", icon: <Landmark size={17} />, status: "Cleared", date: "2025-01-15", notes: "Business use conforms with declared location and barangay classification." },
    { office: "Health", icon: <HeartPulse size={17} />, status: business.riskLevel === "High" ? "For monitoring" : "Passed", date: "2025-09-10", notes: business.riskLevel === "High" ? "Follow-up validation required before renewal endorsement." : "Sanitary documents are valid for the current cycle." },
    { office: "Fire", icon: <Flame size={17} />, status: "Passed", date: "2025-08-26", notes: "Fire safety inspection certificate accepted." },
    { office: "Treasury", icon: <WalletCards size={17} />, status: "No arrears", date: "2025-07-21", notes: "No open balance found in the current dummy ledger." },
  ];
  const openItems = checks.filter((check) => ["For monitoring", "With deficiency", "Pending", "Failed", "Overdue"].includes(check.status));

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <Link className={styles.btnSecondary} href={`/businesses/${business.id}`}>
              <ArrowLeft size={14} /> Back to profile
            </Link>
            <h1>Compliance</h1>
            <div className={styles.heroSub}>
              <span><ShieldCheck size={14} /> {business.businessName}</span>
              <span><AlertTriangle size={14} /> {business.riskLevel} risk</span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href={`/businesses/${business.id}/permits`}>
              <FileText size={15} /> Permit History
            </Link>
            <Link className={styles.btnSecondary} href={`/businesses/${business.id}/edit`}>
              <ClipboardCheck size={15} /> Update Registry
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.profileIcon}>{openItems.length ? <AlertTriangle size={30} /> : <CheckCircle2 size={30} />}</div>
            <div className={styles.profileIdentity}>
              <h2>{business.businessName}</h2>
              <p>{business.permitNo} | {business.lineOfBusiness} | {business.barangay}</p>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${statusClass(business.status)}`}>{business.status}</span>
                <span className={`${styles.badge} ${business.riskLevel === "High" ? styles.danger : business.riskLevel === "Medium" ? styles.warning : styles.success}`}>{business.riskLevel} risk</span>
                <span className={styles.badge}>{openItems.length} open item{openItems.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          <div className={styles.metricStrip}>
            <article><ShieldCheck size={20} /><span>Department checks</span><strong>{checks.length}</strong><small>BPLO, Zoning, Health, Fire, Treasury</small></article>
            <article><AlertTriangle size={20} /><span>Open issues</span><strong>{openItems.length}</strong><small>{openItems.length ? "Needs follow-up" : "No unresolved items"}</small></article>
            <article><ClipboardCheck size={20} /><span>Latest inspection</span><strong>{formatDate(business.lastInspection)}</strong><small>Registry inspection date</small></article>
            <article><Store size={20} /><span>Standing</span><strong>{business.status}</strong><small>Current registry status</small></article>
          </div>

          <div className={styles.profileBody}>
            <div className={styles.profileGrid}>
              {checks.map((check) => (
                <section className={styles.detailCard} key={check.office}>
                  <div className={styles.detailCardHeader}>
                    <span className={styles.detailCardIcon}>{check.icon}</span>
                    <h3>{check.office}</h3>
                  </div>
                  <div className={styles.detailCardBody}>
                    <dl className={styles.dataList}>
                      <div className={styles.dataRow}><dt>Status</dt><dd><span className={`${styles.badge} ${statusClass(check.status)}`}>{check.status}</span></dd></div>
                      <div className={styles.dataRow}><dt>Last checked</dt><dd>{formatDate(check.date)}</dd></div>
                      <div className={styles.dataRow}><dt>Notes</dt><dd>{check.notes}</dd></div>
                    </dl>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
