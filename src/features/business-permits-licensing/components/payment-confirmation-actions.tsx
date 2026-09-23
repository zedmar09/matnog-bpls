import { CheckCircle2, CreditCard, RotateCcw, Save, Undo2, XCircle } from "lucide-react";

import type { PaymentConfirmationAction, PaymentTransaction } from "../types/application-detail";
import { PAYMENT_CHANNELS, type PaymentConfirmationFields } from "../utils/application-detail-utils";
import styles from "./application-detail.module.css";

type PaymentSummary = {
  confirmedAmount: number;
  outstandingBalance: number;
};

type PaymentConfirmationActionsProps = {
  fields: PaymentConfirmationFields;
  assessmentAmount: number;
  transactions: readonly PaymentTransaction[];
  summary: PaymentSummary;
  error: string;
  reversalReason: string;
  onFieldChange: <K extends keyof PaymentConfirmationFields>(field: K, value: PaymentConfirmationFields[K]) => void;
  onReversalReasonChange: (value: string) => void;
  onAction: (action: PaymentConfirmationAction) => void;
  onReverse: (transactionId: string) => void;
};

function peso(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

function transactionStatusClass(status: PaymentTransaction["status"]) {
  if (status === "Confirmed") return styles.paymentConfirmed;
  if (status === "Rejected") return styles.paymentRejected;
  return styles.paymentReversed;
}

export function PaymentConfirmationActions({
  fields,
  assessmentAmount,
  transactions,
  summary,
  error,
  reversalReason,
  onFieldChange,
  onReversalReasonChange,
  onAction,
  onReverse,
}: PaymentConfirmationActionsProps) {
  const online = fields.channel && fields.channel !== "Municipal Treasurer cash / counter";

  return (
    <div className={styles.reviewActions}>
      <div className={styles.reviewActionHeading}>
        <CreditCard size={14} />
        <span>
          <strong>Payment verification and official receipt</strong>
          <small>Validate counter or gateway evidence before applying funds to the posted assessment.</small>
        </span>
      </div>

      <section className={styles.paymentSummary} aria-label="Payment balance summary">
        <span>
          Assessed<strong>{peso(assessmentAmount)}</strong>
        </span>
        <span>
          Confirmed<strong>{peso(summary.confirmedAmount)}</strong>
        </span>
        <span className={styles.paymentBalance}>
          Outstanding<strong>{peso(summary.outstandingBalance)}</strong>
        </span>
      </section>

      {transactions.length ? (
        <section className={styles.paymentLedger} aria-label="Payment transaction ledger">
          <header>
            <strong>Transaction ledger</strong>
            <small>{transactions.length} recorded</small>
          </header>
          {transactions.toReversed().map((transaction) => (
            <article key={transaction.id}>
              <div>
                <strong>{transaction.officialReceiptNumber || transaction.referenceNumber}</strong>
                <small>
                  {transaction.paymentDate} · {transaction.channel}
                </small>
              </div>
              <div>
                <strong>{peso(transaction.amount)}</strong>
                <span className={transactionStatusClass(transaction.status)}>{transaction.status}</span>
              </div>
              {transaction.status === "Confirmed" ? (
                <button type="button" className={styles.paymentReverseButton} onClick={() => onReverse(transaction.id)}>
                  <Undo2 size={11} /> Reverse
                </button>
              ) : null}
              {transaction.reversalReason ? <p>{transaction.reversalReason}</p> : null}
            </article>
          ))}
        </section>
      ) : null}

      {summary.outstandingBalance > 0 ? (
        <>
          <div className={styles.zoningFieldGrid}>
            <label>
              <span>Payment channel</span>
              <select value={fields.channel} onChange={(event) => onFieldChange("channel", event.target.value)}>
                <option value="">Select channel</option>
                {PAYMENT_CHANNELS.map((channel) => (
                  <option key={channel}>{channel}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Gateway / counter status</span>
              <select
                value={fields.gatewayStatus}
                onChange={(event) => onFieldChange("gatewayStatus", event.target.value)}
              >
                <option>Pending verification</option>
                <option>Successful</option>
                <option>Counter received</option>
                <option>Failed</option>
                <option>Rejected</option>
              </select>
            </label>
            <label>
              <span>Payer name</span>
              <input value={fields.payerName} onChange={(event) => onFieldChange("payerName", event.target.value)} />
            </label>
            <label>
              <span>Payment date</span>
              <input
                type="date"
                value={fields.paymentDate}
                max="2026-09-23"
                onChange={(event) => onFieldChange("paymentDate", event.target.value)}
              />
            </label>
            <label>
              <span>Payment amount</span>
              <input
                type="number"
                min="1"
                max={summary.outstandingBalance}
                value={fields.amount}
                onChange={(event) => onFieldChange("amount", Number(event.target.value))}
              />
            </label>
            <label>
              <span>{online ? "Gateway transaction reference" : "Counter reference"}</span>
              <input
                value={fields.referenceNumber}
                placeholder={online ? "Gateway or bank reference" : "CTR-2026-00000"}
                onChange={(event) => onFieldChange("referenceNumber", event.target.value)}
              />
            </label>
            <label className={styles.fullWidthField}>
              <span>Collecting / verifying officer</span>
              <input
                value={fields.collectingOfficer}
                onChange={(event) => onFieldChange("collectingOfficer", event.target.value)}
              />
            </label>
          </div>

          <label className={styles.remarksField}>
            <span>Verification note / rejection reason</span>
            <textarea
              value={fields.notes}
              placeholder="Record gateway verification, counter evidence, reconciliation notes, or rejection reason…"
              onChange={(event) => onFieldChange("notes", event.target.value)}
            />
          </label>
        </>
      ) : null}

      {transactions.some((item) => item.status === "Confirmed") ? (
        <label className={styles.remarksField}>
          <span>Reversal justification</span>
          <textarea
            value={reversalReason}
            placeholder="Required before reversing a confirmed payment or official receipt…"
            onChange={(event) => onReversalReasonChange(event.target.value)}
          />
        </label>
      ) : null}

      {error ? <p className={styles.formError}>{error}</p> : null}
      {summary.outstandingBalance > 0 ? (
        <div className={styles.reviewButtons}>
          <button type="button" className={styles.noteButton} onClick={() => onAction("save")}>
            <Save size={13} /> Save verification note
          </button>
          <button type="button" className={styles.returnButton} onClick={() => onAction("reject")}>
            <XCircle size={13} /> Reject transaction
          </button>
          <button type="button" className={styles.approveButton} onClick={() => onAction("confirm")}>
            {summary.outstandingBalance === fields.amount ? <CheckCircle2 size={13} /> : <RotateCcw size={13} />}
            Confirm payment
          </button>
        </div>
      ) : null}
    </div>
  );
}
