"use client";

import {
  ArrowLeft,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileClock,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "../new/new-application.module.css";
import renewalStyles from "./renewals.module.css";

const STEPS = [
  { title: "Find business", short: "Search" },
  { title: "Business record", short: "Record" },
  { title: "Renewal details", short: "Renewal" },
  { title: "Requirements", short: "Docs" },
  { title: "Review & submit", short: "Review" },
];

const RENEWAL_REQUIREMENTS = [
  "Previous Mayor's Permit",
  "Barangay Business Clearance",
  "Community Tax Certificate (Cedula)",
  "BIR Registration / latest tax filing reference",
  "Fire Safety Inspection Certificate",
  "Sanitary Permit / Health Clearance",
  "Lease Contract / proof of business address",
  "Official receipt of prior year permit fees",
  "Updated employee list",
  "Gross sales declaration / sworn statement",
];

const PAYMENT_MODES = ["Cashier", "GCash", "Maya", "Bank e-channel", "Over-the-counter bank"];
const QUARTERS = ["Annual", "Q1", "Q2", "Q3", "Q4"];

type BusinessRecord = {
  permitNo: string;
  businessName: string;
  tradeName: string;
  owner: string;
  barangay: string;
  address: string;
  lineOfBusiness: string;
  businessType: string;
  tin: string;
  contact: string;
  email: string;
  employees: number;
  area: number;
  grossSales: number;
  lastPaidYear: string;
  expiryDate: string;
  riskLevel: "Low" | "Medium" | "High";
  status: "Active" | "For renewal" | "Expired" | "With deficiency";
};

type RenewalForm = {
  selectedPermit: string;
  renewalYear: string;
  paymentMode: string;
  paymentTerm: string;
  grossSales: string;
  employees: string;
  area: string;
  contact: string;
  email: string;
  changedAddress: string;
  remarks: string;
  documents: string[];
};

const BUSINESSES: BusinessRecord[] = [
  { permitNo: "BP-2025-0002", businessName: "Sorsogon Rice Trading", tradeName: "SR Trading", owner: "Maria S. Santos", barangay: "Bago", address: "Maharlika Highway, Barangay Bago", lineOfBusiness: "Wholesale Trade", businessType: "Sole Proprietorship", tin: "223-456-781-000", contact: "0917-430-1182", email: "srtrading@example.com", employees: 6, area: 84, grossSales: 1320000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Low", status: "For renewal" },
  { permitNo: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", owner: "Ana R. Reyes", barangay: "Poblacion", address: "Port Road, Poblacion", lineOfBusiness: "Transportation", businessType: "Corporation", tin: "104-218-992-000", contact: "0920-881-4420", email: "ops@mtslogistics.ph", employees: 18, area: 160, grossSales: 4850000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Medium", status: "For renewal" },
  { permitNo: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", owner: "Dr. Carlos V. Tan", barangay: "Poblacion", address: "Rizal Street, Poblacion", lineOfBusiness: "Pharmaceutical", businessType: "Corporation", tin: "331-887-204-000", contact: "0918-700-3321", email: "healthplus.matnog@example.com", employees: 9, area: 72, grossSales: 3715000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "High", status: "With deficiency" },
  { permitNo: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", tradeName: "MAR Auto", owner: "Danilo C. Ramos", barangay: "Camachile", address: "Camachile National Road", lineOfBusiness: "Services", businessType: "Sole Proprietorship", tin: "119-330-882-000", contact: "0916-220-9080", email: "marauto@example.com", employees: 5, area: 120, grossSales: 965000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Medium", status: "For renewal" },
  { permitNo: "BP-2025-0013", businessName: "Del Rosario General Merchandise", tradeName: "DRM Store", owner: "Conchita D. Rosario", barangay: "Poblacion", address: "Public Market Annex, Poblacion", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", tin: "204-551-002-000", contact: "0927-631-7761", email: "drmstore@example.com", employees: 4, area: 45, grossSales: 765000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Low", status: "Active" },
  { permitNo: "BP-2025-0014", businessName: "Matnog Copra Buying Station", tradeName: "MCB Station", owner: "Ricardo E. Magsino", barangay: "Bago", address: "Bago Warehouse Compound", lineOfBusiness: "Agriculture & Fishery", businessType: "Partnership", tin: "120-887-613-000", contact: "0915-812-4928", email: "mcbstation@example.com", employees: 12, area: 240, grossSales: 5220000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Medium", status: "For renewal" },
  { permitNo: "BP-2025-0018", businessName: "JMR Construction Supply", tradeName: "JMR Builders", owner: "Jose M. Rivera", barangay: "Poblacion", address: "Diversion Road, Poblacion", lineOfBusiness: "Construction", businessType: "Corporation", tin: "443-208-917-000", contact: "0919-225-9811", email: "sales@jmrbuilders.ph", employees: 21, area: 310, grossSales: 7130000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Medium", status: "For renewal" },
  { permitNo: "BP-2025-0019", businessName: "Matnog Dry Goods Center", tradeName: "MDG Center", owner: "Teresita V. Chua", barangay: "Balocawe", address: "Balocawe Commercial Strip", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", tin: "119-408-551-000", contact: "0921-772-6300", email: "mdgcenter@example.com", employees: 7, area: 80, grossSales: 1180000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Low", status: "For renewal" },
  { permitNo: "BP-2025-0025", businessName: "Bicol Express Courier", tradeName: "BE Courier", owner: "Raul N. Dimaculangan", barangay: "Camachile", address: "Camachile Terminal Arcade", lineOfBusiness: "Transportation", businessType: "Corporation", tin: "620-009-381-000", contact: "0917-880-7215", email: "matnog@becourier.ph", employees: 14, area: 96, grossSales: 2460000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Low", status: "Active" },
  { permitNo: "BP-2025-0026", businessName: "Matnog Livestock Feeds", tradeName: "MLF Feeds", owner: "Norberto C. Espiritu", barangay: "Calayuan", address: "Calayuan Farm Road", lineOfBusiness: "Agriculture & Fishery", businessType: "Sole Proprietorship", tin: "801-221-440-000", contact: "0928-317-1140", email: "mlffeeds@example.com", employees: 8, area: 132, grossSales: 1810000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Medium", status: "For renewal" },
  { permitNo: "BP-2025-0030", businessName: "Tindahan ni Aling Nena", tradeName: "Aling Nena Store", owner: "Nena F. Hernandez", barangay: "Bago", address: "Zone 3, Barangay Bago", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", tin: "610-114-882-000", contact: "0915-660-3304", email: "alingnena@example.com", employees: 2, area: 24, grossSales: 275000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Low", status: "For renewal" },
  { permitNo: "BP-2025-0031", businessName: "Matnog Bay Water Station", tradeName: "MB Water", owner: "Ramon B. Ortega", barangay: "Poblacion", address: "Quezon Avenue, Poblacion", lineOfBusiness: "Manufacturing", businessType: "Sole Proprietorship", tin: "991-204-118-000", contact: "0917-143-9002", email: "mbwater@example.com", employees: 6, area: 68, grossSales: 980000, lastPaidYear: "2024", expiryDate: "2024-12-31", riskLevel: "High", status: "Expired" },
  { permitNo: "BP-2025-0032", businessName: "Roro Port Canteen", tradeName: "Portside Meals", owner: "Amelia F. Gubat", barangay: "Poblacion", address: "Roro Terminal Complex", lineOfBusiness: "Food Service", businessType: "Sole Proprietorship", tin: "230-771-900-000", contact: "0922-811-5532", email: "portside@example.com", employees: 10, area: 90, grossSales: 1520000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Medium", status: "For renewal" },
  { permitNo: "BP-2025-0033", businessName: "Sorsogon Hardware Depot", tradeName: "SH Depot", owner: "Victor L. Sy", barangay: "Sta. Elena", address: "Sta. Elena Commercial Road", lineOfBusiness: "Retail Trade", businessType: "Corporation", tin: "409-229-117-000", contact: "0918-315-6430", email: "shdepot@example.com", employees: 16, area: 220, grossSales: 4230000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "Medium", status: "Active" },
  { permitNo: "BP-2025-0034", businessName: "Ticao Strait Pension House", tradeName: "Ticao Stay", owner: "Rebecca M. Ong", barangay: "Poblacion", address: "Ticao Road, Poblacion", lineOfBusiness: "Accommodation", businessType: "Partnership", tin: "701-663-881-000", contact: "0916-519-7725", email: "reservations@ticaostay.ph", employees: 22, area: 420, grossSales: 6380000, lastPaidYear: "2025", expiryDate: "2025-12-31", riskLevel: "High", status: "With deficiency" },
  { permitNo: "BP-2025-0035", businessName: "Pacific Net Services", tradeName: "Pacific Net", owner: "Mark A. Fernandez", barangay: "Balocawe", address: "Balocawe Center", lineOfBusiness: "Services", businessType: "Sole Proprietorship", tin: "117-440-892-000", contact: "0919-611-5520", email: "pacificnet@example.com", employees: 4, area: 52, grossSales: 690000, lastPaidYear: "2024", expiryDate: "2024-12-31", riskLevel: "Medium", status: "Expired" },
];

const INITIAL: RenewalForm = {
  selectedPermit: BUSINESSES[0].permitNo,
  renewalYear: "2026",
  paymentMode: "",
  paymentTerm: "Annual",
  grossSales: String(BUSINESSES[0].grossSales),
  employees: String(BUSINESSES[0].employees),
  area: String(BUSINESSES[0].area),
  contact: BUSINESSES[0].contact,
  email: BUSINESSES[0].email,
  changedAddress: "",
  remarks: "",
  documents: [],
};

function Field({
  label,
  required,
  hint,
  error,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <span>
        {label}
        {required && <i>Required</i>}
      </span>
      {children}
      {error ? <small className={styles.fieldError}>{error}</small> : hint ? <small>{hint}</small> : null}
    </div>
  );
}

function toggleValue(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function formatCurrency(n: string | number) {
  const num = Number(n);
  if (!num) return "-";
  return "PHP " + num.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status: BusinessRecord["status"]) {
  if (status === "Active") return renewalStyles.statusActive;
  if (status === "Expired") return renewalStyles.statusExpired;
  if (status === "With deficiency") return renewalStyles.statusDeficiency;
  return "";
}

function riskClass(risk: BusinessRecord["riskLevel"]) {
  if (risk === "High") return renewalStyles.riskHigh;
  if (risk === "Medium") return renewalStyles.riskMedium;
  return renewalStyles.riskLow;
}

export default function RenewalsPage() {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<RenewalForm>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof RenewalForm, string>>>({});

  const selected = BUSINESSES.find((b) => b.permitNo === form.selectedPermit) ?? BUSINESSES[0];

  const filteredBusinesses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BUSINESSES;
    return BUSINESSES.filter((business) =>
      [
        business.permitNo,
        business.businessName,
        business.tradeName,
        business.owner,
        business.barangay,
        business.lineOfBusiness,
      ].some((value) => value.toLowerCase().includes(q)),
    );
  }, [query]);

  const set = <K extends keyof RenewalForm>(key: K, value: RenewalForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const selectBusiness = (business: BusinessRecord) => {
    setForm((prev) => ({
      ...prev,
      selectedPermit: business.permitNo,
      grossSales: String(business.grossSales),
      employees: String(business.employees),
      area: String(business.area),
      contact: business.contact,
      email: business.email,
      changedAddress: "",
      remarks: "",
    }));
  };

  const validateStep = () => {
    const nextErrors: Partial<Record<keyof RenewalForm, string>> = {};
    if (step === 0 && !form.selectedPermit) nextErrors.selectedPermit = "Select a business to renew";
    if (step === 2) {
      if (!form.renewalYear.trim()) nextErrors.renewalYear = "Required";
      if (!form.paymentMode) nextErrors.paymentMode = "Required";
      if (!form.grossSales.trim()) nextErrors.grossSales = "Required";
      if (!form.contact.trim()) nextErrors.contact = "Required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const moveNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const selectedDocuments = form.documents.length;

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <Link className={styles.backLink} href="/applications">
              <ArrowLeft size={14} /> Back to all applications
            </Link>
            <h1>Renew application</h1>
            <p>Find an existing business record, confirm updated annual details, and submit the renewal for assessment and permit processing.</p>
          </div>
          <div className={styles.headerMeta}>
            <RefreshCw size={18} />
            <span>
              Renewal filing
              <strong>{BUSINESSES.length} business records loaded</strong>
            </span>
          </div>
        </div>
      </div>

      <div className={`${styles.body} ${renewalStyles.wideBody}`}>
        <form className={styles.formCard} onSubmit={(event) => event.preventDefault()} noValidate>
          <nav className={styles.stepper} aria-label="Renewal steps">
            {STEPS.map((item, index) => (
              <button
                type="button"
                key={item.title}
                className={`${index === step ? styles.stepActive : ""} ${index < step ? styles.stepComplete : ""}`}
                onClick={() => setStep(index)}
              >
                <i>{index < step ? <Check size={13} /> : index + 1}</i>
                <span>
                  <small>Step {index + 1}</small>
                  <strong>{item.title}</strong>
                </span>
              </button>
            ))}
          </nav>

          <section className={`${styles.formBody} ${renewalStyles.wideFormBody}`}>
            <header className={styles.sectionHeader}>
              <span>{STEPS[step].short}</span>
              <h3>{STEPS[step].title}</h3>
              <p>
                {step === 0 && "Search the business masterlist and select the permit record to renew."}
                {step === 1 && "Review the existing business profile before encoding renewal values."}
                {step === 2 && "Update the renewal year, payment preference, gross sales, contacts, and operational details."}
                {step === 3 && "Mark submitted renewal requirements for front-desk validation."}
                {step === 4 && "Confirm the renewal application before forwarding it to assessment."}
              </p>
            </header>

            {step === 0 && (
              <div className={styles.formGrid}>
                <Field label="Search business masterlist" hint="Search by permit number, business name, owner, barangay, or line of business." error={errors.selectedPermit} wide>
                  <div className={styles.inputWithIcon}>
                    <Search size={15} />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try BP-2025-0007, pharmacy, Poblacion..." />
                  </div>
                </Field>

                <section className={`${styles.subsection} ${styles.fieldWide}`}>
                  <header>
                    <h3>Renewal candidates ({filteredBusinesses.length})</h3>
                    <p>Select one business record to prefill the renewal application.</p>
                  </header>
                  <div className={renewalStyles.candidateGrid}>
                    {filteredBusinesses.map((business) => {
                      const isSelected = business.permitNo === form.selectedPermit;
                      return (
                        <label key={business.permitNo} className={renewalStyles.candidateCard}>
                          <input
                            type="radio"
                            name="business"
                            checked={isSelected}
                            onChange={() => selectBusiness(business)}
                          />
                          <span className={renewalStyles.candidateIcon}>
                            <Building2 size={17} />
                          </span>
                          <span className={renewalStyles.candidateMain}>
                            <strong>{business.businessName}</strong>
                            <span className={renewalStyles.candidateMeta}>
                              <span>{business.permitNo}</span>
                              <span>{business.tradeName}</span>
                              <span>{business.owner}</span>
                              <span>{business.barangay}</span>
                              <span>{business.lineOfBusiness}</span>
                            </span>
                          </span>
                          <span className={renewalStyles.candidateBadges}>
                            <span className={`${renewalStyles.statusBadge} ${statusClass(business.status)}`}>
                              {business.status}
                            </span>
                            <span className={`${renewalStyles.riskBadge} ${riskClass(business.riskLevel)}`}>
                              {business.riskLevel} risk
                            </span>
                            <span className={renewalStyles.dateBadge}>
                              Expires {formatDate(business.expiryDate)}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {step === 1 && (
              <div className={styles.reviewLayout}>
                <div className={styles.reviewHero}>
                  <div>
                    <span>Selected business record</span>
                    <h3>{selected.businessName}</h3>
                    <p>{selected.permitNo} | {selected.tradeName} | {selected.status} | {selected.riskLevel} risk</p>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <header>
                    <Building2 size={15} />
                    <h3>Business Profile</h3>
                  </header>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewField}><span>Business Type</span><strong>{selected.businessType}</strong></div>
                    <div className={styles.reviewField}><span>Line of Business</span><strong>{selected.lineOfBusiness}</strong></div>
                    <div className={styles.reviewField}><span>Barangay</span><strong>{selected.barangay}</strong></div>
                    <div className={styles.reviewField}><span>Business Address</span><strong>{selected.address}</strong></div>
                    <div className={styles.reviewField}><span>TIN</span><strong>{selected.tin}</strong></div>
                    <div className={styles.reviewField}><span>Last Paid Year</span><strong>{selected.lastPaidYear}</strong></div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <header>
                    <UserRound size={15} />
                    <h3>Owner and Operations</h3>
                  </header>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewField}><span>Owner</span><strong>{selected.owner}</strong></div>
                    <div className={styles.reviewField}><span>Contact</span><strong>{selected.contact}</strong></div>
                    <div className={styles.reviewField}><span>Email</span><strong>{selected.email}</strong></div>
                    <div className={styles.reviewField}><span>Employees</span><strong>{selected.employees}</strong></div>
                    <div className={styles.reviewField}><span>Business Area</span><strong>{selected.area} sq.m.</strong></div>
                    <div className={styles.reviewField}><span>Declared Gross Sales</span><strong>{formatCurrency(selected.grossSales)}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formGrid}>
                <Field label="Renewal year" required error={errors.renewalYear}>
                  <input value={form.renewalYear} onChange={(event) => set("renewalYear", event.target.value)} placeholder="2026" />
                </Field>
                <Field label="Payment term" required>
                  <Select value={form.paymentTerm} onValueChange={(value) => set("paymentTerm", value)}>
                    <SelectTrigger className={styles.selectTrigger} aria-label="Payment term">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUARTERS.map((term) => <SelectItem key={term} value={term}>{term}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Preferred payment mode" required error={errors.paymentMode}>
                  <Select value={form.paymentMode} onValueChange={(value) => set("paymentMode", value)}>
                    <SelectTrigger className={styles.selectTrigger} aria-label="Preferred payment mode">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map((mode) => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Gross sales / receipts" required error={errors.grossSales}>
                  <div className={styles.currencyInput}>
                    <span>PHP</span>
                    <input type="number" min="0" step="1000" value={form.grossSales} onChange={(event) => set("grossSales", event.target.value)} />
                  </div>
                </Field>
                <Field label="Number of employees">
                  <input type="number" min="0" value={form.employees} onChange={(event) => set("employees", event.target.value)} />
                </Field>
                <Field label="Business area (sq.m.)">
                  <input type="number" min="0" value={form.area} onChange={(event) => set("area", event.target.value)} />
                </Field>
                <Field label="Contact number" required error={errors.contact}>
                  <input value={form.contact} onChange={(event) => set("contact", event.target.value)} />
                </Field>
                <Field label="Email address">
                  <input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
                </Field>
                <Field label="Changed business address" hint="Leave blank if unchanged." wide>
                  <input value={form.changedAddress} onChange={(event) => set("changedAddress", event.target.value)} placeholder={selected.address} />
                </Field>
                <Field label="Remarks / front desk notes" wide>
                  <textarea value={form.remarks} onChange={(event) => set("remarks", event.target.value)} placeholder="Capture declared changes, pending items, or verification notes." />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className={styles.formGrid}>
                <section className={`${styles.subsection} ${styles.fieldWide}`}>
                  <header>
                    <h3>Renewal documentary requirements</h3>
                    <p>Check each submitted requirement. This page intentionally has enough sample fields for a production UI pass.</p>
                  </header>
                  <div className={styles.formGrid}>
                    {RENEWAL_REQUIREMENTS.map((doc) => {
                      const checked = form.documents.includes(doc);
                      return (
                        <label key={doc} className={styles.switchCard}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => set("documents", toggleValue(form.documents, doc))}
                          />
                          <span>
                            <ClipboardList size={17} />
                            <strong>{doc}</strong>
                            <small>{checked ? "Received and ready for validation" : "Pending front-desk validation"}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {step === 4 && (
              <div className={styles.reviewLayout}>
                <div className={styles.reviewHero}>
                  <div>
                    <span>Business permit renewal</span>
                    <h3>{selected.businessName}</h3>
                    <p>{selected.permitNo} | Renewal year {form.renewalYear || "-"} | {form.paymentTerm} payment</p>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <header>
                    <ShieldCheck size={15} />
                    <h3>Selected Record</h3>
                  </header>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewField}><span>Business</span><strong>{selected.businessName}</strong></div>
                    <div className={styles.reviewField}><span>Owner</span><strong>{selected.owner}</strong></div>
                    <div className={styles.reviewField}><span>Barangay</span><strong>{selected.barangay}</strong></div>
                    <div className={styles.reviewField}><span>Status</span><strong>{selected.status}</strong></div>
                    <div className={styles.reviewField}><span>Last Paid Year</span><strong>{selected.lastPaidYear}</strong></div>
                    <div className={styles.reviewField}><span>Expiry Date</span><strong>{selected.expiryDate}</strong></div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <header>
                    <CircleDollarSign size={15} />
                    <h3>Renewal Declaration</h3>
                  </header>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewField}><span>Renewal Year</span><strong>{form.renewalYear || "-"}</strong></div>
                    <div className={styles.reviewField}><span>Payment Mode</span><strong>{form.paymentMode || "-"}</strong></div>
                    <div className={styles.reviewField}><span>Gross Sales</span><strong>{formatCurrency(form.grossSales)}</strong></div>
                    <div className={styles.reviewField}><span>Employees</span><strong>{form.employees || "-"}</strong></div>
                    <div className={styles.reviewField}><span>Business Area</span><strong>{form.area ? `${form.area} sq.m.` : "-"}</strong></div>
                    <div className={styles.reviewField}><span>Business Address</span><strong>{form.changedAddress || selected.address}</strong></div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <header>
                    <FileClock size={15} />
                    <h3>Requirements Submitted ({selectedDocuments} of {RENEWAL_REQUIREMENTS.length})</h3>
                  </header>
                  <div className={styles.reviewGrid}>
                    {RENEWAL_REQUIREMENTS.map((doc) => (
                      <div key={doc} className={styles.reviewField}>
                        <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {form.documents.includes(doc) ? <Check size={13} style={{ color: "#14794f" }} /> : <span style={{ width: 13, height: 13, borderRadius: 3, border: "1.5px solid #ccc", display: "inline-block" }} />}
                          {doc}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.reviewReady}>
                  <Check size={18} />
                  <div>
                    <strong>Ready for renewal assessment</strong>
                    <p>This will create a renewal transaction in the applications masterlist and forward it to assessment once backend persistence is connected.</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <footer className={styles.formFooter}>
            <div>
              {step > 0 ? (
                <button className={styles.secondaryButton} type="button" onClick={() => { setErrors({}); setStep((s) => s - 1); }}>
                  <ChevronLeft size={14} /> Previous
                </button>
              ) : (
                <Link className={styles.secondaryButton} href="/applications">
                  Cancel
                </Link>
              )}
            </div>
            <span>Step {step + 1} of {STEPS.length}</span>
            <div className={styles.footerActions}>
              {step === STEPS.length - 1 ? (
                <>
                  <button className={styles.secondaryButton} type="button">
                    <Save size={14} /> Save as draft
                  </button>
                  <button className={styles.primaryButton} type="button">
                    <Send size={14} /> Submit Renewal
                  </button>
                </>
              ) : (
                <button className={styles.primaryButton} type="button" onClick={moveNext}>
                  Continue <ChevronRight size={14} />
                </button>
              )}
            </div>
          </footer>
        </form>
      </div>
    </main>
  );
}
