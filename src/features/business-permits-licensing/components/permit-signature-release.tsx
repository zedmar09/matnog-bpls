import { AlertTriangle, BadgeCheck, LockKeyhole, PackageCheck, PenTool, Send, XCircle } from "lucide-react";

import type { PermitDocumentOverride, PermitReleaseAction, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type { PermitReleaseFields } from "../utils/application-detail-utils";
import styles from "./application-detail.module.css";

type PermitSignatureReleaseProps = {
  record: ApplicationDirectoryRecord;
  document: PermitDocumentOverride;
  workflow: PermitReleaseOverride | undefined;
  fields: PermitReleaseFields;
  error: string;
  onFieldChange: <K extends keyof PermitReleaseFields>(field: K, value: PermitReleaseFields[K]) => void;
  onAction: (action: PermitReleaseAction) => void;
};

export function PermitSignatureRelease({
  record,
  document,
  workflow,
  fields,
  error,
  onFieldChange,
  onAction,
}: PermitSignatureReleaseProps) {
  const signatureStatus = workflow?.signatureStatus ?? "Pending";
  const releaseStatus = workflow?.releaseStatus ?? "Not released";
  const released = releaseStatus === "Released";
  const releaseUnlocked = signatureStatus === "Signed" && !released;

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <span>
          <PenTool size={17} />
        </span>
        <div>
          <h2>E-signature and controlled release</h2>
          <p>Complete the signature envelope before releasing the controlled document.</p>
        </div>
        <small>{released ? "Completed" : signatureStatus}</small>
      </header>

      <div className={styles.signatureStatusStrip}>
        <span className={signatureStatus !== "Pending" ? styles.workflowComplete : styles.workflowCurrent}>
          <Send size={13} /> Envelope sent
        </span>
        <i />
        <span className={signatureStatus === "Signed" ? styles.workflowComplete : styles.workflowCurrent}>
          <BadgeCheck size={13} /> Signature completed
        </span>
        <i />
        <span className={released ? styles.workflowComplete : styles.workflowCurrent}>
          <PackageCheck size={13} /> Released
        </span>
      </div>

      <div className={styles.signatureWorkspace}>
        <section className={styles.workflowPanel}>
          <div className={styles.reviewActionHeading}>
            <PenTool size={14} />
            <span>
              <strong>Signature envelope</strong>
              <small>
                {document.documentNumber} · Version {document.versions.at(-1)?.version ?? 1}
              </small>
            </span>
          </div>
          <div className={styles.zoningFieldGrid}>
            <label>
              <span>Signature provider</span>
              <select
                disabled={released}
                value={fields.provider}
                onChange={(event) => onFieldChange("provider", event.target.value)}
              >
                <option>DocuSign</option>
                <option>Manual digital signature</option>
              </select>
            </label>
            <label>
              <span>Envelope / signing reference</span>
              <input
                disabled={released}
                value={fields.envelopeReference}
                onChange={(event) => onFieldChange("envelopeReference", event.target.value)}
              />
            </label>
            <label>
              <span>Signer email</span>
              <input
                type="email"
                disabled={released}
                value={fields.signerEmail}
                onChange={(event) => onFieldChange("signerEmail", event.target.value)}
              />
            </label>
            <label>
              <span>Sent date</span>
              <input
                type="date"
                max="2026-09-23"
                disabled={released}
                value={fields.sentDate}
                onChange={(event) => onFieldChange("sentDate", event.target.value)}
              />
            </label>
            <label className={styles.fullWidthField}>
              <span>Signature completion date</span>
              <input
                type="date"
                min={fields.sentDate}
                max="2026-09-23"
                disabled={released}
                value={fields.signedDate}
                onChange={(event) => onFieldChange("signedDate", event.target.value)}
              />
            </label>
          </div>
          <label className={styles.remarksField}>
            <span>Signature notes / exception reason</span>
            <textarea
              disabled={released}
              value={fields.signatureNotes}
              placeholder="Record signing evidence, callback notes, decline reason, or provider failure…"
              onChange={(event) => onFieldChange("signatureNotes", event.target.value)}
            />
          </label>
          {!released ? (
            <div className={styles.reviewButtons}>
              {["Pending", "Declined", "Failed"].includes(signatureStatus) ? (
                <button type="button" className={styles.approveButton} onClick={() => onAction("send")}>
                  <Send size={13} /> Send for signature
                </button>
              ) : null}
              {signatureStatus === "Sent" ? (
                <>
                  <button type="button" className={styles.returnButton} onClick={() => onAction("declined")}>
                    <XCircle size={13} /> Record declined
                  </button>
                  <button type="button" className={styles.noteButton} onClick={() => onAction("failed")}>
                    <AlertTriangle size={13} /> Record failed
                  </button>
                  <button type="button" className={styles.approveButton} onClick={() => onAction("signed")}>
                    <BadgeCheck size={13} /> Confirm signed
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className={`${styles.workflowPanel} ${!releaseUnlocked && !released ? styles.releaseLocked : ""}`}>
          <div className={styles.reviewActionHeading}>
            {releaseUnlocked || released ? <PackageCheck size={14} /> : <LockKeyhole size={14} />}
            <span>
              <strong>Release and acknowledgment</strong>
              <small>
                {released
                  ? `${document.documentNumber} has been released and its QR verification record is active.`
                  : releaseUnlocked
                    ? "Signature verified. Capture the recipient acknowledgment to finalize release."
                    : "This section unlocks after signature completion."}
              </small>
            </span>
          </div>
          <fieldset disabled={!releaseUnlocked || released}>
            <div className={styles.zoningFieldGrid}>
              <label>
                <span>Release channel</span>
                <select
                  value={fields.releaseChannel}
                  onChange={(event) => onFieldChange("releaseChannel", event.target.value)}
                >
                  <option>Digital email</option>
                  <option>Onsite pickup</option>
                  <option>Printed counter release</option>
                </select>
              </label>
              <label>
                <span>Release date</span>
                <input
                  type="date"
                  min={fields.signedDate}
                  max="2026-09-23"
                  value={fields.releaseDate}
                  onChange={(event) => onFieldChange("releaseDate", event.target.value)}
                />
              </label>
              <label>
                <span>Recipient name</span>
                <input
                  value={fields.recipientName}
                  onChange={(event) => onFieldChange("recipientName", event.target.value)}
                />
              </label>
              <label>
                <span>Recipient ID / authority</span>
                <input
                  value={fields.recipientIdentification}
                  placeholder="ID type and last four digits"
                  onChange={(event) => onFieldChange("recipientIdentification", event.target.value)}
                />
              </label>
              <label>
                <span>Recipient contact</span>
                <input
                  value={fields.recipientContact}
                  onChange={(event) => onFieldChange("recipientContact", event.target.value)}
                />
              </label>
              <label>
                <span>Releasing officer</span>
                <input
                  value={fields.releasingOfficer}
                  onChange={(event) => onFieldChange("releasingOfficer", event.target.value)}
                />
              </label>
              <label className={styles.fullWidthField}>
                <span>Acknowledgment reference</span>
                <input
                  value={fields.acknowledgmentReference}
                  onChange={(event) => onFieldChange("acknowledgmentReference", event.target.value)}
                />
              </label>
            </div>
            <label className={styles.remarksField}>
              <span>Release notes</span>
              <textarea
                value={fields.releaseNotes}
                onChange={(event) => onFieldChange("releaseNotes", event.target.value)}
              />
            </label>
            <label className={styles.acknowledgmentCheck}>
              <input
                type="checkbox"
                checked={fields.acknowledgmentConfirmed}
                onChange={(event) => onFieldChange("acknowledgmentConfirmed", event.target.checked)}
              />
              <span>Recipient acknowledgment has been captured and attached to this release record.</span>
            </label>
          </fieldset>
          {releaseUnlocked ? (
            <div className={styles.reviewButtons}>
              <button type="button" className={styles.approveButton} onClick={() => onAction("release")}>
                <PackageCheck size={13} /> Finalize {record.type === "Closure" ? "closure" : "issuance"}
              </button>
            </div>
          ) : null}
          {released ? (
            <div className={styles.releaseComplete}>
              <BadgeCheck size={18} />
              <span>
                <strong>{record.type === "Closure" ? "Closure completed" : "Permit issued"}</strong>
                <small>{fields.acknowledgmentReference} · QR verification active</small>
              </span>
            </div>
          ) : null}
        </section>
      </div>

      {error ? <p className={styles.signatureError}>{error}</p> : null}
      {workflow?.attempts.length ? (
        <div className={styles.signatureAttempts}>
          <header>
            <strong>Signature attempt history</strong>
            <small>
              {workflow.attempts.length} envelope attempt{workflow.attempts.length === 1 ? "" : "s"}
            </small>
          </header>
          {workflow.attempts.toReversed().map((attempt) => (
            <article key={attempt.id}>
              <span>
                <strong>{attempt.envelopeReference}</strong>
                <small>
                  {attempt.provider} · {attempt.signerEmail}
                </small>
              </span>
              <span>
                <strong>{attempt.status}</strong>
                <small>{attempt.completedAt || attempt.sentAt}</small>
              </span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
