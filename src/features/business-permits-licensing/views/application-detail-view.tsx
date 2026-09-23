"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileQuestion,
  FileText,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import styles from "../components/application-detail.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import type { ApplicationGateStatus } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import {
  createApplicationRequirements,
  createApplicationTimeline,
  createOfficeReviews,
  createProcessingGates,
  resolveApplicationRecord,
} from "../utils/application-detail-utils";
import { SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import { mergeBusinessRecords, REGISTERED_BUSINESSES_STORAGE_KEY } from "../utils/business-registration-utils";

function formatDate(value: string, includeTime = false) {
  if (!value) return "—";
  const source = value.includes("T") ? value : value.replace(" ", "T");
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(source.length === 10 ? `${source}T00:00:00` : source));
}

function formatPeso(value: number) {
  return value
    ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value)
    : "—";
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`${styles.badge} ${styles[`status${value.replaceAll(" ", "")}`] ?? ""}`}>{value}</span>;
}

function FactGrid({ items }: { items: Array<[string, string | number]> }) {
  return (
    <dl className={styles.factGrid}>
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function GateIcon({ status }: { status: ApplicationGateStatus }) {
  if (status === "Complete") return <Check size={13} />;
  if (status === "Blocked") return <AlertTriangle size={13} />;
  return <CircleDot size={13} />;
}

export function ApplicationDetailView({ applicationId }: { applicationId: string }) {
  const seededRecord = resolveApplicationRecord(MATNOG_APPLICATION_DIRECTORY, [], applicationId);
  const [record, setRecord] = useState<ApplicationDirectoryRecord | undefined>(seededRecord);
  const [businesses, setBusinesses] = useState(() => [...MATNOG_BUSINESS_DIRECTORY]);
  const [loaded, setLoaded] = useState(Boolean(seededRecord));

  useEffect(() => {
    try {
      const savedApplications = JSON.parse(
        window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]",
      ) as ApplicationDirectoryRecord[];
      setRecord(resolveApplicationRecord(MATNOG_APPLICATION_DIRECTORY, savedApplications, applicationId));
      const savedBusinesses = JSON.parse(window.localStorage.getItem(REGISTERED_BUSINESSES_STORAGE_KEY) ?? "[]");
      setBusinesses(mergeBusinessRecords(MATNOG_BUSINESS_DIRECTORY, savedBusinesses));
    } catch {
      window.localStorage.removeItem(SAVED_APPLICATIONS_STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, [applicationId]);

  const business = businesses.find((item) => item.id === record?.businessId);
  const requirements = useMemo(() => (record ? createApplicationRequirements(record) : []), [record]);
  const reviews = useMemo(() => (record ? createOfficeReviews(record) : []), [record]);
  const gates = useMemo(
    () => (record ? createProcessingGates(record, requirements, reviews) : []),
    [record, requirements, reviews],
  );
  const timeline = useMemo(() => (record ? createApplicationTimeline(record) : []), [record]);

  if (!loaded)
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Loading application workspace…</div>
      </main>
    );

  if (!record)
    return (
      <main className={`${styles.page} ${styles.notFound}`}>
        <section>
          <FileQuestion size={38} />
          <h1>Application not found</h1>
          <p>The requested reference does not exist in the current application registry.</p>
          <Link className={styles.primaryButton} href="/applications">
            <ArrowLeft size={14} /> Return to applications
          </Link>
        </section>
      </main>
    );

  const verifiedRequirements = requirements.filter((item) => item.status === "Verified").length;
  const approvedReviews = reviews.filter((item) => ["Approved", "Not applicable"].includes(item.status)).length;
  const completedGates = gates.filter((gate) => gate.status === "Complete").length;
  const initials = record.businessName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <main className={styles.page}>
      <div className={styles.topActions}>
        <Link className={styles.secondaryButton} href="/applications">
          <ArrowLeft size={14} /> Applications
        </Link>
        <div className={styles.readOnlyNotice}>
          <ShieldCheck size={14} /> Review workspace · read-only
        </div>
      </div>

      <section className={styles.applicationHero}>
        <div className={styles.applicationAvatar}>{initials}</div>
        <div className={styles.heroIdentity}>
          <p className={styles.eyebrow}>{record.id}</p>
          <h1>{record.businessName}</h1>
          <p>{record.registeredName}</p>
          <div className={styles.badgeRow}>
            <StatusBadge value={record.status} />
            <span className={styles.badge}>{record.type}</span>
            <span className={`${styles.badge} ${styles[`risk${record.riskLevel}`]}`}>{record.riskLevel} risk</span>
            {record.priority === "Urgent" ? <span className={`${styles.badge} ${styles.urgent}`}>Urgent</span> : null}
          </div>
        </div>
        <dl className={styles.heroMeta}>
          <div>
            <dt>Current stage</dt>
            <dd>{record.currentStage}</dd>
          </div>
          <div>
            <dt>Assigned officer</dt>
            <dd>{record.assignedOfficer}</dd>
          </div>
          <div>
            <dt>Target release</dt>
            <dd>{formatDate(record.targetRelease)}</dd>
          </div>
          <div>
            <dt>Permit number</dt>
            <dd>{record.permitNumber}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.summaryGrid} aria-label="Application completion summary">
        <article>
          <FileCheck2 size={18} />
          <span>
            Requirements
            <strong>
              {verifiedRequirements}/{requirements.length}
            </strong>
            <small>Verified evidence</small>
          </span>
        </article>
        <article>
          <ClipboardCheck size={18} />
          <span>
            Office reviews
            <strong>
              {approvedReviews}/{reviews.length}
            </strong>
            <small>Approved or not applicable</small>
          </span>
        </article>
        <article>
          <Banknote size={18} />
          <span>
            Assessment<strong>{formatPeso(record.assessmentAmount)}</strong>
            <small>{record.paymentStatus}</small>
          </span>
        </article>
        <article>
          <ShieldCheck size={18} />
          <span>
            Processing gates
            <strong>
              {completedGates}/{gates.length}
            </strong>
            <small>Ready for final action</small>
          </span>
        </article>
      </section>

      <div className={styles.workspace}>
        <div className={styles.primaryColumn}>
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <span>
                <FileText size={17} />
              </span>
              <div>
                <h2>Application information</h2>
                <p>Filing, applicant, and establishment details.</p>
              </div>
            </header>
            <FactGrid
              items={[
                ["Application type", record.type],
                ["Fiscal period", record.fiscalPeriod],
                ["Filed", formatDate(record.filedAt, true)],
                ["Last updated", formatDate(record.updatedAt, true)],
                ["Applicant / owner", record.ownerName],
                ["Contact number", business?.contactNumber ?? "Not recorded"],
                ["Email address", business?.email ?? "Not recorded"],
                ["Filing channel", Number(record.id.replace(/\D/g, "")) % 2 ? "Onsite" : "Online"],
              ]}
            />
            <div className={styles.detailDivider} />
            <div className={styles.businessStrip}>
              <Building2 size={18} />
              <div>
                <strong>{record.businessName}</strong>
                <span>
                  {record.businessId} · {record.barangay}, Matnog, Sorsogon
                </span>
              </div>
              <Link href={`/businesses/${record.businessId}`}>Open business record</Link>
            </div>
            <FactGrid
              items={[
                ["Primary activity", business?.primaryActivity ?? "Registered business activity"],
                ["Establishment address", business?.address ?? `${record.barangay}, Matnog, Sorsogon`],
                ["Organization", business?.organizationType ?? "Business registration on file"],
                ["Registration reference", business?.registrationNumber ?? "Linked registry record"],
              ]}
            />
          </section>

          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <span>
                <FileCheck2 size={17} />
              </span>
              <div>
                <h2>Requirements and evidence</h2>
                <p>Submitted records and their current validation state.</p>
              </div>
              <small>{verifiedRequirements} verified</small>
            </header>
            <div className={styles.requirementTable}>
              <div className={styles.tableHead}>
                <span>Requirement</span>
                <span>Reference</span>
                <span>Submitted</span>
                <span>Expires</span>
                <span>Status</span>
              </div>
              {requirements.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>
                      {item.name}
                      {item.mandatory ? <b> *</b> : null}
                    </strong>
                    <small>{item.office}</small>
                  </div>
                  <span>{item.reference}</span>
                  <span>{formatDate(item.submittedAt)}</span>
                  <span>{formatDate(item.expiresAt)}</span>
                  <StatusBadge value={item.status} />
                </article>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <span>
                <ClipboardCheck size={17} />
              </span>
              <div>
                <h2>Office review board</h2>
                <p>Applicable municipal decisions and assigned reviewing officers.</p>
              </div>
              <small>{approvedReviews} approved</small>
            </header>
            <div className={styles.reviewGrid}>
              {reviews.map((review, index) => (
                <article key={review.id}>
                  <div className={styles.reviewTop}>
                    <span className={styles.reviewNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <StatusBadge value={review.status} />
                  </div>
                  <h3>{review.office}</h3>
                  <p>{review.remarks}</p>
                  <dl>
                    <div>
                      <dt>Assignee</dt>
                      <dd>{review.assignee}</dd>
                    </div>
                    <div>
                      <dt>Received</dt>
                      <dd>{formatDate(review.receivedAt, true)}</dd>
                    </div>
                    <div>
                      <dt>Completed</dt>
                      <dd>{formatDate(review.completedAt, true)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <span>
                <Clock3 size={17} />
              </span>
              <div>
                <h2>Timeline and audit trail</h2>
                <p>Chronological record of workflow activity.</p>
              </div>
              <small>{timeline.length} events</small>
            </header>
            <ol className={styles.timeline}>
              {timeline.toReversed().map((event, index) => (
                <li key={event.id}>
                  <div className={index === 0 ? styles.timelineCurrent : ""}>
                    <Check size={12} />
                  </div>
                  <section>
                    <header>
                      <strong>{event.action}</strong>
                      <time>{formatDate(event.occurredAt, true)}</time>
                    </header>
                    <p>{event.detail}</p>
                    <small>
                      {event.actor} · {event.office}
                    </small>
                  </section>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <span>
                <ShieldCheck size={17} />
              </span>
              <div>
                <h2>Processing readiness</h2>
                <p>Required gates for final action.</p>
              </div>
            </header>
            <div className={styles.gateList}>
              {gates.map((gate, index) => (
                <article key={gate.id}>
                  <div className={`${styles.gateIcon} ${styles[`gate${gate.status.replaceAll(" ", "")}`]}`}>
                    <GateIcon status={gate.status} />
                  </div>
                  <span>
                    <strong>{gate.label}</strong>
                    <small>{gate.detail}</small>
                  </span>
                  {index < gates.length - 1 ? <i /> : null}
                </article>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <span>
                <ReceiptText size={17} />
              </span>
              <div>
                <h2>Assessment and payment</h2>
                <p>Current financial gate.</p>
              </div>
            </header>
            <div className={styles.amountBox}>
              <span>Total assessment</span>
              <strong>{formatPeso(record.assessmentAmount)}</strong>
              <StatusBadge value={record.paymentStatus} />
            </div>
            {record.assessmentAmount ? (
              <dl className={styles.paymentBreakdown}>
                <div>
                  <dt>Business tax</dt>
                  <dd>{formatPeso(Math.round(record.assessmentAmount * 0.63))}</dd>
                </div>
                <div>
                  <dt>Regulatory fees</dt>
                  <dd>{formatPeso(Math.round(record.assessmentAmount * 0.25))}</dd>
                </div>
                <div>
                  <dt>Other local charges</dt>
                  <dd>
                    {formatPeso(
                      record.assessmentAmount -
                        Math.round(record.assessmentAmount * 0.63) -
                        Math.round(record.assessmentAmount * 0.25),
                    )}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className={styles.emptyText}>The Treasurer’s Office has not posted an assessment.</p>
            )}
          </section>

          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <span>
                <CalendarClock size={17} />
              </span>
              <div>
                <h2>Service target</h2>
                <p>Application turnaround tracking.</p>
              </div>
            </header>
            <FactGrid
              items={[
                ["Filed", formatDate(record.filedAt)],
                ["Target release", formatDate(record.targetRelease)],
                ["Priority", record.priority],
                ["Last activity", formatDate(record.updatedAt, true)],
              ]}
            />
            <div className={styles.slaNote}>
              <MapPin size={14} />
              <span>
                Processing office<strong>{record.currentStage}</strong>
              </span>
            </div>
          </section>

          <section className={styles.auditNote}>
            <CheckCircle2 size={18} />
            <div>
              <strong>Audit-ready view</strong>
              <p>
                All displayed decisions, evidence states, assignments, and timestamps are tied to this application
                reference.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
