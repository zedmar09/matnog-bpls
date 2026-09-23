"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { BadgeCheck, Ban, CalendarClock, FileQuestion, LockKeyhole, Search, ShieldAlert } from "lucide-react";

import { certificateRepository } from "@/features/barangay-certifications/services/certificate-repository";
import { DocumentVerificationWireframeView } from "@/features/barangay-certifications/views/document-verification-wireframe-view";

import styles from "../components/public-permit-verification.module.css";
import { MATNOG_APPLICATION_DIRECTORY } from "../data/matnog-application-directory";
import { MATNOG_PERMIT_REGISTRY } from "../data/matnog-permit-registry";
import type { PermitDocumentOverride, PermitReleaseOverride } from "../types/application-detail";
import type { ApplicationDirectoryRecord } from "../types/application-directory";
import type { PublicPermitVerificationRecord } from "../types/permit-registry";
import { PERMIT_DOCUMENT_STORAGE_KEY, PERMIT_RELEASE_STORAGE_KEY } from "../utils/application-detail-utils";
import { mergeApplicationRecords, SAVED_APPLICATIONS_STORAGE_KEY } from "../utils/application-wizard-utils";
import { mergePermitRegistryRecords, resolvePublicPermitVerification } from "../utils/permit-registry-utils";

function formatDate(value: string) {
  if (!value) return "Not applicable";
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(value.replace(" ", "T")),
  );
}

function resultPresentation(record: PublicPermitVerificationRecord) {
  switch (record.verificationState) {
    case "Verified":
      return {
        title: "Official document verified",
        description: "This record matches an issued document in the Municipality of Matnog permit registry.",
        tone: "success",
        icon: BadgeCheck,
      };
    case "Expiring soon":
      return {
        title: "Verified · Expiring soon",
        description: "This permit is authentic and remains recorded, but its validity period is nearing its end.",
        tone: "warning",
        icon: CalendarClock,
      };
    case "Expired":
      return {
        title: "Document expired",
        description: "This is an authentic registry record, but the permit is outside its validity period.",
        tone: "warning",
        icon: CalendarClock,
      };
    case "Suspended":
      return {
        title: "Permit suspended",
        description:
          "This document exists in the registry but is not currently authorized for active business operation.",
        tone: "danger",
        icon: ShieldAlert,
      };
    case "Revoked":
      return {
        title: "Permit revoked",
        description: "This document was revoked by the issuing authority and must not be treated as valid.",
        tone: "danger",
        icon: Ban,
      };
    default:
      return {
        title: "Verification inactive",
        description:
          "The document record exists, but public verification is not currently active. Contact the BPLO for confirmation.",
        tone: "danger",
        icon: ShieldAlert,
      };
  }
}

function VerificationSearch({ initialToken }: { initialToken: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialToken);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = value.trim();
    if (token) router.push(`/verify/documents/${encodeURIComponent(token)}`);
  };
  return (
    <form className={styles.verificationForm} onSubmit={submit}>
      <label>
        <span className={styles.formLabel}>Verify another QR token</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter the token printed below the QR code"
        />
      </label>
      <button type="submit">
        <Search size={14} /> Verify document
      </button>
    </form>
  );
}

