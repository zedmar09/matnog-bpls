import type {
  PermitTemplateFilters,
  PermitTemplateFormValues,
  PermitTemplateRecord,
  PermitTemplateSortKey,
} from "../types/permit-template";

export const PERMIT_TEMPLATE_STORAGE_KEY = "matnog-bpls-permit-templates-v2";
export const PERMIT_TEMPLATE_ACTOR = "Maricel A. Gacosta";
export const PERMIT_TEMPLATE_REFERENCE_DATE = "2026-09-23";

export const EMPTY_PERMIT_TEMPLATE_FILTERS: PermitTemplateFilters = {
  search: "",
  documentType: "",
  status: "",
  fiscalYear: "",
  signatureProvider: "",
  reviewState: "",
};

export function createDefaultPermitTemplateForm(): PermitTemplateFormValues {
  return {
    code: "TPL-BP-STD-2027-V1",
    name: "New Business Permit Template",
    documentType: "Business Permit",
    purpose: "Standard",
    fiscalYear: "2027",
    version: 1,
    pageSize: "A4",
    orientation: "Portrait",
    numberingPattern: "MATNOG-BP-{YYYY}-{#####}",
    validityRule: "Through December 31 of fiscal year",
    defaultConditions: "Subject to continued compliance with applicable municipal and national regulations.",
    signatoryName: "Hon. Roberto P. Hababag",
    signatoryTitle: "Municipal Mayor",
    signatureProvider: "DocuSign · Pending connection",
    qrPlacement: "Bottom right",
    verificationLabel: "Scan to verify this document in the Matnog BPLS registry",
    reviewDate: "2026-10-15",
    changeNotes: "Initial draft prepared for configuration review.",
  };
}

export function templateToForm(record: PermitTemplateRecord): PermitTemplateFormValues {
  const {
    id: _id,
    status: _status,
    usageCount: _usageCount,
    lastUsedAt: _lastUsedAt,
    publishedAt: _publishedAt,
    publishedBy: _publishedBy,
    updatedAt: _updatedAt,
    events: _events,
    ...form
  } = record;
  return form;
}

export function validatePermitTemplateForm(values: PermitTemplateFormValues) {
  if (values.name.trim().length < 5) return "Enter a descriptive template name.";
  if (!/^TPL-(BP|CC)-[A-Z]{3}-\d{4}-V\d+$/.test(values.code.trim()))
    return "Use template code format TPL-BP-STD-YYYY-V# or TPL-CC-CLS-YYYY-V#.";
  if (values.documentType === "Closure Certificate" && values.purpose !== "Closure")
    return "Closure certificates must use the Closure purpose.";
  if (values.documentType === "Business Permit" && values.purpose === "Closure")
    return "Business permits cannot use the Closure purpose.";
  if (!values.numberingPattern.includes("{YYYY}") || !values.numberingPattern.includes("{#####}"))
    return "Numbering pattern must include {YYYY} and {#####}.";
  if (values.defaultConditions.trim().length < 20) return "Enter default conditions of at least 20 characters.";
  if (!values.signatoryName.trim() || !values.signatoryTitle.trim()) return "Enter the authorized signatory and title.";
  if (!values.reviewDate) return "Select the next review date.";
  if (values.changeNotes.trim().length < 10) return "Enter change notes of at least 10 characters.";
  return "";
}

export function savePermitTemplateDraft(
  records: readonly PermitTemplateRecord[],
  values: PermitTemplateFormValues,
  existingId?: string,
  occurredAt = "2026-09-23 17:45",
) {
  const existing = records.find((record) => record.id === existingId);
  if (existing && existing.status !== "Draft")
    throw new Error("Published templates are immutable. Create a draft version first.");
  const duplicateCode = records.some((record) => record.code === values.code.trim() && record.id !== existingId);
  if (duplicateCode) throw new Error("Template code must be unique.");
  const id =
    existing?.id ??
    `PT-${String(Math.max(0, ...records.map((record) => Number(record.id.slice(3)))) + 1).padStart(4, "0")}`;
  const event = {
    id: `PTE-${id.slice(3)}-${String((existing?.events.length ?? 0) + 1).padStart(2, "0")}`,
    action: "Draft saved" as const,
    detail: values.changeNotes.trim(),
    actor: PERMIT_TEMPLATE_ACTOR,
    occurredAt,
  };
  const record: PermitTemplateRecord = {
    ...values,
    id,
    code: values.code.trim(),
    name: values.name.trim(),
    status: "Draft",
    usageCount: existing?.usageCount ?? 0,
    lastUsedAt: existing?.lastUsedAt ?? "",
    publishedAt: existing?.publishedAt ?? "",
    publishedBy: existing?.publishedBy ?? "",
    updatedAt: occurredAt,
    events: [...(existing?.events ?? []), event],
  };
  return existing ? records.map((item) => (item.id === existing.id ? record : item)) : [record, ...records];
}

