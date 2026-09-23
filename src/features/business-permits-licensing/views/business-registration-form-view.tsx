"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Info,
  MapPin,
  Save,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";

import styles from "../components/business-registration-form.module.css";
import {
  BUSINESS_ACTIVITY_CATEGORIES,
  MATNOG_BARANGAYS,
  MATNOG_BUSINESS_DIRECTORY,
} from "../data/matnog-business-directory";
import type { BusinessDirectoryRecord } from "../types/business-directory";
import {
  type BusinessRegistrationErrors,
  type BusinessRegistrationValues,
  EMPTY_BUSINESS_REGISTRATION,
} from "../types/business-registration";
import {
  BUSINESS_DRAFT_STORAGE_KEY,
  createRegisteredBusiness,
  getStepErrors,
  REGISTERED_BUSINESSES_STORAGE_KEY,
  validateBusinessRegistration,
} from "../utils/business-registration-utils";

const steps = [
  { label: "Business identity", short: "Identity", icon: Building2 },
  { label: "Owner & contact", short: "Owner", icon: UserRound },
  { label: "Activity & location", short: "Location", icon: MapPin },
  { label: "Operations", short: "Operations", icon: WalletCards },
  { label: "Review & register", short: "Review", icon: FileCheck2 },
] as const;

function Field({
  label,
  name,
  value,
  error,
  required,
  help,
  type = "text",
  placeholder,
  className,
  onChange,
}: {
  label: string;
  name: keyof BusinessRegistrationValues;
  value: string;
  error?: string;
  required?: boolean;
  help?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`${styles.field} ${className ?? ""}`}>
      <span>
        {label}
        {required ? <b> *</b> : null}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <small className={styles.fieldError}>{error}</small> : help ? <small>{help}</small> : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  error,
  required,
  help,
  onChange,
}: {
  label: string;
  name: keyof BusinessRegistrationValues;
  value: string;
  options: readonly string[];
  error?: string;
  required?: boolean;
  help?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>
        {label}
        {required ? <b> *</b> : null}
      </span>
      <select
        name={name}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {error ? <small className={styles.fieldError}>{error}</small> : help ? <small>{help}</small> : null}
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.reviewRow}>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

