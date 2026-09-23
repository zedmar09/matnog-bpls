"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Contact,
  ExternalLink,
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

import styles from "../components/business-profile.module.css";
import { MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import type { BusinessDirectoryRecord } from "../types/business-directory";
import { createApplicationHistory, createAuditTrail, createDocumentChecklist } from "../utils/business-profile-utils";
import { REGISTERED_BUSINESSES_STORAGE_KEY } from "../utils/business-registration-utils";

const tabs = [
  "Overview",
  "Registration & Ownership",
  "Activity & Operations",
  "Applications & Permits",
  "Documents",
  "Activity Log",
] as const;
type Tab = (typeof tabs)[number];

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function DataRows({ items }: { items: Array<[string, string | number | undefined]> }) {
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

function StatusBadge({ value }: { value: string }) {
  return <span className={`${styles.badge} ${styles[`status${value.replaceAll(" ", "")}`] ?? ""}`}>{value}</span>;
}

export function BusinessProfileView({ businessId }: { businessId: string }) {
  const seededRecord = MATNOG_BUSINESS_DIRECTORY.find((item) => item.id === businessId);
  const [record, setRecord] = useState<BusinessDirectoryRecord | undefined>(seededRecord);
  const [loaded, setLoaded] = useState(Boolean(seededRecord));
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    if (seededRecord) return;
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(REGISTERED_BUSINESSES_STORAGE_KEY) ?? "[]",
      ) as BusinessDirectoryRecord[];
      setRecord(saved.find((item) => item.id === businessId));
    } catch {
      window.localStorage.removeItem(REGISTERED_BUSINESSES_STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, [businessId, seededRecord]);

  const applications = useMemo(() => (record ? createApplicationHistory(record) : []), [record]);
  const documents = useMemo(() => (record ? createDocumentChecklist(record) : []), [record]);
  const auditEvents = useMemo(() => (record ? createAuditTrail(record) : []), [record]);

  if (!loaded)
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Loading business profile…</div>
      </main>
    );
  if (!record) {
    return (
      <main className={`${styles.page} ${styles.notFound}`}>
        <section>
          <Building2 size={36} />
          <h1>Business record not found</h1>
          <p>The business reference does not exist in the current registry.</p>
          <Link className={styles.primaryButton} href="/businesses">
            <ArrowLeft size={14} /> Return to registry
          </Link>
        </section>
      </main>
    );
  }

  const verifiedDocuments = documents.filter((document) => document.status === "Verified").length;
  const permitAction =
    record.status === "For application"
      ? "Start permit application"
      : record.status === "Expired" || record.status === "Expiring soon"
        ? "Start renewal"
        : "New application";
  const permitType = record.status === "For application" ? "new" : "renewal";

  return (
    <main className={styles.page}>
      <div className={styles.topActions}>
        <Link className={styles.secondaryButton} href="/businesses">
          <ArrowLeft size={14} /> Business registry
        </Link>
        <div>
          <Link className={styles.secondaryButton} href={`/businesses/${record.id}/edit`}>
            <Pencil size={14} /> Edit business
          </Link>
          <Link
            className={styles.primaryButton}
            href={`/business/applications/new?type=${permitType}&businessId=${record.id}`}
          >
            <Plus size={14} /> {permitAction}
          </Link>
        </div>
      </div>

      <section className={styles.profileCard}>
        <header className={styles.profileHeader}>
          <div className={styles.businessAvatar}>
            {record.tradeName
              .split(" ")
              .slice(0, 2)
              .map((part) => part[0])
              .join("")}
          </div>
          <div className={styles.profileIdentity}>
            <p className={styles.eyebrow}>{record.id}</p>
            <h1>{record.tradeName}</h1>
            <p>{record.registeredName}</p>
            <div className={styles.badgeRow}>
              <StatusBadge value={record.status} />
              <span className={`${styles.badge} ${styles[`risk${record.riskLevel}`]}`}>{record.riskLevel} risk</span>
              <span className={styles.badge}>{record.organizationType}</span>
            </div>
          </div>
          <div className={styles.headerMeta}>
            <span>Current permit</span>
            <strong>{record.permitNumber}</strong>
            <small>
              {record.permitValidUntil
                ? `Valid until ${formatDate(record.permitValidUntil)}`
                : "Permit application not yet started"}
            </small>
          </div>
        </header>

        <div className={styles.summaryStrip}>
          <div>
            <UserRound size={15} />
            <span>
              Owner / representative<strong>{record.ownerName}</strong>
            </span>
          </div>
          <div>
            <MapPin size={15} />
            <span>
              Establishment<strong>Barangay {record.barangay}</strong>
            </span>
          </div>
          <div>
            <Users size={15} />
            <span>
              Employees<strong>{record.employeeCount}</strong>
            </span>
          </div>
          <div>
            <WalletCards size={15} />
            <span>
              Capitalization<strong>{formatPeso(record.capitalization)}</strong>
            </span>
          </div>
          <div>
            <Clock3 size={15} />
            <span>
              Last updated<strong>{formatDate(record.updatedAt)}</strong>
            </span>
          </div>
        </div>

        <nav className={styles.tabs} aria-label="Business profile sections">
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
          {tab === "Overview" && (
            <div className={styles.overviewLayout}>
              <div className={styles.cardGrid}>
                <section className={styles.detailCard}>
                  <h2>
                    <Building2 size={16} /> Business identity
                  </h2>
                  <DataRows
                    items={[
                      ["Registered name", record.registeredName],
                      ["Trade name", record.tradeName],
                      ["Organization", record.organizationType],
                      ["Establishment", record.establishmentType],
                      ["TIN", record.tin],
                    ]}
                  />
                </section>
                <section className={styles.detailCard}>
                  <h2>
                    <Contact size={16} /> Owner and contact
                  </h2>
                  <DataRows
                    items={[
                      ["Owner / representative", record.ownerName],
                      ["Mobile", record.contactNumber],
                      ["Email", record.email || "No email on file"],
                      ["Registration authority", record.registrationAuthority],
                      ["Registration number", record.registrationNumber],
                    ]}
                  />
                </section>
                <section className={styles.detailCard}>
                  <h2>
                    <MapPin size={16} /> Establishment location
                  </h2>
                  <DataRows
                    items={[
                      ["Barangay", record.barangay],
                      ["Complete address", record.address],
                      ["Municipality", "Matnog"],
                      ["Province", "Sorsogon"],
                      ["Postal code", "4708"],
                    ]}
                  />
                </section>
                <section className={styles.detailCard}>
                  <h2>
                    <Activity size={16} /> Business activity
                  </h2>
                  <DataRows
                    items={[
                      ["Primary activity", record.primaryActivity],
                      ["Category", record.activityCategory],
                      ["PSIC code", record.psicCode],
                      ["Risk classification", record.riskLevel],
                      ["Employees", record.employeeCount],
                    ]}
                  />
                </section>
              </div>
              <aside className={styles.complianceCard}>
                <div className={styles.complianceHeading}>
                  <ShieldCheck size={19} />
                  <div>
                    <h2>Compliance snapshot</h2>
                    <p>Current registration readiness</p>
                  </div>
                </div>
                <div className={styles.complianceScore}>
                  <strong>{verifiedDocuments}</strong>
                  <span>
                    of {documents.length}
                    <small>documents verified</small>
                  </span>
                </div>
                <div className={styles.progress}>
                  <span style={{ width: `${(verifiedDocuments / documents.length) * 100}%` }} />
                </div>
                <ul>
                  <li>
                    <span>
                      <CheckCircle2 size={14} /> Business registration
                    </span>
                    <strong>On file</strong>
                  </li>
                  <li>
                    <span>
                      <FileCheck2 size={14} /> Requirements
                    </span>
                    <strong>
                      {documents.length - verifiedDocuments === 0
                        ? "Complete"
                        : `${documents.length - verifiedDocuments} attention`}
                    </strong>
                  </li>
                  <li>
                    <span>
                      <ReceiptText size={14} /> Permit standing
                    </span>
                    <strong>{record.status}</strong>
                  </li>
                  <li>
                    <span>
                      <AlertCircle size={14} /> Risk classification
                    </span>
                    <strong>{record.riskLevel}</strong>
                  </li>
                </ul>
                <button type="button" onClick={() => setTab("Documents")}>
                  Review documents <ChevronRight size={13} />
                </button>
              </aside>
            </div>
          )}

          {tab === "Registration & Ownership" && (
            <div className={styles.cardGrid}>
              <section className={styles.detailCard}>
                <h2>
                  <FileText size={16} /> Legal registration
                </h2>
                <DataRows
                  items={[
                    ["Registration authority", record.registrationAuthority],
                    ["Registration number", record.registrationNumber],
                    ["Registration date", formatDate(record.registrationDate)],
                    ["Organization type", record.organizationType],
                    ["Establishment type", record.establishmentType],
                    ["Taxpayer identification number", record.tin],
                  ]}
                />
              </section>
              <section className={styles.detailCard}>
                <h2>
                  <UserRound size={16} /> Ownership and representative
                </h2>
                <DataRows
                  items={[
                    ["Registered business", record.registeredName],
                    ["Owner / representative", record.ownerName],
                    [
                      "Role",
                      record.organizationType === "Sole proprietorship"
                        ? "Owner / Proprietor"
                        : "Authorized representative",
                    ],
                    ["Primary mobile", record.contactNumber],
                    ["Email address", record.email || "Not provided"],
                  ]}
                />
              </section>
              <section className={`${styles.detailCard} ${styles.fullWidth}`}>
                <h2>
                  <Phone size={16} /> Official communication details
                </h2>
                <div className={styles.contactGrid}>
                  <a href={`tel:${record.contactNumber.replaceAll(" ", "")}`}>
                    <Phone size={17} />
                    <span>
                      Primary phone<strong>{record.contactNumber}</strong>
                    </span>
                    <ExternalLink size={13} />
                  </a>
                  <a href={record.email ? `mailto:${record.email}` : undefined}>
                    <Mail size={17} />
                    <span>
                      Email address<strong>{record.email || "No email on file"}</strong>
                    </span>
                    {record.email ? <ExternalLink size={13} /> : null}
                  </a>
                </div>
              </section>
            </div>
          )}

          {tab === "Activity & Operations" && (
            <div className={styles.cardGrid}>
              <section className={styles.detailCard}>
                <h2>
                  <Activity size={16} /> Business classification
                </h2>
                <DataRows
                  items={[
                    ["Primary business activity", record.primaryActivity],
                    ["Activity category", record.activityCategory],
                    ["PSIC code", record.psicCode],
                    ["Risk level", record.riskLevel],
                    ["Establishment type", record.establishmentType],
                  ]}
                />
              </section>
              <section className={styles.detailCard}>
                <h2>
                  <CircleDollarSign size={16} /> Financial declaration
                </h2>
                <DataRows
                  items={[
                    ["Declared capitalization", formatPeso(record.capitalization)],
                    ["Declared gross sales", formatPeso(record.grossSales)],
                    ["Employees", record.employeeCount],
                    ["Accounting period", "Calendar year"],
                    [
                      "Assessment basis",
                      record.status === "For application" ? "Pending initial assessment" : "Validated declaration",
                    ],
                  ]}
                />
              </section>
              <section className={`${styles.detailCard} ${styles.fullWidth}`}>
                <h2>
                  <MapPin size={16} /> Operating establishment
                </h2>
                <DataRows
                  items={[
                    ["Complete location", record.address],
                    ["Barangay", record.barangay],
                    ["Municipality / province", "Matnog, Sorsogon"],
                    ["Start of operations", formatDate(record.registrationDate)],
                    ["Current operating status", record.status === "Closed" ? "Closed" : "Operating"],
                  ]}
                />
              </section>
            </div>
          )}

          {tab === "Applications & Permits" && (
            <section className={styles.tableCard}>
              <div className={styles.sectionTop}>
                <div>
                  <h2>Application and permit history</h2>
                  <p>Permit applications connected to this establishment.</p>
                </div>
                <Link
                  className={styles.primaryButton}
                  href={`/business/applications/new?type=${permitType}&businessId=${record.id}`}
                >
                  <Plus size={14} /> {permitAction}
                </Link>
              </div>
              {applications.length ? (
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>Application no.</th>
                        <th>Type</th>
                        <th>Period</th>
                        <th>Filed</th>
                        <th>Status</th>
                        <th>Current stage</th>
                        <th>Assessment</th>
                        <th>Permit no.</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application) => (
                        <tr key={application.id}>
                          <td>
                            <Link className={styles.recordLink} href={`/business/applications/${application.id}`}>
                              {application.id}
                            </Link>
                          </td>
                          <td>{application.type}</td>
                          <td>{application.period}</td>
                          <td>{formatDate(application.filedAt)}</td>
                          <td>
                            <StatusBadge value={application.status} />
                          </td>
                          <td>{application.currentStage}</td>
                          <td>{formatPeso(application.assessmentAmount)}</td>
                          <td>{application.permitNumber}</td>
                          <td>
                            <Link className={styles.rowAction} href={`/business/applications/${application.id}`}>
                              Open <ChevronRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <ReceiptText size={30} />
                  <h2>No permit applications yet</h2>
                  <p>Start the first application for this registered business.</p>
                  <Link
                    className={styles.primaryButton}
                    href={`/business/applications/new?type=new&businessId=${record.id}`}
                  >
                    Start permit application
                  </Link>
                </div>
              )}
            </section>
          )}

          {tab === "Documents" && (
            <section className={styles.tableCard}>
              <div className={styles.sectionTop}>
                <div>
                  <h2>Document compliance</h2>
                  <p>Requirements submitted for registration and permit processing.</p>
                </div>
                <span className={styles.counter}>
                  {verifiedDocuments} of {documents.length} verified
                </span>
              </div>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Requirement</th>
                      <th>Responsible office</th>
                      <th>Reference</th>
                      <th>Submitted</th>
                      <th>Expiration</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td>
                          <strong>{document.name}</strong>
                        </td>
                        <td>{document.office}</td>
                        <td>{document.reference}</td>
                        <td>{formatDate(document.uploadedAt)}</td>
                        <td>{formatDate(document.expiresAt)}</td>
                        <td>
                          <StatusBadge value={document.status} />
                        </td>
                        <td>
                          <button type="button" className={styles.rowAction}>
                            {document.status === "Not submitted" ? "Upload" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "Activity Log" && (
            <section className={styles.activityCard}>
              <div className={styles.sectionTop}>
                <div>
                  <h2>Record activity log</h2>
                  <p>Accountable history of updates and workflow events.</p>
                </div>
                <span className={styles.counter}>{auditEvents.length} recorded events</span>
              </div>
              <div className={styles.timeline}>
                {auditEvents.map((event, index) => (
                  <article key={event.id}>
                    <span className={styles.timelineMarker}>
                      {index === 0 ? <Activity size={14} /> : <Check size={13} />}
                    </span>
                    <div>
                      <header>
                        <strong>{event.action}</strong>
                        <time>{event.occurredAt}</time>
                      </header>
                      <p>{event.detail}</p>
                      <small>
                        {event.actor} · {event.office}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
