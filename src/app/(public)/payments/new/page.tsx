"use client";

import { useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CircleDollarSign,
  CreditCard,
  FileText,
  Receipt,
  Search,
  Send,
  UserRound,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "../../applications/new/new-application.module.css";

type AssessmentItem = { fee: string; amount: number };

type ApplicationRecord = {
  id: string;
  permitId: string;
  businessName: string;
  tradeName: string;
  owner: string;
  ownerContact: string;
  barangay: string;
  applicationType: string;
  status: string;
  opNumber: string;
  dateAssessed: string;
  items: AssessmentItem[];
  totalAmount: number;
  amountPaid: number;
  balance: number;
};

const APPLICATIONS: ApplicationRecord[] = [
  { id: "1", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", owner: "Ana R. Reyes", ownerContact: "09181234567", barangay: "Poblacion", applicationType: "Renewal", status: "Assessed", opNumber: "OP-2025-0001", dateAssessed: "2025-03-28", items: [{ fee: "Business Tax", amount: 6500 }, { fee: "Mayor's Permit", amount: 3500 }, { fee: "Regulatory Fee", amount: 2000 }, { fee: "Sanitary Permit", amount: 800 }, { fee: "Fire Inspection", amount: 1200 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 900 }], totalAmount: 15000, amountPaid: 0, balance: 15000 },
  { id: "2", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", owner: "Dr. Carlos V. Tan", ownerContact: "09171234568", barangay: "Poblacion", applicationType: "Renewal", status: "Assessed", opNumber: "OP-2025-0002", dateAssessed: "2025-04-02", items: [{ fee: "Business Tax", amount: 10000 }, { fee: "Mayor's Permit", amount: 5000 }, { fee: "Regulatory Fee", amount: 3000 }, { fee: "Sanitary Permit", amount: 1500 }, { fee: "Fire Inspection", amount: 1500 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 900 }], totalAmount: 22000, amountPaid: 0, balance: 22000 },
  { id: "3", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", tradeName: "Sunshine Bakery", owner: "Rosa M. Flores", ownerContact: "09191234569", barangay: "Poblacion", applicationType: "New", status: "Assessed", opNumber: "OP-2025-0003", dateAssessed: "2025-04-05", items: [{ fee: "Business Tax", amount: 1200 }, { fee: "Mayor's Permit", amount: 1000 }, { fee: "Sanitary Permit", amount: 500 }, { fee: "Fire Inspection", amount: 500 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 500 }], totalAmount: 3800, amountPaid: 0, balance: 3800 },
  { id: "4", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", tradeName: "Ticao Cargo", owner: "Ernesto R. Baluyot", ownerContact: "09201234570", barangay: "Camachile", applicationType: "New", status: "Assessed", opNumber: "OP-2025-0004", dateAssessed: "2025-04-08", items: [{ fee: "Business Tax", amount: 12000 }, { fee: "Mayor's Permit", amount: 5500 }, { fee: "Regulatory Fee", amount: 3500 }, { fee: "Zoning Fee", amount: 1000 }, { fee: "Fire Inspection", amount: 1500 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 1400 }], totalAmount: 25000, amountPaid: 0, balance: 25000 },
  { id: "5", permitId: "BP-2025-0017", businessName: "Matnog Piggery Farm", tradeName: "MPF Livestock", owner: "Benjamin S. Torres", ownerContact: "09211234571", barangay: "Calayuan", applicationType: "New", status: "Assessed", opNumber: "OP-2025-0005", dateAssessed: "2025-04-10", items: [{ fee: "Business Tax", amount: 3500 }, { fee: "Mayor's Permit", amount: 2000 }, { fee: "Regulatory Fee", amount: 1200 }, { fee: "Sanitary Permit", amount: 800 }, { fee: "Fire Inspection", amount: 800 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 500 }], totalAmount: 8900, amountPaid: 0, balance: 8900 },
  { id: "6", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", tradeName: "MAR Auto", owner: "Danilo C. Ramos", ownerContact: "09221234572", barangay: "Camachile", applicationType: "Renewal", status: "Assessed", opNumber: "OP-2025-0009", dateAssessed: "2025-02-01", items: [{ fee: "Business Tax", amount: 2000 }, { fee: "Mayor's Permit", amount: 1500 }, { fee: "Regulatory Fee", amount: 800 }, { fee: "Fire Inspection", amount: 600 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 600 }], totalAmount: 5600, amountPaid: 0, balance: 5600 },
  { id: "7", permitId: "BP-2025-0005", businessName: "Southern Hardware Supply", tradeName: "Southern Hardware", owner: "Roberto M. Lim", ownerContact: "09231234573", barangay: "Sta. Elena", applicationType: "New", status: "Assessed", opNumber: "OP-2025-0010", dateAssessed: "2025-02-05", items: [{ fee: "Business Tax", amount: 2500 }, { fee: "Mayor's Permit", amount: 1800 }, { fee: "Regulatory Fee", amount: 1000 }, { fee: "Fire Inspection", amount: 700 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 700 }], totalAmount: 6800, amountPaid: 0, balance: 6800 },
];

const fmt = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });

const STEPS = [
  { label: "Select application", tag: "Application" },
  { label: "Payment details", tag: "Payment" },
  { label: "Review & confirm", tag: "Confirm" },
];

type PaymentForm = {
  selectedApp: ApplicationRecord | null;
  paymentDate: string;
  orNumber: string;
  method: string;
  amount: string;
  remarks: string;
  payerName: string;
};

const INITIAL: PaymentForm = {
  selectedApp: null,
  paymentDate: new Date().toISOString().slice(0, 10),
  orNumber: "OR-2025-001254",
  method: "",
  amount: "",
  remarks: "",
  payerName: "",
};

export default function NewPaymentPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PaymentForm>(INITIAL);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredApps = searchQuery
    ? APPLICATIONS.filter(
        (a) =>
          a.permitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.owner.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : APPLICATIONS;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.selectedApp) errs.selectedApp = "Please select an application";
    }
    if (step === 1) {
      if (!form.method) errs.method = "Select a payment method";
      if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = "Enter a valid amount";
      if (!form.orNumber.trim()) errs.orNumber = "Enter the OR number";
      if (!form.paymentDate) errs.paymentDate = "Select a payment date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 2)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const selectApp = (app: ApplicationRecord) => {
    setForm((f) => ({
      ...f,
      selectedApp: app,
      amount: String(app.balance),
      payerName: app.owner,
    }));
    setErrors({});
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <Link href="/payments" className={styles.backLink}>
              <ArrowLeft size={13} /> Back to payment records
            </Link>
            <h1>New Payment</h1>
            <p>Record a new business permit payment transaction.</p>
          </div>
          <div className={styles.headerMeta}>
            <Receipt size={16} strokeWidth={1.8} />
            <span>
              Receipt
              <strong>{form.orNumber}</strong>
            </span>
          </div>
        </div>
      </section>

      <div className={styles.body}>
        <div className={styles.formCard}>
          <div className={styles.stepper} style={{ gridTemplateColumns: `repeat(${STEPS.length}, minmax(0, 1fr))` }}>
            {STEPS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                className={`${i === step ? styles.stepActive : ""} ${i < step ? styles.stepComplete : ""}`}
                onClick={() => setStep(i)}
              >
                <i>{i < step ? <Check size={13} strokeWidth={3} /> : i + 1}</i>
                <span>
                  <small>Step {i + 1}</small>
                  <strong>{s.label}</strong>
                </span>
              </button>
            ))}
          </div>

          <div className={styles.formBody}>
            {step === 0 && (
              <>
                <div className={styles.sectionHeader}>
                  <span>{STEPS[0].tag}</span>
                  <h3>Select application</h3>
                  <p>Search for the assessed application to record payment against.</p>
                </div>

                {errors.selectedApp && <div className={styles.formAlert}>{errors.selectedApp}</div>}

                <div className={styles.formGrid}>
                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <span>Search application <i>Required</i></span>
                    <div className={styles.inputWithIcon}>
                      <Search size={15} />
                      <input
                        type="text"
                        placeholder="Search by permit ID, business name, or owner..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
                  {filteredApps.map((app) => {
                    const selected = form.selectedApp?.id === app.id;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => selectApp(app)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          alignItems: "center",
                          gap: 12,
                          padding: "14px 16px",
                          background: selected ? "#f5f5f5" : "#fff",
                          border: selected ? "1.5px solid #1a1a1a" : "1px solid #e0e0e0",
                          borderRadius: 10,
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "border-color 120ms, background 120ms",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <strong style={{ fontSize: 13, fontWeight: 620, color: "#1a1a1a" }}>{app.businessName}</strong>
                            <span style={{ fontSize: 11, color: "#888", background: "#f0f0f0", padding: "1px 7px", borderRadius: 6, fontWeight: 550 }}>{app.applicationType}</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#888" }}>
                            <span>{app.permitId}</span>
                            <span>·</span>
                            <span>{app.owner}</span>
                            <span>·</span>
                            <span>{app.opNumber}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 650, color: "#1a1a1a", letterSpacing: "-0.02em" }}>{fmt(app.balance)}</div>
                          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Balance due</div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredApps.length === 0 && (
                    <div style={{ padding: 32, textAlign: "center", color: "#999", fontSize: 13 }}>
                      No assessed applications found matching your search.
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className={styles.sectionHeader}>
                  <span>{STEPS[1].tag}</span>
                  <h3>Payment details</h3>
                  <p>Enter the payment information for {form.selectedApp?.businessName}.</p>
                </div>

                {form.selectedApp && (
                  <div className={styles.subsection} style={{ marginBottom: 20 }}>
                    <header>
                      <h3>Assessment Summary — {form.selectedApp.opNumber}</h3>
                    </header>
                    <div style={{ padding: 14 }}>
                      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left", padding: "0 8px 8px", color: "#888", fontSize: 11, fontWeight: 650, borderBottom: "1px solid #eee" }}>Fee / Charge</th>
                            <th style={{ textAlign: "right", padding: "0 8px 8px", color: "#888", fontSize: 11, fontWeight: 650, borderBottom: "1px solid #eee" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.selectedApp.items.map((item) => (
                            <tr key={item.fee}>
                              <td style={{ padding: "8px", color: "#333", borderBottom: "1px solid #f0f0f0" }}>{item.fee}</td>
                              <td style={{ padding: "8px", color: "#333", textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>{fmt(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td style={{ padding: "10px 8px 0", fontWeight: 650, color: "#1a1a1a", borderTop: "2px solid #ddd" }}>Total Due</td>
                            <td style={{ padding: "10px 8px 0", fontWeight: 650, color: "#1a1a1a", textAlign: "right", borderTop: "2px solid #ddd" }}>{fmt(form.selectedApp.balance)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <span>Official receipt no. <i>Required</i></span>
                    <input
                      type="text"
                      value={form.orNumber}
                      onChange={(e) => setForm((f) => ({ ...f, orNumber: e.target.value }))}
                    />
                    {errors.orNumber && <span className={styles.fieldError}>{errors.orNumber}</span>}
                  </div>

                  <div className={styles.field}>
                    <span>Payment date <i>Required</i></span>
                    <input
                      type="date"
                      value={form.paymentDate}
                      onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
                    />
                    {errors.paymentDate && <span className={styles.fieldError}>{errors.paymentDate}</span>}
                  </div>

                  <div className={styles.field}>
                    <span>Payment method <i>Required</i></span>
                    <Select value={form.method} onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}>
                      <SelectTrigger className={styles.selectTrigger}>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="GCash">GCash</SelectItem>
                        <SelectItem value="Maya">Maya</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.method && <span className={styles.fieldError}>{errors.method}</span>}
                  </div>

                  <div className={styles.field}>
                    <span>Amount paid <i>Required</i></span>
                    <div className={styles.currencyInput}>
                      <span>₱</span>
                      <input
                        type="number"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      />
                    </div>
                    {errors.amount && <span className={styles.fieldError}>{errors.amount}</span>}
                    {form.selectedApp && (
                      <small>Balance due: {fmt(form.selectedApp.balance)}</small>
                    )}
                  </div>

                  <div className={styles.field}>
                    <span>Payer name</span>
                    <input
                      type="text"
                      value={form.payerName}
                      onChange={(e) => setForm((f) => ({ ...f, payerName: e.target.value }))}
                    />
                  </div>

                  <div className={styles.field}>
                    <span>Remarks</span>
                    <input
                      type="text"
                      placeholder="Optional notes"
                      value={form.remarks}
                      onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && form.selectedApp && (
              <>
                <div className={styles.sectionHeader}>
                  <span>{STEPS[2].tag}</span>
                  <h3>Review & confirm</h3>
                  <p>Please review the payment details before confirming.</p>
                </div>

                <div className={styles.reviewLayout}>
                  <div className={styles.reviewHero}>
                    <div>
                      <span>Business</span>
                      <h3>{form.selectedApp.businessName}</h3>
                      <p>{form.selectedApp.tradeName} · {form.selectedApp.permitId} · {form.selectedApp.barangay}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span>Amount</span>
                      <div style={{ fontSize: 22, fontWeight: 660, color: "#1a1a1a", marginTop: 4, letterSpacing: "-0.03em" }}>{fmt(parseFloat(form.amount) || 0)}</div>
                    </div>
                  </div>

                  <div className={styles.reviewSection}>
                    <header>
                      <Building2 size={15} />
                      <h3>Application Details</h3>
                    </header>
                    <div className={styles.reviewGrid}>
                      <div className={styles.reviewField}><span>Permit ID</span><strong>{form.selectedApp.permitId}</strong></div>
                      <div className={styles.reviewField}><span>OP Number</span><strong>{form.selectedApp.opNumber}</strong></div>
                      <div className={styles.reviewField}><span>Application Type</span><strong>{form.selectedApp.applicationType}</strong></div>
                      <div className={styles.reviewField}><span>Owner</span><strong>{form.selectedApp.owner}</strong></div>
                    </div>
                  </div>

                  <div className={styles.reviewSection}>
                    <header>
                      <CreditCard size={15} />
                      <h3>Payment Details</h3>
                    </header>
                    <div className={styles.reviewGrid}>
                      <div className={styles.reviewField}><span>Official Receipt No.</span><strong>{form.orNumber}</strong></div>
                      <div className={styles.reviewField}><span>Payment Date</span><strong>{form.paymentDate}</strong></div>
                      <div className={styles.reviewField}><span>Payment Method</span><strong>{form.method}</strong></div>
                      <div className={styles.reviewField}><span>Amount Paid</span><strong>{fmt(parseFloat(form.amount) || 0)}</strong></div>
                      <div className={styles.reviewField}><span>Payer Name</span><strong>{form.payerName || "—"}</strong></div>
                      <div className={styles.reviewField}><span>Remarks</span><strong>{form.remarks || "—"}</strong></div>
                    </div>
                  </div>

                  <div className={styles.reviewSection}>
                    <header>
                      <Banknote size={15} />
                      <h3>Assessment Breakdown</h3>
                    </header>
                    <div style={{ padding: 14 }}>
                      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                        <tbody>
                          {form.selectedApp.items.map((item) => (
                            <tr key={item.fee}>
                              <td style={{ padding: "7px 8px", color: "#555", borderBottom: "1px solid #f0f0f0" }}>{item.fee}</td>
                              <td style={{ padding: "7px 8px", color: "#333", textAlign: "right", borderBottom: "1px solid #f0f0f0", fontWeight: 550 }}>{fmt(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td style={{ padding: "10px 8px 0", fontWeight: 650, color: "#1a1a1a", borderTop: "2px solid #ddd" }}>Total Assessment</td>
                            <td style={{ padding: "10px 8px 0", fontWeight: 650, color: "#1a1a1a", textAlign: "right", borderTop: "2px solid #ddd" }}>{fmt(form.selectedApp.totalAmount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className={styles.reviewReady}>
                    <Check size={18} />
                    <div>
                      <strong>Ready to confirm payment</strong>
                      <p>This will record the payment and generate an official receipt. This action cannot be undone.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.formFooter}>
            <div>
              {step > 0 ? (
                <button className={styles.secondaryButton} type="button" onClick={prev}>
                  <ArrowLeft size={14} /> Previous
                </button>
              ) : (
                <Link className={styles.secondaryButton} href="/payments">
                  Cancel
                </Link>
              )}
            </div>
            <span>Step {step + 1} of {STEPS.length}</span>
            <div className={styles.footerActions}>
              {step < 2 ? (
                <button className={styles.primaryButton} type="button" onClick={next}>
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button className={styles.primaryButton} type="button">
                  <Send size={14} /> Confirm Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