function PublicResult({ record }: { record: PublicPermitVerificationRecord }) {
  const presentation = resultPresentation(record);
  const Icon = presentation.icon;
  const toneClass =
    presentation.tone === "danger" ? styles.toneDanger : presentation.tone === "warning" ? styles.toneWarning : "";
  return (
    <>
      <article className={`${styles.resultCard} ${toneClass}`}>
        <header className={styles.resultHeader}>
          <div className={styles.statusLead}>
            <span className={styles.statusIcon}>
              <Icon size={24} />
            </span>
            <div>
              <h1>{presentation.title}</h1>
              <p>{presentation.description}</p>
            </div>
          </div>
          <span className={styles.statusBadge}>{record.verificationState}</span>
        </header>
        <section className={styles.documentSummary}>
          <p className={styles.eyebrow}>{record.documentType}</p>
          <h2>{record.businessName}</h2>
          <p className={styles.documentNumber}>{record.documentNumber}</p>
        </section>
        <dl className={styles.facts}>
          <div>
            <dt>Document status</dt>
            <dd>{record.documentStatus}</dd>
          </div>
          <div>
            <dt>Barangay</dt>
            <dd>{record.barangay}, Matnog, Sorsogon</dd>
          </div>
          <div>
            <dt>Issue date</dt>
            <dd>{formatDate(record.issueDate)}</dd>
          </div>
          <div>
            <dt>Valid until</dt>
            <dd>{formatDate(record.effectiveUntil)}</dd>
          </div>
          <div>
            <dt>Fiscal period</dt>
            <dd>{record.fiscalPeriod}</dd>
          </div>
          <div>
            <dt>Document version</dt>
            <dd>Version {record.version}</dd>
          </div>
          <div>
            <dt>Issuing authority</dt>
            <dd>{record.issuingAuthority}</dd>
          </div>
          <div>
            <dt>Authorized signatory</dt>
            <dd>{record.signatoryTitle}</dd>
          </div>
          <div>
            <dt>Verification token</dt>
            <dd className={styles.token}>{record.qrToken}</dd>
          </div>
          <div>
            <dt>Registry checked</dt>
            <dd>{formatDateTime(record.lastVerifiedAt)}</dd>
          </div>
        </dl>
        <p className={styles.privacyNotice}>
          <LockKeyhole size={16} />
          For privacy and fraud prevention, this public result excludes owner identification, contact details, payment
          records, internal notes, and signature-envelope information.
        </p>
      </article>
      <VerificationSearch initialToken={record.qrToken} />
      <p className={styles.helpText}>
        If the printed document differs from this result, contact the Matnog Business Permits and Licensing Office
        before accepting it.
      </p>
    </>
  );
}

function NotFoundResult({ token }: { token: string }) {
  return (
    <>
      <article className={`${styles.resultCard} ${styles.toneDanger}`}>
        <header className={styles.resultHeader}>
          <div className={styles.statusLead}>
            <span className={styles.statusIcon}>
              <FileQuestion size={24} />
            </span>
            <div>
              <h1>Document not found</h1>
              <p>
                No issued BPLS permit or closure certificate matches this token. Check the characters and try again.
              </p>
            </div>
          </div>
          <span className={styles.statusBadge}>Not verified</span>
        </header>
        <section className={styles.documentSummary}>
          <p className={styles.eyebrow}>Submitted token</p>
          <h2 className={styles.token}>{token}</h2>
          <p className={styles.documentNumber}>No private or application information has been disclosed.</p>
        </section>
      </article>
      <VerificationSearch initialToken={token} />
    </>
  );
}

export function PublicPermitVerificationView({ token }: { token: string }) {
  const seededResult = useMemo(() => resolvePublicPermitVerification(MATNOG_PERMIT_REGISTRY, token), [token]);
  const [result, setResult] = useState<PublicPermitVerificationRecord | undefined>(seededResult);
  const [hydrated, setHydrated] = useState(Boolean(seededResult));

  useEffect(() => {
    try {
      const savedApplications = JSON.parse(
        window.localStorage.getItem(SAVED_APPLICATIONS_STORAGE_KEY) ?? "[]",
      ) as ApplicationDirectoryRecord[];
      const documents = JSON.parse(
        window.localStorage.getItem(PERMIT_DOCUMENT_STORAGE_KEY) ?? "[]",
      ) as PermitDocumentOverride[];
      const releases = JSON.parse(
        window.localStorage.getItem(PERMIT_RELEASE_STORAGE_KEY) ?? "[]",
      ) as PermitReleaseOverride[];
      const applications = mergeApplicationRecords(MATNOG_APPLICATION_DIRECTORY, savedApplications);
      const registry = mergePermitRegistryRecords(MATNOG_PERMIT_REGISTRY, applications, documents, releases);
      setResult(resolvePublicPermitVerification(registry, token));
    } catch {
      setResult(seededResult);
    } finally {
      setHydrated(true);
    }
  }, [seededResult, token]);

  if (!hydrated)
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.loading}>Checking the official Matnog document registry…</div>
        </div>
      </div>
    );
  if (!result && certificateRepository.verify(token).kind === "success")
    return <DocumentVerificationWireframeView token={token} />;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.masthead}>
          <div className={styles.identity}>
            <span className={styles.seal}>M</span>
            <div>
              <strong>Municipality of Matnog</strong>
              <span>Business permit document verification</span>
            </div>
          </div>
          <span className={styles.secureLabel}>
            <LockKeyhole size={13} /> Public registry result
          </span>
        </div>
        {result ? <PublicResult record={result} /> : <NotFoundResult token={decodeURIComponent(token)} />}
      </div>
    </main>
  );
}
