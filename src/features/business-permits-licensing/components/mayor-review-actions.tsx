import { CheckCircle2, Clock3, Crown, RotateCcw } from "lucide-react";

import type { MayorReviewAction } from "../types/application-detail";
import type { ApplicationDirectoryType } from "../types/application-directory";
import { MAYOR_RETURN_DESTINATIONS, type MayorReviewFields } from "../utils/application-detail-utils";
import styles from "./application-detail.module.css";

type MayorReviewActionsProps = {
  fields: MayorReviewFields;
  applicationType: ApplicationDirectoryType;
  error: string;
  onFieldChange: <K extends keyof MayorReviewFields>(field: K, value: MayorReviewFields[K]) => void;
  onAction: (action: MayorReviewAction) => void;
};

export function MayorReviewActions({
  fields,
  applicationType,
  error,
  onFieldChange,
  onAction,
}: MayorReviewActionsProps) {
  const closure = applicationType === "Closure";

  return (
    <div className={styles.reviewActions}>
      <div className={styles.reviewActionHeading}>
        <Crown size={14} />
        <span>
          <strong>Mayor’s final decision</strong>
          <small>Record the executive decision before controlled document generation and issuance.</small>
        </span>
      </div>

      <div className={styles.zoningFieldGrid}>
        <label>
          <span>Decision reference</span>
          <input
            value={fields.decisionReference}
            placeholder="MAY-2026-00000"
            onChange={(event) => onFieldChange("decisionReference", event.target.value)}
          />
        </label>
        <label>
          <span>Decision date</span>
          <input
            type="date"
            max="2026-09-23"
            value={fields.decisionDate}
            onChange={(event) => onFieldChange("decisionDate", event.target.value)}
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
          <span>Document classification</span>
          <select
            value={fields.permitClassification}
            onChange={(event) => onFieldChange("permitClassification", event.target.value)}
          >
            {closure ? (
              <option>Closure certificate</option>
            ) : (
              <>
                <option>{applicationType} business permit</option>
                <option>Conditional business permit</option>
                <option>Temporary business permit</option>
              </>
            )}
          </select>
        </label>
        <label>
          <span>Return destination</span>
          <select
            value={fields.returnDestination}
            onChange={(event) => onFieldChange("returnDestination", event.target.value)}
          >
            {MAYOR_RETURN_DESTINATIONS.map((destination) => (
              <option key={destination}>{destination}</option>
            ))}
          </select>
        </label>
      </div>

      <label className={styles.remarksField}>
        <span>Permit conditions</span>
        <textarea
          value={fields.conditions}
          placeholder="Record conditions that must appear in the permit or closure certificate…"
          onChange={(event) => onFieldChange("conditions", event.target.value)}
        />
      </label>
      <label className={styles.remarksField}>
        <span>Executive remarks / return or deferral reason</span>
        <textarea
          value={fields.remarks}
          placeholder="Record the final endorsement, return instructions, or reason for deferral…"
          onChange={(event) => onFieldChange("remarks", event.target.value)}
        />
      </label>

      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.reviewButtons}>
        <button type="button" className={styles.noteButton} onClick={() => onAction("defer")}>
          <Clock3 size={13} /> Defer decision
        </button>
        <button type="button" className={styles.returnButton} onClick={() => onAction("return")}>
          <RotateCcw size={13} /> Return to office
        </button>
        <button type="button" className={styles.approveButton} onClick={() => onAction("approve")}>
          <CheckCircle2 size={13} /> Approve final decision
        </button>
      </div>
    </div>
  );
}
