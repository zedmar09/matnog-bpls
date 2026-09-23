"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  Archive,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CopyPlus,
  FileBadge2,
  FileClock,
  FilePlus2,
  FileSearch,
  History,
  QrCode,
  Save,
  Search,
  Send,
  X,
} from "lucide-react";

import styles from "../components/permit-templates.module.css";
import { MATNOG_PERMIT_TEMPLATES } from "../data/matnog-permit-templates";
import type {
  PermitTemplateFilters,
  PermitTemplateFormValues,
  PermitTemplateRecord,
  PermitTemplateSortKey,
} from "../types/permit-template";
import {
  archivePermitTemplate,
  createDefaultPermitTemplateForm,
  createPermitTemplateDraftVersion,
  EMPTY_PERMIT_TEMPLATE_FILTERS,
  filterPermitTemplates,
  PERMIT_TEMPLATE_REFERENCE_DATE,
  PERMIT_TEMPLATE_STORAGE_KEY,
  publishPermitTemplate,
  savePermitTemplateDraft,
  sortPermitTemplates,
  summarizePermitTemplates,
  templateToForm,
  validatePermitTemplateForm,
} from "../utils/permit-template-utils";

const documentTypes = ["Business Permit", "Closure Certificate"];
const statuses = ["Active", "Draft", "Archived"];
const fiscalYears = ["2027", "2026", "2025", "2024"];
const providers = ["DocuSign · Pending connection", "Manual digital signature"];

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function statusClass(status: PermitTemplateRecord["status"]) {
  return status === "Active" ? styles.active : status === "Draft" ? styles.draft : styles.archived;
}

function SortHeading({
  label,
  column,
  current,
  direction,
  onSort,
}: {
  label: string;
  column: PermitTemplateSortKey;
  current: PermitTemplateSortKey;
  direction: "asc" | "desc";
  onSort: (key: PermitTemplateSortKey) => void;
}) {
  return (
    <th aria-sort={column === current ? (direction === "asc" ? "ascending" : "descending") : undefined}>
      <button className={styles.sortButton} type="button" onClick={() => onSort(column)}>
        {label} <ChevronsUpDown size={12} />
      </button>
    </th>
  );
}

function TemplatePreview({ values, status }: { values: PermitTemplateFormValues; status: string }) {
  const closure = values.documentType === "Closure Certificate";
  return (
    <aside className={`${styles.preview} ${values.orientation === "Landscape" ? styles.landscape : ""}`}>
      <div className={styles.previewToolbar}>
        <span>Live template preview</span>
        <small>
          {values.pageSize} · {values.orientation}
        </small>
      </div>
      <div className={styles.paper}>
        <div className={styles.seal}>M</div>
        <small>Republic of the Philippines</small>
        <strong>Municipality of Matnog</strong>
        <span>Province of Sorsogon</span>
        <h3>{closure ? "Certificate of Business Closure" : "Mayor’s Business Permit"}</h3>
        <p className={styles.previewNumber}>
          {values.numberingPattern.replace("{YYYY}", values.fiscalYear).replace("{#####}", "00001")}
        </p>
        <p>This certifies that</p>
        <h4>Matnog Bay Trading Corporation</h4>
        <p>Sample registered enterprise · Barangay Poblacion</p>
        <dl>
          <div>
            <dt>Purpose</dt>
            <dd>{values.purpose}</dd>
          </div>
          <div>
            <dt>Validity rule</dt>
            <dd>{values.validityRule}</dd>
          </div>
        </dl>
        <p className={styles.previewConditions}>{values.defaultConditions}</p>
        <div className={`${styles.previewFooter} ${styles[`qr${values.qrPlacement.replaceAll(" ", "")}`]}`}>
          <span>
            <i />
            <strong>{values.signatoryName}</strong>
            <small>{values.signatoryTitle}</small>
          </span>
          <span className={styles.qr}>
            <QrCode size={42} />
            <small>{values.verificationLabel}</small>
          </span>
        </div>
        <em>Template {status.toLocaleLowerCase()} · Sample data only</em>
      </div>
    </aside>
  );
}