export function createPermitTemplateDraftVersion(
  records: readonly PermitTemplateRecord[],
  sourceId: string,
  occurredAt = "2026-09-23 17:45",
) {
  const source = records.find((record) => record.id === sourceId);
  if (!source) throw new Error("Template not found.");
  const nextVersion =
    Math.max(
      ...records
        .filter((record) => record.documentType === source.documentType && record.purpose === source.purpose)
        .map((record) => record.version),
      source.version,
    ) + 1;
  const form = templateToForm(source);
  const code = form.code.replace(/V\d+$/, `V${nextVersion}`).replace(/\d{4}(?=-V\d+$)/, "2027");
  return savePermitTemplateDraft(
    records,
    {
      ...form,
      code,
      fiscalYear: "2027",
      version: nextVersion,
      name: `${source.name.replace(/\s\d{4}$/, "")} 2027`,
      reviewDate: "2026-10-15",
      changeNotes: `Draft version ${nextVersion} created from ${source.code}.`,
    },
    undefined,
    occurredAt,
  );
}

export function publishPermitTemplate(
  records: readonly PermitTemplateRecord[],
  id: string,
  occurredAt = "2026-09-23 17:50",
) {
  const target = records.find((record) => record.id === id);
  if (target?.status !== "Draft") throw new Error("Only draft templates can be published.");
  return records.map((record) => {
    if (record.id === id)
      return {
        ...record,
        status: "Active" as const,
        publishedAt: occurredAt,
        publishedBy: PERMIT_TEMPLATE_ACTOR,
        updatedAt: occurredAt,
        events: [
          ...record.events,
          {
            id: `PTE-${record.id.slice(3)}-${String(record.events.length + 1).padStart(2, "0")}`,
            action: "Published" as const,
            detail: `Version ${record.version} activated for ${record.documentType} · ${record.purpose}.`,
            actor: PERMIT_TEMPLATE_ACTOR,
            occurredAt,
          },
        ],
      };
    if (record.status === "Active" && record.documentType === target.documentType && record.purpose === target.purpose)
      return {
        ...record,
        status: "Archived" as const,
        updatedAt: occurredAt,
        events: [
          ...record.events,
          {
            id: `PTE-${record.id.slice(3)}-${String(record.events.length + 1).padStart(2, "0")}`,
            action: "Archived" as const,
            detail: `Automatically retired when ${target.code} was published.`,
            actor: PERMIT_TEMPLATE_ACTOR,
            occurredAt,
          },
        ],
      };
    return record;
  });
}

export function archivePermitTemplate(
  records: readonly PermitTemplateRecord[],
  id: string,
  occurredAt = "2026-09-23 17:50",
) {
  return records.map((record) =>
    record.id === id
      ? {
          ...record,
          status: "Archived" as const,
          updatedAt: occurredAt,
          events: [
            ...record.events,
            {
              id: `PTE-${record.id.slice(3)}-${String(record.events.length + 1).padStart(2, "0")}`,
              action: "Archived" as const,
              detail: "Template removed from controlled generation use.",
              actor: PERMIT_TEMPLATE_ACTOR,
              occurredAt,
            },
          ],
        }
      : record,
  );
}

export function filterPermitTemplates(records: readonly PermitTemplateRecord[], filters: PermitTemplateFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    if (
      query &&
      ![record.name, record.code, record.signatoryName, record.numberingPattern]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    )
      return false;
    if (filters.documentType && record.documentType !== filters.documentType) return false;
    if (filters.status && record.status !== filters.status) return false;
    if (filters.fiscalYear && record.fiscalYear !== filters.fiscalYear) return false;
    if (filters.signatureProvider && record.signatureProvider !== filters.signatureProvider) return false;
    const due = record.reviewDate <= PERMIT_TEMPLATE_REFERENCE_DATE;
    if (filters.reviewState === "Due" && !due) return false;
    if (filters.reviewState === "Scheduled" && due) return false;
    return true;
  });
}

export function sortPermitTemplates(
  records: readonly PermitTemplateRecord[],
  key: PermitTemplateSortKey,
  direction: "asc" | "desc",
) {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...records].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    if (typeof left === "number" && typeof right === "number") return (left - right) * multiplier;
    return String(left).localeCompare(String(right)) * multiplier;
  });
}

export function summarizePermitTemplates(records: readonly PermitTemplateRecord[]) {
  return {
    total: records.length,
    active: records.filter((record) => record.status === "Active").length,
    draft: records.filter((record) => record.status === "Draft").length,
    archived: records.filter((record) => record.status === "Archived").length,
    due: records.filter((record) => record.status !== "Archived" && record.reviewDate <= PERMIT_TEMPLATE_REFERENCE_DATE)
      .length,
    usage: records.reduce((sum, record) => sum + record.usageCount, 0),
  };
}
