"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CircleDollarSign,
  ClipboardList,
  Download,
  FileText,
  MapPin,
  Pencil,
  Printer,
  Store,
  UserRound,
} from "lucide-react";

import styles from "./application-detail.module.css";

const DUMMY_APPS: Record<string, AppData> = {
  "1": {
    permitId: "BP-2025-0001",
    businessName: "Matnog Fisheries Corp.",
    tradeName: "Matnog Fish Market",
    applicationType: "New",
    businessType: "Corporation",
    status: "Released",
    dateFiled: "2025-01-10",
    dateAssessed: "2025-01-18",
    dateApproved: "2025-02-05",
    dateReleased: "2025-02-12",
    owner: "Juan D. Cruz",
    ownerContact: "09171234567",
    ownerEmail: "juan.cruz@email.com",
    ownerAddress: "123 National Highway, Poblacion, Matnog",
    barangay: "Poblacion",
    businessAddress: "Pier Area, Poblacion, Matnog, Sorsogon",
    lineOfBusiness: "Fishery",
    businessArea: "120",
    numberOfEmployees: "15",
    capitalInvestment: 850000,
    grossSales: 2400000,
    dtisecNumber: "CS-2025-001234",
    tinNumber: "123-456-789-000",
    incentives: ["BMBE (Barangay Micro Business Enterprise)"],
    documents: [
      "Barangay Business Clearance",
      "DTI / SEC / CDA Registration",
      "Community Tax Certificate (Cedula)",
      "Zoning Clearance",
      "Sanitary Permit",
      "Fire Safety Inspection Certificate",
      "Contract of Lease / Land Title",
      "SSS / PhilHealth / Pag-IBIG Registration",
      "BIR Registration (TIN / Form 2303)",
    ],
    assessmentItems: [
      { fee: "Business Tax", amount: 4800 },
      { fee: "Mayor's Permit Fee", amount: 2500 },
      { fee: "Sanitary Permit Fee", amount: 500 },
      { fee: "Zoning Fee", amount: 300 },
      { fee: "Fire Inspection Fee", amount: 1000 },
      { fee: "Garbage Fee", amount: 600 },
      { fee: "Regulatory Fee", amount: 1200 },
      { fee: "Occupational Permit", amount: 600 },
      { fee: "Sticker Fee", amount: 100 },
      { fee: "Community Tax Certificate", amount: 900 },
    ],
    totalAssessment: 12500,
    paymentStatus: "Paid",
    paymentDate: "2025-02-10",
    orNumber: "OR-2025-001234",
    activities: [
      { action: "Permit released", date: "Feb 12, 2025", actor: "BPLO Staff" },
      { action: "Payment verified", date: "Feb 10, 2025", actor: "Treasury" },
      { action: "Assessment approved", date: "Feb 5, 2025", actor: "Mayor's Office" },
      { action: "Assessment created", date: "Jan 18, 2025", actor: "BPLO Staff" },
      { action: "Requirements verified", date: "Jan 15, 2025", actor: "BPLO Staff" },
      { action: "Application submitted", date: "Jan 10, 2025", actor: "Juan D. Cruz" },
    ],
  },
};

// Generate entries for IDs 2-30
for (let i = 2; i <= 30; i++) {
  DUMMY_APPS[String(i)] = { ...DUMMY_APPS["1"], permitId: `BP-2025-${String(i).padStart(4, "0")}` };
}

type AppData = {
  permitId: string;
  businessName: string;
  tradeName: string;
  applicationType: string;
  businessType: string;
  status: string;
  dateFiled: string;
  dateAssessed: string;
  dateApproved: string;
  dateReleased: string;
  owner: string;
  ownerContact: string;
  ownerEmail: string;
  ownerAddress: string;
  barangay: string;
  businessAddress: string;
  lineOfBusiness: string;
  businessArea: string;
  numberOfEmployees: string;
  capitalInvestment: number;
  grossSales: number;
  dtisecNumber: string;
  tinNumber: string;
  incentives: string[];
  documents: string[];
  assessmentItems: Array<{ fee: string; amount: number }>;
  totalAssessment: number;
  paymentStatus: string;
  paymentDate: string;
  orNumber: string;
  activities: Array<{ action: string; date: string; actor: string }>;
};

const ALL_DOCS = [
  "Barangay Business Clearance",
  "DTI / SEC / CDA Registration",
  "Community Tax Certificate (Cedula)",
  "Zoning Clearance",
  "Sanitary Permit",
  "Fire Safety Inspection Certificate",
  "Contract of Lease / Land Title",
  "SSS / PhilHealth / Pag-IBIG Registration",
  "BIR Registration (TIN / Form 2303)",
  "Environmental Compliance Certificate",
];

