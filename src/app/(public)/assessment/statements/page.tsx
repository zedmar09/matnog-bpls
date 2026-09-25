"use client";

import { useMemo, useState } from "react";

import {
  Banknote,
  CalendarClock,
  Download,
  FileCheck2,
  Landmark,
  Mail,
  Printer,
  QrCode,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";

import tableStyles from "../../applications/applications.module.css";
import styles from "./statements.module.css";

type FeeLine = {
  code: string;
  name: string;
  basis: string;
  office: string;
  amount: number;
};

type StatementRecord = {
  id: string;
  soaNo: string;
  applicationNo: string;
  businessName: string;
  owner: string;
  tin: string;
  lineOfBusiness: string;
  type: "New" | "Renewal" | "Amendment";
  barangay: string;
  address: string;
  billingDate: string;
  dueDate: string;
  status: "Draft" | "For Payment" | "Sent to Treasury" | "Overdue";
  risk: "Low" | "Medium" | "High";
  assessor: string;
  reviewer: string;
  treasurer: string;
  surcharge: number;
  discount: number;
  documentaryStamp: number;
  fees: FeeLine[];
};

const records: StatementRecord[] = [
  {
    id: "SOA-001",
    soaNo: "SOA-2026-00118",
    applicationNo: "APP-2026-00318",
    businessName: "Matnog Fisheries Corp.",
    owner: "Juan D. Cruz",
    tin: "927-144-088-000",
    lineOfBusiness: "Agriculture & Fishery",
    type: "Renewal",
    barangay: "Poblacion",
    address: "Poblacion, Matnog, Sorsogon 4708",
    billingDate: "Jan 15, 2026",
    dueDate: "Jan 31, 2026",
    status: "For Payment",
    risk: "Medium",
    assessor: "M. Dela Cruz",
    reviewer: "Atty. Lina Ramos",
    treasurer: "Maria Teresa Lim",
    surcharge: 850,
    discount: 500,
    documentaryStamp: 150,
    fees: [
      { code: "BTX-2026", name: "Business Tax", basis: "Gross sales PHP 3,860,000 x 0.55%", office: "Treasurer", amount: 21230 },
      { code: "MPF-2026", name: "Mayor's Permit Fee", basis: "Annual renewal permit base fee", office: "Mayor's Office", amount: 2000 },
      { code: "SAN-2026", name: "Sanitary Permit Fee", basis: "24 employees + fishery handling classification", office: "Health Office", amount: 1430 },
      { code: "ZON-2026", name: "Zoning Clearance Fee", basis: "310 sq.m. declared establishment area", office: "Zoning", amount: 1540 },
      { code: "FIR-2026", name: "Fire Inspection Fee", basis: "Medium risk profile inspection charge", office: "BFP", amount: 1650 },
      { code: "ENV-2026", name: "Garbage / Environmental Fee", basis: "Poblacion collection class", office: "MENRO", amount: 900 },
      { code: "REG-2026", name: "Regulatory Fee", basis: "LGU regulatory charge", office: "BPLO", amount: 1200 },
      { code: "SIG-2026", name: "Signboard / Sticker Fee", basis: "Annual business sticker and signage", office: "BPLO", amount: 350 },
      { code: "OCC-2026", name: "Occupational Permit Fee", basis: "24 employees x PHP 120", office: "BPLO", amount: 2880 },
    ],
  },
  {
    id: "SOA-002",
    soaNo: "SOA-2026-00119",
    applicationNo: "APP-2026-00320",
    businessName: "Matnog Pharmacy Inc.",
    owner: "Dr. Carlos V. Tan",
    tin: "104-772-610-000",
    lineOfBusiness: "Pharmaceutical",
    type: "Renewal",
    barangay: "Poblacion",
    address: "Rizal Street, Poblacion, Matnog, Sorsogon",
    billingDate: "Jan 16, 2026",
    dueDate: "Jan 30, 2026",
    status: "Sent to Treasury",
    risk: "High",
    assessor: "M. Dela Cruz",
    reviewer: "Atty. Lina Ramos",
    treasurer: "Maria Teresa Lim",
    surcharge: 1200,
    discount: 0,
    documentaryStamp: 150,
    fees: [
      { code: "BTX-2026", name: "Business Tax", basis: "Gross sales PHP 3,715,000 x 0.80%", office: "Treasurer", amount: 29720 },
      { code: "MPF-2026", name: "Mayor's Permit Fee", basis: "Annual renewal permit base fee", office: "Mayor's Office", amount: 2000 },
      { code: "SAN-2026", name: "Sanitary Permit Fee", basis: "9 employees + regulated goods handling", office: "Health Office", amount: 1255 },
      { code: "FIR-2026", name: "Fire Inspection Fee", basis: "High risk profile inspection charge", office: "BFP", amount: 2400 },
      { code: "REG-2026", name: "Regulatory Fee", basis: "LGU regulatory charge", office: "BPLO", amount: 1200 },
    ],
  },
  {
    id: "SOA-003",
    soaNo: "SOA-2026-00120",
    applicationNo: "APP-2026-00322",
    businessName: "Bicol Eatery & Catering",
    owner: "Lorna T. Mendoza",
    tin: "448-298-110-000",
    lineOfBusiness: "Food Service",
    type: "Renewal",
    barangay: "Calayuan",
    address: "Calayuan Road, Matnog, Sorsogon",
    billingDate: "Jan 16, 2026",
    dueDate: "Feb 02, 2026",
    status: "Draft",
    risk: "Medium",
    assessor: "A. Reyes",
    reviewer: "Atty. Lina Ramos",
    treasurer: "Maria Teresa Lim",
    surcharge: 0,
    discount: 250,
    documentaryStamp: 150,
    fees: [
      { code: "BTX-2026", name: "Business Tax", basis: "Gross sales PHP 730,000 x 0.65%", office: "Treasurer", amount: 4745 },
      { code: "MPF-2026", name: "Mayor's Permit Fee", basis: "Annual renewal permit base fee", office: "Mayor's Office", amount: 2000 },
      { code: "SAN-2026", name: "Sanitary Permit Fee", basis: "Food service classification", office: "Health Office", amount: 1375 },
      { code: "ENV-2026", name: "Garbage / Environmental Fee", basis: "Barangay collection class", office: "MENRO", amount: 650 },
      { code: "OCC-2026", name: "Occupational Permit Fee", basis: "5 employees x PHP 120", office: "BPLO", amount: 600 },
    ],
  },
  {
    id: "SOA-004",
    soaNo: "SOA-2026-00121",
    applicationNo: "APP-2026-00326",
    businessName: "Casa Matnog Pension House",
    owner: "Felicidad M. Gutierrez",
    tin: "812-441-509-000",
    lineOfBusiness: "Accommodation",
    type: "Renewal",
    barangay: "Poblacion",
    address: "Maharlika Highway, Matnog, Sorsogon",
    billingDate: "Jan 17, 2026",
    dueDate: "Jan 28, 2026",
    status: "Overdue",
    risk: "High",
    assessor: "J. Rivera",
    reviewer: "Atty. Lina Ramos",
    treasurer: "Maria Teresa Lim",
    surcharge: 2100,
    discount: 0,
    documentaryStamp: 150,
    fees: [
      { code: "BTX-2026", name: "Business Tax", basis: "Gross sales PHP 6,380,000 x 0.90%", office: "Treasurer", amount: 57420 },
      { code: "MPF-2026", name: "Mayor's Permit Fee", basis: "Annual renewal permit base fee", office: "Mayor's Office", amount: 2000 },
      { code: "ZON-2026", name: "Zoning Clearance Fee", basis: "420 sq.m. declared establishment area", office: "Zoning", amount: 1980 },
      { code: "FIR-2026", name: "Fire Inspection Fee", basis: "High risk profile inspection charge", office: "BFP", amount: 2400 },
      { code: "OCC-2026", name: "Occupational Permit Fee", basis: "22 employees x PHP 120", office: "BPLO", amount: 2640 },
    ],
  },
  {
    id: "SOA-005",
    soaNo: "SOA-2026-00122",
    applicationNo: "APP-2026-00321",
    businessName: "Southern Hardware Supply",
    owner: "Roberto M. Lim",
    tin: "671-700-331-000",
    lineOfBusiness: "Retail Trade",
    type: "New",
    barangay: "Sta. Elena",
    address: "Sta. Elena, Matnog, Sorsogon",
    billingDate: "Jan 18, 2026",
    dueDate: "Feb 05, 2026",
    status: "For Payment",
    risk: "Medium",
    assessor: "J. Rivera",
    reviewer: "Atty. Lina Ramos",
    treasurer: "Maria Teresa Lim",
    surcharge: 0,
    discount: 0,
    documentaryStamp: 150,
    fees: [
      { code: "BTX-2026", name: "Business Tax", basis: "Capital PHP 2,140,000 x 0.55%", office: "Treasurer", amount: 11770 },
      { code: "MPF-2026", name: "Mayor's Permit Fee", basis: "New business permit base fee", office: "Mayor's Office", amount: 2500 },
      { code: "ZON-2026", name: "Zoning Clearance Fee", basis: "190 sq.m. declared establishment area", office: "Zoning", amount: 1060 },
      { code: "FIR-2026", name: "Fire Inspection Fee", basis: "Medium risk profile inspection charge", office: "BFP", amount: 1650 },
      { code: "REG-2026", name: "Regulatory Fee", basis: "LGU regulatory charge", office: "BPLO", amount: 1200 },
    ],
  },
];

function currency(value: number) {
  return "PHP " + value.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function statusClass(status: StatementRecord["status"]) {
  if (status === "For Payment" || status === "Sent to Treasury") return tableStyles.success;
  if (status === "Overdue") return tableStyles.danger;
  return tableStyles.info;
}

function totalFor(record: StatementRecord) {
  const subtotal = record.fees.reduce((sum, fee) => sum + fee.amount, 0);
  return subtotal + record.surcharge + record.documentaryStamp - record.discount;
}

export default function StatementOfAccountPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return records;
    return records.filter((record) => (
      record.businessName.toLowerCase().includes(search)
      || record.owner.toLowerCase().includes(search)
      || record.soaNo.toLowerCase().includes(search)
      || record.applicationNo.toLowerCase().includes(search)
      || record.barangay.toLowerCase().includes(search)
    ));
  }, [query]);

  const selected = records.find((record) => record.id === selectedId) ?? null;
  const subtotal = selected?.fees.reduce((sum, fee) => sum + fee.amount, 0) ?? 0;
  const grandTotal = selected ? totalFor(selected) : 0;

  return (
    <div className={tableStyles.page}>
      <div className={tableStyles.hero}>
        <div className={tableStyles.heroInner}>
          <div>
            <h1>Statements of Account</h1>
            <p>Select a business first, then review the payable SOA in a darker, easier-to-read detail workspace.</p>
          </div>
          <div className={tableStyles.heroActions}>
            <button className={tableStyles.btnPrimary} disabled={!selected} type="button"><Printer size={15} /> Print SOA</button>
            <button className={tableStyles.btnSecondary} disabled={!selected} type="button"><Download size={15} /> Download PDF</button>
          </div>
        </div>
      </div>

      <div className={tableStyles.body}>
        <div className={styles.workspace}>
          <section className={styles.selectorCard}>
            <div className={styles.selectorHeader}>
              <div>
                <h2>Business SOA Queue</h2>
                <p>{filtered.length} billing records with dummy assessment data.</p>
              </div>
              <ReceiptText size={17} />
            </div>
            <div className={styles.searchBar}>
              <Search size={15} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business, owner, SOA, application..." />
            </div>
            <div className={styles.businessList}>
              {filtered.map((record) => (
                <button
                  className={`${styles.businessCard} ${record.id === selected?.id ? styles.businessCardActive : ""}`}
                  key={record.id}
                  type="button"
                  onClick={() => setSelectedId(record.id)}
                >
                  <span className={styles.thumbnail}>{initials(record.businessName)}</span>
                  <span className={styles.businessInfo}>
                    <strong>{record.businessName}</strong>
                    <small>{record.owner} | {record.barangay}</small>
                    <span>{record.soaNo} • {record.applicationNo}</span>
                  </span>
                  <span className={styles.cardAmount}>
                    <strong>{currency(totalFor(record))}</strong>
                    <em className={`${tableStyles.badge} ${statusClass(record.status)}`}>{record.status}</em>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.detailPanel}>
            {!selected ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><ReceiptText size={34} /></div>
                <h2>Select a business to view SOA</h2>
                <p>Choose a billing record from the left queue. The statement details, fees, controls, and activity trail will appear here.</p>
                <div className={styles.emptyPreview}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : (
              <>
                <div className={styles.darkHeader}>
                  <div className={styles.sealBlock}>
                    <div className={styles.seal}>LGU</div>
                    <div>
                      <span className={styles.kicker}>Municipality of Matnog, Sorsogon</span>
                      <h2>Statement of Account</h2>
                      <p>Business Permits and Licensing Office • {selected.lineOfBusiness} • {selected.type}</p>
                    </div>
                  </div>
                  <div className={styles.soaNumber}>
                    <span>SOA Number</span>
                    <strong>{selected.soaNo}</strong>
                  </div>
                </div>

                <div className={styles.darkBody}>
                  <div className={styles.summaryStrip}>
                    <article>
                      <span>Business</span>
                      <strong>{selected.businessName}</strong>
                      <small>{selected.address}</small>
                    </article>
                    <article>
                      <span>Owner / Taxpayer</span>
                      <strong>{selected.owner}</strong>
                      <small>TIN {selected.tin}</small>
                    </article>
                    <article>
                      <span>Total Due</span>
                      <strong>{currency(grandTotal)}</strong>
                      <small>Due {selected.dueDate}</small>
                    </article>
                    <article>
                      <span>Status</span>
                      <strong>{selected.status}</strong>
                      <small>{selected.risk} risk profile</small>
                    </article>
                  </div>

                  <div className={styles.contentGrid}>
                    <div className={styles.documentCard}>
                      <div className={styles.sectionTitle}>
                        <div>
                          <h3>
                            <span>Assessed Fees</span>
                            <span>and Charges</span>
                          </h3>
                          <p>Dummy ordinance computation for UI review. Final values require LGU ordinance validation.</p>
                        </div>
                        <span className={`${tableStyles.badge} ${statusClass(selected.status)}`}>{selected.status}</span>
                      </div>
                      <div className={styles.tableWrap}>
                        <table className={styles.feeTable}>
                          <thead>
                            <tr>
                              <th>Code</th>
                              <th>Fee Description</th>
                              <th>Office</th>
                              <th className={styles.money}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.fees.map((fee) => (
                              <tr key={fee.code}>
                                <td>{fee.code}</td>
                                <td>
                                  <span className={styles.feeName}>
                                    <strong>{fee.name}</strong>
                                    <span>{fee.basis}</span>
                                  </span>
                                </td>
                                <td>{fee.office}</td>
                                <td className={styles.money}>{currency(fee.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className={styles.totalsPanel}>
                        <div className={styles.totalRow}><span>Computed subtotal</span><strong>{currency(subtotal)}</strong></div>
                        <div className={styles.totalRow}><span>Documentary stamp / form fee</span><strong>{currency(selected.documentaryStamp)}</strong></div>
                        <div className={styles.totalRow}><span>Surcharge / penalty</span><strong>{currency(selected.surcharge)}</strong></div>
                        <div className={styles.totalRow}><span>Discount / waiver</span><strong>-{currency(selected.discount)}</strong></div>
                        <div className={styles.grandTotal}>
                          <span>Total Amount Due</span>
                          <strong>{currency(grandTotal)}</strong>
                        </div>
                      </div>
                    </div>

                    <aside className={styles.controlPanel}>
                      <div className={styles.statusCard}>
                        <span>Total Due</span>
                        <strong>{currency(grandTotal)}</strong>
                        <small>{selected.status} • Valid until {selected.dueDate}</small>
                      </div>
                      <div className={styles.actionStack}>
                        <button className={tableStyles.btnPrimary} type="button"><Send size={14} /> Send to Treasury</button>
                        <button className={tableStyles.secondaryButton} type="button"><Mail size={14} /> Email to Taxpayer</button>
                        <button className={tableStyles.secondaryButton} type="button"><FileCheck2 size={14} /> Mark Ready for Payment</button>
                        <button className={tableStyles.secondaryButton} type="button"><CalendarClock size={14} /> Set Due Date</button>
                      </div>
                      <article className={styles.noticeBox}>
                        <Landmark size={18} />
                        <strong>Municipal Treasury Counter</strong>
                        <span>Present this SOA number and application reference at the Treasury cashier.</span>
                      </article>
                      <article className={styles.noticeBox}>
                        <Banknote size={18} />
                        <strong>Online Payment Channels</strong>
                        <span>GCash, Maya, and bank e-channel references will be generated after gateway setup.</span>
                      </article>
                      <article className={styles.noticeBox}>
                        <QrCode size={18} />
                        <strong>QR Verification</strong>
                        <span>Reserved for official payment validation and final permit release.</span>
                      </article>
                    </aside>
                  </div>

                  <div className={styles.reviewPanel}>
                    <div className={styles.reviewHeader}>
                      <div>
                        <h3>SOA Review Preview</h3>
                        <p>Fast view of who computed, reviewed, and will authorize collection.</p>
                      </div>
                      <ShieldCheck size={18} />
                    </div>
                    <div className={styles.reviewGrid}>
                      <article className={styles.reviewerCard}>
                        <span className={styles.reviewAvatar}>AS</span>
                        <div>
                          <small>Assessor</small>
                          <strong>{selected.assessor}</strong>
                          <span>Computed fees and validated assessment basis</span>
                        </div>
                      </article>
                      <article className={styles.reviewerCard}>
                        <span className={styles.reviewAvatar}>BH</span>
                        <div>
                          <small>BPLO Head</small>
                          <strong>{selected.reviewer}</strong>
                          <span>Reviewed SOA before Treasury handoff</span>
                        </div>
                      </article>
                      <article className={styles.reviewerCard}>
                        <span className={styles.reviewAvatar}>TR</span>
                        <div>
                          <small>Treasurer</small>
                          <strong>{selected.treasurer}</strong>
                          <span>Collection authority for payment posting</span>
                        </div>
                      </article>
                      <article className={styles.noteCard}>
                        <strong>Note</strong>
                        <span>This page is UI-only. Fee formulas must be replaced with verified Matnog ordinance tables before production.</span>
                      </article>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
