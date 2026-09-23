import { Calculator, CircleDollarSign, Plus, RotateCcw, Save, Send, Trash2 } from "lucide-react";

import type {
  ApplicationRequirementDetail,
  AssessmentFeeItem,
  TreasurerAssessmentAction,
} from "../types/application-detail";
import type { TreasurerAssessmentFields } from "../utils/application-detail-utils";
import styles from "./application-detail.module.css";

type AssessmentTotals = {
  subtotal: number;
  deductions: number;
  additions: number;
  total: number;
};

type TreasurerAssessmentActionsProps = {
  fields: TreasurerAssessmentFields;
  totals: AssessmentTotals;
  requirements: readonly ApplicationRequirementDetail[];
  affectedRequirementIds: readonly string[];
  error: string;
  onFieldChange: <K extends keyof TreasurerAssessmentFields>(field: K, value: TreasurerAssessmentFields[K]) => void;
  onFeeItemChange: (id: string, field: keyof Pick<AssessmentFeeItem, "label" | "amount">, value: string) => void;
  onAddFeeItem: () => void;
  onRemoveFeeItem: (id: string) => void;
  onToggleRequirement: (id: string) => void;
  onRecalculate: () => void;
  onAction: (action: TreasurerAssessmentAction) => void;
};

function peso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TreasurerAssessmentActions({
  fields,
  totals,
  requirements,
  affectedRequirementIds,
  error,
  onFieldChange,
  onFeeItemChange,
  onAddFeeItem,
  onRemoveFeeItem,
  onToggleRequirement,
  onRecalculate,
  onAction,
}: TreasurerAssessmentActionsProps) {
  const exempt = fields.assessmentType === "Zero / exempt";

  return (
    <div className={styles.reviewActions}>
      <div className={styles.reviewActionHeading}>
        <CircleDollarSign size={14} />
        <span>
          <strong>Tax and regulatory fee assessment</strong>
          <small>Validate the tax basis, apply configured fee rules, and post an auditable payment obligation.</small>
        </span>
      </div>

      <div className={styles.zoningFieldGrid}>
        <label>
          <span>Assessment reference</span>
          <input
            value={fields.assessmentReference}
            placeholder="ASM-2026-00000"
            onChange={(event) => onFieldChange("assessmentReference", event.target.value)}
          />
        </label>
        <label>
          <span>Assessment type</span>
          <select
            value={fields.assessmentType}
            onChange={(event) =>
              onFieldChange("assessmentType", event.target.value as TreasurerAssessmentFields["assessmentType"])
            }
          >
            <option>Standard</option>
            <option>Zero / exempt</option>
          </select>
        </label>
        <label className={styles.fullWidthField}>
          <span>Revenue-code rule version</span>
          <input value={fields.ruleVersion} onChange={(event) => onFieldChange("ruleVersion", event.target.value)} />
          <small className={styles.fieldHelp}>Configurable sample rule for prototype assessment data.</small>
        </label>
        <label>
          <span>Assessment date</span>
          <input
            type="date"
            value={fields.assessmentDate}
            max="2026-09-23"
            onChange={(event) => onFieldChange("assessmentDate", event.target.value)}
          />
        </label>
        <label>
          <span>Payment due date</span>
          <input
            type="date"
            value={fields.dueDate}
            min={fields.assessmentDate || "2026-09-23"}
            onChange={(event) => onFieldChange("dueDate", event.target.value)}
          />
        </label>
        <label>
          <span>Assessment basis</span>
          <select value={fields.basisType} onChange={(event) => onFieldChange("basisType", event.target.value)}>
            <option value="">Select basis</option>
            <option>Prior-year gross receipts</option>
            <option>Declared capital investment</option>
            <option>Fixed regulatory schedule</option>
            <option>Closure reconciliation</option>
          </select>
        </label>
        <label>
          <span>Declared amount</span>
          <input
            type="number"
            min="0"
            step="100"
            value={fields.declaredAmount}
            onChange={(event) => onFieldChange("declaredAmount", Number(event.target.value))}
          />
        </label>
        {exempt ? (
          <label className={styles.fullWidthField}>
            <span>Exemption basis</span>
            <input
              value={fields.exemptionBasis}
              placeholder="Legal provision, administrative order, or approved exemption reference"
              onChange={(event) => onFieldChange("exemptionBasis", event.target.value)}
            />
          </label>
        ) : null}
      </div>

      {!exempt ? (
        <section className={styles.assessmentLines} aria-label="Assessment fee lines">
          <header>
            <span>
              <strong>Assessment line items</strong>
              <small>Amounts remain editable after automatic computation.</small>
            </span>
            <button type="button" className={styles.assessmentAddButton} onClick={onAddFeeItem}>
              <Plus size={12} /> Add fee
            </button>
          </header>
          <div className={styles.assessmentLineHeader}>
            <span>Fee or tax</span>
            <span>Amount</span>
            <span aria-hidden="true" />
          </div>
          {fields.feeItems.map((item) => (
            <div className={styles.assessmentLine} key={item.id}>
              <input
                aria-label={`${item.label || "Custom fee"} label`}
                value={item.label}
                onChange={(event) => onFeeItemChange(item.id, "label", event.target.value)}
              />
              <input
                aria-label={`${item.label || "Custom fee"} amount`}
                type="number"
                min="0"
                step="1"
                value={item.amount}
                onChange={(event) => onFeeItemChange(item.id, "amount", event.target.value)}
              />
              <button
                type="button"
                className={styles.assessmentRemoveButton}
                aria-label={`Remove ${item.label || "custom fee"}`}
                onClick={() => onRemoveFeeItem(item.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </section>
      ) : null}

      <div className={styles.adjustmentGrid}>
        <label>
          <span>Discount</span>
          <input
            type="number"
            min="0"
            value={fields.discount}
            disabled={exempt}
            onChange={(event) => onFieldChange("discount", Number(event.target.value))}
          />
        </label>
        <label>
          <span>Penalty / surcharge</span>
          <input
            type="number"
            min="0"
            value={fields.surcharge}
            disabled={exempt}
            onChange={(event) => onFieldChange("surcharge", Number(event.target.value))}
          />
        </label>
        <label>
          <span>Manual adjustment</span>
          <input
            type="number"
            value={fields.adjustment}
            disabled={exempt}
            onChange={(event) => onFieldChange("adjustment", Number(event.target.value))}
          />
        </label>
        <label>
          <span>Adjustment justification</span>
          <input
            value={fields.adjustmentReason}
            disabled={exempt}
            placeholder="Required for non-zero manual adjustments"
            onChange={(event) => onFieldChange("adjustmentReason", event.target.value)}
          />
        </label>
      </div>

      <section className={styles.assessmentTotals} aria-label="Assessment totals">
        <span>
          Subtotal<strong>{peso(totals.subtotal)}</strong>
        </span>
        <span>
          Deductions<strong>− {peso(totals.deductions)}</strong>
        </span>
        <span>
          Additions<strong>{peso(totals.additions)}</strong>
        </span>
        <span className={styles.assessmentGrandTotal}>
          Amount due<strong>{peso(totals.total)}</strong>
        </span>
      </section>

      <label className={styles.remarksField}>
        <span>Assessment notes / correction reason</span>
        <textarea
          value={fields.remarks}
          placeholder="Record assessment findings, exemption justification, or the reason for correction…"
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
        <button type="button" className={styles.noteButton} onClick={onRecalculate}>
          <Calculator size={13} /> Recalculate
        </button>
        <button type="button" className={styles.noteButton} onClick={() => onAction("save")}>
          <Save size={13} /> Save draft
        </button>
        <button type="button" className={styles.returnButton} onClick={() => onAction("return")}>
          <RotateCcw size={13} /> Return for correction
        </button>
        <button type="button" className={styles.approveButton} onClick={() => onAction("post")}>
          <Send size={13} /> Post assessment
        </button>
      </div>
    </div>
  );
}