const tabs = ["Overview", "Assessment", "Permit", "Activity"] as const;
type Tab = (typeof tabs)[number];

function statusClass(status: string) {
  if (status === "Released" || status === "Approved" || status === "Paid") return styles.success;
  if (status === "Rejected") return styles.danger;
  if (status === "Pending") return styles.warning;
  if (status === "Under Review" || status === "Assessed") return styles.info;
  return "";
}

function Rows({ items }: { items: Array<[string, string | number | undefined | null]> }) {
  return (
    <dl className={styles.dataList}>
      {items.map(([label, value]) => (
        <div className={styles.dataRow} key={label}>
          <dt>{label}</dt>
          <dd>{value || "—"}</dd>
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

const fmt = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });

function OverviewTab({ app }: { app: AppData }) {
  return (
    <div className={styles.profileGrid}>
      <DetailCard icon={<Building2 size={17} />} title="Business Information">
        <Rows
          items={[
            ["Application type", app.applicationType],
            ["Business type", app.businessType],
            ["Business name", app.businessName],
            ["Trade name", app.tradeName],
            ["DTI / SEC / CDA no.", app.dtisecNumber],
            ["TIN", app.tinNumber],
            ["Business address", app.businessAddress],
            ["Barangay", app.barangay],
          ]}
        />
      </DetailCard>

      <DetailCard icon={<UserRound size={17} />} title="Owner Information">
        <Rows
          items={[
            ["Full name", app.owner],
            ["Contact number", app.ownerContact],
            ["Email address", app.ownerEmail],
            ["Home address", app.ownerAddress],
          ]}
        />
      </DetailCard>

      <DetailCard icon={<CircleDollarSign size={17} />} title="Business Activity">
        <Rows
          items={[
            ["Line of business", app.lineOfBusiness],
            ["Business area", app.businessArea ? `${app.businessArea} sq.m.` : "—"],
            ["Number of employees", app.numberOfEmployees],
            ["Capital investment", fmt(app.capitalInvestment)],
            ["Gross sales / receipts", fmt(app.grossSales)],
            ["Tax incentives", app.incentives.length ? app.incentives.join(", ") : "None"],
          ]}
        />
      </DetailCard>

      <DetailCard icon={<ClipboardList size={17} />} title={`Documentary Requirements (${app.documents.length} of ${ALL_DOCS.length})`}>
        <div className={styles.docsGrid}>
          {ALL_DOCS.map((doc) => {
            const submitted = app.documents.includes(doc);
            return (
              <div key={doc} className={`${styles.docItem} ${submitted ? styles.docSubmitted : styles.docMissing}`}>
                {submitted ? <Check size={14} /> : <span style={{ width: 14, height: 14, borderRadius: 3, border: "1.5px solid #ccc", display: "inline-block", flexShrink: 0 }} />}
                {doc}
              </div>
            );
          })}
        </div>
      </DetailCard>
    </div>
  );
}

function AssessmentTab({ app }: { app: AppData }) {
  return (
    <div className={styles.profileGrid}>
      <DetailCard icon={<Banknote size={17} />} title="Assessment of Fees">
        <table className={styles.assessmentTable}>
          <thead>
            <tr>
              <th>Fee / Charge</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {app.assessmentItems.map((item) => (
              <tr key={item.fee}>
                <td>{item.fee}</td>
                <td>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total Assessment</td>
              <td>{fmt(app.totalAssessment)}</td>
            </tr>
          </tfoot>
        </table>
      </DetailCard>

      <DetailCard icon={<CircleDollarSign size={17} />} title="Payment Information">
        <Rows
          items={[
            ["Payment status", app.paymentStatus],
            ["Payment date", app.paymentDate],
            ["Official receipt no.", app.orNumber],
            ["Total amount paid", fmt(app.totalAssessment)],
            ["Mode of payment", "Cash"],
          ]}
        />
      </DetailCard>
    </div>
  );
}

function PermitTab({ app }: { app: AppData }) {
  return (
    <div>
      <div className={styles.permitCard}>
        <div className={styles.permitHeader}>
          <div>
            <small>Municipality of Matnog, Sorsogon</small>
            <h3>Mayor&apos;s Business Permit</h3>
          </div>
          <span className={`${styles.badge} ${statusClass(app.status)}`}>{app.status}</span>
        </div>
        <div className={styles.permitBody}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className={styles.permitField}>
              <span>Permit Number</span>
              <strong>{app.permitId}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Date Released</span>
              <strong>{app.dateReleased}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Business Name</span>
              <strong>{app.businessName}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Trade Name</span>
              <strong>{app.tradeName}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Owner</span>
              <strong>{app.owner}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Business Type</span>
              <strong>{app.businessType}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Line of Business</span>
              <strong>{app.lineOfBusiness}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Barangay</span>
              <strong>{app.barangay}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Business Address</span>
              <strong>{app.businessAddress}</strong>
            </div>
            <div className={styles.permitField}>
              <span>Valid Until</span>
              <strong>December 31, 2025</strong>
            </div>
          </div>
        </div>
        <div className={styles.permitActions}>
          <button className={styles.printButton} type="button">
            <Printer size={14} /> Print Permit
          </button>
          <button className={styles.outlineButton} type="button">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ app }: { app: AppData }) {
  return (
    <DetailCard icon={<FileText size={17} />} title="Activity Log">
      <div className={styles.timeline}>
        {app.activities.map((a, i) => (
          <div key={i} className={styles.timelineItem}>
            <span className={styles.timelineDot} />
            <div>
              <strong>{a.action}</strong>
              <small>By {a.actor}</small>
            </div>
            <span className={styles.timelineDate}>{a.date}</span>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const app = DUMMY_APPS[id];
  const [tab, setTab] = useState<Tab>("Overview");

  if (!app) {
    return (
      <div className={styles.notFound}>
        <Store size={28} />
        <h2>Application not found</h2>
        <p>This application record does not exist or has been removed.</p>
        <Link href="/applications">Return to all applications</Link>
      </div>
    );
  }

  const progressPercent =
    app.status === "Released" ? 100 :
    app.status === "Approved" ? 80 :
    app.status === "Assessed" ? 60 :
    app.status === "Under Review" ? 40 :
    app.status === "Pending" ? 20 : 0;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1>{app.businessName}</h1>
            <div className={styles.heroSub}>
              <span>{app.permitId}</span>
              <span>·</span>
              <span><MapPin size={14} /> {app.barangay}</span>
              <span>·</span>
              <span>{app.applicationType} Application</span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href={`/applications/${id}/edit`}>
              <Pencil size={15} /> Edit Application
            </Link>
            <Link className={styles.btnSecondary} href="/applications">
              <ArrowLeft size={15} /> All Applications
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.body}>
        <section className={styles.card}>
          <header className={styles.profileHeader}>
            <div className={styles.profileIcon}>
              <Store size={28} />
            </div>
            <div className={styles.profileIdentity}>
              <h2>{app.businessName}</h2>
              <p>{app.permitId} · {app.tradeName} · {app.lineOfBusiness}</p>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${statusClass(app.status)}`}>{app.status}</span>
                <span className={styles.badge}>{app.applicationType}</span>
                <span className={styles.badge}>{app.businessType}</span>
              </div>
            </div>
          </header>

          <section className={styles.metricStrip} aria-label="Application summary">
            <article>
              <Banknote size={20} />
              <span>Total assessment</span>
              <strong>{fmt(app.totalAssessment)}</strong>
              <small>{app.paymentStatus === "Paid" ? `Paid · ${app.orNumber}` : "Awaiting payment"}</small>
            </article>
            <article>
              <CalendarDays size={20} />
              <span>Date filed</span>
              <strong>{app.dateFiled}</strong>
              <small>{app.applicationType} application</small>
            </article>
            <article>
              <Store size={20} />
              <span>Processing status</span>
              <strong>{app.status}</strong>
              <div className={styles.metricProgress}>
                <i style={{ width: `${progressPercent}%` }} />
              </div>
            </article>
            <article>
              <FileText size={20} />
              <span>Documents submitted</span>
              <strong>{app.documents.length} / {ALL_DOCS.length}</strong>
              <small>{app.documents.length === ALL_DOCS.length ? "All requirements met" : `${ALL_DOCS.length - app.documents.length} missing`}</small>
            </article>
          </section>

          <nav className={styles.tabs} aria-label="Application details">
            {tabs.map((value) => (
              <button
                type="button"
                key={value}
                className={`${styles.tab} ${tab === value ? styles.tabActive : ""}`}
                onClick={() => setTab(value)}
              >
                {value}
              </button>
            ))}
          </nav>

          <div className={styles.profileBody}>
            {tab === "Overview" && <OverviewTab app={app} />}
            {tab === "Assessment" && <AssessmentTab app={app} />}
            {tab === "Permit" && <PermitTab app={app} />}
            {tab === "Activity" && <ActivityTab app={app} />}
          </div>
        </section>
      </div>
    </div>
  );
}
