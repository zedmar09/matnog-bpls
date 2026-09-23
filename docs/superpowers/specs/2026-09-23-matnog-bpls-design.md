# Matnog Business Process Licensing System Design

Date: 23 September 2026  
Status: Approved direction; implementation plan pending review  
Target: `WebApp(BPLS)`

## 1. Purpose

Build a standalone, production-oriented Business Process Licensing System (BPLS/eBOSS) for the Municipality of Matnog, Sorsogon. The system will give applicants a digital channel for business transactions and give municipal offices a single traceable workspace for requirements, assessment, payment, review, inspection, approval, permit issuance, compliance, reporting, and mapping.

The initial implementation will reuse the technical and visual foundation in `WebApp-Template-Setup`. Its current Next.js, TypeScript, shadcn, Refine, form, validation, and shared-component conventions are the baseline. UI modernization is a later phase and must not delay establishing correct business records and workflows.

## 2. Delivery approach

The recommended approach is a Matnog-owned standalone application with integration boundaries for eLGU/eBOSS and external agencies. It must not claim an integration until Matnog and the partner confirm access, agreements, data fields, and test credentials.

The product has three connected experiences:

1. A public/business portal for applications, requirements, payments, tracking, corrections, and permits.
2. An LGU operations portal for BPLO, reviewers, inspectors, Treasury, approvers, records personnel, auditors, and administrators.
3. An assisted-service counter for onsite applications and payments using the same records and workflow as online transactions.

The first build is requirements-complete but may use local repositories and fictional sample records until production backend, integrations, and validated Matnog rules are introduced. Every simulated action must be visibly labeled and must not be presented as an official transaction.

## 3. System boundaries

The BPLS owns business and establishment records, permit applications, requirement status, municipal review workflow, Matnog assessments, payment linkage, permit snapshots, compliance status, notifications, reports, and authorized business-map projections.

It does not independently issue DTI, SEC, CDA, BIR, barangay, BFP, or other agency documents. It records or integrates the status of those documents. It also does not replace the municipal general ledger, property tax, building permits, procurement, payroll, tourism, or barangay administration systems.

## 4. Users and access

Public roles are business owner and authorized business representative. Municipal roles are assisted-service encoder, BPLO receiving officer, BPLO evaluator, BPLO supervisor, zoning/planning reviewer, health/sanitary reviewer, engineering reviewer, environmental or sector reviewer, BFP liaison, inspector, assessor, cashier, Treasurer, releasing officer, authorized signatory, Mayor's Office reviewer, records officer, report viewer, internal auditor, Data Protection Officer, system administrator, and integration service account.

Access is role-, office-, assignment-, and record-scoped. Public users see only businesses they own or are authorized to represent. Staff permissions follow least privilege. Assessment, collection, reconciliation, final approval, and system administration are separated. Privileged users require stronger authentication in production. Delegation is temporary, explicit, and auditable.

## 5. Core domain model

The principal records are:

- Organization or legal business entity
- Owner, officer, and authorized representative
- Establishment or branch
- Business activity or line of business
- Permit application and revision
- Requirement definition and submitted document
- Review track, task, decision, and correction request
- Inspection, finding, deficiency, and reinspection
- Ordinance/fee-rule version and assessment line
- Payment attempt, collection, settlement, and official-receipt link
- Permit version, signature status, and verification token
- Notification and delivery attempt
- GIS location and authoritative geographic reference
- Audit event

Organization, establishment, applicant, application, assessment, payment, collection, and permit are separate records with permanent identifiers. A browser redirect or uploaded payment screenshot is not a confirmed collection. A permit version is immutable after signing; corrections create a new version and retain its predecessor.

## 6. Applicant journeys

Supported transaction paths are new registration, annual renewal, amendment, closure/retirement, and controlled re-opening where allowed. Related capabilities include draft saving, staff-assisted encoding, withdrawal, correction and resubmission, permit reprint, legacy-record enrollment, and renewal reminders.

The common journey is:

1. Authenticate or begin an assisted transaction.
2. Select the business, establishment, and transaction type.
3. Enter or confirm ownership, activity, location, operating, and contact details.
4. Upload the requirements selected by the configurable requirements matrix.
5. Certify and submit the application.
6. Complete BPLO completeness validation.
7. Run the applicable office reviews and inspections, in parallel where policy permits.
8. Resolve correction requests without losing the prior submission.
9. Produce an itemized, versioned assessment.
10. Record or receive payment and confirm municipal collection.
11. Complete final eligibility and authorized approval.
12. Sign, issue, release, and archive the permit.
13. Monitor expiry, renewal, and post-issuance compliance.

Applicant tracking exposes a safe timeline and actionable corrections. It excludes internal notes, unrelated office data, restricted documents, and sensitive financial operations.

## 7. Requirements and document management

