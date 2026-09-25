"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  CircleDollarSign,
  ClipboardList,
  FilePenLine,
  FileText,
  MapPin,
  Printer,
  RefreshCw,
  ShieldCheck,
  Store,
  UserRound,
  X,
} from "lucide-react";

import { BUSINESS_DOCUMENTS, formatCurrency, formatDate, getBusinessById, type BusinessRecord } from "@/features/business-registry/business-data";

import styles from "../../applications/[id]/application-detail.module.css";

const tabs = ["Overview", "Permits", "Compliance", "Documents", "Activity"] as const;
type Tab = (typeof tabs)[number];

function statusClass(status: string) {
  if (status === "Active" || status === "Issued" || status === "Passed" || status === "Compliant") return styles.success;
  if (status === "For Renewal" || status === "With Deficiency" || status === "For monitoring") return styles.warning;
  if (status === "Expired" || status === "Suspended" || status === "Closed") return styles.danger;
  return styles.info;
}

function riskClass(risk: string) {
  if (risk === "Low") return styles.success;
  if (risk === "Medium") return styles.warning;
  return styles.danger;
}

function Rows({ items }: { items: Array<[string, string | number | undefined | null]> }) {
  return (
    <dl className={styles.dataList}>
      {items.map(([label, value]) => (
        <div className={styles.dataRow} key={label}>
          <dt>{label}</dt>
          <dd>{value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className={styles.detailCard}>
      <div className={styles.detailCardHeader}>
        <span className={styles.detailCardIcon}>{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className={styles.detailCardBody}>{children}</div>
    </section>
  );
}

function OverviewTab({ business }: { business: BusinessRecord }) {
  return (
    <div className={styles.profileGrid}>
      <DetailCard icon={<Building2 size={17} />} title="Business Information">
        <Rows
          items={[
            ["Business name", business.businessName],
            ["Trade name", business.tradeName],
            ["Business type", business.businessType],
            ["Line of business", business.lineOfBusiness],
            ["Registration no.", business.registrationNo],
            ["TIN", business.tin],
            ["Business address", business.address],
            ["Barangay", business.barangay],
          ]}
        />
      </DetailCard>

      <DetailCard icon={<UserRound size={17} />} title="Owner and Contact">
        <Rows
          items={[
            ["Owner", business.owner],
            ["Contact number", business.contact],
            ["Email address", business.email],
            ["Owner address", business.ownerAddress],
          ]}
        />
      </DetailCard>

      <DetailCard icon={<CircleDollarSign size={17} />} title="Operations">
        <Rows
          items={[
            ["Gross sales", formatCurrency(business.grossSales)],
            ["Capital investment", formatCurrency(business.capitalInvestment)],
            ["Employees", business.employees],
            ["Business area", `${business.area} sq.m.`],
            ["Last inspection", formatDate(business.lastInspection)],
            ["Remarks", business.remarks],
          ]}
        />
      </DetailCard>

      <DetailCard icon={<MapPin size={17} />} title="Location">
        <Rows
          items={[
            ["Latitude", business.latitude],
            ["Longitude", business.longitude],
            ["Mapped barangay", business.barangay],
            ["GIS note", "Ready for future map layer integration"],
          ]}
        />
      </DetailCard>
    </div>
  );
}

function PermitsTab({ business }: { business: BusinessRecord }) {
  return (
    <DetailCard icon={<FileText size={17} />} title="Permit History">
      <table className={styles.assessmentTable}>
        <thead>
          <tr>
            <th>Year</th>
            <th>Permit No.</th>
            <th>Status</th>
            <th>Issued</th>
            <th>Expiry</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {business.permits.map((permit) => (
            <tr key={permit.permitNo}>
              <td>{permit.year}</td>
              <td>{permit.permitNo}</td>
              <td><span className={`${styles.badge} ${statusClass(permit.status)}`}>{permit.status}</span></td>
              <td>{formatDate(permit.issued)}</td>
              <td>{formatDate(permit.expiry)}</td>
              <td>{formatCurrency(permit.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DetailCard>
  );
}

function ComplianceTab({ business }: { business: BusinessRecord }) {
  return (
    <div className={styles.profileGrid}>
      <DetailCard icon={<ShieldCheck size={17} />} title="Inspection and Compliance Notes">
        <div className={styles.timeline}>
          {business.inspections.map((inspection) => (
            <div className={styles.timelineItem} key={`${inspection.office}-${inspection.date}`}>
              <span className={styles.timelineDot} />
              <div>
                <strong>{inspection.office} - {inspection.result}</strong>
                <small>{inspection.notes}</small>
              </div>
              <span className={styles.timelineDate}>{formatDate(inspection.date)}</span>
            </div>
          ))}
        </div>
      </DetailCard>

      <DetailCard icon={<ClipboardList size={17} />} title="Registry Standing">
        <Rows
          items={[
            ["Current status", business.status],
            ["Risk level", business.riskLevel],
            ["Last permit year", business.lastPermitYear],
            ["Permit expiry", formatDate(business.expiryDate)],
            ["Compliance remarks", business.remarks],
          ]}
        />
      </DetailCard>
    </div>
  );
}

function DocumentsTab({ business }: { business: BusinessRecord }) {
  return (
    <DetailCard icon={<ClipboardList size={17} />} title="Registry Documents">
      <div className={styles.docsGrid}>
        {BUSINESS_DOCUMENTS.map((doc) => {
          const submitted = business.documents.includes(doc);
          return (
            <div key={doc} className={`${styles.docItem} ${submitted ? styles.docSubmitted : styles.docMissing}`}>
              {submitted ? <Check size={14} /> : <X size={14} />}
              {doc}
            </div>
          );
        })}
      </div>
    </DetailCard>
  );
}

function ActivityTab({ business }: { business: BusinessRecord }) {
  return (
    <DetailCard icon={<CalendarDays size={17} />} title="Recent Registry Activity">
      <div className={styles.timeline}>
        {business.activities.map((activity) => (
          <div className={styles.timelineItem} key={`${activity.action}-${activity.date}`}>
            <span className={styles.timelineDot} />
            <div>
              <strong>{activity.action}</strong>
              <small>{activity.actor}</small>
            </div>
            <span className={styles.timelineDate}>{activity.date}</span>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}

export default function BusinessProfilePage() {
  const params = useParams<{ id: string }>();
  const business = getBusinessById(params.id);
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <Link className={styles.btnSecondary} href="/businesses">
              <ArrowLeft size={14} /> Back to registry
            </Link>
            <h1>{business.businessName}</h1>
            <div className={styles.heroSub}>
              <span><Store size={14} /> {business.tradeName}</span>
              <span><MapPin size={14} /> {business.barangay}</span>
              <span><CalendarDays size={14} /> Expires {formatDate(business.expiryDate)}</span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href={`/businesses/${business.id}/edit`}>
              <FilePenLine size={15} /> Edit Registry
            </Link>
            <Link className={styles.btnSecondary} href="/applications/renewals">
              <RefreshCw size={15} /> Start Renewal
            </Link>
            <button className={styles.btnSecondary} type="button">
              <Printer size={15} /> Print
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.profileIcon}><Building2 size={30} /></div>
            <div className={styles.profileIdentity}>
              <h2>{business.businessName}</h2>
              <p>{business.permitNo} | {business.lineOfBusiness} | {business.businessType}</p>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${statusClass(business.status)}`}>{business.status}</span>
                <span className={`${styles.badge} ${riskClass(business.riskLevel)}`}>{business.riskLevel} risk</span>
                <span className={styles.badge}>{business.lastPermitYear} permit year</span>
              </div>
            </div>
          </div>

          <div className={styles.metricStrip}>
            <article>
              <CircleDollarSign size={20} />
              <span>Gross sales</span>
              <strong>{formatCurrency(business.grossSales)}</strong>
              <small>Latest declared receipts</small>
            </article>
            <article>
              <UserRound size={20} />
              <span>Employees</span>
              <strong>{business.employees}</strong>
              <small>Registered workforce</small>
            </article>
            <article>
              <Store size={20} />
              <span>Business area</span>
              <strong>{business.area} sq.m.</strong>
              <small>Declared floor area</small>
            </article>
            <article>
              <ShieldCheck size={20} />
              <span>Inspections</span>
              <strong>{business.inspections.length}</strong>
              <small>Latest: {formatDate(business.lastInspection)}</small>
            </article>
          </div>

          <div className={styles.tabs}>
            {tabs.map((item) => (
              <button key={item} className={`${styles.tab} ${tab === item ? styles.tabActive : ""}`} type="button" onClick={() => setTab(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className={styles.profileBody}>
            {tab === "Overview" && <OverviewTab business={business} />}
            {tab === "Permits" && <PermitsTab business={business} />}
            {tab === "Compliance" && <ComplianceTab business={business} />}
            {tab === "Documents" && <DocumentsTab business={business} />}
            {tab === "Activity" && <ActivityTab business={business} />}
          </div>
        </div>
      </div>
    </main>
  );
}
