"use client";

import {
  ArrowLeft,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FilePlus2,
  MapPinned,
  Save,
  Send,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "./new-application.module.css";

const STEPS = [
  { title: "Business info", short: "Business" },
  { title: "Owner details", short: "Owner" },
  { title: "Business activity", short: "Activity" },
  { title: "Requirements", short: "Docs" },
  { title: "Review & submit", short: "Review" },
];

const BUSINESS_TYPES = ["Sole Proprietorship", "Partnership", "Corporation", "Cooperative", "One Person Corporation"];
const APPLICATION_TYPES = ["New", "Renewal", "Amendment"];
const BARANGAYS = ["Poblacion", "Bago", "Camachile", "Sta. Elena", "Calayuan", "Balocawe", "Malidoc", "Sulat"];
const LINE_OF_BUSINESS = [
  "Retail Trade", "Wholesale Trade", "Food Service", "Manufacturing", "Services",
  "Transportation", "Agriculture & Fishery", "Construction", "Pharmaceutical",
  "Financial Services", "Real Estate", "Accommodation", "Education", "Health Services",
];
const TAX_INCENTIVES = [
  "BMBE (Barangay Micro Business Enterprise)",
  "Senior Citizen Discount",
  "PWD Discount",
  "Newly Registered (50% discount 1st year)",
];
const REQUIRED_DOCS = [
  "Barangay Business Clearance",
  "DTI / SEC / CDA Registration",
  "Community Tax Certificate (Cedula)",
  "Zoning Clearance",
  "Sanitary Permit",
  "Fire Safety Inspection Certificate",
  "Contract of Lease / Land Title",
  "SSS / PhilHealth / Pag-IBIG Registration",
  "BIR Registration (TIN / Form 2303)",
  "Environmental Compliance Certificate",
];

type FormData = {
  applicationType: string;
  businessName: string;
  tradeName: string;
  businessType: string;
  dtisecNumber: string;
  tinNumber: string;
  businessAddress: string;
  barangay: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerMiddleName: string;
  ownerAddress: string;
  ownerContact: string;
  ownerEmail: string;
  lineOfBusiness: string;
  businessArea: string;
  numberOfEmployees: string;
  capitalInvestment: string;
  grossSales: string;
  incentives: string[];
  documents: string[];
};

const INITIAL: FormData = {
  applicationType: "",
  businessName: "",
  tradeName: "",
  businessType: "",
  dtisecNumber: "",
  tinNumber: "",
  businessAddress: "",
  barangay: "",
  ownerFirstName: "",
  ownerLastName: "",
  ownerMiddleName: "",
  ownerAddress: "",
  ownerContact: "",
  ownerEmail: "",
  lineOfBusiness: "",
  businessArea: "",
  numberOfEmployees: "",
  capitalInvestment: "",
  grossSales: "",
  incentives: [],
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

function SelectField({
  label,
  required,
  placeholder,
  options,
  value,
  onChange,
  wide,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
}) {
  return (
    <Field label={label} required={required} wide={wide}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={styles.selectTrigger} aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function toggleValue(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function NewApplicationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!form.applicationType) errs.applicationType = "Required";
      if (!form.businessName.trim()) errs.businessName = "Required";
      if (!form.businessType) errs.businessType = "Required";
      if (!form.businessAddress.trim()) errs.businessAddress = "Required";
      if (!form.barangay) errs.barangay = "Required";
    } else if (step === 1) {
      if (!form.ownerFirstName.trim()) errs.ownerFirstName = "Required";
      if (!form.ownerLastName.trim()) errs.ownerLastName = "Required";
      if (!form.ownerContact.trim()) errs.ownerContact = "Required";
    } else if (step === 2) {
      if (!form.lineOfBusiness) errs.lineOfBusiness = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const moveNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const formatCurrency = (n: string) => {
    const num = Number(n);
    if (!num) return "—";
    return "₱" + num.toLocaleString("en-PH", { minimumFractionDigits: 2 });
  };

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <Link className={styles.backLink} href="/applications">
              <ArrowLeft size={14} /> Back to all applications
            </Link>
            <h1>New application</h1>
            <p>Complete the business information, owner details, activity, and requirements to file a new business permit application.</p>
          </div>
          <div className={styles.headerMeta}>
            <FilePlus2 size={18} />
            <span>
              New record
              <strong>Permit ID assigned when saved</strong>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
      <form className={styles.formCard} onSubmit={(e) => e.preventDefault()} noValidate>
        <nav className={styles.stepper} aria-label="Application steps">
          {STEPS.map((item, i) => (
            <button
              type="button"
              key={item.title}
              className={`${i === step ? styles.stepActive : ""} ${i < step ? styles.stepComplete : ""}`}
              onClick={() => setStep(i)}
            >
              <i>{i < step ? <Check size={13} /> : i + 1}</i>
              <span>
                <small>Step {i + 1}</small>
                <strong>{item.title}</strong>
              </span>
            </button>
          ))}
        </nav>

        <section className={styles.formBody}>
          <header className={styles.sectionHeader}>
            <span>{STEPS[step].short}</span>
            <h3>{STEPS[step].title}</h3>
            <p>
              {step === 0 && "Provide the basic business information, registration type, and address."}
              {step === 1 && "Enter the business owner or authorized representative's personal details."}
              {step === 2 && "Describe the business activity, capitalization, and applicable incentives."}
              {step === 3 && "Check the documentary requirements submitted with this application."}
              {step === 4 && "Review all information before submitting the application for processing."}
            </p>
          </header>

          {/* Step 0: Business info */}
          {step === 0 && (
            <div className={styles.formGrid}>
              <SelectField
                label="Application type"
                required
                placeholder="Select type"
                options={APPLICATION_TYPES}
                value={form.applicationType}
                onChange={(v) => set("applicationType", v)}
              />
              <SelectField
                label="Business type"
                required
                placeholder="Select business type"
                options={BUSINESS_TYPES}
                value={form.businessType}
                onChange={(v) => set("businessType", v)}
              />
              <Field label="Business name" required error={errors.businessName} wide>
                <input
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  placeholder="Registered business name"
                />
              </Field>
              <Field label="Trade name / Franchise" hint="Leave blank if same as business name">
                <input
                  value={form.tradeName}
                  onChange={(e) => set("tradeName", e.target.value)}
                  placeholder="e.g. 7-Eleven, Jollibee"
                />
              </Field>
              <Field label="DTI / SEC / CDA registration no.">
                <input
                  value={form.dtisecNumber}
                  onChange={(e) => set("dtisecNumber", e.target.value)}
                  placeholder="Registration number"
                />
              </Field>
              <Field label="TIN">
                <input
                  value={form.tinNumber}
                  onChange={(e) => set("tinNumber", e.target.value)}
                  placeholder="Tax Identification Number"
                />
              </Field>
              <Field label="Business address" required error={errors.businessAddress} wide>
                <input
                  value={form.businessAddress}
                  onChange={(e) => set("businessAddress", e.target.value)}
                  placeholder="Street, building, lot/block number"
                />
              </Field>
              <SelectField
                label="Barangay"
                required
                placeholder="Select barangay"
                options={BARANGAYS}
                value={form.barangay}
                onChange={(v) => set("barangay", v)}
              />
            </div>
          )}

          {/* Step 1: Owner details */}
          {step === 1 && (
            <div className={styles.formGrid}>
              <Field label="Last name" required error={errors.ownerLastName}>
                <input
                  value={form.ownerLastName}
                  onChange={(e) => set("ownerLastName", e.target.value)}
                  placeholder="Family name"
                />
              </Field>
              <Field label="First name" required error={errors.ownerFirstName}>
                <input
                  value={form.ownerFirstName}
                  onChange={(e) => set("ownerFirstName", e.target.value)}
                  placeholder="Given name"
                />
              </Field>
              <Field label="Middle name">
                <input
                  value={form.ownerMiddleName}
                  onChange={(e) => set("ownerMiddleName", e.target.value)}
                  placeholder="Middle name"
                />
              </Field>
              <Field label="Contact number" required error={errors.ownerContact}>
                <input
                  value={form.ownerContact}
                  onChange={(e) => set("ownerContact", e.target.value)}
                  placeholder="09XX-XXX-XXXX"
                />
              </Field>
              <Field label="Email address">
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => set("ownerEmail", e.target.value)}
                  placeholder="email@example.com"
                />
              </Field>
              <Field label="Home address" wide>
                <input
                  value={form.ownerAddress}
                  onChange={(e) => set("ownerAddress", e.target.value)}
                  placeholder="Complete residential address"
                />
              </Field>
            </div>
          )}

          {/* Step 2: Business activity */}
          {step === 2 && (
            <div className={styles.formGrid}>
              <SelectField
                label="Line of business"
                required
                placeholder="Select category"
                options={LINE_OF_BUSINESS}
                value={form.lineOfBusiness}
                onChange={(v) => set("lineOfBusiness", v)}
                wide
              />
              <Field label="Business area (sq.m.)">
                <input
                  type="number"
                  min="0"
                  value={form.businessArea}
                  onChange={(e) => set("businessArea", e.target.value)}
                  placeholder="Floor area in square meters"
                />
              </Field>
              <Field label="Number of employees">
                <input
                  type="number"
                  min="0"
                  value={form.numberOfEmployees}
                  onChange={(e) => set("numberOfEmployees", e.target.value)}
                  placeholder="Total employees"
                />
              </Field>
              <Field label="Capital investment" hint="For new applications">
                <div className={styles.currencyInput}>
                  <span>₱</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.capitalInvestment}
                    onChange={(e) => set("capitalInvestment", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <Field label="Gross sales / receipts" hint="For renewal applications">
                <div className={styles.currencyInput}>
                  <span>₱</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.grossSales}
                    onChange={(e) => set("grossSales", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <fieldset className={`${styles.choiceField} ${styles.fieldWide}`}>
                <legend>
                  Tax incentives
                  <i>Select if applicable</i>
                </legend>
                <div className={styles.choiceGrid}>
                  {TAX_INCENTIVES.map((item) => {
                    const selected = form.incentives.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        className={selected ? styles.choiceSelected : ""}
                        aria-pressed={selected}
                        onClick={() => set("incentives", toggleValue(form.incentives, item))}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          )}

          {/* Step 3: Requirements */}
          {step === 3 && (
            <div className={styles.formGrid}>
              <section className={`${styles.subsection} ${styles.fieldWide}`}>
                <header>
                  <h3>Documentary requirements</h3>
                  <p>Check each document that has been submitted by the applicant.</p>
                </header>
                <div className={styles.formGrid} style={{ padding: 14 }}>
                  {REQUIRED_DOCS.map((doc) => {
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
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className={styles.reviewLayout}>
              <div className={styles.reviewHero}>
                <div>
                  <span>Business permit application</span>
                  <h3>{form.businessName || "Untitled Business"}</h3>
                  <p>{form.tradeName || form.businessName || "—"} &middot; {form.applicationType || "—"} &middot; {form.barangay || "—"}</p>
                </div>
              </div>

              <div className={styles.reviewSection}>
                <header>
                  <Building2 size={15} />
                  <h3>Business Information</h3>
                </header>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewField}><span>Application Type</span><strong>{form.applicationType || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Business Type</span><strong>{form.businessType || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Business Name</span><strong>{form.businessName || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Trade Name</span><strong>{form.tradeName || "—"}</strong></div>
                  <div className={styles.reviewField}><span>DTI / SEC / CDA No.</span><strong>{form.dtisecNumber || "—"}</strong></div>
                  <div className={styles.reviewField}><span>TIN</span><strong>{form.tinNumber || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Business Address</span><strong>{form.businessAddress || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Barangay</span><strong>{form.barangay || "—"}</strong></div>
                </div>
              </div>

              <div className={styles.reviewSection}>
                <header>
                  <UserRound size={15} />
                  <h3>Owner Details</h3>
                </header>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewField}><span>Full Name</span><strong>{[form.ownerLastName, form.ownerFirstName, form.ownerMiddleName].filter(Boolean).join(", ") || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Contact</span><strong>{form.ownerContact || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Email</span><strong>{form.ownerEmail || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Home Address</span><strong>{form.ownerAddress || "—"}</strong></div>
                </div>
              </div>

              <div className={styles.reviewSection}>
                <header>
                  <CircleDollarSign size={15} />
                  <h3>Business Activity</h3>
                </header>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewField}><span>Line of Business</span><strong>{form.lineOfBusiness || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Business Area</span><strong>{form.businessArea ? `${form.businessArea} sq.m.` : "—"}</strong></div>
                  <div className={styles.reviewField}><span>Employees</span><strong>{form.numberOfEmployees || "—"}</strong></div>
                  <div className={styles.reviewField}><span>Capital Investment</span><strong>{formatCurrency(form.capitalInvestment)}</strong></div>
                  <div className={styles.reviewField}><span>Gross Sales</span><strong>{formatCurrency(form.grossSales)}</strong></div>
                  <div className={styles.reviewField}><span>Incentives</span><strong>{form.incentives.length ? form.incentives.join(", ") : "None"}</strong></div>
                </div>
              </div>

              <div className={styles.reviewSection}>
                <header>
                  <ClipboardList size={15} />
                  <h3>Documents Submitted ({form.documents.length} of {REQUIRED_DOCS.length})</h3>
                </header>
                <div className={styles.reviewGrid}>
                  {REQUIRED_DOCS.map((doc) => (
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
                  <strong>Ready to submit</strong>
                  <p>Review the information above. Click &quot;Submit Application&quot; to file this for processing, or save as draft to continue later.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className={styles.formFooter}>
          <div>
            {step > 0 ? (
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => { setErrors({}); setStep((s) => s - 1); }}
              >
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
                  <Send size={14} /> Submit Application
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