Requirements are configurable by transaction type, business activity, risk, establishment, and office. Files support approved PDF/image formats, size validation, malware scanning in production, metadata, preview, versions, expiry, acceptance/rejection, replacement, and retention. A still-valid document may be reused when policy permits.

The system maintains document hashes, origin, issue and expiry dates, reviewer decisions, access history, and archival status. Public verification never exposes uploaded requirements. Authorized exports are logged.

## 8. Review and inspection workflow

The workflow engine determines the applicable tracks from published configuration. Potential tracks include BPLO completeness, barangay business-clearance status, zoning/locational review, planning, engineering, health/sanitary, environmental or sector review, BFP/FSIC status, Treasury, final BPLO review, and authorized approval.

Each track supports a work queue, assignment, checklist, safe applicant message, internal note, correction request, decision, reason, service deadline, escalation, and history. Workflow versions are retained. Supervisor overrides require permission, reason, and audit entry and cannot bypass a legally mandatory prerequisite.

Inspections support schedules, assigned inspectors, checklists, findings, attachments, deficiency notices, corrective deadlines, reinspection, and pass/conditional/fail outcomes. GPS and timestamps are evidence aids, not proof by themselves. Offline field operation is a later extension unless Matnog makes it a launch requirement.

## 9. Assessment

The assessment engine applies versioned Matnog Revenue Code and ordinance rules by effective date. It supports capitalization, gross sales, brackets, fixed fees, activity-specific charges, regulatory fees, penalties, interest, discounts, exemptions, installments where permitted, minimums, maximums, and rounding rules.

Every assessment shows its line items and governing rule version. Reassessment preserves the previous result. Manual adjustment requires a reason and, when configured, supervisor approval. Published fee configurations cannot retroactively change posted transactions. A simulation mode allows authorized staff to test a new schedule before publication.

Production formulas depend on LGU-supplied and LGU-approved ordinances, schedules, examples, and interpretations.

## 10. Payment and Treasury controls

Channels include authorized over-the-counter collection, checks or bank deposits where allowed, GCash, Maya, bank e-channels, and LandBank/EGov Pay or another approved BSP-regulated provider.

The design separates assessment, payment attempt, provider acknowledgment, confirmed collection, settlement/deposit, and official receipt. It supports idempotent provider callbacks, pending inquiry, expiry, duplicate detection, under/overpayment, permitted partial payment, reversal, refund, chargeback, cashier closeout, settlement matching, and exception queues.

Reports preserve gross charge, provider fee, and net settlement. Treasury authorizes collection confirmation and reconciliation. Accounting consumes controlled postings or exports; the BPLS does not silently post to an unvalidated ledger.

## 11. Approval, signing, and permit verification

Final issuance checks applicable decisions, compliance, and payment. The permit service controls templates, number sequences, signatories, signature requests, signature callbacks, signed-file preservation, release, print/download, reprint, correction, suspension, revocation, reinstatement, and supersession.

DocuSign is the requested initial signing adapter, subject to procurement, legal approval, and credentials. The internal contract must allow another approved provider.

Each issued permit has a QR verification token. The public verification view reveals only approved fields: permit number, establishment/business name, document type, issuing LGU, issue/expiry dates, validity status, and a safe activity summary. It does not expose owner contact details, residence, requirements, payment history, findings, or internal notes.

## 12. Notifications

In-app, email, and SMS notifications cover submission, corrections, assessment, payment, inspection, decision, issuance, expiry, renewal, and staff escalation. Templates are versioned and may have English and Filipino variants. Delivery attempts, provider references, retries, failures, and deduplication are recorded. Transactional notifications remain distinct from optional announcements.

## 13. GIS

Authorized staff can map establishments, correct coordinates, filter by barangay, activity, status, permit year, and risk, and inspect list/map results together. The module supports clustering, aggregate heatmaps, compliance overlays, inspection planning, missing-coordinate flags, and authorized CSV/GeoJSON exports. Zoning overlays are used only when Matnog provides authoritative layers.

A future public directory may expose approved business information, but not private residences, sensitive facilities, or internal compliance data.

## 14. Reporting

Operational dashboards cover volume, status, office workload, correction rate, processing time, deadline compliance, inspections, and expiring permits or requirements. Financial dashboards cover assessments, collections, channels, settlement, unmatched transactions, adjustments, reversals, and cashier closeout. Statistical reports cover monthly, quarterly, and annual issuance, new versus renewal, business distribution, compliance, and revenue trends.

Reports support date, office, barangay, activity, and status filters; safe drill-down; PDF/CSV/XLSX export; and scheduled generation. Sensitive exports require permission and create an audit event.

## 15. Administration and audit

Administrators manage offices, roles, application types, business classifications, requirements matrices, workflows, checklists, service targets, ordinance versions, permit templates, signatories, numbering, barangays, geographic references, notification templates, retention schedules, and holiday calendars. Integration credentials use production secret storage and never appear in source or audit payloads.

