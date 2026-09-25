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
  FileText,
  Plus,
  Search,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "../../../applications/new/new-application.module.css";

type ApplicationRecord = {
  id: string;
  permitId: string;
  businessName: string;
  tradeName: string;
  owner: string;
  ownerContact: string;
  barangay: string;
  businessAddress: string;
  applicationType: string;
  lineOfBusiness: string;
  capitalInvestment: number;
  grossSales: number;
  status: string;
};

const APPLICATIONS: ApplicationRecord[] = [
  { id: "1", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", owner: "Ana R. Reyes", ownerContact: "09181234567", barangay: "Poblacion", businessAddress: "National Highway, Poblacion, Matnog", applicationType: "Renewal", lineOfBusiness: "Transportation", capitalInvestment: 1200000, grossSales: 3600000, status: "Under Review" },
  { id: "2", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", owner: "Dr. Carlos V. Tan", ownerContact: "09171234568", barangay: "Poblacion", businessAddress: "Rizal Street, Poblacion, Matnog", applicationType: "Renewal", lineOfBusiness: "Pharmaceutical", capitalInvestment: 2500000, grossSales: 5200000, status: "Under Review" },
  { id: "3", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", tradeName: "Sunshine Bakery", owner: "Rosa M. Flores", ownerContact: "09191234569", barangay: "Poblacion", businessAddress: "Market Area, Poblacion, Matnog", applicationType: "New", lineOfBusiness: "Food Service", capitalInvestment: 150000, grossSales: 0, status: "Under Review" },
  { id: "4", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", tradeName: "Ticao Cargo", owner: "Ernesto R. Baluyot", ownerContact: "09201234570", barangay: "Camachile", businessAddress: "Port Area, Camachile, Matnog", applicationType: "New", lineOfBusiness: "Transportation", capitalInvestment: 3500000, grossSales: 0, status: "Under Review" },
  { id: "5", permitId: "BP-2025-0017", businessName: "Matnog Piggery Farm", tradeName: "MPF Livestock", owner: "Benjamin S. Torres", ownerContact: "09211234571", barangay: "Calayuan", businessAddress: "Brgy. Calayuan, Matnog", applicationType: "New", lineOfBusiness: "Agriculture", capitalInvestment: 800000, grossSales: 0, status: "Under Review" },
  { id: "6", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", tradeName: "MAR Auto", owner: "Danilo C. Ramos", ownerContact: "09221234572", barangay: "Camachile", businessAddress: "National Highway, Camachile, Matnog", applicationType: "Renewal", lineOfBusiness: "Services", capitalInvestment: 400000, grossSales: 1800000, status: "Under Review" },
  { id: "7", permitId: "BP-2025-0005", businessName: "Southern Hardware Supply", tradeName: "Southern Hardware", owner: "Roberto M. Lim", ownerContact: "09231234573", barangay: "Sta. Elena", businessAddress: "Brgy. Sta. Elena, Matnog", applicationType: "New", lineOfBusiness: "Retail", capitalInvestment: 650000, grossSales: 0, status: "Under Review" },
  { id: "8", permitId: "BP-2025-0015", businessName: "Bicolana Beauty Parlor", tradeName: "Bicolana Salon", owner: "Gloria P. Navarro", ownerContact: "09241234574", barangay: "Poblacion", businessAddress: "Quezon Street, Poblacion, Matnog", applicationType: "New", lineOfBusiness: "Services", capitalInvestment: 80000, grossSales: 0, status: "Under Review" },
];

type FeeItem = { fee: string; amount: number };

const DEFAULT_FEES: FeeItem[] = [
  { fee: "Business Tax", amount: 0 },
  { fee: "Mayor's Permit Fee", amount: 0 },
  { fee: "Sanitary Permit Fee", amount: 0 },
  { fee: "Zoning Fee", amount: 0 },
  { fee: "Fire Inspection Fee", amount: 0 },
  { fee: "Garbage Fee", amount: 0 },
  { fee: "Regulatory Fee", amount: 0 },
  { fee: "Sticker Fee", amount: 100 },
  { fee: "Community Tax Certificate", amount: 0 },
];

function computeFees(app: ApplicationRecord): FeeItem[] {
  const base = app.applicationType === "Renewal" ? app.grossSales : app.capitalInvestment;
  const taxRate = 0.005;
  const businessTax = Math.round(base * taxRate);
  const mayorPermit = base >= 2000000 ? 5000 : base >= 1000000 ? 3500 : base >= 500000 ? 2000 : base >= 200000 ? 1200 : base >= 100000 ? 800 : 500;
  const sanitary = base >= 1000000 ? 1500 : base >= 500000 ? 800 : base >= 200000 ? 500 : 300;
  const zoning = base >= 1000000 ? 1000 : base >= 500000 ? 500 : 300;
  const fire = base >= 1000000 ? 1500 : base >= 500000 ? 1000 : base >= 200000 ? 600 : 300;
  const garbage = base >= 500000 ? 600 : 300;
  const regulatory = base >= 1000000 ? 3000 : base >= 500000 ? 1200 : base >= 200000 ? 800 : 400;
  const ctc = Math.max(500, Math.min(5000, Math.round(base * 0.001)));

  return [
    { fee: "Business Tax", amount: businessTax },
    { fee: "Mayor's Permit Fee", amount: mayorPermit },
    { fee: "Sanitary Permit Fee", amount: sanitary },
    { fee: "Zoning Fee", amount: zoning },
    { fee: "Fire Inspection Fee", amount: fire },
    { fee: "Garbage Fee", amount: garbage },
    { fee: "Regulatory Fee", amount: regulatory },
    { fee: "Sticker Fee", amount: 100 },
    { fee: "Community Tax Certificate", amount: ctc },
  ];
}

const fmt = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });

const STEPS = [
  { label: "Select application", tag: "Application" },
  { label: "Assessment of fees", tag: "Fees" },
  { label: "Review & generate", tag: "Generate" },
];

type FormState = {
  selectedApp: ApplicationRecord | null;
  fees: FeeItem[];
  dueDate: string;
  assessedBy: string;
  notes: string;
};

const today = new Date();
const dueDefault = new Date(today);
dueDefault.setDate(dueDefault.getDate() + 30);

const INITIAL: FormState = {
  selectedApp: null,
  fees: DEFAULT_FEES,
  dueDate: dueDefault.toISOString().slice(0, 10),
  assessedBy: "Maria Santos",
  notes: "",
};

export default function GenerateOrderPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
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

  const totalFees = form.fees.reduce((sum, f) => sum + f.amount, 0);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0 && !form.selectedApp) errs.selectedApp = "Please select an application";
    if (step === 1) {
      if (totalFees <= 0) errs.fees = "Total assessment must be greater than zero";
      if (!form.dueDate) errs.dueDate = "Select a due date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 2)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const selectApp = (app: ApplicationRecord) => {
    const computed = computeFees(app);
    setForm((f) => ({ ...f, selectedApp: app, fees: computed }));
    setErrors({});
  };

  const updateFeeAmount = (index: number, amount: number) => {
    setForm((f) => {
      const fees = [...f.fees];
      fees[index] = { ...fees[index], amount };
      return { ...f, fees };
    });
  };

  const removeFee = (index: number) => {
    setForm((f) => ({ ...f, fees: f.fees.filter((_, i) => i !== index) }));
  };

  const addFee = () => {
    setForm((f) => ({ ...f, fees: [...f.fees, { fee: "Other Fee", amount: 0 }] }));
  };

  const updateFeeName = (index: number, name: string) => {
    setForm((f) => {
      const fees = [...f.fees];
      fees[index] = { ...fees[index], fee: name };
      return { ...f, fees };
    });
  };

  const opNumber = `OP-2025-${String(13 + Math.floor(Math.random() * 100)).padStart(4, "0")}`;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <Link href="/payments/order" className={styles.backLink}>
              <ArrowLeft size={13} /> Back to order of payment
            </Link>
            <h1>Generate Order of Payment</h1>
            <p>Create an order of payment with fee assessment for a business permit application.</p>
          </div>
          <div className={styles.headerMeta}>
            <FileText size={16} strokeWidth={1.8} />
            <span>
              Assessed by
              <strong>{form.assessedBy}</strong>
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
                  <p>Choose a business permit application that is ready for assessment.</p>
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
                            <span>{app.lineOfBusiness}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{app.barangay}</div>
                          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{app.status}</div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredApps.length === 0 && (
                    <div style={{ padding: 32, textAlign: "center", color: "#999", fontSize: 13 }}>
                      No applications found matching your search.
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 1 && form.selectedApp && (
              <>
                <div className={styles.sectionHeader}>
                  <span>{STEPS[1].tag}</span>
                  <h3>Assessment of fees</h3>
                  <p>Review and adjust the computed fees for {form.selectedApp.businessName}.</p>
                </div>

                {errors.fees && <div className={styles.formAlert}>{errors.fees}</div>}

                <div className={styles.subsection} style={{ marginBottom: 20 }}>
                  <header>
                    <h3>Business Summary</h3>
                  </header>
                  <div className={styles.formGrid} style={{ padding: 14 }}>
                    <div className={styles.field}>
                      <span>Business name</span>
                      <input type="text" value={form.selectedApp.businessName} readOnly style={{ background: "#fafafa", color: "#666" }} />
                    </div>
                    <div className={styles.field}>
                      <span>Application type</span>
                      <input type="text" value={form.selectedApp.applicationType} readOnly style={{ background: "#fafafa", color: "#666" }} />
                    </div>
                    <div className={styles.field}>
                      <span>Line of business</span>
                      <input type="text" value={form.selectedApp.lineOfBusiness} readOnly style={{ background: "#fafafa", color: "#666" }} />
                    </div>
                    <div className={styles.field}>
                      <span>{form.selectedApp.applicationType === "Renewal" ? "Gross sales / receipts" : "Capital investment"}</span>
                      <input type="text" value={fmt(form.selectedApp.applicationType === "Renewal" ? form.selectedApp.grossSales : form.selectedApp.capitalInvestment)} readOnly style={{ background: "#fafafa", color: "#666" }} />
                    </div>
                  </div>
                </div>

                <div className={styles.subsection} style={{ marginBottom: 20 }}>
                  <header>
                    <h3>Fee Schedule</h3>
                    <p>Fees are auto-computed based on the business profile. You may adjust amounts as needed.</p>
                  </header>
                  <div style={{ padding: 14 }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "0 8px 8px", color: "#888", fontSize: 11, fontWeight: 650, borderBottom: "1px solid #eee" }}>Fee / Charge</th>
                          <th style={{ textAlign: "right", padding: "0 8px 8px", color: "#888", fontSize: 11, fontWeight: 650, borderBottom: "1px solid #eee", width: 160 }}>Amount</th>
                          <th style={{ width: 40, borderBottom: "1px solid #eee" }} />
                        </tr>
                      </thead>
                      <tbody>
                        {form.fees.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: "6px 8px", borderBottom: "1px solid #f0f0f0" }}>
                              <input
                                type="text"
                                value={item.fee}
                                onChange={(e) => updateFeeName(idx, e.target.value)}
                                style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "6px 10px", fontSize: 13, color: "#333", background: "#fff", outline: "none" }}
                              />
                            </td>
                            <td style={{ padding: "6px 8px", borderBottom: "1px solid #f0f0f0" }}>
                              <div style={{ display: "flex", alignItems: "center", border: "1px solid #eee", borderRadius: 6, background: "#fff", paddingLeft: 10 }}>
                                <span style={{ color: "#888", fontSize: 13, fontWeight: 600 }}>₱</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => updateFeeAmount(idx, parseFloat(e.target.value) || 0)}
                                  style={{ width: "100%", border: 0, padding: "6px 10px", fontSize: 13, color: "#1a1a1a", fontWeight: 550, outline: "none", textAlign: "right", background: "transparent" }}
                                />
                              </div>
                            </td>
                            <td style={{ padding: "6px 4px", borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => removeFee(idx)}
                                style={{ background: "none", border: 0, color: "#ccc", cursor: "pointer", padding: 4, borderRadius: 4 }}
                                title="Remove fee"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td style={{ padding: "12px 8px 0", fontWeight: 650, color: "#1a1a1a", borderTop: "2px solid #ddd" }}>Total Assessment</td>
                          <td style={{ padding: "12px 8px 0", fontWeight: 650, color: "#1a1a1a", textAlign: "right", borderTop: "2px solid #ddd" }}>{fmt(totalFees)}</td>
                          <td style={{ borderTop: "2px solid #ddd" }} />
                        </tr>
                      </tfoot>
                    </table>
                    <button
                      type="button"
                      onClick={addFee}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "7px 14px", fontSize: 12, fontWeight: 560, color: "#555", background: "#fff", border: "1px solid #ddd", borderRadius: 7, cursor: "pointer" }}
                    >
                      <Plus size={13} /> Add fee item
                    </button>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <span>Due date <i>Required</i></span>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    />
                    {errors.dueDate && <span className={styles.fieldError}>{errors.dueDate}</span>}
                  </div>
                  <div className={styles.field}>
                    <span>Assessed by</span>
                    <Select value={form.assessedBy} onValueChange={(v) => setForm((f) => ({ ...f, assessedBy: v }))}>
                      <SelectTrigger className={styles.selectTrigger}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                        <SelectItem value="Pedro Garcia">Pedro Garcia</SelectItem>
                        <SelectItem value="Elena Reyes">Elena Reyes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <span>Notes</span>
                    <input
                      type="text"
                      placeholder="Optional assessment notes"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && form.selectedApp && (
              <>
                <div className={styles.sectionHeader}>
                  <span>{STEPS[2].tag}</span>
                  <h3>Review & generate</h3>
                  <p>Review the order of payment details before generating.</p>
                </div>

                <div className={styles.reviewLayout}>
                  <div className={styles.reviewHero}>
                    <div>
                      <span>Business</span>
                      <h3>{form.selectedApp.businessName}</h3>
                      <p>{form.selectedApp.tradeName} · {form.selectedApp.permitId} · {form.selectedApp.barangay}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span>Total Assessment</span>
                      <div style={{ fontSize: 22, fontWeight: 660, color: "#1a1a1a", marginTop: 4, letterSpacing: "-0.03em" }}>{fmt(totalFees)}</div>
                    </div>
                  </div>

                  <div className={styles.reviewSection}>
                    <header>
                      <Building2 size={15} />
                      <h3>Business Details</h3>
                    </header>
                    <div className={styles.reviewGrid}>
                      <div className={styles.reviewField}><span>Permit ID</span><strong>{form.selectedApp.permitId}</strong></div>
                      <div className={styles.reviewField}><span>Application Type</span><strong>{form.selectedApp.applicationType}</strong></div>
                      <div className={styles.reviewField}><span>Owner</span><strong>{form.selectedApp.owner}</strong></div>
                      <div className={styles.reviewField}><span>Line of Business</span><strong>{form.selectedApp.lineOfBusiness}</strong></div>
                      <div className={styles.reviewField}><span>Barangay</span><strong>{form.selectedApp.barangay}</strong></div>
                      <div className={styles.reviewField}><span>Business Address</span><strong>{form.selectedApp.businessAddress}</strong></div>
                    </div>
                  </div>

                  <div className={styles.reviewSection}>
                    <header>
                      <CalendarDays size={15} />
                      <h3>Order Details</h3>
                    </header>
                    <div className={styles.reviewGrid}>
                      <div className={styles.reviewField}><span>Date Issued</span><strong>{new Date().toISOString().slice(0, 10)}</strong></div>
                      <div className={styles.reviewField}><span>Due Date</span><strong>{form.dueDate}</strong></div>
                      <div className={styles.reviewField}><span>Assessed By</span><strong>{form.assessedBy}</strong></div>
                      <div className={styles.reviewField}><span>Notes</span><strong>{form.notes || "—"}</strong></div>
                    </div>
                  </div>

                  <div className={styles.reviewSection}>
                    <header>
                      <Banknote size={15} />
                      <h3>Assessment of Fees</h3>
                    </header>
                    <div style={{ padding: 14 }}>
                      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                        <tbody>
                          {form.fees.filter((f) => f.amount > 0).map((item) => (
                            <tr key={item.fee}>
                              <td style={{ padding: "7px 8px", color: "#555", borderBottom: "1px solid #f0f0f0" }}>{item.fee}</td>
                              <td style={{ padding: "7px 8px", color: "#333", textAlign: "right", borderBottom: "1px solid #f0f0f0", fontWeight: 550 }}>{fmt(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td style={{ padding: "10px 8px 0", fontWeight: 650, color: "#1a1a1a", borderTop: "2px solid #ddd" }}>Total Amount Due</td>
                            <td style={{ padding: "10px 8px 0", fontWeight: 650, color: "#1a1a1a", textAlign: "right", borderTop: "2px solid #ddd" }}>{fmt(totalFees)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className={styles.reviewReady}>
                    <Check size={18} />
                    <div>
                      <strong>Ready to generate order of payment</strong>
                      <p>This will create the order and notify the business owner. The order can be printed for walk-in payments.</p>
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
                <Link className={styles.secondaryButton} href="/payments/order">
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
                  <Send size={14} /> Generate Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
