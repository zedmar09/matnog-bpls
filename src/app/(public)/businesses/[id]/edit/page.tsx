"use client";

import { useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  MapPinned,
  Save,
  Store,
  UserRound,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { BUSINESS_DOCUMENTS, getBusinessById } from "@/features/business-registry/business-data";

import styles from "../../../applications/new/new-application.module.css";

const STEPS = [
  { title: "Business info", short: "Business" },
  { title: "Owner & contact", short: "Owner" },
  { title: "Operations", short: "Ops" },
  { title: "Documents & notes", short: "Docs" },
  { title: "Review changes", short: "Review" },
];

const BUSINESS_TYPES = ["Sole Proprietorship", "Partnership", "Corporation", "Cooperative", "OPC"];
const STATUSES = ["Active", "For Renewal", "Expired", "Suspended", "Closed", "With Deficiency"];
const RISKS = ["Low", "Medium", "High"];
const BARANGAYS = ["Poblacion", "Bago", "Camachile", "Sta. Elena", "Calayuan", "Balocawe"];
const LINES = ["Retail Trade", "Wholesale Trade", "Food Service", "Services", "Agriculture & Fishery", "Transportation", "Manufacturing", "Pharmaceutical", "Construction", "Accommodation"];

type RegistryForm = {
  businessName: string;
  tradeName: string;
  businessType: string;
  lineOfBusiness: string;
  registrationNo: string;
  tin: string;
  status: string;
  riskLevel: string;
  owner: string;
  contact: string;
  email: string;
  ownerAddress: string;
  address: string;
  barangay: string;
  latitude: string;
  longitude: string;
  grossSales: string;
  capitalInvestment: string;
  employees: string;
  area: string;
  lastPermitYear: string;
  expiryDate: string;
  lastInspection: string;
  remarks: string;
  documents: string[];
};

function Field({
  label,
  required,
  hint,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
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
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  required,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <Field label={label} required={required}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={styles.selectTrigger} aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}

function toggleValue(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];
}

function formatCurrency(value: string) {
  const number = Number(value);
  if (!number) return "-";
  return "PHP " + number.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

export default function EditBusinessRegistryPage() {
  const params = useParams<{ id: string }>();
  const business = getBusinessById(params.id);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegistryForm>({
    businessName: business.businessName,
    tradeName: business.tradeName,
    businessType: business.businessType,
    lineOfBusiness: business.lineOfBusiness,
    registrationNo: business.registrationNo,
    tin: business.tin,
    status: business.status,
    riskLevel: business.riskLevel,
    owner: business.owner,
    contact: business.contact,
    email: business.email,
    ownerAddress: business.ownerAddress,
    address: business.address,
    barangay: business.barangay,
    latitude: business.latitude,
    longitude: business.longitude,
    grossSales: String(business.grossSales),
    capitalInvestment: String(business.capitalInvestment),
    employees: String(business.employees),
    area: String(business.area),
    lastPermitYear: business.lastPermitYear,
    expiryDate: business.expiryDate,
    lastInspection: business.lastInspection,
    remarks: business.remarks,
    documents: business.documents,
  });

  const set = <K extends keyof RegistryForm>(key: K, value: RegistryForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <Link className={styles.backLink} href={`/businesses/${business.id}`}>
              <ArrowLeft size={14} /> Back to business profile
            </Link>
            <h1>Edit registry</h1>
            <p>Update the permanent business registry record, owner details, operating information, compliance status, and document checklist.</p>
          </div>
          <div className={styles.headerMeta}>
            <Store size={18} />
            <span>
              Registry record
              <strong>{business.permitNo}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <form className={styles.formCard} onSubmit={(event) => event.preventDefault()} noValidate>
          <nav className={styles.stepper} aria-label="Registry edit steps">
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

          <section className={styles.formBody}>
            <header className={styles.sectionHeader}>
              <span>{STEPS[step].short}</span>
              <h3>{STEPS[step].title}</h3>
              <p>
                {step === 0 && "Maintain the registered business identity, classification, and permit standing."}
                {step === 1 && "Update owner, authorized contact, and communication details."}
                {step === 2 && "Capture operational values used for assessment and monitoring."}
                {step === 3 && "Review document completeness and internal registry remarks."}
                {step === 4 && "Confirm the updated registry values before saving."}
              </p>
            </header>

            {step === 0 && (
              <div className={styles.formGrid}>
                <Field label="Business name" required wide>
                  <input value={form.businessName} onChange={(event) => set("businessName", event.target.value)} />
                </Field>
                <Field label="Trade name">
                  <input value={form.tradeName} onChange={(event) => set("tradeName", event.target.value)} />
                </Field>
                <SelectField label="Business type" required value={form.businessType} options={BUSINESS_TYPES} onChange={(value) => set("businessType", value)} />
                <SelectField label="Line of business" required value={form.lineOfBusiness} options={LINES} onChange={(value) => set("lineOfBusiness", value)} />
                <Field label="Registration no.">
                  <input value={form.registrationNo} onChange={(event) => set("registrationNo", event.target.value)} />
                </Field>
                <Field label="TIN">
                  <input value={form.tin} onChange={(event) => set("tin", event.target.value)} />
                </Field>
                <SelectField label="Registry status" required value={form.status} options={STATUSES} onChange={(value) => set("status", value)} />
                <SelectField label="Risk level" required value={form.riskLevel} options={RISKS} onChange={(value) => set("riskLevel", value)} />
              </div>
            )}

            {step === 1 && (
              <div className={styles.formGrid}>
                <Field label="Owner / authorized representative" required>
                  <input value={form.owner} onChange={(event) => set("owner", event.target.value)} />
                </Field>
                <Field label="Contact number" required>
                  <input value={form.contact} onChange={(event) => set("contact", event.target.value)} />
                </Field>
                <Field label="Email address">
                  <input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
                </Field>
                <Field label="Owner address" wide>
                  <input value={form.ownerAddress} onChange={(event) => set("ownerAddress", event.target.value)} />
                </Field>
                <Field label="Business address" required wide>
                  <input value={form.address} onChange={(event) => set("address", event.target.value)} />
                </Field>
                <SelectField label="Barangay" required value={form.barangay} options={BARANGAYS} onChange={(value) => set("barangay", value)} />
                <Field label="Latitude">
                  <input value={form.latitude} onChange={(event) => set("latitude", event.target.value)} />
                </Field>
                <Field label="Longitude">
                  <input value={form.longitude} onChange={(event) => set("longitude", event.target.value)} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formGrid}>
                <Field label="Gross sales / receipts" required>
                  <div className={styles.currencyInput}>
                    <span>PHP</span>
                    <input type="number" min="0" value={form.grossSales} onChange={(event) => set("grossSales", event.target.value)} />
                  </div>
                </Field>
                <Field label="Capital investment">
                  <div className={styles.currencyInput}>
                    <span>PHP</span>
                    <input type="number" min="0" value={form.capitalInvestment} onChange={(event) => set("capitalInvestment", event.target.value)} />
                  </div>
                </Field>
                <Field label="Employees">
                  <input type="number" min="0" value={form.employees} onChange={(event) => set("employees", event.target.value)} />
                </Field>
                <Field label="Business area (sq.m.)">
                  <input type="number" min="0" value={form.area} onChange={(event) => set("area", event.target.value)} />
                </Field>
                <Field label="Last permit year">
                  <input value={form.lastPermitYear} onChange={(event) => set("lastPermitYear", event.target.value)} />
                </Field>
                <Field label="Permit expiry">
                  <input type="date" value={form.expiryDate} onChange={(event) => set("expiryDate", event.target.value)} />
                </Field>
                <Field label="Last inspection">
                  <input type="date" value={form.lastInspection} onChange={(event) => set("lastInspection", event.target.value)} />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className={styles.formGrid}>
                <section className={`${styles.subsection} ${styles.fieldWide}`}>
                  <header>
                    <h3>Registry document checklist</h3>
                    <p>Track the permanent file documents attached to this business profile.</p>
                  </header>
                  <div className={styles.formGrid}>
                    {BUSINESS_DOCUMENTS.map((doc) => {
                      const checked = form.documents.includes(doc);
                      return (
                        <label key={doc} className={styles.switchCard}>
                          <input checked={checked} type="checkbox" onChange={() => set("documents", toggleValue(form.documents, doc))} />
                          <span>
                            <ClipboardList size={17} />
                            <strong>{doc}</strong>
                            <small>{checked ? "On file" : "Missing or pending upload"}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
                <Field label="Internal remarks" wide>
                  <textarea value={form.remarks} onChange={(event) => set("remarks", event.target.value)} />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className={styles.reviewLayout}>
                <div className={styles.reviewHero}>
                  <div>
                    <span>Registry update</span>
                    <h3>{form.businessName}</h3>
                    <p>{business.permitNo} &middot; {form.status} &middot; {form.riskLevel} risk</p>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <header><Building2 size={15} /><h3>Business</h3></header>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewField}><span>Business Name</span><strong>{form.businessName}</strong></div>
                    <div className={styles.reviewField}><span>Trade Name</span><strong>{form.tradeName}</strong></div>
                    <div className={styles.reviewField}><span>Business Type</span><strong>{form.businessType}</strong></div>
                    <div className={styles.reviewField}><span>Line of Business</span><strong>{form.lineOfBusiness}</strong></div>
                    <div className={styles.reviewField}><span>Status</span><strong>{form.status}</strong></div>
                    <div className={styles.reviewField}><span>Risk</span><strong>{form.riskLevel}</strong></div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <header><UserRound size={15} /><h3>Owner and Location</h3></header>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewField}><span>Owner</span><strong>{form.owner}</strong></div>
                    <div className={styles.reviewField}><span>Contact</span><strong>{form.contact}</strong></div>
                    <div className={styles.reviewField}><span>Email</span><strong>{form.email}</strong></div>
                    <div className={styles.reviewField}><span>Barangay</span><strong>{form.barangay}</strong></div>
                    <div className={styles.reviewField}><span>Address</span><strong>{form.address}</strong></div>
                    <div className={styles.reviewField}><span>Coordinates</span><strong>{form.latitude}, {form.longitude}</strong></div>
                  </div>
                </div>

                <div className={styles.reviewSection}>
                  <header><CircleDollarSign size={15} /><h3>Operations</h3></header>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewField}><span>Gross Sales</span><strong>{formatCurrency(form.grossSales)}</strong></div>
                    <div className={styles.reviewField}><span>Capital Investment</span><strong>{formatCurrency(form.capitalInvestment)}</strong></div>
                    <div className={styles.reviewField}><span>Employees</span><strong>{form.employees}</strong></div>
                    <div className={styles.reviewField}><span>Area</span><strong>{form.area} sq.m.</strong></div>
                    <div className={styles.reviewField}><span>Permit Expiry</span><strong>{form.expiryDate}</strong></div>
                    <div className={styles.reviewField}><span>Documents</span><strong>{form.documents.length} of {BUSINESS_DOCUMENTS.length} on file</strong></div>
                  </div>
                </div>

                <div className={styles.reviewReady}>
                  <MapPinned size={18} />
                  <div>
                    <strong>Ready to save registry changes</strong>
                    <p>This is a frontend prototype. The save action is ready for backend persistence once connected.</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <footer className={styles.formFooter}>
            <div>
              {step > 0 ? (
                <button className={styles.secondaryButton} type="button" onClick={() => setStep((current) => current - 1)}>
                  <ChevronLeft size={14} /> Previous
                </button>
              ) : (
                <Link className={styles.secondaryButton} href={`/businesses/${business.id}`}>
                  Cancel
                </Link>
              )}
            </div>
            <span>Step {step + 1} of {STEPS.length}</span>
            <div className={styles.footerActions}>
              {step === STEPS.length - 1 ? (
                <button className={styles.primaryButton} type="button">
                  <Save size={14} /> Save Changes
                </button>
              ) : (
                <button className={styles.primaryButton} type="button" onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))}>
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
