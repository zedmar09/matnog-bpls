"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  BadgeCheck,
  Ban,
  Building2,
  CalendarDays,
  ChevronRight,
  FileBadge2,
  FileQuestion,
  History,
  QrCode,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { ConfirmationDialog } from "@/shared/components/confirmation-dialog";

import styles from "../components/permit-detail.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_PERMIT_REGISTRY } from "../data/matnog-permit-registry";
import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type {
  PermitLifecycleAction,
  PermitLifecycleFields,
  PermitLifecycleOverride,
  PermitRegistryRecord,
} from "../types/permit-registry";
import { PERMIT_DOCUMENT_STORAGE_KEY, PERMIT_RELEASE_STORAGE_KEY } from "../utils/application-detail-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import {
  applyPermitLifecycleAction,
  createDefaultPermitLifecycleFields,
  createPermitLifecycleHistory,
  mergePermitLifecycleOverrides,
  mergePermitRegistryRecords,
  PERMIT_LIFECYCLE_STORAGE_KEY,
  PERMIT_RESTRICTION_GROUNDS,
  validatePermitLifecycleAction,
} from "../utils/permit-registry-utils";

function formatDate(value: string) {
  if (!value) return "Not applicable";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value.replace(" ", "T")),
  );
}

function statusClass(status: string) {
  return styles[`status${status.replaceAll(" ", "")}`] ?? "";
}

function actionLabel(action: PermitLifecycleAction) {
  return action === "suspend" ? "Suspend permit" : action === "revoke" ? "Revoke permit" : "Reinstate permit";
}