export function BusinessRegistrationFormView() {
  const [values, setValues] = useState<BusinessRegistrationValues>(EMPTY_BUSINESS_REGISTRATION);
  const [errors, setErrors] = useState<BusinessRegistrationErrors>({});
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [created, setCreated] = useState<BusinessDirectoryRecord | null>(null);

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(BUSINESS_DRAFT_STORAGE_KEY);
    if (!rawDraft) return;
    try {
      setValues({ ...EMPTY_BUSINESS_REGISTRATION, ...JSON.parse(rawDraft) });
      setDraftMessage("Saved draft restored");
    } catch {
      window.localStorage.removeItem(BUSINESS_DRAFT_STORAGE_KEY);
    }
  }, []);

  const completedSteps = useMemo(() => {
    const allErrors = validateBusinessRegistration(values);
    return steps.map((_, index) => getStepErrors(allErrors, index).length === 0);
  }, [values]);

  function set<K extends keyof BusinessRegistrationValues>(key: K, value: BusinessRegistrationValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setDirty(true);
    setDraftMessage("");
  }

  function continueToNextStep() {
    const nextErrors = validateBusinessRegistration(values);
    const currentFields = getStepErrors(nextErrors, step);
    if (currentFields.length > 0) {
      setErrors(Object.fromEntries(currentFields.map((field) => [field, nextErrors[field]])));
      document.querySelector<HTMLElement>(`[name="${currentFields[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setStep((current) => Math.min(steps.length - 1, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveDraft() {
    window.localStorage.setItem(BUSINESS_DRAFT_STORAGE_KEY, JSON.stringify(values));
    setDirty(false);
    setDraftMessage("Draft saved on this device");
  }

  function discardDraft() {
    window.localStorage.removeItem(BUSINESS_DRAFT_STORAGE_KEY);
    setValues(EMPTY_BUSINESS_REGISTRATION);
    setErrors({});
    setStep(0);
    setDirty(false);
    setDraftMessage("Draft discarded");
  }

  function registerBusiness(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validateBusinessRegistration(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstInvalidStep = steps.findIndex((_, index) => getStepErrors(nextErrors, index).length > 0);
      setStep(firstInvalidStep < 0 ? 0 : firstInvalidStep);
      return;
    }
    let savedRecords: BusinessDirectoryRecord[] = [];
    try {
      savedRecords = JSON.parse(window.localStorage.getItem(REGISTERED_BUSINESSES_STORAGE_KEY) ?? "[]");
    } catch {
      savedRecords = [];
    }
    const record = createRegisteredBusiness(values, MATNOG_BUSINESS_DIRECTORY.length + savedRecords.length + 1);
    window.localStorage.setItem(REGISTERED_BUSINESSES_STORAGE_KEY, JSON.stringify([record, ...savedRecords]));
    window.localStorage.removeItem(BUSINESS_DRAFT_STORAGE_KEY);
    setCreated(record);
    setDirty(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (created) {
    return (
      <main className={styles.page}>
        <section className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={32} />
          </div>
          <p className={styles.eyebrow}>Registration completed</p>
          <h1>{created.tradeName}</h1>
          <p>The business record has been created and is ready for a new permit application.</p>
          <div className={styles.referenceBox}>
            <span>Business ID</span>
            <strong>{created.id}</strong>
            <small>Permit status: For application</small>
          </div>
          <div className={styles.successActions}>
            <Link
              className={styles.primaryButton}
              href={`/business/applications/new?type=new&businessId=${created.id}`}
            >
              Start permit application <ChevronRight size={15} />
            </Link>
            <Link className={styles.secondaryButton} href="/businesses">
              Return to registry
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const errorCount = Object.keys(errors).length;
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Business Registration &amp; Renewal</p>
          <h1>Register Business</h1>
          <p>Create a municipal business identity record before starting permit assessment.</p>
        </div>
        <Link className={styles.secondaryButton} href="/businesses">
          <ChevronLeft size={15} /> Back to registry
        </Link>
      </header>

      <form className={styles.formCard} onSubmit={registerBusiness} noValidate>
        <nav className={styles.stepper} aria-label="Registration progress">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={`${styles.step} ${index === step ? styles.stepActive : ""} ${index < step || completedSteps[index] ? styles.stepDone : ""}`}
                onClick={() => {
                  setErrors({});
                  setStep(index);
                }}
              >
                <span className={styles.stepMarker}>
                  {index < step || completedSteps[index] ? <Check size={13} /> : <Icon size={14} />}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>
                    Step {index + 1} of {steps.length}
                  </small>
                </span>
              </button>
            );
          })}
        </nav>

        <div className={styles.formLayout}>
          <section className={styles.formBody}>
            {errorCount > 0 && (
              <div className={styles.errorSummary} role="alert">
                <AlertCircle size={18} />
                <div>
                  <strong>
                    Please review {errorCount} {errorCount === 1 ? "field" : "fields"}.
                  </strong>
                  <p>Correct the highlighted information before continuing.</p>
                </div>
              </div>
            )}

            {step === 0 && (
              <div className={styles.stepPanel}>
                <div className={styles.sectionHeading}>
                  <span>
                    <Building2 size={18} />
                  </span>
                  <div>
                    <h2>Business identity</h2>
                    <p>Legal registration details used to establish the municipal business record.</p>
                  </div>
                </div>
                <div className={styles.infoBanner}>
                  <Info size={16} />
                  <span>
                    A Business ID will be generated after registration. A permit number is issued only after application
                    approval.
                  </span>
                </div>
                <div className={styles.formGrid}>
                  <Field
                    required
                    label="Registered business name"
                    name="registeredName"
                    value={values.registeredName}
                    error={errors.registeredName}
                    onChange={(value) => set("registeredName", value)}
                    placeholder="Name appearing on DTI, SEC, or CDA registration"
                    className={styles.span2}
                  />
                  <Field
                    required
                    label="Trade / establishment name"
                    name="tradeName"
                    value={values.tradeName}
                    error={errors.tradeName}
                    onChange={(value) => set("tradeName", value)}
                    placeholder="Public-facing business name"
                    className={styles.span2}
                  />
                  <SelectField
                    required
                    label="Organization type"
                    name="organizationType"
                    value={values.organizationType}
                    options={[
                      "Sole proprietorship",
                      "Partnership",
                      "Corporation",
                      "One person corporation",
                      "Cooperative",
                    ]}
                    onChange={(value) =>
                      set("organizationType", value as BusinessRegistrationValues["organizationType"])
                    }
                  />
                  <SelectField
                    required
                    label="Registration authority"
                    name="registrationAuthority"
                    value={values.registrationAuthority}
                    options={["DTI", "SEC", "CDA"]}
                    onChange={(value) =>
                      set("registrationAuthority", value as BusinessRegistrationValues["registrationAuthority"])
                    }
                  />
                  <Field
                    required
                    label="Registration number"
                    name="registrationNumber"
                    value={values.registrationNumber}
                    error={errors.registrationNumber}
                    onChange={(value) => set("registrationNumber", value)}
                    placeholder="e.g. DTI-2026-123456"
                  />
                  <Field
                    required
                    label="Registration date"
                    name="registrationDate"
                    type="date"
                    value={values.registrationDate}
                    error={errors.registrationDate}
                    onChange={(value) => set("registrationDate", value)}
                  />
                  <SelectField
                    required
                    label="Establishment type"
                    name="establishmentType"
                    value={values.establishmentType}
                    options={["Main office", "Branch"]}
                    onChange={(value) =>
                      set("establishmentType", value as BusinessRegistrationValues["establishmentType"])
                    }
                  />
                  <Field
                    required
                    label="Taxpayer identification number"
                    name="tin"
                    value={values.tin}
                    error={errors.tin}
                    onChange={(value) => set("tin", value)}
                    placeholder="000-000-000-000"
                    help="Enter the 9 or 12-digit BIR TIN."
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className={styles.stepPanel}>
                <div className={styles.sectionHeading}>
                  <span>
                    <UserRound size={18} />
                  </span>
                  <div>
                    <h2>Owner and contact</h2>
                    <p>Primary person accountable for this registration and official notices.</p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <Field
                    required
                    label="Owner / authorized representative"
                    name="ownerName"
                    value={values.ownerName}
                    error={errors.ownerName}
                    onChange={(value) => set("ownerName", value)}
                    placeholder="Complete legal name"
                    className={styles.span2}
                  />
                  <Field
                    label="Position / designation"
                    name="ownerPosition"
                    value={values.ownerPosition}
                    onChange={(value) => set("ownerPosition", value)}
                    placeholder="Owner, president, manager"
                  />
                  <Field
                    required
                    label="Primary mobile number"
                    name="contactNumber"
                    type="tel"
                    value={values.contactNumber}
                    error={errors.contactNumber}
                    onChange={(value) => set("contactNumber", value)}
                    placeholder="0917 123 4567"
                  />
                  <Field
                    label="Alternate phone / landline"
                    name="alternateContact"
                    type="tel"
                    value={values.alternateContact}
                    onChange={(value) => set("alternateContact", value)}
                    placeholder="Optional"
                  />
                  <Field
                    label="Official email address"
                    name="email"
                    type="email"
                    value={values.email}
                    error={errors.email}
                    onChange={(value) => set("email", value)}
                    placeholder="business@example.com"
                    className={styles.span2}
                    help="Used for application updates, assessment notices, and permit release."
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepPanel}>
                <div className={styles.sectionHeading}>
                  <span>
                    <MapPin size={18} />
                  </span>
                  <div>
                    <h2>Activity and location</h2>
                    <p>Classify the establishment and record its operating address in Matnog.</p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <SelectField
                    required
                    label="Activity category"
                    name="activityCategory"
                    value={values.activityCategory}
                    options={BUSINESS_ACTIVITY_CATEGORIES}
                    error={errors.activityCategory}
                    onChange={(value) =>
                      set("activityCategory", value as BusinessRegistrationValues["activityCategory"])
                    }
                  />
                  <Field
                    required
                    label="PSIC code"
                    name="psicCode"
                    value={values.psicCode}
                    error={errors.psicCode}
                    onChange={(value) => set("psicCode", value)}
                    placeholder="5-digit code"
                  />
                  <Field
                    required
                    label="Primary business activity"
                    name="primaryActivity"
                    value={values.primaryActivity}
                    error={errors.primaryActivity}
                    onChange={(value) => set("primaryActivity", value)}
                    placeholder="Describe the main goods or services offered"
                    className={styles.span2}
                  />
                  <SelectField
                    required
                    label="Initial risk classification"
                    name="riskLevel"
                    value={values.riskLevel}
                    options={["Low", "Medium", "High"]}
                    onChange={(value) => set("riskLevel", value as BusinessRegistrationValues["riskLevel"])}
                    help="Subject to validation by the reviewing office."
                  />
                  <SelectField
                    required
                    label="Barangay"
                    name="barangay"
                    value={values.barangay}
                    options={MATNOG_BARANGAYS}
                    error={errors.barangay}
                    onChange={(value) => set("barangay", value)}
                  />
                  <Field
                    required
                    label="Street / road"
                    name="street"
                    value={values.street}
                    error={errors.street}
                    onChange={(value) => set("street", value)}
                    placeholder="National Road, Rizal Street"
                  />
                  <Field
                    label="Building / unit"
                    name="building"
                    value={values.building}
                    onChange={(value) => set("building", value)}
                    placeholder="Building, stall, or unit number"
                  />
                  <Field
                    label="Sitio / purok"
                    name="sitio"
                    value={values.sitio}
                    onChange={(value) => set("sitio", value)}
                  />
                  <Field
                    label="Postal code"
                    name="postalCode"
                    value={values.postalCode}
                    onChange={(value) => set("postalCode", value)}
                  />
                  <Field
                    label="Landmark / address notes"
                    name="landmark"
                    value={values.landmark}
                    onChange={(value) => set("landmark", value)}
                    className={styles.span2}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepPanel}>
                <div className={styles.sectionHeading}>
                  <span>
                    <WalletCards size={18} />
                  </span>
                  <div>
                    <h2>Operations</h2>
                    <p>Declared employment and financial details used during tax and fee assessment.</p>
                  </div>
                </div>
                <div className={styles.infoBanner}>
                  <Info size={16} />
                  <span>
                    Amounts entered here are declarations. The Treasurer’s Office will validate applicable taxes and
                    fees.
                  </span>
                </div>
                <div className={styles.formGrid}>
                  <Field
                    required
                    label="Total employees"
                    name="employeeCount"
                    type="number"
                    value={values.employeeCount}
                    error={errors.employeeCount}
                    onChange={(value) => set("employeeCount", value)}
                    placeholder="0"
                  />
                  <Field
                    label="Male employees"
                    name="maleEmployees"
                    type="number"
                    value={values.maleEmployees}
                    onChange={(value) => set("maleEmployees", value)}
                    placeholder="0"
                  />
                  <Field
                    label="Female employees"
                    name="femaleEmployees"
                    type="number"
                    value={values.femaleEmployees}
                    onChange={(value) => set("femaleEmployees", value)}
                    placeholder="0"
                  />
                  <Field
                    required
                    label="Declared capitalization (PHP)"
                    name="capitalization"
                    type="number"
                    value={values.capitalization}
                    error={errors.capitalization}
                    onChange={(value) => set("capitalization", value)}
                    placeholder="0.00"
                  />
                  <Field
                    required
                    label="Declared gross sales (PHP)"
                    name="grossSales"
                    type="number"
                    value={values.grossSales}
                    error={errors.grossSales}
                    onChange={(value) => set("grossSales", value)}
                    placeholder="0.00"
                  />
                  <Field
                    required
                    label="Start of operations"
                    name="startOfOperations"
                    type="date"
                    value={values.startOfOperations}
                    error={errors.startOfOperations}
                    onChange={(value) => set("startOfOperations", value)}
                  />
                  <SelectField
                    label="Accounting period"
                    name="accountingPeriod"
                    value={values.accountingPeriod}
                    options={["Calendar year", "Fiscal year"]}
                    onChange={(value) => set("accountingPeriod", value)}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={styles.stepPanel}>
                <div className={styles.sectionHeading}>
                  <span>
                    <FileCheck2 size={18} />
                  </span>
                  <div>
                    <h2>Review and register</h2>
                    <p>Confirm the business information before creating the municipal record.</p>
                  </div>
                </div>
                <div className={styles.reviewGrid}>
                  <section>
                    <h3>Business identity</h3>
                    <dl>
                      <ReviewRow label="Registered name" value={values.registeredName} />
                      <ReviewRow label="Trade name" value={values.tradeName} />
                      <ReviewRow label="Organization" value={values.organizationType} />
                      <ReviewRow
                        label="Registration"
                        value={`${values.registrationAuthority} · ${values.registrationNumber}`}
                      />
                      <ReviewRow label="TIN" value={values.tin} />
                    </dl>
                    <button type="button" onClick={() => setStep(0)}>
                      Edit identity
                    </button>
                  </section>
                  <section>
                    <h3>Owner and contact</h3>
                    <dl>
                      <ReviewRow label="Representative" value={values.ownerName} />
                      <ReviewRow label="Designation" value={values.ownerPosition} />
                      <ReviewRow label="Mobile" value={values.contactNumber} />
                      <ReviewRow label="Email" value={values.email} />
                    </dl>
                    <button type="button" onClick={() => setStep(1)}>
                      Edit owner details
                    </button>
                  </section>
                  <section>
                    <h3>Activity and location</h3>
                    <dl>
                      <ReviewRow label="Activity" value={values.primaryActivity} />
                      <ReviewRow
                        label="Classification"
                        value={`${values.activityCategory} · PSIC ${values.psicCode}`}
                      />
                      <ReviewRow label="Risk" value={values.riskLevel} />
                      <ReviewRow label="Location" value={`${values.street}, Barangay ${values.barangay}, Matnog`} />
                    </dl>
                    <button type="button" onClick={() => setStep(2)}>
                      Edit activity
                    </button>
                  </section>
                  <section>
                    <h3>Operations</h3>
                    <dl>
                      <ReviewRow label="Employees" value={values.employeeCount} />
                      <ReviewRow
                        label="Capitalization"
                        value={values.capitalization ? `₱${Number(values.capitalization).toLocaleString("en-PH")}` : ""}
                      />
                      <ReviewRow
                        label="Gross sales"
                        value={values.grossSales ? `₱${Number(values.grossSales).toLocaleString("en-PH")}` : ""}
                      />
                      <ReviewRow label="Operations start" value={values.startOfOperations} />
                    </dl>
                    <button type="button" onClick={() => setStep(3)}>
                      Edit operations
                    </button>
                  </section>
                </div>
                <label className={`${styles.declaration} ${errors.declarationAccepted ? styles.declarationError : ""}`}>
                  <input
                    type="checkbox"
                    name="declarationAccepted"
                    checked={values.declarationAccepted}
                    onChange={(event) => set("declarationAccepted", event.target.checked)}
                  />
                  <span>
                    <strong>I certify that the information provided is true and complete.</strong>
                    <small>
                      I understand that this creates a business registry record only. A separate permit application and
                      assessment are still required.
                    </small>
                    {errors.declarationAccepted ? <em>{errors.declarationAccepted}</em> : null}
                  </span>
                </label>
              </div>
            )}
          </section>

          <aside className={styles.sidePanel}>
            <h2>Registration status</h2>
            <p>Complete all required information before creating the record.</p>
            <div className={styles.progressTrack}>
              <span style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
            <strong>
              {step + 1} of {steps.length} steps
            </strong>
            <dl>
              <div>
                <dt>Record status</dt>
                <dd>New registration</dd>
              </div>
              <div>
                <dt>Business ID</dt>
                <dd>Generated on save</dd>
              </div>
              <div>
                <dt>Permit status</dt>
                <dd>For application</dd>
              </div>
            </dl>
            <div className={styles.draftBox}>
              <Save size={16} />
              <div>
                <strong>{dirty ? "Unsaved changes" : draftMessage || "No unsaved changes"}</strong>
                <small>Drafts are stored only on this device.</small>
              </div>
            </div>
            <button type="button" className={styles.saveDraftButton} onClick={saveDraft}>
              <Save size={14} /> Save draft
            </button>
            <button type="button" className={styles.discardButton} onClick={discardDraft}>
              <Trash2 size={14} /> Discard draft
            </button>
          </aside>
        </div>

        <footer className={styles.formFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={step === 0}
            onClick={() => {
              setErrors({});
              setStep((current) => Math.max(0, current - 1));
            }}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span>{dirty ? "You have unsaved changes" : draftMessage}</span>
          {step < steps.length - 1 ? (
            <button type="button" className={styles.primaryButton} onClick={continueToNextStep}>
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button type="submit" className={styles.primaryButton}>
              <CheckCircle2 size={15} /> Register business
            </button>
          )}
        </footer>
      </form>
    </main>
  );
}
