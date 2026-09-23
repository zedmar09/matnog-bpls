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
  ClipboardCheck,
  FileCheck2,
  Info,
  MapPin,
  Paperclip,
  Save,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";

import styles from "../components/application-wizard.module.css";
import { APPLICATION_OFFICERS } from "../data/matnog-application-directory";
import { MATNOG_BUSINESS_DIRECTORY } from "../data/matnog-business-directory";
import type { ApplicationDirectoryRecord, ApplicationDirectoryType } from "../types/application-directory";
import type { ApplicationWizardErrors, ApplicationWizardValues, RequirementChoice } from "../types/application-wizard";
import {
  APPLICATION_DRAFT_STORAGE_KEY,
  applicationValuesForBusiness,
  createApplicationRecord,
  getApplicationStepErrors,
  requirementsFor,
  SAVED_APPLICATIONS_STORAGE_KEY,
  validateApplicationWizard,
} from "../utils/application-wizard-utils";
import { mergeBusinessRecords, REGISTERED_BUSINESSES_STORAGE_KEY } from "../utils/business-registration-utils";

const steps = [
  { label: "Application & business", icon: Building2 },
  { label: "Applicant & filing", icon: UserRound },
  { label: "Transaction details", icon: MapPin },
  { label: "Requirements", icon: Paperclip },
  { label: "Review & submit", icon: ClipboardCheck },
] as const;
const types: ApplicationDirectoryType[] = ["New", "Renewal", "Amendment", "Closure"];

function Field({
  label,
  name,
  value,
  error,
  required,
  type = "text",
  help,
  className,
  onChange,
}: {
  label: string;
  name: keyof ApplicationWizardValues;
  value: string;
  error?: string;
  required?: boolean;
  type?: string;
  help?: string;
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
  onChange,
}: {
  label: string;
  name: keyof ApplicationWizardValues;
  value: string;
  options: readonly string[];
  error?: string;
  required?: boolean;
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
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {error ? <small className={styles.fieldError}>{error}</small> : null}
    </label>
  );
}
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.reviewRow}>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

