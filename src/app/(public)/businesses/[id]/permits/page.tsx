"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, FileText, Printer, QrCode, ReceiptText, RefreshCw } from "lucide-react";

import { formatCurrency, formatDate, getBusinessById } from "@/features/business-registry/business-data";

import styles from "../../../applications/[id]/application-detail.module.css";

function statusClass(status: string) {
  if (status === "Issued" || status === "Released" || status === "Paid" || status === "Verified") return styles.success;
  if (status === "For renewal" || status === "Pending") return styles.warning;
  if (status === "Expired" || status === "Cancelled") return styles.danger;
  return styles.info;
}

export default function BusinessPermitHistoryPage() {
  const params = useParams<{ id: string }>();
  const business = getBusinessById(params.id);
  const rows = business.permits.map((permit, index) => ({
    ...permit,
    type: index === 0 ? "Current permit" : "Renewal",
    payment: permit.status === "Expired" ? "Expired record" : "Paid",
    orNumber: `OR-${permit.year}-${String(2100 + index + Number(business.id.replace("BUS-", ""))).padStart(5, "0")}`,
    qrStatus: permit.status === "Expired" ? "Archived" : "Verified",
    releaseStatus: permit.status === "Expired" ? "Expired" : "Released",
  }));

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <Link className={styles.btnSecondary} href={`/businesses/${business.id}`}>
              <ArrowLeft size={14} /> Back to profile
            </Link>
            <h1>Permit History</h1>
            <div className={styles.heroSub}>
              <span><FileText size={14} /> {business.businessName}</span>
              <span><CalendarDays size={14} /> {business.permitNo}</span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href={`/applications/renewals?businessId=${business.id}`}>
              <RefreshCw size={15} /> Start Renewal
            </Link>
            <button className={styles.btnSecondary} type="button"><Printer size={15} /> Print</button>
            <button className={styles.btnSecondary} type="button"><Download size={15} /> Export</button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.profileIcon}><ReceiptText size={30} /></div>
            <div className={styles.profileIdentity}>
              <h2>{business.businessName}</h2>
              <p>{business.tradeName} | {business.owner} | {business.barangay}</p>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>{rows.length} permit records</span>
                <span className={`${styles.badge} ${statusClass(rows[0]?.releaseStatus ?? "")}`}>{rows[0]?.releaseStatus}</span>
                <span className={styles.badge}>Latest expiry {formatDate(business.expiryDate)}</span>
              </div>
            </div>
          </div>

          <div className={styles.metricStrip}>
            <article><FileText size={20} /><span>Current permit</span><strong>{business.permitNo}</strong><small>{business.lastPermitYear} permit year</small></article>
            <article><ReceiptText size={20} /><span>Latest amount</span><strong>{formatCurrency(rows[0]?.amount ?? 0)}</strong><small>Assessed and paid</small></article>
            <article><QrCode size={20} /><span>QR status</span><strong>{rows[0]?.qrStatus}</strong><small>Permit verification ready</small></article>
            <article><CalendarDays size={20} /><span>Expiry</span><strong>{formatDate(business.expiryDate)}</strong><small>Business permit validity</small></article>
          </div>

          <div className={styles.profileBody}>
            <section className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <span className={styles.detailCardIcon}><FileText size={17} /></span>
                <h3>Permit Timeline</h3>
              </div>
              <div className={styles.detailCardBody}>
                <table className={styles.assessmentTable}>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Permit No.</th>
                      <th>Type</th>
                      <th>Payment / OR</th>
                      <th>Issued</th>
                      <th>Expiry</th>
                      <th>QR</th>
                      <th>Release</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((permit) => (
                      <tr key={permit.permitNo}>
                        <td>{permit.year}</td>
                        <td>{permit.permitNo}</td>
                        <td>{permit.type}</td>
                        <td><span className={`${styles.badge} ${statusClass(permit.payment)}`}>{permit.payment}</span> {permit.orNumber}</td>
                        <td>{formatDate(permit.issued)}</td>
                        <td>{formatDate(permit.expiry)}</td>
                        <td><span className={`${styles.badge} ${statusClass(permit.qrStatus)}`}>{permit.qrStatus}</span></td>
                        <td><span className={`${styles.badge} ${statusClass(permit.releaseStatus)}`}>{permit.releaseStatus}</span></td>
                        <td>{formatCurrency(permit.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
