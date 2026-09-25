"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  XCircle,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "../reviews.module.css";

type Clearance = {
  id: string;
  permitId: string;
  businessName: string;
  owner: string;
  department: string;
  reviewer: string;
  dateAssigned: string;
  dateCompleted: string | null;
  status: "Cleared" | "Pending" | "Failed" | "Waived";
  findings: string;
};

const DUMMY: Clearance[] = [
  { id: "1", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", owner: "Ana R. Reyes", department: "BPLO", reviewer: "Maria Santos", dateAssigned: "2025-03-25", dateCompleted: "2025-03-28", status: "Cleared", findings: "All business documents verified" },
  { id: "2", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", owner: "Ana R. Reyes", department: "Fire", reviewer: "Pedro Garcia", dateAssigned: "2025-03-25", dateCompleted: null, status: "Pending", findings: "" },
  { id: "3", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", owner: "Ana R. Reyes", department: "Sanitary", reviewer: "Elena Reyes", dateAssigned: "2025-03-25", dateCompleted: "2025-03-27", status: "Cleared", findings: "Sanitary requirements met" },
  { id: "4", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", owner: "Ana R. Reyes", department: "Zoning", reviewer: "Maria Santos", dateAssigned: "2025-03-25", dateCompleted: "2025-03-29", status: "Cleared", findings: "Compliant with zoning ordinance" },
  { id: "5", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", owner: "Dr. Carlos V. Tan", department: "BPLO", reviewer: "Maria Santos", dateAssigned: "2025-03-28", dateCompleted: "2025-03-30", status: "Cleared", findings: "Business documents complete" },
  { id: "6", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", owner: "Dr. Carlos V. Tan", department: "Sanitary", reviewer: "Elena Reyes", dateAssigned: "2025-03-28", dateCompleted: null, status: "Pending", findings: "" },
  { id: "7", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", owner: "Dr. Carlos V. Tan", department: "Fire", reviewer: "Pedro Garcia", dateAssigned: "2025-03-28", dateCompleted: "2025-04-01", status: "Cleared", findings: "Fire safety compliant" },
  { id: "8", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", owner: "Rosa M. Flores", department: "BPLO", reviewer: "Pedro Garcia", dateAssigned: "2025-04-01", dateCompleted: null, status: "Pending", findings: "" },
  { id: "9", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", owner: "Rosa M. Flores", department: "Sanitary", reviewer: "Elena Reyes", dateAssigned: "2025-04-01", dateCompleted: "2025-04-04", status: "Failed", findings: "Food handling certificate expired" },
  { id: "10", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", owner: "Rosa M. Flores", department: "Fire", reviewer: "Pedro Garcia", dateAssigned: "2025-04-01", dateCompleted: "2025-04-03", status: "Cleared", findings: "Fire extinguisher and exit compliant" },
  { id: "11", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", owner: "Ernesto R. Baluyot", department: "Zoning", reviewer: "Maria Santos", dateAssigned: "2025-04-02", dateCompleted: null, status: "Pending", findings: "" },
  { id: "12", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", owner: "Ernesto R. Baluyot", department: "BPLO", reviewer: "Maria Santos", dateAssigned: "2025-04-02", dateCompleted: "2025-04-05", status: "Cleared", findings: "Documents in order" },
  { id: "13", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", owner: "Ernesto R. Baluyot", department: "Fire", reviewer: "Pedro Garcia", dateAssigned: "2025-04-02", dateCompleted: "2025-04-06", status: "Cleared", findings: "Fire safety inspection passed" },
  { id: "14", permitId: "BP-2025-0022", businessName: "Sorsogon Bay Seafood Restaurant", owner: "Maricel T. Ong", department: "Sanitary", reviewer: "Elena Reyes", dateAssigned: "2025-04-07", dateCompleted: null, status: "Pending", findings: "" },
  { id: "15", permitId: "BP-2025-0022", businessName: "Sorsogon Bay Seafood Restaurant", owner: "Maricel T. Ong", department: "BPLO", reviewer: "Pedro Garcia", dateAssigned: "2025-04-07", dateCompleted: null, status: "Pending", findings: "" },
  { id: "16", permitId: "BP-2025-0017", businessName: "Matnog Piggery Farm", owner: "Benjamin S. Torres", department: "Sanitary", reviewer: "Elena Reyes", dateAssigned: "2025-04-05", dateCompleted: "2025-04-08", status: "Failed", findings: "Waste management plan inadequate" },
  { id: "17", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", owner: "Danilo C. Ramos", department: "Fire", reviewer: "Pedro Garcia", dateAssigned: "2025-03-20", dateCompleted: "2025-03-25", status: "Cleared", findings: "Fire safety inspection passed" },
  { id: "18", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", owner: "Danilo C. Ramos", department: "Zoning", reviewer: "Maria Santos", dateAssigned: "2025-03-20", dateCompleted: "2025-03-22", status: "Waived", findings: "Existing establishment — zoning waived" },
];

function statusClass(s: Clearance["status"]) {
  if (s === "Cleared") return styles.success;
  if (s === "Pending") return styles.warning;
  if (s === "Failed") return styles.danger;
  if (s === "Waived") return styles.info;
  return "";
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

type Tab = "all" | "pending" | "cleared" | "failed";

const PAGE_SIZE = 10;

export default function ClearancesPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [tab, setTab] = useState<Tab>("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = DUMMY;
    if (tab === "pending") list = list.filter((c) => c.status === "Pending");
    else if (tab === "cleared") list = list.filter((c) => c.status === "Cleared" || c.status === "Waived");
    else if (tab === "failed") list = list.filter((c) => c.status === "Failed");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.permitId.toLowerCase().includes(q) || c.businessName.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== "all") list = list.filter((c) => c.department === deptFilter);
    return list;
  }, [search, deptFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const counts = {
    all: DUMMY.length,
    pending: DUMMY.filter((c) => c.status === "Pending").length,
    cleared: DUMMY.filter((c) => c.status === "Cleared" || c.status === "Waived").length,
    failed: DUMMY.filter((c) => c.status === "Failed").length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Departmental Clearances</h1>
            <p>Track clearance status from each reviewing department for every application.</p>
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
              <span className={styles.summaryLabel}><FileText size={14} /> Total Clearances</span>
              <span className={styles.summaryValue}>{counts.all}</span>
              <span className={styles.summaryMeta}>Across all departments</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Clock size={14} /> Pending</span>
              <span className={styles.summaryValue}>{counts.pending}</span>
              <span className={styles.summaryMeta}>Awaiting clearance</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><CheckCircle2 size={14} /> Cleared</span>
              <span className={styles.summaryValue}>{counts.cleared}</span>
              <span className={styles.summaryMeta}>Including waived</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><AlertTriangle size={14} /> Failed</span>
              <span className={styles.summaryValue}>{counts.failed}</span>
              <span className={styles.summaryMeta}>Issues found</span>
            </div>
          </div>

          <div className={styles.tabBar}>
            {([["all", "All"], ["pending", "Pending"], ["cleared", "Cleared"], ["failed", "Failed"]] as [Tab, string][]).map(([key, label]) => (
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
                placeholder="Search by permit ID, business, or owner..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>

            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                <SelectItem value="BPLO">BPLO</SelectItem>
                <SelectItem value="Sanitary">Sanitary</SelectItem>
                <SelectItem value="Fire">Fire</SelectItem>
                <SelectItem value="Zoning">Zoning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.resultsMeta}>
            Showing <strong>{pageData.length}</strong> of <strong>{filtered.length}</strong> clearances
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Permit ID</th>
                  <th>Business</th>
                  <th>Department</th>
                  <th>Reviewer</th>
                  <th>Assigned</th>
                  <th>Completed</th>
                  <th>Status</th>
                  <th>Findings</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageData.map((c) => (
                  <tr key={c.id}>
                    <td className={styles.mono}>{c.permitId}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <strong>{c.businessName}</strong>
                        <small>{c.owner}</small>
                      </div>
                    </td>
                    <td><span className={styles.badge}>{c.department}</span></td>
                    <td>{c.reviewer}</td>
                    <td className={styles.mono}>{formatDate(c.dateAssigned)}</td>
                    <td className={styles.mono}>{c.dateCompleted ? formatDate(c.dateCompleted) : "—"}</td>
                    <td><span className={`${styles.badge} ${statusClass(c.status)}`}>{c.status}</span></td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{c.findings || "—"}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.actionBtn}
                          type="button"
                          title="More actions"
                          onClick={() => setOpenActionId(openActionId === c.id ? null : c.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openActionId === c.id && (
                          <div className={styles.actionMenu}>
                            <Link href={`/applications/${c.id}`} onClick={() => setOpenActionId(null)}>
                              <Eye size={14} /> View Application
                            </Link>
                            {c.status === "Pending" && (
                              <>
                                <button type="button" className={styles.actionSuccess} onClick={() => setOpenActionId(null)}>
                                  <Check size={14} /> Mark Cleared
                                </button>
                                <button type="button" className={styles.actionDanger} onClick={() => setOpenActionId(null)}>
                                  <XCircle size={14} /> Mark Failed
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