export function PermitDetailView({ documentNumber }: { documentNumber: string }) {
  const normalizedDocumentNumber = decodeURIComponent(documentNumber).toLocaleUpperCase();
  const seededRecord = useMemo(
    () => MATNOG_PERMIT_REGISTRY.find((item) => item.documentNumber === normalizedDocumentNumber),
    [normalizedDocumentNumber],
  );
  const [record, setRecord] = useState<PermitRegistryRecord | undefined>(seededRecord);
  const [lifecycleOverride, setLifecycleOverride] = useState<PermitLifecycleOverride>();
  const [allLifecycleOverrides, setAllLifecycleOverrides] = useState<PermitLifecycleOverride[]>([]);
  const [hydrated, setHydrated] = useState(Boolean(seededRecord));
  const [selectedAction, setSelectedAction] = useState<PermitLifecycleAction | null>(null);
  const [pendingAction, setPendingAction] = useState<PermitLifecycleAction | null>(null);
  const [fields, setFields] = useState<PermitLifecycleFields>(createDefaultPermitLifecycleFields);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const savedApplications = JSON.parse(
        window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]",
      ) as ApplicationDirectoryRecord[];
      const documents = JSON.parse(
        window.localStorage.getItem(PERMIT_DOCUMENT_STORAGE_KEY) ?? "[]",
      ) as PermitDocumentOverride[];
      const releases = JSON.parse(
        window.localStorage.getItem(PERMIT_RELEASE_STORAGE_KEY) ?? "[]",
      ) as PermitReleaseOverride[];
      const lifecycleOverrides = JSON.parse(
        window.localStorage.getItem(PERMIT_LIFECYCLE_STORAGE_KEY) ?? "[]",
      ) as PermitLifecycleOverride[];
      const applications = mergeApplicationRecords(MATNOG_APPLICATION_DIRECTORY, savedApplications);
      const registry = mergePermitRegistryRecords(
        MATNOG_PERMIT_REGISTRY,
        applications,
        documents,
        releases,
        lifecycleOverrides,
      );
      setRecord(registry.find((item) => item.documentNumber.toLocaleUpperCase() === normalizedDocumentNumber));
      setLifecycleOverride(lifecycleOverrides.find((item) => item.documentNumber === normalizedDocumentNumber));
      setAllLifecycleOverrides(lifecycleOverrides);
    } catch {
      setRecord(seededRecord);
    } finally {
      setHydrated(true);
    }
  }, [normalizedDocumentNumber, seededRecord]);

  const history = useMemo(
    () => (record ? createPermitLifecycleHistory(record, lifecycleOverride) : []),
    [record, lifecycleOverride],
  );

  const updateField = <K extends keyof PermitLifecycleFields>(field: K, value: PermitLifecycleFields[K]) => {
    setFields((current) => ({ ...current, [field]: value }));
    setFormError("");
  };

  const chooseAction = (action: PermitLifecycleAction) => {
    setFields(createDefaultPermitLifecycleFields());
    setFormError("");
    setNotice("");
    setSelectedAction(action);
  };

  const requestAction = () => {
    if (!record || !selectedAction) return;
    const error = validatePermitLifecycleAction(record, selectedAction, fields);
    if (error) {
      setFormError(error);
      return;
    }
    setPendingAction(selectedAction);
  };

  const commitAction = () => {
    if (!record || !pendingAction) return;
    const result = applyPermitLifecycleAction(record, lifecycleOverride, pendingAction, fields);
    const nextOverrides = mergePermitLifecycleOverrides(allLifecycleOverrides, result.override);
    window.localStorage.setItem(PERMIT_LIFECYCLE_STORAGE_KEY, JSON.stringify(nextOverrides));
    setRecord(result.record);
    setLifecycleOverride(result.override);
    setAllLifecycleOverrides(nextOverrides);
    setSelectedAction(null);
    setPendingAction(null);
    setFields(createDefaultPermitLifecycleFields());
    setFormError("");
    setNotice(
      pendingAction === "suspend"
        ? "Permit suspended; public QR verification now shows the restriction."
        : pendingAction === "revoke"
          ? "Permit revoked; public QR verification now shows the terminal restriction."
          : "Permit reinstated; active public verification has been restored.",
    );
  };

  if (!hydrated) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.notFound}>Loading controlled permit record…</div>
        </div>
      </main>
    );
  }

  if (!record) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.notFound}>
            <div>
              <FileQuestion size={34} />
              <h1>Permit record not found</h1>
              <p>No controlled document matches {normalizedDocumentNumber}.</p>
              <Link className={styles.primaryButton} href="/permits">
                Return to Permit Registry
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const canRestrict = record.documentType === "Business Permit" && record.status !== "Revoked";
  const canSuspend = canRestrict && record.status !== "Suspended";
  const canReinstate = record.status === "Suspended";
  const verificationActive = record.verificationStatus === "Active";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/permits">Permit Registry</Link>
          <ChevronRight size={11} />
          <span>{record.documentNumber}</span>
        </nav>
        {notice ? (
          <div
            role="status"
            className={
              verificationActive ? styles.verificationCard : `${styles.verificationCard} ${styles.verificationInactive}`
            }
          >
            <BadgeCheck size={17} />
            <div>
              <strong>Lifecycle action recorded</strong>
              <span>{notice}</span>
            </div>
          </div>
        ) : null}

        <header className={styles.recordHeader}>
          <div className={styles.titleGroup}>
            <span className={styles.documentIcon}>
              <FileBadge2 size={22} />
            </span>
            <div>
              <p className={styles.eyebrow}>{record.documentType}</p>
              <h1>{record.documentNumber}</h1>
              <p>
                {record.businessName} · {record.applicationId}
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.statusBadge} ${statusClass(record.status)}`}>{record.status}</span>
            {canSuspend ? (
              <button className={styles.secondaryButton} type="button" onClick={() => chooseAction("suspend")}>
                <ShieldAlert size={14} /> Suspend
              </button>
            ) : null}
            {canReinstate ? (
              <button className={styles.primaryButton} type="button" onClick={() => chooseAction("reinstate")}>
                <RotateCcw size={14} /> Reinstate
              </button>
            ) : null}
            {canRestrict ? (
              <button className={styles.dangerButton} type="button" onClick={() => chooseAction("revoke")}>
                <Ban size={14} /> Revoke
              </button>
            ) : null}
          </div>
        </header>

        <section className={styles.summaryGrid} aria-label="Permit record summary">
          <article>
            <Building2 size={18} />
            <span>
              Business<strong>{record.businessName}</strong>
              <small>{record.businessId}</small>
            </span>
          </article>
          <article>
            <CalendarDays size={18} />
            <span>
              Validity<strong>{formatDate(record.effectiveUntil)}</strong>
              <small>Effective {formatDate(record.effectiveFrom)}</small>
            </span>
          </article>
          <article className={verificationActive ? styles.summarySuccess : styles.summaryDanger}>
            <QrCode size={18} />
            <span>
              QR verification<strong>{record.verificationStatus}</strong>
              <small>{record.qrToken}</small>
            </span>
          </article>
          <article>
            <History size={18} />
            <span>
              Lifecycle events<strong>{history.length}</strong>
              <small>Immutable activity records</small>
            </span>
          </article>
        </section>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            {selectedAction ? (
              <section className={`${styles.panel} ${styles.actionForm}`}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2>{actionLabel(selectedAction)}</h2>
                    <p>Record the controlling evidence before changing public permit status.</p>
                  </div>
                  <span className={styles.statusBadge}>Draft action</span>
                </div>
                <div className={styles.panelBody}>
                  <div className={styles.formGrid}>
                    {selectedAction !== "reinstate" ? (
                      <label className={styles.field}>
                        <span>Grounds</span>
                        <select value={fields.grounds} onChange={(event) => updateField("grounds", event.target.value)}>
                          <option value="">Select grounds</option>
                          {PERMIT_RESTRICTION_GROUNDS.map((ground) => (
                            <option key={ground}>{ground}</option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <label className={styles.field}>
                      <span>
                        {selectedAction === "reinstate" ? "Reinstatement order" : "Order / resolution reference"}
                      </span>
                      <input
                        value={fields.orderReference}
                        onChange={(event) => updateField("orderReference", event.target.value)}
                        placeholder="e.g. MO-2026-0118"
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Effective date</span>
                      <input
                        type="date"
                        value={fields.effectiveDate}
                        onChange={(event) => updateField("effectiveDate", event.target.value)}
                      />
                    </label>
                    {selectedAction === "suspend" ? (
                      <label className={styles.field}>
                        <span>Restriction end date (optional)</span>
                        <input
                          type="date"
                          value={fields.endDate}
                          onChange={(event) => updateField("endDate", event.target.value)}
                        />
                      </label>
                    ) : null}
                    <label className={styles.field}>
                      <span>Approving officer</span>
                      <input
                        value={fields.approvingOfficer}
                        onChange={(event) => updateField("approvingOfficer", event.target.value)}
                      />
                    </label>
                    <label className={`${styles.field} ${styles.fieldWide}`}>
                      <span>Decision reason</span>
                      <textarea
                        value={fields.reason}
                        onChange={(event) => updateField("reason", event.target.value)}
                        placeholder="State the verified finding, authority, and operational effect…"
                      />
                    </label>
                  </div>
                  {formError ? (
                    <p className={styles.formError} role="alert">
                      {formError}
                    </p>
                  ) : null}
                  <div className={styles.formActions}>
                    <button className={styles.secondaryButton} type="button" onClick={() => setSelectedAction(null)}>
                      Cancel
                    </button>
                    <button
                      className={selectedAction === "revoke" ? styles.dangerButton : styles.primaryButton}
                      type="button"
                      onClick={requestAction}
                    >
                      {actionLabel(selectedAction)}
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Controlled document information</h2>
                  <p>Identity, validity, business, and issuing references.</p>
                </div>
                <span className={`${styles.statusBadge} ${statusClass(record.status)}`}>{record.status}</span>
              </div>
              <div className={styles.panelBody}>
                <dl className={styles.facts}>
                  <div>
                    <dt>Business / trade name</dt>
                    <dd>{record.businessName}</dd>
                  </div>
                  <div>
                    <dt>Registered name</dt>
                    <dd>{record.registeredName}</dd>
                  </div>
                  <div>
                    <dt>Owner / representative</dt>
                    <dd>{record.ownerName}</dd>
                  </div>
                  <div>
                    <dt>Barangay</dt>
                    <dd>{record.barangay}, Matnog, Sorsogon</dd>
                  </div>
                  <div>
                    <dt>Application</dt>
                    <dd>
                      <Link href={`/applications/${record.applicationId}`}>{record.applicationId}</Link>
                    </dd>
                  </div>
                  <div>
                    <dt>Business record</dt>
                    <dd>
                      <Link href={`/businesses/${record.businessId}`}>{record.businessId}</Link>
                    </dd>
                  </div>
                  <div>
                    <dt>Issue date</dt>
                    <dd>{formatDate(record.issueDate)}</dd>
                  </div>
                  <div>
                    <dt>Effective from</dt>
                    <dd>{formatDate(record.effectiveFrom)}</dd>
                  </div>
                  <div>
                    <dt>Valid until</dt>
                    <dd>{formatDate(record.effectiveUntil)}</dd>
                  </div>
                  <div>
                    <dt>Fiscal period</dt>
                    <dd>{record.fiscalPeriod}</dd>
                  </div>
                  <div>
                    <dt>Document version</dt>
                    <dd>Version {record.version}</dd>
                  </div>
                  <div>
                    <dt>Last updated</dt>
                    <dd>{formatDateTime(record.lastUpdated)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Lifecycle and audit history</h2>
                  <p>Issuance and restriction decisions in reverse chronological order.</p>
                </div>
                <span className={styles.statusBadge}>{history.length} events</span>
              </div>
              <div className={styles.panelBody}>
                <ol className={styles.timeline}>
                  {history.map((event) => (
                    <li key={event.id}>
                      <div className={styles.timelineHeader}>
                        <strong>
                          {event.action} · {event.resultingStatus}
                        </strong>
                        <time>{formatDateTime(event.occurredAt)}</time>
                      </div>
                      <p>{event.reason}</p>
                      <p className={styles.timelineMeta}>
                        {event.orderReference} · {event.actor} · Effective {formatDate(event.effectiveDate)}
                        {event.endDate ? ` to ${formatDate(event.endDate)}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>

          <aside className={styles.asideColumn}>
            <div
              className={
                verificationActive
                  ? styles.verificationCard
                  : `${styles.verificationCard} ${styles.verificationInactive}`
              }
            >
              <ShieldCheck size={18} />
              <div>
                <strong>Public verification {record.verificationStatus.toLocaleLowerCase()}</strong>
                <span>
                  {verificationActive
                    ? "The QR token resolves to the current public permit status."
                    : "The public QR result displays the active restriction."}
                </span>
              </div>
            </div>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>QR verification</h2>
                  <p>Public authenticity projection.</p>
                </div>
              </div>
              <div className={styles.panelBody}>
                <dl className={styles.facts}>
                  <div className={styles.fieldWide}>
                    <dt>Verification token</dt>
                    <dd className={styles.token}>{record.qrToken}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{record.verificationStatus}</dd>
                  </div>
                  <div>
                    <dt>Document</dt>
                    <dd>{record.status}</dd>
                  </div>
                </dl>
                <Link className={styles.secondaryButton} href={`/verify/documents/${record.qrToken}`}>
                  Open public result
                </Link>
              </div>
            </section>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Release evidence</h2>
                  <p>Controlled issuance record.</p>
                </div>
              </div>
              <div className={styles.panelBody}>
                <dl className={styles.facts}>
                  <div>
                    <dt>Release status</dt>
                    <dd>{record.releaseStatus}</dd>
                  </div>
                  <div>
                    <dt>Signature</dt>
                    <dd>{record.signatureStatus}</dd>
                  </div>
                  <div>
                    <dt>Release date</dt>
                    <dd>{formatDate(record.releaseDate)}</dd>
                  </div>
                  <div>
                    <dt>Channel</dt>
                    <dd>{record.releaseChannel}</dd>
                  </div>
                  <div className={styles.fieldWide}>
                    <dt>Releasing officer</dt>
                    <dd>{record.releasingOfficer}</dd>
                  </div>
                </dl>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <ConfirmationDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={pendingAction ? `${actionLabel(pendingAction)}?` : "Confirm lifecycle action"}
        description={
          pendingAction === "suspend"
            ? "This immediately disables active public QR verification and marks the permit Suspended."
            : pendingAction === "revoke"
              ? "This is a terminal action. The permit will be marked Revoked and public verification will remain restricted."
              : "This lifts the suspension and restores active public QR verification."
        }
        confirmLabel={pendingAction ? actionLabel(pendingAction) : "Confirm"}
        destructive={pendingAction === "revoke"}
        onConfirm={commitAction}
      />
    </main>
  );
}
