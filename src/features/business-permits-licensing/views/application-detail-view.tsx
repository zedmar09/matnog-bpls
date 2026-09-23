"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  Ban,
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
  HeartPulse,
  MapPin,
  MapPinned,
  MessageSquareText,
  ReceiptText,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";

import { ConfirmationDialog } from "@/shared/components/confirmation-dialog";

import styles from "../components/application-detail.module.css";
import { HealthReviewActions, type HealthReviewFields } from "../components/health-review-actions";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import type {
  ApplicationGateStatus,
  BploReviewAction,
  BploReviewOverride,
  HealthReviewAction,
  HealthReviewOverride,
  ZoningReviewAction,
  ZoningReviewOverride,
} from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import {
  applyBploDecision,
  applyHealthDecision,
  applyZoningDecision,
  BPLO_REVIEW_ACTOR,
  BPLO_REVIEW_STORAGE_KEY,
  createApplicationRequirements,
  createApplicationTimeline,
  createOfficeReviews,
  createProcessingGates,
  HEALTH_REVIEW_ACTOR,
  HEALTH_REVIEW_STORAGE_KEY,
  mergeBploReviewOverrides,
  mergeHealthReviewOverrides,
  mergeZoningReviewOverrides,
  resolveApplicationRecord,
  validateBploDecision,
  validateHealthDecision,
  validateZoningDecision,
  ZONING_REVIEW_ACTOR,
  ZONING_REVIEW_STORAGE_KEY,
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
  const [bploOverride, setBploOverride] = useState<BploReviewOverride>();
  const [zoningOverride, setZoningOverride] = useState<ZoningReviewOverride>();
  const [healthOverride, setHealthOverride] = useState<HealthReviewOverride>();
  const [remarks, setRemarks] = useState("");
  const [affectedRequirementIds, setAffectedRequirementIds] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [pendingBploAction, setPendingBploAction] = useState<Exclude<BploReviewAction, "note"> | null>(null);
  const [zoningFields, setZoningFields] = useState({
    classification: "",
    compatibility: "",
    occupancyType: "",
    referenceNumber: "",
    remarks: "",
  });
  const [zoningAffectedRequirementIds, setZoningAffectedRequirementIds] = useState<string[]>([]);
  const [zoningError, setZoningError] = useState("");
  const [pendingZoningAction, setPendingZoningAction] = useState<Exclude<ZoningReviewAction, "note"> | null>(null);
  const [healthFields, setHealthFields] = useState<HealthReviewFields>({
    inspectionRequirement: "",
    inspectionDate: "",
    sanitaryCategory: "",
    inspectionResult: "",
    permitReference: "",
    complianceAreas: [],
    remarks: "",
  });
  const [healthAffectedRequirementIds, setHealthAffectedRequirementIds] = useState<string[]>([]);
  const [healthError, setHealthError] = useState("");
  const [pendingHealthAction, setPendingHealthAction] = useState<Exclude<HealthReviewAction, "note"> | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const savedApplications = JSON.parse(
        window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]",
      ) as ApplicationDirectoryRecord[];
      setRecord(resolveApplicationRecord(MATNOG_APPLICATION_DIRECTORY, savedApplications, applicationId));
      const reviewOverrides = JSON.parse(
        window.localStorage.getItem(BPLO_REVIEW_STORAGE_KEY) ?? "[]",
      ) as BploReviewOverride[];
      const currentOverride = reviewOverrides.find((item) => item.applicationId === applicationId.toUpperCase());
      setBploOverride(currentOverride);
      setRemarks(currentOverride?.remarks ?? "");
      setAffectedRequirementIds(currentOverride?.affectedRequirementIds ?? []);
      const zoningOverrides = JSON.parse(
        window.localStorage.getItem(ZONING_REVIEW_STORAGE_KEY) ?? "[]",
      ) as ZoningReviewOverride[];
      const currentZoningOverride = zoningOverrides.find((item) => item.applicationId === applicationId.toUpperCase());
      setZoningOverride(currentZoningOverride);
      if (currentZoningOverride) {
        setZoningFields({
          classification: currentZoningOverride.classification,
          compatibility: currentZoningOverride.compatibility,
          occupancyType: currentZoningOverride.occupancyType,
          referenceNumber: currentZoningOverride.referenceNumber,
          remarks: currentZoningOverride.remarks,
        });
        setZoningAffectedRequirementIds(currentZoningOverride.affectedRequirementIds);
      }
      const healthOverrides = JSON.parse(
        window.localStorage.getItem(HEALTH_REVIEW_STORAGE_KEY) ?? "[]",
      ) as HealthReviewOverride[];
      const currentHealthOverride = healthOverrides.find((item) => item.applicationId === applicationId.toUpperCase());
      setHealthOverride(currentHealthOverride);
      if (currentHealthOverride) {
        setHealthFields({
          inspectionRequirement: currentHealthOverride.inspectionRequirement,
          inspectionDate: currentHealthOverride.inspectionDate,
          sanitaryCategory: currentHealthOverride.sanitaryCategory,
          inspectionResult: currentHealthOverride.inspectionResult,
          permitReference: currentHealthOverride.permitReference,
          complianceAreas: currentHealthOverride.complianceAreas,
          remarks: currentHealthOverride.remarks,
        });
        setHealthAffectedRequirementIds(currentHealthOverride.affectedRequirementIds);
      }
      const savedBusinesses = JSON.parse(window.localStorage.getItem(REGISTERED_BUSINESSES_STORAGE_KEY) ?? "[]");
      setBusinesses(mergeBusinessRecords(MATNOG_BUSINESS_DIRECTORY, savedBusinesses));
    } catch {
      window.localStorage.removeItem(SAVED_APPLICATIONS_STORAGE_KEY);
    } finally {
      setLoaded(true);
    }
  }, [applicationId]);

  const business = businesses.find((item) => item.id === record?.businessId);
  const requirements = useMemo(
    () => (record ? createApplicationRequirements(record, bploOverride, zoningOverride, healthOverride) : []),
    [record, bploOverride, zoningOverride, healthOverride],
  );
  const reviews = useMemo(
    () => (record ? createOfficeReviews(record, bploOverride, zoningOverride, healthOverride) : []),
    [record, bploOverride, zoningOverride, healthOverride],
  );
  const gates = useMemo(
    () => (record ? createProcessingGates(record, requirements, reviews) : []),
    [record, requirements, reviews],
  );
  const timeline = useMemo(
    () => (record ? createApplicationTimeline(record, bploOverride, zoningOverride, healthOverride) : []),
    [record, bploOverride, zoningOverride, healthOverride],
  );

  function requestDecision(action: BploReviewAction) {
    const error = validateBploDecision(action, remarks, affectedRequirementIds);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");
    if (action === "note") commitDecision(action);
    else setPendingBploAction(action);
  }

  function commitDecision(action: BploReviewAction) {
    if (!record) return;
    const result = applyBploDecision(record, bploOverride, action, remarks, affectedRequirementIds);
    let savedApplications: ApplicationDirectoryRecord[] = [];
    let reviewOverrides: BploReviewOverride[] = [];
    try {
      savedApplications = JSON.parse(window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]");
      reviewOverrides = JSON.parse(window.localStorage.getItem(BPLO_REVIEW_STORAGE_KEY) ?? "[]");
    } catch {
      savedApplications = [];
      reviewOverrides = [];
    }
    window.localStorage.setItem(
      SAVED_APPLICATIONS_STORAGE_KEY,
      JSON.stringify([result.record, ...savedApplications.filter((item) => item.id !== result.record.id)]),
    );
    window.localStorage.setItem(
      BPLO_REVIEW_STORAGE_KEY,
      JSON.stringify(mergeBploReviewOverrides(reviewOverrides, result.override)),
    );
    setRecord(result.record);
    setBploOverride(result.override);
    setPendingBploAction(null);
    setFormError("");
    setNotice(
      action === "approve"
        ? "BPLO completeness review approved and routed to Zoning."
        : action === "return"
          ? "Application returned for correction."
          : "Internal note saved to the audit trail.",
    );
  }

  function toggleRequirement(id: string) {
    setAffectedRequirementIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setFormError("");
  }

  function updateZoningField(field: keyof typeof zoningFields, value: string) {
    setZoningFields((current) => ({ ...current, [field]: value }));
    setZoningError("");
  }

  function toggleZoningRequirement(id: string) {
    setZoningAffectedRequirementIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setZoningError("");
  }

  function requestZoningDecision(action: ZoningReviewAction) {
    const error = validateZoningDecision(action, zoningFields, zoningAffectedRequirementIds);
    if (error) {
      setZoningError(error);
      return;
    }
    setZoningError("");
    if (action === "note") commitZoningDecision(action);
    else setPendingZoningAction(action);
  }

  function commitZoningDecision(action: ZoningReviewAction) {
    if (!record) return;
    const result = applyZoningDecision(record, zoningOverride, action, zoningFields, zoningAffectedRequirementIds);
    let savedApplications: ApplicationDirectoryRecord[] = [];
    let zoningOverrides: ZoningReviewOverride[] = [];
    try {
      savedApplications = JSON.parse(window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]");
      zoningOverrides = JSON.parse(window.localStorage.getItem(ZONING_REVIEW_STORAGE_KEY) ?? "[]");
    } catch {
      savedApplications = [];
      zoningOverrides = [];
    }
    window.localStorage.setItem(
      SAVED_APPLICATIONS_STORAGE_KEY,
      JSON.stringify([result.record, ...savedApplications.filter((item) => item.id !== result.record.id)]),
    );
    window.localStorage.setItem(
      ZONING_REVIEW_STORAGE_KEY,
      JSON.stringify(mergeZoningReviewOverrides(zoningOverrides, result.override)),
    );
    setRecord(result.record);
    setZoningOverride(result.override);
    setPendingZoningAction(null);
    setZoningError("");
    setNotice(
      action === "approve"
        ? "Zoning review approved and routed to Health and Sanitary Review."
        : action === "return"
          ? "Zoning review returned for correction."
          : action === "not-applicable"
            ? "Zoning review marked not applicable and workflow advanced."
            : "Zoning internal note saved to the audit trail.",
    );
  }

  function updateHealthField<K extends keyof HealthReviewFields>(field: K, value: HealthReviewFields[K]) {
    setHealthFields((current) => ({ ...current, [field]: value }));
    setHealthError("");
  }

  function toggleHealthCompliance(area: string) {
    setHealthFields((current) => ({
      ...current,
      complianceAreas: current.complianceAreas.includes(area)
        ? current.complianceAreas.filter((item) => item !== area)
        : [...current.complianceAreas, area],
    }));
    setHealthError("");
  }

  function toggleHealthRequirement(id: string) {
    setHealthAffectedRequirementIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setHealthError("");
  }

  function requestHealthDecision(action: HealthReviewAction) {
    const error = validateHealthDecision(action, healthFields, healthAffectedRequirementIds);
    if (error) {
      setHealthError(error);
      return;
    }
    setHealthError("");
    if (action === "note") commitHealthDecision(action);
    else setPendingHealthAction(action);
  }

  function commitHealthDecision(action: HealthReviewAction) {
    if (!record) return;
    const result = applyHealthDecision(record, healthOverride, action, healthFields, healthAffectedRequirementIds);
    let savedApplications: ApplicationDirectoryRecord[] = [];
    let healthOverrides: HealthReviewOverride[] = [];
    try {
      savedApplications = JSON.parse(window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]");
      healthOverrides = JSON.parse(window.localStorage.getItem(HEALTH_REVIEW_STORAGE_KEY) ?? "[]");
    } catch {
      savedApplications = [];
      healthOverrides = [];
    }
    window.localStorage.setItem(
      SAVED_APPLICATIONS_STORAGE_KEY,
      JSON.stringify([result.record, ...savedApplications.filter((item) => item.id !== result.record.id)]),
    );
    window.localStorage.setItem(
      HEALTH_REVIEW_STORAGE_KEY,
      JSON.stringify(mergeHealthReviewOverrides(healthOverrides, result.override)),
    );
    setRecord(result.record);
    setHealthOverride(result.override);
    setPendingHealthAction(null);
    setHealthError("");
    setNotice(
      action === "approve"
        ? "Health and sanitary review approved and routed to Fire Safety Review."
        : action === "return"
          ? "Health and sanitary review returned for correction."
          : action === "not-applicable"
            ? "Health and sanitary review marked not applicable and workflow advanced."
            : "Health review internal note saved to the audit trail.",
    );
  }

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
  const terminal = ["Issued", "Closed"].includes(record.status);
  const bploReviewActive = !terminal && reviews[0]?.status !== "Approved";
  const zoningReviewActive =
    !terminal && reviews[0]?.status === "Approved" && !["Approved", "Not applicable"].includes(reviews[1]?.status);
  const healthReviewActive =
    !terminal &&
    ["Approved", "Not applicable"].includes(reviews[1]?.status) &&
    !["Approved", "Not applicable"].includes(reviews[2]?.status);
  const initials = record.businessName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <main className={styles.page}>
      {notice ? (
        <div className={styles.savedNotice} role="status">
          <CheckCircle2 size={15} /> {notice}
        </div>
      ) : null}
      <div className={styles.topActions}>
        <Link className={styles.secondaryButton} href="/applications">
          <ArrowLeft size={14} /> Applications
        </Link>
        <div className={styles.activeReviewNotice}>
          {healthReviewActive ? (
            <HeartPulse size={14} />
          ) : zoningReviewActive ? (
            <MapPinned size={14} />
          ) : (
            <ShieldCheck size={14} />
          )}
          {healthReviewActive
            ? `Health review active · ${HEALTH_REVIEW_ACTOR}`
            : zoningReviewActive
              ? `Zoning review active · ${ZONING_REVIEW_ACTOR}`
              : bploReviewActive
                ? `BPLO review active · ${BPLO_REVIEW_ACTOR}`
                : `Current office · ${record.assignedOfficer}`}
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
                <article
                  className={
                    (index === 0 && bploReviewActive) ||
                    (index === 1 && zoningReviewActive) ||
                    (index === 2 && healthReviewActive)
                      ? styles.activeReviewCard
                      : ""
                  }
                  key={review.id}
                >
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
                  {index === 0 && bploReviewActive ? (
                    <div className={styles.reviewActions}>
                      <div className={styles.reviewActionHeading}>
                        <MessageSquareText size={14} />
                        <span>
                          <strong>BPLO decision and remarks</strong>
                          <small>Only the active BPLO review is editable in this phase.</small>
                        </span>
                      </div>
                      <label className={styles.remarksField}>
                        <span>Review remarks</span>
                        <textarea
                          value={remarks}
                          placeholder="Record findings, endorsement notes, or the correction reason…"
                          onChange={(event) => {
                            setRemarks(event.target.value);
                            setFormError("");
                          }}
                        />
                      </label>
                      <fieldset className={styles.affectedRequirements}>
                        <legend>Affected requirements for correction return</legend>
                        <div>
                          {requirements.map((item) => (
                            <label key={item.id}>
                              <input
                                type="checkbox"
                                checked={affectedRequirementIds.includes(item.id)}
                                onChange={() => toggleRequirement(item.id)}
                              />
                              <span>{item.name}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      {formError ? <p className={styles.formError}>{formError}</p> : null}
                      <div className={styles.reviewButtons}>
                        <button type="button" className={styles.noteButton} onClick={() => requestDecision("note")}>
                          <Save size={13} /> Save internal note
                        </button>
                        <button type="button" className={styles.returnButton} onClick={() => requestDecision("return")}>
                          <RotateCcw size={13} /> Return for correction
                        </button>
                        <button
                          type="button"
                          className={styles.approveButton}
                          onClick={() => requestDecision("approve")}
                        >
                          <CheckCircle2 size={13} /> Approve completeness
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {index === 1 && zoningReviewActive ? (
                    <div className={styles.reviewActions}>
                      <div className={styles.reviewActionHeading}>
                        <MapPinned size={14} />
                        <span>
                          <strong>Zoning findings and locational decision</strong>
                          <small>Record the MPDO land-use determination before routing the application onward.</small>
                        </span>
                      </div>
                      <div className={styles.zoningFieldGrid}>
                        <label>
                          <span>Zoning classification</span>
                          <select
                            value={zoningFields.classification}
                            onChange={(event) => updateZoningField("classification", event.target.value)}
                          >
                            <option value="">Select classification</option>
                            <option>Commercial zone</option>
                            <option>Residential zone</option>
                            <option>Industrial zone</option>
                            <option>Agro-industrial zone</option>
                            <option>Institutional zone</option>
                            <option>Tourism zone</option>
                            <option>Exempt transaction</option>
                          </select>
                        </label>
                        <label>
                          <span>Land-use compatibility</span>
                          <select
                            value={zoningFields.compatibility}
                            onChange={(event) => updateZoningField("compatibility", event.target.value)}
                          >
                            <option value="">Select result</option>
                            <option>Conforming use</option>
                            <option>Conditionally compatible</option>
                            <option>Needs verification</option>
                            <option>Non-conforming use</option>
                            <option>Not applicable</option>
                          </select>
                        </label>
                        <label>
                          <span>Occupancy type</span>
                          <select
                            value={zoningFields.occupancyType}
                            onChange={(event) => updateZoningField("occupancyType", event.target.value)}
                          >
                            <option value="">Select occupancy</option>
                            <option>Mercantile</option>
                            <option>Business</option>
                            <option>Assembly</option>
                            <option>Industrial</option>
                            <option>Storage</option>
                            <option>Mixed-use</option>
                            <option>No change in occupancy</option>
                          </select>
                        </label>
                        <label>
                          <span>Locational reference no.</span>
                          <input
                            value={zoningFields.referenceNumber}
                            placeholder={`ZLC-2026-${record.id.slice(-5)}`}
                            onChange={(event) => updateZoningField("referenceNumber", event.target.value)}
                          />
                        </label>
                      </div>
                      <label className={styles.remarksField}>
                        <span>Site findings / inspection notes</span>
                        <textarea
                          value={zoningFields.remarks}
                          placeholder="Record site conditions, setback findings, compatibility notes, or the correction reason…"
                          onChange={(event) => updateZoningField("remarks", event.target.value)}
                        />
                      </label>
                      <fieldset className={styles.affectedRequirements}>
                        <legend>Affected requirements for correction return</legend>
                        <div>
                          {requirements.map((item) => (
                            <label key={item.id}>
                              <input
                                type="checkbox"
                                checked={zoningAffectedRequirementIds.includes(item.id)}
                                onChange={() => toggleZoningRequirement(item.id)}
                              />
                              <span>{item.name}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      {zoningError ? <p className={styles.formError}>{zoningError}</p> : null}
                      <div className={styles.reviewButtons}>
                        <button
                          type="button"
                          className={styles.noteButton}
                          onClick={() => requestZoningDecision("note")}
                        >
                          <Save size={13} /> Save internal note
                        </button>
                        <button
                          type="button"
                          className={styles.notApplicableButton}
                          onClick={() => requestZoningDecision("not-applicable")}
                        >
                          <Ban size={13} /> Not applicable
                        </button>
                        <button
                          type="button"
                          className={styles.returnButton}
                          onClick={() => requestZoningDecision("return")}
                        >
                          <RotateCcw size={13} /> Return for correction
                        </button>
                        <button
                          type="button"
                          className={styles.approveButton}
                          onClick={() => requestZoningDecision("approve")}
                        >
                          <CheckCircle2 size={13} /> Approve zoning review
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {index === 2 && healthReviewActive ? (
                    <HealthReviewActions
                      fields={healthFields}
                      requirements={requirements}
                      affectedRequirementIds={healthAffectedRequirementIds}
                      error={healthError}
                      onFieldChange={updateHealthField}
                      onToggleCompliance={toggleHealthCompliance}
                      onToggleRequirement={toggleHealthRequirement}
                      onAction={requestHealthDecision}
                    />
                  ) : null}
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
      <ConfirmationDialog
        open={Boolean(pendingBploAction)}
        onOpenChange={(open) => {
          if (!open) setPendingBploAction(null);
        }}
        title={
          pendingBploAction === "approve" ? "Approve BPLO completeness review?" : "Return application for correction?"
        }
        description={
          pendingBploAction === "approve"
            ? "This records BPLO approval, updates the application to Under review, and routes it to Zoning review."
            : `This changes the application to For correction and returns ${affectedRequirementIds.length} selected ${affectedRequirementIds.length === 1 ? "requirement" : "requirements"} to the applicant.`
        }
        confirmLabel={pendingBploAction === "approve" ? "Approve and route" : "Return application"}
        destructive={pendingBploAction === "return"}
        onConfirm={() => {
          if (pendingBploAction) commitDecision(pendingBploAction);
        }}
      />
      <ConfirmationDialog
        open={Boolean(pendingZoningAction)}
        onOpenChange={(open) => {
          if (!open) setPendingZoningAction(null);
        }}
        title={
          pendingZoningAction === "approve"
            ? "Approve zoning and locational review?"
            : pendingZoningAction === "not-applicable"
              ? "Mark zoning review as not applicable?"
              : "Return zoning review for correction?"
        }
        description={
          pendingZoningAction === "approve"
            ? "This records the zoning findings and routes the application to Health and Sanitary Review."
            : pendingZoningAction === "not-applicable"
              ? "This records the exemption reason and routes the application to Health and Sanitary Review."
              : `This returns ${zoningAffectedRequirementIds.length} selected ${zoningAffectedRequirementIds.length === 1 ? "requirement" : "requirements"} to the applicant while keeping the case assigned to Zoning.`
        }
        confirmLabel={
          pendingZoningAction === "approve"
            ? "Approve and route"
            : pendingZoningAction === "not-applicable"
              ? "Confirm not applicable"
              : "Return for correction"
        }
        destructive={pendingZoningAction === "return"}
        onConfirm={() => {
          if (pendingZoningAction) commitZoningDecision(pendingZoningAction);
        }}
      />
      <ConfirmationDialog
        open={Boolean(pendingHealthAction)}
        onOpenChange={(open) => {
          if (!open) setPendingHealthAction(null);
        }}
        title={
          pendingHealthAction === "approve"
            ? "Approve health and sanitary review?"
            : pendingHealthAction === "not-applicable"
              ? "Mark health review as not applicable?"
              : "Return health review for correction?"
        }
        description={
          pendingHealthAction === "approve"
            ? "This records the sanitary findings and routes the application to Fire Safety Review."
            : pendingHealthAction === "not-applicable"
              ? "This records the exemption reason and routes the application to Fire Safety Review."
              : `This returns ${healthAffectedRequirementIds.length} selected ${healthAffectedRequirementIds.length === 1 ? "requirement" : "requirements"} to the applicant while keeping the case assigned to the Municipal Health Office.`
        }
        confirmLabel={
          pendingHealthAction === "approve"
            ? "Approve and route"
            : pendingHealthAction === "not-applicable"
              ? "Confirm not applicable"
              : "Return for correction"
        }
        destructive={pendingHealthAction === "return"}
        onConfirm={() => {
          if (pendingHealthAction) commitHealthDecision(pendingHealthAction);
        }}
      />
    </main>
  );
}
