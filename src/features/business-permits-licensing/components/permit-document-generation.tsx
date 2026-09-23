import { FileCheck2, QrCode, Save, Sparkles } from "lucide-react";

import type { MayorReviewOverride, PermitDocumentAction, PermitDocumentOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type { PermitDocumentFields } from "../utils/application-detail-utils";
import styles from "./application-detail.module.css";

type PermitDocumentGenerationProps = {
  record: ApplicationDirectoryRecord;
  mayorDecision: MayorReviewOverride;
  fields: PermitDocumentFields;
  document: PermitDocumentOverride | undefined;
  error: string;
  onFieldChange: <K extends keyof PermitDocumentFields>(field: K, value: PermitDocumentFields[K]) => void;
  onAction: (action: PermitDocumentAction) => void;
};

export function PermitDocumentGeneration({
  record,
  mayorDecision,
  fields,
  document,
  error,
  onFieldChange,
  onAction,
}: PermitDocumentGenerationProps) {
  const closure = record.type === "Closure";
  const latestVersion = document?.versions.at(-1);

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <span>
          <FileCheck2 size={17} />
        </span>
        <div>
          <h2>{closure ? "Closure certificate generation" : "Business permit generation"}</h2>
          <p>Prepare the controlled document before e-signature and release.</p>
        </div>
        <small>{document?.status ?? "New draft"}</small>
      </header>

      <div className={styles.documentWorkspace}>
        <div className={styles.documentForm}>
          <div className={styles.reviewActionHeading}>
            <Sparkles size={14} />
            <span>
              <strong>Document production controls</strong>
              <small>Generated versions are preserved; editing creates the basis for the next version.</small>
            </span>
          </div>

          <div className={styles.zoningFieldGrid}>
            <label>
              <span>Controlled document number</span>
              <input
                value={fields.documentNumber}
                readOnly={Boolean(document?.versions.length)}
                onChange={(event) => onFieldChange("documentNumber", event.target.value)}
              />
              {document?.versions.length ? (
                <small className={styles.fieldHelp}>Locked after first generation.</small>
              ) : null}
            </label>
            <label>
              <span>Template</span>
              <select
                value={fields.templateName}
                onChange={(event) => onFieldChange("templateName", event.target.value)}
              >
                {closure ? (
                  <>
                    <option>Matnog Closure Certificate · 2026</option>
                    <option>Matnog Closure Certificate · Formal</option>
                  </>
                ) : (
                  <>
                    <option>Matnog Business Permit · 2026</option>
                    <option>Matnog Business Permit · Conditional</option>
                  </>
                )}
              </select>
            </label>
            <label>
              <span>Issue date</span>
              <input
                type="date"
                max="2026-09-23"
                value={fields.issueDate}
                onChange={(event) => onFieldChange("issueDate", event.target.value)}
              />
            </label>
            <label>
              <span>{closure ? "Closure effectivity" : "Permit valid from"}</span>
              <input
                type="date"
                value={fields.effectiveFrom}
                onChange={(event) => onFieldChange("effectiveFrom", event.target.value)}
              />
            </label>
            {!closure ? (
              <label>
                <span>Permit valid until</span>
                <input
                  type="date"
                  min={fields.effectiveFrom}
                  value={fields.effectiveUntil}
                  onChange={(event) => onFieldChange("effectiveUntil", event.target.value)}
                />
              </label>
            ) : null}
            <label>
              <span>E-signature provider</span>
              <select
                value={fields.signatureProvider}
                onChange={(event) => onFieldChange("signatureProvider", event.target.value)}
              >
                <option>DocuSign · Pending connection</option>
                <option>Manual digital signature</option>
              </select>
            </label>
            <label>
              <span>Authorized signatory</span>
              <input
                value={fields.signatoryName}
                onChange={(event) => onFieldChange("signatoryName", event.target.value)}
              />
            </label>
            <label>
              <span>Signatory title</span>
              <input
                value={fields.signatoryTitle}
                onChange={(event) => onFieldChange("signatoryTitle", event.target.value)}
              />
            </label>
          </div>

          <label className={styles.remarksField}>
            <span>Conditions appearing on document</span>
            <textarea value={fields.conditions} onChange={(event) => onFieldChange("conditions", event.target.value)} />
          </label>
          <label className={styles.remarksField}>
            <span>Internal production notes</span>
            <textarea
              value={fields.productionNotes}
              placeholder="Record template adjustments, printing instructions, or revision notes…"
              onChange={(event) => onFieldChange("productionNotes", event.target.value)}
            />
          </label>

          {error ? <p className={styles.formError}>{error}</p> : null}
          <div className={styles.reviewButtons}>
            <button type="button" className={styles.noteButton} onClick={() => onAction("save")}>
              <Save size={13} /> Save draft
            </button>
            <button type="button" className={styles.approveButton} onClick={() => onAction("generate")}>
              <FileCheck2 size={13} /> {latestVersion ? "Generate new version" : "Generate document"}
            </button>
          </div>
        </div>

        <aside className={styles.documentPreview} aria-label="Document preview">
          <div className={styles.documentSeal}>M</div>
          <small>Republic of the Philippines</small>
          <strong>Municipality of Matnog</strong>
          <span>Province of Sorsogon</span>
          <h3>{closure ? "Certificate of Business Closure" : "Mayor’s Business Permit"}</h3>
          <p className={styles.documentNumber}>{fields.documentNumber}</p>
          <p>This certifies that</p>
          <h4>{record.businessName}</h4>
          <p>{record.registeredName}</p>
          <dl>
            <div>
              <dt>Owner</dt>
              <dd>{record.ownerName}</dd>
            </div>
            <div>
              <dt>Business address</dt>
              <dd>Barangay {record.barangay}, Matnog, Sorsogon</dd>
            </div>
            <div>
              <dt>Mayor decision</dt>
              <dd>{mayorDecision.decisionReference}</dd>
            </div>
            <div>
              <dt>{closure ? "Effective closure" : "Validity"}</dt>
              <dd>{closure ? fields.effectiveFrom : `${fields.effectiveFrom} to ${fields.effectiveUntil}`}</dd>
            </div>
          </dl>
          <p className={styles.documentConditions}>{fields.conditions}</p>
          <div className={styles.documentFooter}>
            <span>
              <i />
              <strong>{fields.signatoryName}</strong>
              <small>{fields.signatoryTitle} · Pending e-signature</small>
            </span>
            <span className={styles.qrPlaceholder}>
              <QrCode size={38} />
              <small>{document?.qrToken ?? "QR token created on generation"}</small>
            </span>
          </div>
          <em>Preview only · Not valid until signed and released</em>
        </aside>
      </div>

      {document?.versions.length ? (
        <div className={styles.documentVersions}>
          <header>
            <strong>Version history</strong>
            <small>{document.versions.length} generated</small>
          </header>
          {document.versions.toReversed().map((version) => (
            <article key={version.version}>
              <span>
                <strong>Version {version.version}</strong>
                <small>{version.templateName}</small>
              </span>
              <span>
                <strong>{version.documentNumber}</strong>
                <small>
                  {version.generatedAt} · {version.generatedBy}
                </small>
              </span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
