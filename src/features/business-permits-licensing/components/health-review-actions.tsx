import { Ban, CheckCircle2, HeartPulse, RotateCcw, Save } from "lucide-react";

import type {
  ApplicationRequirementDetail,
  HealthReviewAction,
  HealthReviewOverride,
} from "../types/application-detail";
import { HEALTH_COMPLIANCE_AREAS } from "../utils/application-detail-utils";
import styles from "./application-detail.module.css";

export type HealthReviewFields = Pick<
  HealthReviewOverride,
  | "inspectionRequirement"
  | "inspectionDate"
  | "sanitaryCategory"
  | "inspectionResult"
  | "permitReference"
  | "complianceAreas"
  | "remarks"
>;

type HealthReviewActionsProps = {
  fields: HealthReviewFields;
  requirements: readonly ApplicationRequirementDetail[];
  affectedRequirementIds: readonly string[];
  error: string;
  onFieldChange: <K extends keyof HealthReviewFields>(field: K, value: HealthReviewFields[K]) => void;
  onToggleCompliance: (area: string) => void;
  onToggleRequirement: (id: string) => void;
  onAction: (action: HealthReviewAction) => void;
};

export function HealthReviewActions({
  fields,
  requirements,
  affectedRequirementIds,
  error,
  onFieldChange,
  onToggleCompliance,
  onToggleRequirement,
  onAction,
}: HealthReviewActionsProps) {
  return (
    <div className={styles.reviewActions}>
      <div className={styles.reviewActionHeading}>
        <HeartPulse size={14} />
        <span>
          <strong>Health inspection and sanitary decision</strong>
          <small>Record the MHO inspection result and verified public-health controls.</small>
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
          <span>Inspection date</span>
          <input
            type="date"
            value={fields.inspectionDate}
            max="2026-09-23"
            onChange={(event) => onFieldChange("inspectionDate", event.target.value)}
          />
        </label>
        <label>
          <span>Sanitary classification</span>
          <select
            value={fields.sanitaryCategory}
            onChange={(event) => onFieldChange("sanitaryCategory", event.target.value)}
          >
            <option value="">Select classification</option>
            <option>Food establishment</option>
            <option>Non-food commercial</option>
            <option>Industrial establishment</option>
            <option>Lodging / tourism</option>
            <option>Office / professional service</option>
            <option>Exempt transaction</option>
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
        <label className={styles.fullWidthField}>
          <span>Sanitary permit / review reference</span>
          <input
            value={fields.permitReference}
            placeholder="SP-2026-00000"
            onChange={(event) => onFieldChange("permitReference", event.target.value)}
          />
        </label>
      </div>
      <fieldset className={styles.complianceChecklist}>
        <legend>Verified sanitary controls</legend>
        <div>
          {HEALTH_COMPLIANCE_AREAS.map((area) => (
            <label key={area}>
              <input
                type="checkbox"
                checked={fields.complianceAreas.includes(area)}
                onChange={() => onToggleCompliance(area)}
              />
              <span>{area}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className={styles.remarksField}>
        <span>Health findings / corrective instructions</span>
        <textarea
          value={fields.remarks}
          placeholder="Record sanitation observations, inspection findings, conditions, or the correction reason…"
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
          <CheckCircle2 size={13} /> Approve health review
        </button>
      </div>
    </div>
  );
}