export function PermitTemplatesView() {
  const [records, setRecords] = useState<PermitTemplateRecord[]>(() => [...MATNOG_PERMIT_TEMPLATES]);
  const [filters, setFilters] = useState<PermitTemplateFilters>(EMPTY_PERMIT_TEMPLATE_FILTERS);
  const [sortKey, setSortKey] = useState<PermitTemplateSortKey>("updatedAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [form, setForm] = useState<PermitTemplateFormValues>(createDefaultPermitTemplateForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(PERMIT_TEMPLATE_STORAGE_KEY) ?? "[]",
      ) as PermitTemplateRecord[];
      if (saved.length) setRecords(saved);
    } catch {
      setRecords([...MATNOG_PERMIT_TEMPLATES]);
    }
  }, []);

  const selected = records.find((record) => record.id === selectedId);
  const readOnly = Boolean(selected && selected.status !== "Draft");
  const summary = useMemo(() => summarizePermitTemplates(records), [records]);
  const filtered = useMemo(
    () => sortPermitTemplates(filterPermitTemplates(records, filters), sortKey, direction),
    [direction, filters, records, sortKey],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const persist = (next: PermitTemplateRecord[]) => {
    setRecords(next);
    try {
      window.localStorage.setItem(PERMIT_TEMPLATE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // UI state remains usable when browser storage is unavailable.
    }
  };
  const setFilter = (key: keyof PermitTemplateFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => {
    setFilters(EMPTY_PERMIT_TEMPLATE_FILTERS);
    setPage(1);
  };
  const sort = (key: PermitTemplateSortKey) => {
    if (key === sortKey) setDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDirection("asc");
    }
  };
  const openRecord = (record: PermitTemplateRecord) => {
    setSelectedId(record.id);
    setForm(templateToForm(record));
    setError("");
    setNotice("");
    setEditorOpen(true);
  };
  const openNew = () => {
    setSelectedId(undefined);
    setForm(createDefaultPermitTemplateForm());
    setError("");
    setNotice("");
    setEditorOpen(true);
  };
  const setField = <K extends keyof PermitTemplateFormValues>(key: K, value: PermitTemplateFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validatePermitTemplateForm(form);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      const next = savePermitTemplateDraft(records, form, selectedId);
      const saved = next.find((record) => record.code === form.code.trim());
      persist(next);
      setSelectedId(saved?.id);
      setError("");
      setNotice("Draft saved with an audit event.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the draft.");
    }
  };

  const newVersion = (record: PermitTemplateRecord) => {
    try {
      const next = createPermitTemplateDraftVersion(records, record.id);
      const draft = next.find((item) => !records.some((existing) => existing.id === item.id));
      persist(next);
      if (draft) openRecord(draft);
      setNotice(`Draft version ${draft?.version ?? ""} created from ${record.code}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create a new version.");
    }
  };

  const publish = (record: PermitTemplateRecord, pendingForm?: PermitTemplateFormValues) => {
    if (
      !window.confirm(
        `Publish ${record.code}? The current active ${record.documentType} · ${record.purpose} template will be archived.`,
      )
    )
      return;
    try {
      if (pendingForm) {
        const validation = validatePermitTemplateForm(pendingForm);
        if (validation) {
          setError(validation);
          return;
        }
      }
      const saved = pendingForm ? savePermitTemplateDraft(records, pendingForm, record.id) : records;
      const next = publishPermitTemplate(saved, record.id);
      persist(next);
      const published = next.find((item) => item.id === record.id);
      if (published) openRecord(published);
      setNotice(`${record.code} is now the active controlled template.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to publish the template.");
    }
  };

  const archive = (record: PermitTemplateRecord) => {
    if (!window.confirm(`Archive ${record.code}? It will no longer be available for new controlled documents.`)) return;
    const next = archivePermitTemplate(records, record.id);
    persist(next);
    const archivedRecord = next.find((item) => item.id === record.id);
    if (archivedRecord) openRecord(archivedRecord);
    setNotice(`${record.code} archived.`);
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/permits">Permits</Link>
            <span>/</span>
            <span>Permit templates</span>
          </nav>
          <p className={styles.eyebrow}>Controlled Document Configuration</p>
          <h1>Permit Templates</h1>
          <p>
            Manage immutable permit and closure-certificate layouts, publishing controls, signatories, and QR placement.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryAction} href="/permits/issued">
            <FileSearch size={15} /> Issued permits
          </Link>
          <button className={styles.primaryAction} type="button" onClick={openNew}>
            <FilePlus2 size={15} /> New template
          </button>
        </div>
      </header>

      <section className={styles.summaryGrid} aria-label="Permit template summary">
        <article>
          <FileBadge2 size={18} />
          <span>
            Total versions<strong>{summary.total}</strong>
            <small>Controlled template registry</small>
          </span>
        </article>
        <article className={styles.successMetric}>
          <BadgeCheck size={18} />
          <span>
            Active<strong>{summary.active}</strong>
            <small>Available for generation</small>
          </span>
        </article>
        <article className={styles.warningMetric}>
          <FileClock size={18} />
          <span>
            Drafts<strong>{summary.draft}</strong>
            <small>Awaiting review or publishing</small>
          </span>
        </article>
        <article>
          <Archive size={18} />
          <span>
            Archived<strong>{summary.archived}</strong>
            <small>Immutable historical versions</small>
          </span>
        </article>
        <article className={styles.dangerMetric}>
          <CircleAlert size={18} />
          <span>
            Review due<strong>{summary.due}</strong>
            <small>Active or draft controls</small>
          </span>
        </article>
        <article>
          <History size={18} />
          <span>
            Documents generated<strong>{summary.usage}</strong>
            <small>All template versions</small>
          </span>
        </article>
      </section>

      <section className={styles.registryCard} aria-label="Permit template registry">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search size={15} />
            <input
              aria-label="Search permit templates"
              placeholder="Search template, code, signatory, or numbering pattern"
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
            />
          </label>
          {activeFilterCount ? (
            <button className={styles.clearButton} type="button" onClick={resetFilters}>
              <X size={14} /> Clear filters <span className={styles.filterCount}>{activeFilterCount}</span>
            </button>
          ) : null}
        </div>
        <div className={styles.filters}>
          <label>
            Document type
            <select value={filters.documentType} onChange={(event) => setFilter("documentType", event.target.value)}>
              <option value="">All document types</option>
              {documentTypes.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Fiscal year
            <select value={filters.fiscalYear} onChange={(event) => setFilter("fiscalYear", event.target.value)}>
              <option value="">All years</option>
              {fiscalYears.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Signature provider
            <select
              value={filters.signatureProvider}
              onChange={(event) => setFilter("signatureProvider", event.target.value)}
            >
              <option value="">All providers</option>
              {providers.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Review state
            <select value={filters.reviewState} onChange={(event) => setFilter("reviewState", event.target.value)}>
              <option value="">All review states</option>
              <option>Due</option>
              <option>Scheduled</option>
            </select>
          </label>
        </div>
        <div className={styles.resultBar}>
          <div>
            <strong>{filtered.length}</strong> matching versions · {records.length} total
          </div>
          <span>
            Showing {filtered.length ? (safePage - 1) * pageSize + 1 : 0}–
            {Math.min(safePage * pageSize, filtered.length)}
          </span>
        </div>

        {visibleRecords.length ? (
          <>
            <div className={styles.tableViewport}>
              <table>
                <thead>
                  <tr>
                    <SortHeading label="Template" column="name" current={sortKey} direction={direction} onSort={sort} />
                    <SortHeading label="Code" column="code" current={sortKey} direction={direction} onSort={sort} />
                    <SortHeading
                      label="Document"
                      column="documentType"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Purpose"
                      column="purpose"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Year"
                      column="fiscalYear"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Version"
                      column="version"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading label="Status" column="status" current={sortKey} direction={direction} onSort={sort} />
                    <th>Layout</th>
                    <th>Signatory / provider</th>
                    <th>QR placement</th>
                    <SortHeading
                      label="Review"
                      column="reviewDate"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <SortHeading
                      label="Usage"
                      column="usageCount"
                      current={sortKey}
                      direction={direction}
                      onSort={sort}
                    />
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <button className={styles.nameButton} type="button" onClick={() => openRecord(record)}>
                          {record.name}
                        </button>
                        <small>{record.numberingPattern}</small>
                      </td>
                      <td className={styles.codeCell}>{record.code}</td>
                      <td>{record.documentType}</td>
                      <td>{record.purpose}</td>
                      <td>{record.fiscalYear}</td>
                      <td>v{record.version}</td>
                      <td>
                        <span className={`${styles.badge} ${statusClass(record.status)}`}>{record.status}</span>
                      </td>
                      <td>
                        {record.pageSize} · {record.orientation}
                      </td>
                      <td>
                        <strong>{record.signatoryName}</strong>
                        <small>{record.signatureProvider}</small>
                      </td>
                      <td>{record.qrPlacement}</td>
                      <td>
                        <span
                          className={
                            record.reviewDate <= PERMIT_TEMPLATE_REFERENCE_DATE && record.status !== "Archived"
                              ? styles.reviewDue
                              : ""
                          }
                        >
                          {formatDate(record.reviewDate)}
                        </span>
                      </td>
                      <td>{record.usageCount}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button type="button" onClick={() => openRecord(record)}>
                            {record.status === "Draft" ? "Edit" : "View"}
                          </button>
                          {record.status === "Active" ? (
                            <button type="button" onClick={() => newVersion(record)}>
                              New version
                            </button>
                          ) : null}
                          {record.status === "Draft" ? (
                            <button type="button" onClick={() => publish(record)}>
                              Publish
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.mobileList}>
              {visibleRecords.map((record) => (
                <article className={styles.mobileCard} key={record.id}>
                  <div className={styles.mobileHeader}>
                    <div>
                      <button className={styles.nameButton} type="button" onClick={() => openRecord(record)}>
                        {record.name}
                      </button>
                      <p>
                        {record.code} · v{record.version}
                      </p>
                    </div>
                    <span className={`${styles.badge} ${statusClass(record.status)}`}>{record.status}</span>
                  </div>
                  <div className={styles.mobileFacts}>
                    <div>
                      <span>Document</span>
                      <strong>{record.documentType}</strong>
                    </div>
                    <div>
                      <span>Purpose</span>
                      <strong>{record.purpose}</strong>
                    </div>
                    <div>
                      <span>Review</span>
                      <strong>{formatDate(record.reviewDate)}</strong>
                    </div>
                    <div>
                      <span>Usage</span>
                      <strong>{record.usageCount}</strong>
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <button type="button" onClick={() => openRecord(record)}>
                      {record.status === "Draft" ? "Edit template" : "View template"}
                    </button>
                    {record.status === "Active" ? (
                      <button type="button" onClick={() => newVersion(record)}>
                        Create draft version
                      </button>
                    ) : null}
                    {record.status === "Draft" ? (
                      <button type="button" onClick={() => publish(record)}>
                        Publish
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <FileSearch size={28} />
            <h2>No templates found</h2>
            <p>Change the search or filters to broaden the registry.</p>
            <button className={styles.clearButton} type="button" onClick={resetFilters}>
              Clear all filters
            </button>
          </div>
        )}
        <footer className={styles.pagination}>
          <div>
            Rows per page
            <select
              className={styles.pageSize}
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div>
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={safePage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </section>

      {editorOpen ? (
        <section className={styles.editorShell} aria-label="Template editor">
          <header className={styles.editorHeader}>
            <div>
              <p>{selected ? `${selected.code} · ${selected.status}` : "New draft"}</p>
              <h2>{readOnly ? "Template details" : "Template editor"}</h2>
            </div>
            <button type="button" aria-label="Close template editor" onClick={() => setEditorOpen(false)}>
              <X size={17} />
            </button>
          </header>
          <div className={styles.editorGrid}>
            <form className={styles.form} onSubmit={saveDraft}>
              <div className={styles.formSection}>
                <h3>Identity &amp; control</h3>
                <div className={styles.fieldGrid}>
                  <label>
                    Template name
                    <input disabled={readOnly} value={form.name} onChange={(e) => setField("name", e.target.value)} />
                  </label>
                  <label>
                    Template code
                    <input
                      disabled={readOnly}
                      value={form.code}
                      onChange={(e) => setField("code", e.target.value.toLocaleUpperCase())}
                    />
                  </label>
                  <label>
                    Document type
                    <select
                      disabled={readOnly}
                      value={form.documentType}
                      onChange={(e) => {
                        const value = e.target.value as PermitTemplateFormValues["documentType"];
                        setField("documentType", value);
                        if (value === "Closure Certificate") {
                          setField("purpose", "Closure");
                          setField("numberingPattern", "MATNOG-CC-{YYYY}-{#####}");
                        }
                      }}
                    >
                      <option>Business Permit</option>
                      <option>Closure Certificate</option>
                    </select>
                  </label>
                  <label>
                    Purpose
                    <select
                      disabled={readOnly}
                      value={form.purpose}
                      onChange={(e) => setField("purpose", e.target.value as PermitTemplateFormValues["purpose"])}
                    >
                      {form.documentType === "Closure Certificate" ? (
                        <option>Closure</option>
                      ) : (
                        <>
                          <option>Standard</option>
                          <option>Conditional</option>
                          <option>Amendment</option>
                        </>
                      )}
                    </select>
                  </label>
                  <label>
                    Fiscal year
                    <input
                      disabled={readOnly}
                      value={form.fiscalYear}
                      onChange={(e) => setField("fiscalYear", e.target.value)}
                    />
                  </label>
                  <label>
                    Version
                    <input
                      disabled={readOnly}
                      type="number"
                      min="1"
                      value={form.version}
                      onChange={(e) => setField("version", Number(e.target.value))}
                    />
                  </label>
                </div>
              </div>
              <div className={styles.formSection}>
                <h3>Layout &amp; numbering</h3>
                <div className={styles.fieldGrid}>
                  <label>
                    Page size
                    <select
                      disabled={readOnly}
                      value={form.pageSize}
                      onChange={(e) => setField("pageSize", e.target.value as PermitTemplateFormValues["pageSize"])}
                    >
                      <option>A4</option>
                      <option>Legal</option>
                    </select>
                  </label>
                  <label>
                    Orientation
                    <select
                      disabled={readOnly}
                      value={form.orientation}
                      onChange={(e) =>
                        setField("orientation", e.target.value as PermitTemplateFormValues["orientation"])
                      }
                    >
                      <option>Portrait</option>
                      <option>Landscape</option>
                    </select>
                  </label>
                  <label className={styles.wideField}>
                    Numbering pattern
                    <input
                      disabled={readOnly}
                      value={form.numberingPattern}
                      onChange={(e) => setField("numberingPattern", e.target.value)}
                    />
                  </label>
                  <label className={styles.wideField}>
                    Validity rule
                    <input
                      disabled={readOnly}
                      value={form.validityRule}
                      onChange={(e) => setField("validityRule", e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <div className={styles.formSection}>
                <h3>Signature &amp; verification</h3>
                <div className={styles.fieldGrid}>
                  <label>
                    Authorized signatory
                    <input
                      disabled={readOnly}
                      value={form.signatoryName}
                      onChange={(e) => setField("signatoryName", e.target.value)}
                    />
                  </label>
                  <label>
                    Signatory title
                    <input
                      disabled={readOnly}
                      value={form.signatoryTitle}
                      onChange={(e) => setField("signatoryTitle", e.target.value)}
                    />
                  </label>
                  <label>
                    Signature provider
                    <select
                      disabled={readOnly}
                      value={form.signatureProvider}
                      onChange={(e) => setField("signatureProvider", e.target.value)}
                    >
                      {providers.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    QR placement
                    <select
                      disabled={readOnly}
                      value={form.qrPlacement}
                      onChange={(e) =>
                        setField("qrPlacement", e.target.value as PermitTemplateFormValues["qrPlacement"])
                      }
                    >
                      <option>Bottom right</option>
                      <option>Bottom left</option>
                      <option>Footer center</option>
                    </select>
                  </label>
                  <label className={styles.wideField}>
                    Public verification label
                    <input
                      disabled={readOnly}
                      value={form.verificationLabel}
                      onChange={(e) => setField("verificationLabel", e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <div className={styles.formSection}>
                <h3>Conditions &amp; governance</h3>
                <div className={styles.fieldGrid}>
                  <label className={styles.wideField}>
                    Default document conditions
                    <textarea
                      disabled={readOnly}
                      value={form.defaultConditions}
                      onChange={(e) => setField("defaultConditions", e.target.value)}
                    />
                  </label>
                  <label>
                    Next review date
                    <input
                      disabled={readOnly}
                      type="date"
                      value={form.reviewDate}
                      onChange={(e) => setField("reviewDate", e.target.value)}
                    />
                  </label>
                  <label className={styles.wideField}>
                    Internal change notes
                    <textarea
                      disabled={readOnly}
                      value={form.changeNotes}
                      onChange={(e) => setField("changeNotes", e.target.value)}
                    />
                  </label>
                </div>
              </div>
              {error ? <p className={styles.formError}>{error}</p> : null}
              {notice ? <p className={styles.formNotice}>{notice}</p> : null}
              <div className={styles.editorActions}>
                {readOnly && selected?.status === "Active" ? (
                  <button className={styles.secondaryButton} type="button" onClick={() => newVersion(selected)}>
                    <CopyPlus size={14} /> Create draft version
                  </button>
                ) : null}
                {!readOnly ? (
                  <button className={styles.primaryButton} type="submit">
                    <Save size={14} /> Save draft
                  </button>
                ) : null}
                {selected?.status === "Draft" ? (
                  <button className={styles.publishButton} type="button" onClick={() => publish(selected, form)}>
                    <Send size={14} /> Publish version
                  </button>
                ) : null}
                {selected && selected.status !== "Archived" ? (
                  <button className={styles.archiveButton} type="button" onClick={() => archive(selected)}>
                    <Archive size={14} /> Archive
                  </button>
                ) : null}
              </div>
              {selected ? (
                <div className={styles.audit}>
                  <h3>Version activity</h3>
                  {selected.events.toReversed().map((event) => (
                    <article key={event.id}>
                      <span>
                        <strong>{event.action}</strong>
                        <small>{event.detail}</small>
                      </span>
                      <span>
                        <strong>{event.actor}</strong>
                        <small>{event.occurredAt}</small>
                      </span>
                    </article>
                  ))}
                </div>
              ) : null}
            </form>
            <TemplatePreview values={form} status={selected?.status ?? "Draft"} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
