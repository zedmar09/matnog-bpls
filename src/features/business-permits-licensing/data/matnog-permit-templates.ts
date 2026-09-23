import type {
  PermitTemplateDocumentType,
  PermitTemplatePurpose,
  PermitTemplateRecord,
  PermitTemplateStatus,
} from "../types/permit-template";

const configurations: readonly [
  string,
  string,
  PermitTemplateDocumentType,
  PermitTemplatePurpose,
  PermitTemplateStatus,
][] = [
  ["TPL-BP-STD-2026-V4", "Unified Business Permit", "Business Permit", "Standard", "Active"],
  ["TPL-BP-CON-2026-V2", "Conditional Business Permit", "Business Permit", "Conditional", "Active"],
  ["TPL-BP-AMD-2026-V2", "Business Permit Amendment", "Business Permit", "Amendment", "Active"],
  ["TPL-CC-CLS-2026-V2", "Business Closure Certificate", "Closure Certificate", "Closure", "Active"],
  ["TPL-BP-STD-2027-V5", "Unified Business Permit 2027", "Business Permit", "Standard", "Draft"],
  ["TPL-BP-CON-2027-V3", "Conditional Business Permit 2027", "Business Permit", "Conditional", "Draft"],
  ["TPL-CC-CLS-2027-V3", "Business Closure Certificate 2027", "Closure Certificate", "Closure", "Draft"],
  ["TPL-BP-STD-2025-V3", "Unified Business Permit 2025", "Business Permit", "Standard", "Archived"],
  ["TPL-BP-CON-2025-V1", "Conditional Business Permit 2025", "Business Permit", "Conditional", "Archived"],
  ["TPL-BP-AMD-2025-V1", "Business Permit Amendment 2025", "Business Permit", "Amendment", "Archived"],
  ["TPL-CC-CLS-2025-V1", "Business Closure Certificate 2025", "Closure Certificate", "Closure", "Archived"],
  ["TPL-BP-STD-2024-V2", "Legacy Mayor’s Business Permit", "Business Permit", "Standard", "Archived"],
];

export const MATNOG_PERMIT_TEMPLATES: readonly PermitTemplateRecord[] = configurations.map(
  ([code, name, documentType, purpose, status], index) => {
    const fiscalYear = code.includes("2027")
      ? "2027"
      : code.includes("2025")
        ? "2025"
        : code.includes("2024")
          ? "2024"
          : "2026";
    const version = Number(code.match(/V(\d+)$/)?.[1] ?? 1);
    const active = status === "Active";
    const draft = status === "Draft";
    const closure = documentType === "Closure Certificate";
    const updatedAt = draft
      ? `2026-09-${18 + (index % 5)} 14:20`
      : active
        ? `2026-01-${10 + index} 09:15`
        : `${fiscalYear}-01-08 10:00`;
    return {
      id: `PT-${String(index + 1).padStart(4, "0")}`,
      code,
      name,
      documentType,
      purpose,
      fiscalYear,
      version,
      status,
      pageSize: index % 4 === 2 ? "Legal" : "A4",
      orientation: index % 4 === 2 ? "Landscape" : "Portrait",
      numberingPattern: closure ? "MATNOG-CC-{YYYY}-{#####}" : "MATNOG-BP-{YYYY}-{#####}",
      validityRule: closure ? "No expiry · closure effective date" : "Through December 31 of fiscal year",
      defaultConditions: closure
        ? "This certificate confirms closure subject to final clearance of outstanding municipal obligations."
        : purpose === "Conditional"
          ? "Valid subject to the conditions stated herein and continued compliance with municipal regulations."
          : "Subject to continued compliance with applicable municipal and national regulations.",
      signatoryName: "Hon. Roberto P. Hababag",
      signatoryTitle: "Municipal Mayor",
      signatureProvider: index % 3 === 1 ? "Manual digital signature" : "DocuSign · Pending connection",
      qrPlacement: index % 3 === 0 ? "Bottom right" : index % 3 === 1 ? "Bottom left" : "Footer center",
      verificationLabel: "Scan to verify this document in the Matnog BPLS registry",
      reviewDate: draft ? "2026-10-15" : index % 4 === 0 ? "2026-09-15" : `${Number(fiscalYear) + 1}-01-15`,
      changeNotes: draft
        ? "Draft prepared for ordinance, signatory, and annual validity review."
        : active
          ? "Published production template approved for controlled document generation."
          : "Retained as an immutable historical template version.",
      usageCount: draft ? 0 : active ? 54 + index * 7 : 18 + index * 4,
      lastUsedAt: draft ? "" : active ? `2026-09-${20 - index} 16:10` : `${fiscalYear}-12-28 15:30`,
      publishedAt: draft ? "" : active ? `2026-01-${10 + index} 09:15` : `${fiscalYear}-01-08 10:00`,
      publishedBy: draft ? "" : "Maricel A. Gacosta",
      updatedAt,
      events: [
        {
          id: `PTE-${String(index + 1).padStart(4, "0")}-01`,
          action: draft ? "Draft saved" : "Published",
          detail: draft ? "Draft configuration saved for review." : "Template version published for controlled use.",
          actor: "Maricel A. Gacosta",
          occurredAt: updatedAt,
        },
      ],
    } satisfies PermitTemplateRecord;
  },
);