The append-only audit trail records actor, role, office, timestamp, session, record, action, before/after values where appropriate, workflow decisions, assessment version, adjustments, financial events, permit operations, exports, configuration changes, and access changes. Ordinary administrators cannot edit audit history.

## 16. Architecture

The frontend uses Next.js App Router, React, TypeScript, shadcn primitives, Refine for staff resources, TanStack Query, React Hook Form, Zod, and the template's shared component patterns. Routes stay thin; the `business-permits-licensing` feature owns its data contracts, schemas, services, components, and views. Shared cross-module concerns are identity/session, documents, workflow, payments, notifications, reporting, GIS, audit, and configuration.

The production architecture will use authenticated APIs, a transactional relational database, object storage for documents, background jobs for integrations and notifications, an append-only audit facility, monitoring, and separate development/test/production environments. External services sit behind typed adapters with timeout, retry, idempotency, acknowledgment, reconciliation, and manual exception handling.

The first frontend milestone may use deterministic local repositories and sample fixtures, but their interfaces must be replaceable by production APIs. Browser-side role filtering is a demonstration, not a security boundary.

## 17. Error handling and recovery

Every user-facing operation has explicit loading, empty, invalid, denied, conflict, unavailable, and retry states. Form failures preserve entered data. Stale updates return a conflict rather than overwriting a newer record. Replayed payment, signature, and notification events are idempotent. Integration failures enter monitored exception queues rather than silently completing a transaction.

Production operations include encrypted backups, restoration tests, disaster recovery, business continuity, incident handling, and breach response. Proposed targets for LGU approval are 99.5% monthly availability, common-page p95 response within three seconds under agreed load, a recovery point of 24 hours or better, and recovery time of eight hours or better.

## 18. Privacy, security, and accessibility

Before production, Matnog will complete a Privacy Impact Assessment, records and data-sharing reviews, access approvals, retention schedules, and system registration obligations. Controls include encryption in transit and at rest, strong password storage, staff MFA, secure sessions, malware scanning, least privilege, vulnerability management, security testing, centralized monitoring, and no production personal data in development.

The UI is responsive, keyboard accessible, screen-reader compatible, usable on low-bandwidth connections, and never communicates status through color alone. English is the initial language; Filipino copy requires municipal review. Dates use Asia/Manila and amounts use Philippine peso formatting.

## 19. Initial release boundaries

The initial release excludes native mobile apps, full offline field operation, general-ledger replacement, real-property tax, building and occupancy permits, procurement, payroll, biometric identity, predictive risk scoring, independent issuance of partner-agency documents, and automated final approval without an authorized official.

UI refinement, a new visual design system, and advanced motion are explicitly deferred until the foundational journeys and data boundaries are working. Functional screens will still meet responsive and accessibility requirements.

## 20. Validation and acceptance

Each feature requires unit tests for rules and state transitions, integration tests for repositories/APIs and adapters, browser tests for critical journeys, accessibility checks, permission tests, financial idempotency/reconciliation tests, template snapshot tests, and migration reconciliation.

Release acceptance requires:

- All supported transaction paths complete with safe error and correction states.
- No permit issuance without the configured prerequisite decisions and payment state.
- Every assessment reproducible from its preserved rule version.
- Duplicate provider events producing no duplicate collection or permit.
- Public tracking and verification exposing only their approved projections.
- Office roles unable to access unauthorized records or operations.
- Audit history covering consequential actions.
- LGU validation of requirements, workflow, fees, templates, signatories, reports, and migrated data.
- Successful UAT, backup restoration test, security review, accessibility review, training, pilot, and cutover rehearsal.

## 21. Required LGU inputs

Matnog must supply the current Citizen's Charter, Revenue Code and amendments, fee schedules and worked examples, requirements lists, workflow and inspection checklists, service deadlines, permit/assessment templates, numbering and receipt rules, signatories and delegation policy, role matrix, existing system inventory, business master data, sample historical transactions, retention policy, provider decisions, integration agreements, official branding, hosting constraints, and migration sign-off owners.

These inputs are configuration and acceptance dependencies. Where they are absent, the application uses clearly marked fictional values and cannot be treated as production-ready.

## 22. Delivery sequence

1. Copy and normalize the existing template into `WebApp(BPLS)` while preserving its license and architecture conventions.
2. Establish BPLS routes, navigation, domain contracts, fixtures, repositories, roles, and scenario controls.
3. Implement the business registry and applicant transaction journeys.
4. Add requirements, documents, reviews, corrections, and inspections.
5. Add assessment and Treasury/payment lifecycle screens.
6. Add approval, signing states, permit generation, QR verification, and notifications.
7. Add GIS, reports, dashboards, administration, and audit views.
8. Validate types, lint, unit tests, browser journeys, accessibility, and production build.
9. Replace adapters with validated production services, migrate data, run UAT, and pilot before general launch.

