import { Ban, CheckCircle2, Flame, RotateCcw, Save } from "lucide-react";

import type { ApplicationRequirementDetail, FireReviewAction, FireReviewOverride } from "../types/application-detail";
import { FIRE_SAFETY_CONTROLS } from "../utils/application-detail-utils";
import styles from "./application-detail.module.css";

export type FireReviewFields = Pick<
  FireReviewOverride,
  | "inspectionRequirement"
  | "scheduledDate"
  | "inspectionDate"
  | "inspectionResult"
  | "fsicNumber"
  | "validUntil"
  | "safetyControls"
  | "remarks"
>;

type FireReviewActionsProps = {
  fields: FireReviewFields;
  requirements: readonly ApplicationRequirementDetail[];
  affectedRequirementIds: readonly string[];
  error: string;
  onFieldChange: <K extends keyof FireReviewFields>(field: K, value: FireReviewFields[K]) => void;
  onToggleControl: (control: string) => void;
  onToggleRequirement: (id: string) => void;
  onAction: (action: FireReviewAction) => void;
};

export function FireReviewActions({
  fields,
  requirements,
  affectedRequirementIds,
  error,
  onFieldChange,
  onToggleControl,
  onToggleRequirement,
  onAction,
}: FireReviewActionsProps) {
  return (
    <div className={styles.reviewActions}>
      <div className={styles.reviewActionHeading}>
        <Flame size={14} />
        <span>
          <strong>BFP inspection and fire-safety decision</strong>
          <small>Record inspection completion, FSIC validity, verified controls, and outstanding deficiencies.</small>
        </span>
      </div>
      <div className={styles.zoningFieldGrid}>
        <label>
          <span>Inspection requirement</span>
          <select
            value={fields.inspectionRequirement}
            onChange={(event) => onFieldChange("inspectionRequirement", event.target.value)}
          >
            <option value="">Select requirement</option>
            <option>On-site inspection required</option>
            <option>Documentary review only</option>
            <option>Not required</option>
          </select>
        </label>
        <label>
          <span>Inspection result</span>
          <select
            value={fields.inspectionResult}
            onChange={(event) => onFieldChange("inspectionResult", event.target.value)}
          >
            <option value="">Select result</option>
            <option>Passed</option>
            <option>Passed with conditions</option>
            <option>Failed</option>
            <option>Not applicable</option>
          </select>
        </label>
        <label>
          <span>Scheduled inspection date</span>
          <input
            type="date"
            value={fields.scheduledDate}
            max="2026-09-23"
            onChange={(event) => onFieldChange("scheduledDate", event.target.value)}
          />
        </label>
        <label>
          <span>Completed inspection date</span>
          <input
            type="date"
            value={fields.inspectionDate}
            max="2026-09-23"
            onChange={(event) => onFieldChange("inspectionDate", event.target.value)}
          />
        </label>
        <label>
          <span>FSIC / BFP reference</span>
          <input
            value={fields.fsicNumber}
            placeholder="FSIC-2026-00000"
            onChange={(event) => onFieldChange("fsicNumber", event.target.value)}
          />
        </label>
        <label>
          <span>Valid until</span>
          <input
            type="date"
            value={fields.validUntil}
            min="2026-09-24"
            onChange={(event) => onFieldChange("validUntil", event.target.value)}
          />
        </label>
      </div>
      <fieldset className={styles.complianceChecklist}>
        <legend>Verified fire-safety controls</legend>
        <div>
          {FIRE_SAFETY_CONTROLS.map((control) => (
            <label key={control}>
              <input
                type="checkbox"
                checked={fields.safetyControls.includes(control)}
                onChange={() => onToggleControl(control)}
              />
              <span>{control}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className={styles.remarksField}>
        <span>BFP findings / deficiencies</span>
        <textarea
          value={fields.remarks}
          placeholder="Record inspection findings, conditions, deficiencies, or the correction reason…"
          onChange={(event) => onFieldChange("remarks", event.target.value)}
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
                onChange={() => onToggleRequirement(item.id)}
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.reviewButtons}>
        <button type="button" className={styles.noteButton} onClick={() => onAction("note")}>
          <Save size={13} /> Save internal note
        </button>
        <button type="button" className={styles.notApplicableButton} onClick={() => onAction("not-applicable")}>
          <Ban size={13} /> Not applicable
        </button>
        <button type="button" className={styles.returnButton} onClick={() => onAction("return")}>
          <RotateCcw size={13} /> Return for correction
        </button>
        <button type="button" className={styles.approveButton} onClick={() => onAction("approve")}>
          <CheckCircle2 size={13} /> Approve fire review
        </button>
      </div>
    </div>
  );
}