export function ApplicationWizardView({
  initialType = "New",
  initialBusinessId = "",
}: {
  initialType?: ApplicationDirectoryType;
  initialBusinessId?: string;
}) {
  const [businesses, setBusinesses] = useState(() => [...MATNOG_BUSINESS_DIRECTORY]);
  const initialBusiness = MATNOG_BUSINESS_DIRECTORY.find((item) => item.id === initialBusinessId);
  const [values, setValues] = useState<ApplicationWizardValues>(() =>
    applicationValuesForBusiness(initialType, initialBusiness),
  );
  const [errors, setErrors] = useState<ApplicationWizardErrors>({});
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [created, setCreated] = useState<ApplicationDirectoryRecord | null>(null);

  useEffect(() => {
    try {
      const overrides = JSON.parse(window.localStorage.getItem(REGISTERED_BUSINESSES_STORAGE_KEY) ?? "[]");
      const merged = mergeBusinessRecords(MATNOG_BUSINESS_DIRECTORY, overrides);
      setBusinesses(merged);
      const business = merged.find((item) => item.id === initialBusinessId) ?? initialBusiness;
      const rawDraft = window.localStorage.getItem(APPLICATION_DRAFT_STORAGE_KEY);
      if (rawDraft) {
        setValues({ ...applicationValuesForBusiness(initialType, business), ...JSON.parse(rawDraft) });
        setDraftMessage("Saved draft restored");
      } else if (business) setValues(applicationValuesForBusiness(initialType, business));
    } catch {
      window.localStorage.removeItem(APPLICATION_DRAFT_STORAGE_KEY);
    }
  }, [initialBusiness, initialBusinessId, initialType]);

  const business = businesses.find((item) => item.id === values.businessId);
  const requirements = useMemo(() => requirementsFor(values.type, business), [values.type, business]);
  const validation = useMemo(() => validateApplicationWizard(values, requirements), [values, requirements]);
  const completed = steps.map((_, index) => getApplicationStepErrors(validation, index).length === 0);

  function set<K extends keyof ApplicationWizardValues>(key: K, value: ApplicationWizardValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setDirty(true);
    setDraftMessage("");
  }
  function selectBusiness(id: string) {
    const selected = businesses.find((item) => item.id === id);
    if (!selected) return;
    setValues((current) => ({
      ...applicationValuesForBusiness(current.type, selected),
      fiscalPeriod: current.fiscalPeriod,
      filingChannel: current.filingChannel,
      priority: current.priority,
      assignedOfficer: current.assignedOfficer,
    }));
    setErrors((current) => ({ ...current, businessId: undefined }));
    setDirty(true);
  }
  function selectType(type: ApplicationDirectoryType) {
    setValues((current) => ({
      ...applicationValuesForBusiness(type, business),
      fiscalPeriod: current.fiscalPeriod,
      filingChannel: current.filingChannel,
      priority: current.priority,
      assignedOfficer: current.assignedOfficer,
    }));
    setErrors({});
    setDirty(true);
  }
  function continueNext() {
    const current = getApplicationStepErrors(validation, step);
    if (current.length) {
      setErrors(Object.fromEntries(current.map((field) => [field, validation[field]])));
      document.querySelector<HTMLElement>(`[name="${current[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setStep((value) => Math.min(4, value + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function saveBrowserDraft() {
    window.localStorage.setItem(APPLICATION_DRAFT_STORAGE_KEY, JSON.stringify(values));
    setDirty(false);
    setDraftMessage("Draft saved on this device");
  }
  function discardDraft() {
    window.localStorage.removeItem(APPLICATION_DRAFT_STORAGE_KEY);
    setValues(applicationValuesForBusiness(initialType, initialBusiness));
    setErrors({});
    setStep(0);
    setDirty(false);
    setDraftMessage("Draft discarded");
  }
  function setRequirement(id: string, value: RequirementChoice) {
    set("requirements", { ...values.requirements, [id]: value });
  }
  function finish(mode: "draft" | "submit") {
    if (!business) {
      setErrors({ businessId: "Select a registered business." });
      setStep(0);
      return;
    }
    if (mode === "submit" && Object.keys(validation).length) {
      setErrors(validation);
      const first = steps.findIndex((_, index) => getApplicationStepErrors(validation, index).length);
      setStep(first < 0 ? 0 : first);
      return;
    }
    let saved: ApplicationDirectoryRecord[] = [];
    try {
      saved = JSON.parse(window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]");
    } catch {
      saved = [];
    }
    const record = createApplicationRecord(values, business, saved.length + 1, mode);
    window.localStorage.setItem(SAVED_APPLICATIONS_STORAGE_KEY, JSON.stringify([record, ...saved]));
    window.localStorage.removeItem(APPLICATION_DRAFT_STORAGE_KEY);
    setCreated(record);
    setDirty(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (created)
    return (
      <main className={styles.page}>
        <section className={styles.successCard}>
          <div className={styles.successIcon}>
            {created.status === "Draft" ? <Save size={31} /> : <CheckCircle2 size={31} />}
          </div>
          <p className={styles.eyebrow}>Application {created.status === "Draft" ? "draft saved" : "submitted"}</p>
          <h1>{created.id}</h1>
          <p>
            {created.businessName} · {created.type} application
          </p>
          <div className={styles.referenceBox}>
            <span>Workflow status</span>
            <strong>{created.status}</strong>
            <small>Target release: {created.targetRelease}</small>
          </div>
          <div className={styles.successActions}>
            <Link className={styles.primaryButton} href={`/applications/${created.id}`}>
              Open application <ChevronRight size={14} />
            </Link>
            <Link className={styles.secondaryButton} href="/applications">
              Return to applications
            </Link>
          </div>
        </section>
      </main>
    );

  const errorCount = Object.keys(errors).length;
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Business Registration &amp; Renewal</p>
          <h1>New Permit Application</h1>
          <p>Prepare a new registration, renewal, amendment, or closure request.</p>
        </div>
        <Link className={styles.secondaryButton} href="/applications">
          <ChevronLeft size={14} /> Back to applications
        </Link>
      </header>
      <form className={styles.formCard} onSubmit={(event) => event.preventDefault()} noValidate>
        <nav className={styles.stepper} aria-label="Application progress">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.label}
                className={`${styles.step} ${index === step ? styles.stepActive : ""} ${index < step || completed[index] ? styles.stepDone : ""}`}
                onClick={() => {
                  setErrors({});
                  setStep(index);
                }}
              >
                <span className={styles.stepMarker}>
                  {index < step || completed[index] ? <Check size={13} /> : <Icon size={14} />}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>Step {index + 1} of 5</small>
                </span>
              </button>
            );
          })}
        </nav>
        <div className={styles.formLayout}>
          <section className={styles.formBody}>
            {errorCount ? (
              <div className={styles.errorSummary} role="alert">
                <AlertCircle size={18} />
                <div>
                  <strong>
                    Please review {errorCount} {errorCount === 1 ? "item" : "items"}.
                  </strong>
                  <p>Correct the highlighted information before submission.</p>
                </div>
              </div>
            ) : null}
            {step === 0 ? (
              <div className={styles.stepPanel}>
                <Section
                  icon={<Building2 size={18} />}
                  title="Application and business"
                  text="Choose the transaction and registered business that this application covers."
                />
                <div className={styles.typeGrid}>
                  {types.map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={values.type === type ? styles.typeActive : ""}
                      onClick={() => selectType(type)}
                    >
                      <strong>{type}</strong>
                      <span>
                        {type === "New"
                          ? "First permit"
                          : type === "Renewal"
                            ? "Next fiscal period"
                            : type === "Amendment"
                              ? "Controlled change"
                              : "Retire establishment"}
                      </span>
                    </button>
                  ))}
                </div>
                <label className={styles.field}>
                  <span>Registered business *</span>
                  <select
                    name="businessId"
                    value={values.businessId}
                    aria-invalid={Boolean(errors.businessId)}
                    onChange={(event) => selectBusiness(event.target.value)}
                  >
                    <option value="">Select a registered business</option>
                    {businesses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.tradeName} · {item.id}
                      </option>
                    ))}
                  </select>
                  {errors.businessId ? <small className={styles.fieldError}>{errors.businessId}</small> : null}
                </label>
                {business ? (
                  <div className={styles.businessPreview}>
                    <div>
                      <Building2 size={19} />
                    </div>
                    <span>
                      <strong>{business.tradeName}</strong>
                      <small>
                        {business.id} · {business.registeredName}
                      </small>
                    </span>
                    <dl>
                      <div>
                        <dt>Permit</dt>
                        <dd>{business.permitNumber}</dd>
                      </div>
                      <div>
                        <dt>Barangay</dt>
                        <dd>{business.barangay}</dd>
                      </div>
                      <div>
                        <dt>Risk</dt>
                        <dd>{business.riskLevel}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{business.status}</dd>
                      </div>
                    </dl>
                  </div>
                ) : null}
              </div>
            ) : null}
            {step === 1 ? (
              <div className={styles.stepPanel}>
                <Section
                  icon={<UserRound size={18} />}
                  title="Applicant and filing"
                  text="Record who is filing and establish the application service target."
                />
                <div className={styles.formGrid}>
                  <SelectField
                    required
                    label="Applicant role"
                    name="representativeRole"
                    value={values.representativeRole}
                    options={["Owner", "Authorized representative"]}
                    onChange={(value) =>
                      set("representativeRole", value as ApplicationWizardValues["representativeRole"])
                    }
                  />
                  <Field
                    required
                    label="Applicant / representative"
                    name="representativeName"
                    value={values.representativeName}
                    error={errors.representativeName}
                    onChange={(value) => set("representativeName", value)}
                  />
                  <Field
                    label="Position / designation"
                    name="representativePosition"
                    value={values.representativePosition}
                    onChange={(value) => set("representativePosition", value)}
                  />
                  <Field
                    required
                    label="Primary mobile number"
                    name="contactNumber"
                    value={values.contactNumber}
                    error={errors.contactNumber}
                    onChange={(value) => set("contactNumber", value)}
                  />
                  <Field
                    label="Email address"
                    name="email"
                    type="email"
                    value={values.email}
                    error={errors.email}
                    onChange={(value) => set("email", value)}
                  />
                  <Field
                    required
                    label="Fiscal period"
                    name="fiscalPeriod"
                    value={values.fiscalPeriod}
                    error={errors.fiscalPeriod}
                    onChange={(value) => set("fiscalPeriod", value)}
                  />
                  <SelectField
                    label="Filing channel"
                    name="filingChannel"
                    value={values.filingChannel}
                    options={["Onsite", "Online"]}
                    onChange={(value) => set("filingChannel", value as ApplicationWizardValues["filingChannel"])}
                  />
                  <SelectField
                    label="Priority"
                    name="priority"
                    value={values.priority}
                    options={["Normal", "Urgent"]}
                    onChange={(value) => set("priority", value as ApplicationWizardValues["priority"])}
                  />
                  <SelectField
                    label="Assigned officer"
                    name="assignedOfficer"
                    value={values.assignedOfficer}
                    options={APPLICATION_OFFICERS}
                    onChange={(value) => set("assignedOfficer", value)}
                  />
                </div>
              </div>
            ) : null}
            {step === 2 ? (
              <div className={styles.stepPanel}>
                <Section
                  icon={<MapPin size={18} />}
                  title="Transaction details"
                  text="Confirm the establishment information and describe transaction-specific changes."
                />
                <div className={styles.infoBanner}>
                  <Info size={15} />
                  <span>
                    Business identity changes belong in the business record. This section records what the permit
                    transaction requests.
                  </span>
                </div>
                <div className={styles.formGrid}>
                  <Field
                    required
                    label="Business activity"
                    name="activity"
                    value={values.activity}
                    error={errors.activity}
                    onChange={(value) => set("activity", value)}
                    className={styles.span2}
                  />
                  <Field
                    required
                    label="Establishment location"
                    name="location"
                    value={values.location}
                    error={errors.location}
                    onChange={(value) => set("location", value)}
                    className={styles.span2}
                  />
                  {values.type === "Amendment" ? (
                    <>
                      <SelectField
                        required
                        label="Information being amended"
                        name="amendmentType"
                        value={values.amendmentType}
                        options={[
                          "Select amendment type",
                          "Business name",
                          "Ownership",
                          "Business activity",
                          "Establishment location",
                          "Capitalization",
                          "Other permit detail",
                        ]}
                        error={errors.amendmentType}
                        onChange={(value) => set("amendmentType", value === "Select amendment type" ? "" : value)}
                      />
                      <Field
                        required
                        label="Effective date"
                        name="effectiveDate"
                        type="date"
                        value={values.effectiveDate}
                        error={errors.effectiveDate}
                        onChange={(value) => set("effectiveDate", value)}
                      />
                      <Field
                        required
                        label="Reason and requested change"
                        name="transactionReason"
                        value={values.transactionReason}
                        error={errors.transactionReason}
                        onChange={(value) => set("transactionReason", value)}
                        className={styles.span2}
                      />
                    </>
                  ) : null}
                  {values.type === "Closure" ? (
                    <>
                      <Field
                        required
                        label="Requested closure date"
                        name="closureDate"
                        type="date"
                        value={values.closureDate}
                        error={errors.closureDate}
                        onChange={(value) => set("closureDate", value)}
                      />
                      <Field
                        required
                        label="Closure reason"
                        name="transactionReason"
                        value={values.transactionReason}
                        error={errors.transactionReason}
                        onChange={(value) => set("transactionReason", value)}
                      />
                      <label className={`${styles.checkField} ${errors.outstandingDeclared ? styles.checkError : ""}`}>
                        <input
                          name="outstandingDeclared"
                          type="checkbox"
                          checked={values.outstandingDeclared}
                          onChange={(event) => set("outstandingDeclared", event.target.checked)}
                        />
                        <span>
                          <strong>Outstanding obligations declared</strong>
                          <small>
                            All unpaid taxes, pending clearances, and accountable property have been disclosed.
                          </small>
                          {errors.outstandingDeclared ? <em>{errors.outstandingDeclared}</em> : null}
                        </span>
                      </label>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}
            {step === 3 ? (
              <div className={styles.stepPanel}>
                <Section
                  icon={<Paperclip size={18} />}
                  title="Requirements and evidence"
                  text="Reuse valid records or select replacement evidence for mandatory requirements."
                />
                <div className={styles.requirementSummary}>
                  <span>
                    <strong>
                      {
                        requirements.filter((item) => item.mandatory && values.requirements[item.id] !== "missing")
                          .length
                      }
                    </strong>{" "}
                    of {requirements.filter((item) => item.mandatory).length} mandatory complete
                  </span>
                  <div>
                    <i
                      style={{
                        width: `${(requirements.filter((item) => item.mandatory && values.requirements[item.id] !== "missing").length / Math.max(1, requirements.filter((item) => item.mandatory).length)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className={styles.requirementList}>
                  {requirements.map((item) => {
                    const choice = values.requirements[item.id] ?? "missing";
                    return (
                      <article
                        key={item.id}
                        className={choice === "missing" && item.mandatory ? styles.requirementMissing : ""}
                      >
                        <div className={styles.requirementIcon}>
                          {choice === "missing" ? <AlertCircle size={16} /> : <FileCheck2 size={16} />}
                        </div>
                        <div className={styles.requirementName}>
                          <strong>
                            {item.name}
                            {item.mandatory ? <b> *</b> : null}
                          </strong>
                          <span>
                            {item.office}
                            {item.expiresAt ? ` · Valid until ${item.expiresAt}` : ""}
                          </span>
                        </div>
                        <select
                          aria-label={`${item.name} evidence`}
                          value={choice}
                          onChange={(event) => setRequirement(item.id, event.target.value as RequirementChoice)}
                        >
                          <option value="missing">Not submitted</option>
                          {item.reusable ? <option value="reuse">Reuse valid record</option> : null}
                          <option value="selected">Select sample file</option>
                        </select>
                        <small
                          className={`${styles.requirementStatus} ${choice !== "missing" ? styles.requirementComplete : ""}`}
                        >
                          {choice === "reuse"
                            ? "Reusable"
                            : choice === "selected"
                              ? "Selected"
                              : item.mandatory
                                ? "Required"
                                : "Optional"}
                        </small>
                      </article>
                    );
                  })}
                </div>
                {errors.requirements ? <p className={styles.inlineError}>{errors.requirements}</p> : null}
              </div>
            ) : null}
            {step === 4 ? (
              <div className={styles.stepPanel}>
                <Section
                  icon={<ClipboardCheck size={18} />}
                  title="Review and submit"
                  text="Confirm the application, evidence, and filing declaration."
                />
                <div className={styles.reviewGrid}>
                  <Review
                    title="Application"
                    edit={() => setStep(0)}
                    rows={[
                      ["Type", values.type],
                      ["Business", business?.tradeName ?? ""],
                      ["Business ID", values.businessId],
                      ["Fiscal period", values.fiscalPeriod],
                    ]}
                  />
                  <Review
                    title="Applicant"
                    edit={() => setStep(1)}
                    rows={[
                      ["Role", values.representativeRole],
                      ["Representative", values.representativeName],
                      ["Mobile", values.contactNumber],
                      ["Assigned officer", values.assignedOfficer],
                    ]}
                  />
                  <Review
                    title="Transaction"
                    edit={() => setStep(2)}
                    rows={[
                      ["Activity", values.activity],
                      ["Location", values.location],
                      ["Effective date", values.type === "Closure" ? values.closureDate : values.effectiveDate],
                      ["Reason", values.transactionReason],
                    ]}
                  />
                  <Review
                    title="Requirements"
                    edit={() => setStep(3)}
                    rows={[
                      [
                        "Mandatory complete",
                        `${requirements.filter((item) => item.mandatory && values.requirements[item.id] !== "missing").length}/${requirements.filter((item) => item.mandatory).length}`,
                      ],
                      [
                        "Reusable records",
                        Object.values(values.requirements).filter((value) => value === "reuse").length,
                      ],
                      [
                        "Selected files",
                        Object.values(values.requirements).filter((value) => value === "selected").length,
                      ],
                      ["Missing", Object.values(values.requirements).filter((value) => value === "missing").length],
                    ]}
                  />
                </div>
                <label className={`${styles.declaration} ${errors.declarationAccepted ? styles.checkError : ""}`}>
                  <input
                    name="declarationAccepted"
                    type="checkbox"
                    checked={values.declarationAccepted}
                    onChange={(event) => set("declarationAccepted", event.target.checked)}
                  />
                  <span>
                    <strong>I certify that this application is complete and accurate.</strong>
                    <small>
                      I authorize the LGU to validate submitted information and route this application to applicable
                      reviewing offices.
                    </small>
                    {errors.declarationAccepted ? <em>{errors.declarationAccepted}</em> : null}
                  </span>
                </label>
              </div>
            ) : null}
          </section>
          <aside className={styles.sidePanel}>
            <h2>Application status</h2>
            <p>Complete each section before submission.</p>
            <div className={styles.progressTrack}>
              <span style={{ width: `${((step + 1) / 5) * 100}%` }} />
            </div>
            <strong>{step + 1} of 5 steps</strong>
            <dl>
              <div>
                <dt>Transaction</dt>
                <dd>{values.type}</dd>
              </div>
              <div>
                <dt>Business</dt>
                <dd>{business?.id ?? "Not selected"}</dd>
              </div>
              <div>
                <dt>Workflow status</dt>
                <dd>Draft</dd>
              </div>
              <div>
                <dt>Target release</dt>
                <dd>{values.priority === "Urgent" ? "Sep 28, 2026" : "Oct 2, 2026"}</dd>
              </div>
            </dl>
            <div className={styles.draftBox}>
              <Save size={15} />
              <div>
                <strong>{dirty ? "Unsaved changes" : draftMessage || "No unsaved changes"}</strong>
                <small>Draft fields are stored only on this device.</small>
              </div>
            </div>
            <button type="button" className={styles.saveDraftButton} onClick={saveBrowserDraft}>
              <Save size={14} /> Save browser draft
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
              setStep((value) => Math.max(0, value - 1));
            }}
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span>{dirty ? "You have unsaved changes" : draftMessage}</span>
          {step < 4 ? (
            <button type="button" className={styles.primaryButton} onClick={continueNext}>
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <div className={styles.finalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => finish("draft")}>
                <Save size={14} /> Save as draft
              </button>
              <button type="button" className={styles.primaryButton} onClick={() => finish("submit")}>
                <Send size={14} /> Submit for review
              </button>
            </div>
          )}
        </footer>
      </form>
    </main>
  );
}

function Section({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className={styles.sectionHeading}>
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
function Review({ title, rows, edit }: { title: string; rows: Array<[string, string | number]>; edit: () => void }) {
  return (
    <section>
      <h3>{title}</h3>
      <dl>
        {rows.map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </dl>
      <button type="button" onClick={edit}>
        Edit {title.toLowerCase()}
      </button>
    </section>
  );
}
