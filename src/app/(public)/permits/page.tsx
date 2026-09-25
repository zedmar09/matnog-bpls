"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Printer,
  Search,
  Send,
  XCircle,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "./permits.module.css";

type PermitRelease = {
  id: string;
  permitNumber: string;
  permitId: string;
  businessName: string;
  tradeName: string;
  owner: string;
  applicationType: "New" | "Renewal" | "Amendment";
  permitType: "Mayor's Permit" | "Business Permit" | "Special Permit";
  dateApproved: string;
  validUntil: string;
  status: "Ready for Release" | "On Hold" | "Released" | "Cancelled";
  assessedAmount: string;
  paidAmount: string;
  remarks: string;
};

const DUMMY: PermitRelease[] = [
  { id: "1", permitNumber: "MP-2025-0001", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", tradeName: "MAR Auto", owner: "Danilo C. Ramos", applicationType: "Renewal", permitType: "Mayor's Permit", dateApproved: "2025-03-28", validUntil: "2025-12-31", status: "Ready for Release", assessedAmount: "₱8,450.00", paidAmount: "₱8,450.00", remarks: "All clearances complete" },
  { id: "2", permitNumber: "MP-2025-0002", permitId: "BP-2025-0005", businessName: "Southern Hardware Supply", tradeName: "Southern Hardware", owner: "Roberto M. Lim", applicationType: "New", permitType: "Mayor's Permit", dateApproved: "2025-03-30", validUntil: "2025-12-31", status: "Ready for Release", assessedAmount: "₱12,300.00", paidAmount: "₱12,300.00", remarks: "" },
  { id: "3", permitNumber: "BP-2025-0001", permitId: "BP-2025-0023", businessName: "RollOn Motorcycle Parts", tradeName: "RollOn Moto", owner: "Dennis L. Padilla", applicationType: "Amendment", permitType: "Business Permit", dateApproved: "2025-04-02", validUntil: "2025-12-31", status: "Ready for Release", assessedAmount: "₱5,200.00", paidAmount: "₱5,200.00", remarks: "Activity amendment — new permit issued" },
  { id: "4", permitNumber: "MP-2025-0003", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", owner: "Ana R. Reyes", applicationType: "Renewal", permitType: "Mayor's Permit", dateApproved: "2025-04-05", validUntil: "2025-12-31", status: "On Hold", assessedAmount: "₱15,800.00", paidAmount: "₱15,800.00", remarks: "Fire clearance still pending" },
  { id: "5", permitNumber: "MP-2025-0004", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", owner: "Dr. Carlos V. Tan", applicationType: "Renewal", permitType: "Mayor's Permit", dateApproved: "2025-04-06", validUntil: "2025-12-31", status: "On Hold", assessedAmount: "₱18,250.00", paidAmount: "₱18,250.00", remarks: "Sanitary clearance pending" },
  { id: "6", permitNumber: "SP-2025-0001", permitId: "BP-2025-0027", businessName: "Casa Matnog Pension House", tradeName: "Casa Matnog Inn", owner: "Felicidad M. Gutierrez", applicationType: "New", permitType: "Special Permit", dateApproved: "2025-04-08", validUntil: "2025-12-31", status: "Ready for Release", assessedAmount: "₱22,500.00", paidAmount: "₱22,500.00", remarks: "Tourism accommodation permit" },
  { id: "7", permitNumber: "MP-2025-0005", permitId: "BP-2025-0009", businessName: "Matnog Rice Trading", tradeName: "MRT Rice", owner: "Lourdes B. Villanueva", applicationType: "Renewal", permitType: "Mayor's Permit", dateApproved: "2025-03-15", validUntil: "2025-12-31", status: "Released", assessedAmount: "₱9,800.00", paidAmount: "₱9,800.00", remarks: "Released on Mar 18" },
  { id: "8", permitNumber: "MP-2025-0006", permitId: "BP-2025-0012", businessName: "Matnog Fishing Supplies", tradeName: "Fisher's Choice", owner: "Ricardo P. Santos", applicationType: "Renewal", permitType: "Mayor's Permit", dateApproved: "2025-03-10", validUntil: "2025-12-31", status: "Released", assessedAmount: "₱7,200.00", paidAmount: "₱7,200.00", remarks: "Released on Mar 12" },
  { id: "9", permitNumber: "BP-2025-0002", permitId: "BP-2025-0014", businessName: "Matnog Water Refilling Station", tradeName: "AquaPure Matnog", owner: "Angelita R. Cruz", applicationType: "New", permitType: "Business Permit", dateApproved: "2025-04-01", validUntil: "2025-12-31", status: "Ready for Release", assessedAmount: "₱6,350.00", paidAmount: "₱6,350.00", remarks: "" },
  { id: "10", permitNumber: "MP-2025-0007", permitId: "BP-2025-0020", businessName: "Matnog Bakery & Snack House", tradeName: "Pan de Matnog", owner: "Carmen S. Diaz", applicationType: "Renewal", permitType: "Mayor's Permit", dateApproved: "2025-03-05", validUntil: "2025-12-31", status: "Released", assessedAmount: "₱5,650.00", paidAmount: "₱5,650.00", remarks: "Released on Mar 8" },
  { id: "11", permitNumber: "MP-2025-0008", permitId: "BP-2025-0002", businessName: "Sorsogon Strait Shipping Co.", tradeName: "SS Shipping", owner: "Fernando A. Mendoza", applicationType: "Renewal", permitType: "Mayor's Permit", dateApproved: "2025-03-18", validUntil: "2025-12-31", status: "Released", assessedAmount: "₱35,000.00", paidAmount: "₱35,000.00", remarks: "Released on Mar 20" },
  { id: "12", permitNumber: "SP-2025-0002", permitId: "BP-2025-0025", businessName: "Matnog Beach Resort", tradeName: "Subic Beach Resort", owner: "Patricia L. Tan", applicationType: "Renewal", permitType: "Special Permit", dateApproved: "2025-04-09", validUntil: "2025-12-31", status: "Ready for Release", assessedAmount: "₱28,750.00", paidAmount: "₱28,750.00", remarks: "Tourism accommodation" },
  { id: "13", permitNumber: "BP-2025-0003", permitId: "BP-2025-0008", businessName: "Pacific Internet Cafe", tradeName: "Pacific Net", owner: "Mark A. Fernandez", applicationType: "New", permitType: "Business Permit", dateApproved: "2025-04-10", validUntil: "2025-12-31", status: "Cancelled", assessedAmount: "₱4,100.00", paidAmount: "₱4,100.00", remarks: "Application returned — incomplete documents" },
];

function statusClass(s: PermitRelease["status"]) {
  if (s === "Ready for Release") return styles.success;
  if (s === "On Hold") return styles.warning;
  if (s === "Released") return styles.info;
  if (s === "Cancelled") return styles.danger;
  return "";
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

type Tab = "all" | "ready" | "onhold" | "released";

const PAGE_SIZE = 10;

export default function ForReleasePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tab, setTab] = useState<Tab>("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = DUMMY;
    if (tab === "ready") list = list.filter((p) => p.status === "Ready for Release");
    else if (tab === "onhold") list = list.filter((p) => p.status === "On Hold");
    else if (tab === "released") list = list.filter((p) => p.status === "Released");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.permitNumber.toLowerCase().includes(q) ||
          p.businessName.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") list = list.filter((p) => p.permitType === typeFilter);
    return list;
  }, [search, typeFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const counts = {
    all: DUMMY.length,
    ready: DUMMY.filter((p) => p.status === "Ready for Release").length,
    onhold: DUMMY.filter((p) => p.status === "On Hold").length,
    released: DUMMY.filter((p) => p.status === "Released").length,
  };

  const previewItem = previewId ? DUMMY.find((p) => p.id === previewId) : null;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Permits for Release</h1>
            <p>Manage approved permits ready for printing and release to business owners.</p>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.btnSecondary} type="button">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.summaryStrip}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><FileText size={14} /> Total Permits</span>
              <span className={styles.summaryValue}>{counts.all}</span>
              <span className={styles.summaryMeta}>All processed permits</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><CheckCircle2 size={14} /> Ready for Release</span>
              <span className={styles.summaryValue}>{counts.ready}</span>
              <span className={styles.summaryMeta}>Approved and paid</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Clock size={14} /> On Hold</span>
              <span className={styles.summaryValue}>{counts.onhold}</span>
              <span className={styles.summaryMeta}>Pending clearance</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Send size={14} /> Released</span>
              <span className={styles.summaryValue}>{counts.released}</span>
              <span className={styles.summaryMeta}>Claimed by owners</span>
            </div>
          </div>

          <div className={styles.tabBar}>
            {([["all", "All"], ["ready", "Ready"], ["onhold", "On Hold"], ["released", "Released"]] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`${styles.tab} ${tab === key ? styles.tabActive : ""}`}
                onClick={() => { setTab(key); setPage(0); }}
              >
                {label}
                <span className={styles.tabCount}>{counts[key]}</span>
              </button>
            ))}
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search by permit number, business, or owner..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>

            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Mayor's Permit">Mayor&apos;s Permit</SelectItem>
                <SelectItem value="Business Permit">Business Permit</SelectItem>
                <SelectItem value="Special Permit">Special Permit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.resultsMeta}>
            Showing <strong>{pageData.length}</strong> of <strong>{filtered.length}</strong> permits
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Permit No.</th>
                  <th>Business</th>
                  <th>Type</th>
                  <th>Permit Type</th>
                  <th>Approved</th>
                  <th>Valid Until</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageData.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.mono}>{p.permitNumber}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <strong>{p.businessName}</strong>
                        <small>{p.owner}</small>
                      </div>
                    </td>
                    <td><span className={styles.badge}>{p.applicationType}</span></td>
                    <td>{p.permitType}</td>
                    <td className={styles.mono}>{formatDate(p.dateApproved)}</td>
                    <td className={styles.mono}>{formatDate(p.validUntil)}</td>
                    <td className={styles.mono}>{p.assessedAmount}</td>
                    <td><span className={`${styles.badge} ${statusClass(p.status)}`}>{p.status}</span></td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.actionBtn}
                          type="button"
                          title="More actions"
                          onClick={() => setOpenActionId(openActionId === p.id ? null : p.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openActionId === p.id && (
                          <div className={styles.actionMenu}>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewId(previewId === p.id ? null : p.id);
                                setOpenActionId(null);
                              }}
                            >
                              <Eye size={14} /> View Details
                            </button>
                            <Link href={`/applications/${p.id}`} onClick={() => setOpenActionId(null)}>
                              <FileText size={14} /> View Application
                            </Link>
                            <button type="button" onClick={() => setOpenActionId(null)}>
                              <Printer size={14} /> Print Permit
                            </button>
                            {p.status === "Ready for Release" && (
                              <>
                                <div className={styles.actionDivider} />
                                <button type="button" className={styles.actionSuccess} onClick={() => setOpenActionId(null)}>
                                  <Send size={14} /> Release Permit
                                </button>
                              </>
                            )}
                            {p.status === "On Hold" && (
                              <>
                                <div className={styles.actionDivider} />
                                <button type="button" className={styles.actionDanger} onClick={() => setOpenActionId(null)}>
                                  <XCircle size={14} /> Cancel
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewItem && (
            <div className={styles.permitPreview}>
              <div className={styles.permitPreviewHeader}>
                <div>
                  <h3>{previewItem.businessName}</h3>
                  <p>{previewItem.permitNumber} &middot; {previewItem.tradeName} &middot; {previewItem.owner}</p>
                </div>
                <div className={styles.permitPreviewActions}>
                  <button className={styles.printBtn} type="button"><Printer size={14} /> Print</button>
                  {previewItem.status === "Ready for Release" && (
                    <button className={styles.releaseBtn} type="button"><Send size={14} /> Release</button>
                  )}
                </div>
              </div>
              <dl className={styles.permitGrid}>
                <div className={styles.permitField}>
                  <dt>Permit Number</dt>
                  <dd>{previewItem.permitNumber}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Application ID</dt>
                  <dd>{previewItem.permitId}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Permit Type</dt>
                  <dd>{previewItem.permitType}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Application Type</dt>
                  <dd>{previewItem.applicationType}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Date Approved</dt>
                  <dd>{formatDate(previewItem.dateApproved)}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Valid Until</dt>
                  <dd>{formatDate(previewItem.validUntil)}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Assessed Amount</dt>
                  <dd>{previewItem.assessedAmount}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Paid Amount</dt>
                  <dd>{previewItem.paidAmount}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Status</dt>
                  <dd><span className={`${styles.badge} ${statusClass(previewItem.status)}`}>{previewItem.status}</span></dd>
                </div>
                {previewItem.remarks && (
                  <div className={styles.permitField}>
                    <dt>Remarks</dt>
                    <dd>{previewItem.remarks}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className={styles.pagination}>
            <span>Page {page + 1} of {totalPages}</span>
            <button className={styles.pageBtn} type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={15} />
            </button>
            <button className={styles.pageBtn} type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
