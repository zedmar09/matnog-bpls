"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Send,
  XCircle,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "./reviews.module.css";

type ReviewItem = {
  id: string;
  permitId: string;
  businessName: string;
  tradeName: string;
  owner: string;
  applicationType: "New" | "Renewal" | "Amendment";
  department: string;
  assignedTo: string;
  dateSubmitted: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending Review" | "In Progress" | "Approved" | "Returned" | "On Hold";
  remarks: string;
  daysInQueue: number;
};

const DUMMY: ReviewItem[] = [
  { id: "1", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", owner: "Ana R. Reyes", applicationType: "Renewal", department: "BPLO", assignedTo: "Maria Santos", dateSubmitted: "2025-03-25", priority: "High", status: "Pending Review", remarks: "Renewal with changes in business activity", daysInQueue: 5 },
  { id: "2", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", owner: "Dr. Carlos V. Tan", applicationType: "Renewal", department: "Sanitary", assignedTo: "Elena Reyes", dateSubmitted: "2025-03-28", priority: "High", status: "In Progress", remarks: "Requires updated sanitary permit", daysInQueue: 3 },
  { id: "3", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", tradeName: "Sunshine Bakery", owner: "Rosa M. Flores", applicationType: "New", department: "BPLO", assignedTo: "Pedro Garcia", dateSubmitted: "2025-04-01", priority: "Medium", status: "Pending Review", remarks: "", daysInQueue: 2 },
  { id: "4", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", tradeName: "Ticao Cargo", owner: "Ernesto R. Baluyot", applicationType: "New", department: "Zoning", assignedTo: "Maria Santos", dateSubmitted: "2025-04-02", priority: "High", status: "In Progress", remarks: "Zoning verification for port area", daysInQueue: 4 },
  { id: "5", permitId: "BP-2025-0017", businessName: "Matnog Piggery Farm", tradeName: "MPF Livestock", owner: "Benjamin S. Torres", applicationType: "New", department: "Sanitary", assignedTo: "Elena Reyes", dateSubmitted: "2025-04-05", priority: "Medium", status: "Pending Review", remarks: "Environmental compliance check needed", daysInQueue: 1 },
  { id: "6", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", tradeName: "MAR Auto", owner: "Danilo C. Ramos", applicationType: "Renewal", department: "Fire", assignedTo: "Pedro Garcia", dateSubmitted: "2025-03-20", priority: "Low", status: "Approved", remarks: "Fire safety inspection passed", daysInQueue: 0 },
  { id: "7", permitId: "BP-2025-0005", businessName: "Southern Hardware Supply", tradeName: "Southern Hardware", owner: "Roberto M. Lim", applicationType: "New", department: "BPLO", assignedTo: "Maria Santos", dateSubmitted: "2025-03-22", priority: "Medium", status: "Approved", remarks: "All requirements complete", daysInQueue: 0 },
  { id: "8", permitId: "BP-2025-0015", businessName: "Bicolana Beauty Parlor", tradeName: "Bicolana Salon", owner: "Gloria P. Navarro", applicationType: "New", department: "Sanitary", assignedTo: "Elena Reyes", dateSubmitted: "2025-04-03", priority: "Low", status: "Returned", remarks: "Missing sanitary permit from DOH", daysInQueue: 0 },
  { id: "9", permitId: "BP-2025-0003", businessName: "Island Sari-Sari Store", tradeName: "Island Mart", owner: "Pedro L. Garcia", applicationType: "New", department: "BPLO", assignedTo: "Pedro Garcia", dateSubmitted: "2025-04-06", priority: "Low", status: "Pending Review", remarks: "", daysInQueue: 1 },
  { id: "10", permitId: "BP-2025-0019", businessName: "Matnog Dry Goods Center", tradeName: "MDG Center", owner: "Teresita V. Chua", applicationType: "Renewal", department: "Fire", assignedTo: "Pedro Garcia", dateSubmitted: "2025-03-30", priority: "Medium", status: "In Progress", remarks: "Fire inspection scheduled", daysInQueue: 3 },
  { id: "11", permitId: "BP-2025-0022", businessName: "Sorsogon Bay Seafood Restaurant", tradeName: "Sorsogon Bay Resto", owner: "Maricel T. Ong", applicationType: "New", department: "Sanitary", assignedTo: "Elena Reyes", dateSubmitted: "2025-04-07", priority: "High", status: "Pending Review", remarks: "Food establishment — requires sanitary inspection", daysInQueue: 1 },
  { id: "12", permitId: "BP-2025-0026", businessName: "Matnog Livestock Feeds", tradeName: "MLF Feeds", owner: "Norberto C. Espiritu", applicationType: "Renewal", department: "Zoning", assignedTo: "Maria Santos", dateSubmitted: "2025-04-04", priority: "Low", status: "On Hold", remarks: "Awaiting zoning reclassification decision", daysInQueue: 6 },
  { id: "13", permitId: "BP-2025-0027", businessName: "Casa Matnog Pension House", tradeName: "Casa Matnog Inn", owner: "Felicidad M. Gutierrez", applicationType: "New", department: "Fire", assignedTo: "Pedro Garcia", dateSubmitted: "2025-04-08", priority: "High", status: "Pending Review", remarks: "Accommodation — fire safety priority", daysInQueue: 0 },
  { id: "14", permitId: "BP-2025-0023", businessName: "RollOn Motorcycle Parts", tradeName: "RollOn Moto", owner: "Dennis L. Padilla", applicationType: "Amendment", department: "BPLO", assignedTo: "Maria Santos", dateSubmitted: "2025-04-01", priority: "Medium", status: "Approved", remarks: "Business activity amendment approved", daysInQueue: 0 },
  { id: "15", permitId: "BP-2025-0008", businessName: "Pacific Internet Cafe", tradeName: "Pacific Net", owner: "Mark A. Fernandez", applicationType: "New", department: "BPLO", assignedTo: "Pedro Garcia", dateSubmitted: "2025-03-15", priority: "Low", status: "Returned", remarks: "Application rejected — incomplete documents", daysInQueue: 0 },
];

function statusClass(s: ReviewItem["status"]) {
  if (s === "Approved") return styles.success;
  if (s === "Pending Review") return styles.warning;
  if (s === "In Progress") return styles.info;
  if (s === "Returned") return styles.danger;
  if (s === "On Hold") return "";
  return "";
}

function priorityClass(p: ReviewItem["priority"]) {
  if (p === "High") return styles.priorityHigh;
  if (p === "Medium") return styles.priorityMedium;
  return styles.priorityLow;
}

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

type Tab = "all" | "pending" | "inprogress" | "approved" | "returned";

const PAGE_SIZE = 10;

export default function ReviewQueuePage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [tab, setTab] = useState<Tab>("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = DUMMY;
    if (tab === "pending") list = list.filter((r) => r.status === "Pending Review");
    else if (tab === "inprogress") list = list.filter((r) => r.status === "In Progress");
    else if (tab === "approved") list = list.filter((r) => r.status === "Approved");
    else if (tab === "returned") list = list.filter((r) => r.status === "Returned" || r.status === "On Hold");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.permitId.toLowerCase().includes(q) || r.businessName.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q));
    }
    if (deptFilter !== "all") list = list.filter((r) => r.department === deptFilter);
    if (assignedFilter !== "all") list = list.filter((r) => r.assignedTo === assignedFilter);
    return list;
  }, [search, deptFilter, assignedFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const counts = {
    all: DUMMY.length,
    pending: DUMMY.filter((r) => r.status === "Pending Review").length,
    inprogress: DUMMY.filter((r) => r.status === "In Progress").length,
    approved: DUMMY.filter((r) => r.status === "Approved").length,
    returned: DUMMY.filter((r) => r.status === "Returned" || r.status === "On Hold").length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Review Queue</h1>
            <p>Track and manage application reviews across all departments.</p>
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
              <span className={styles.summaryLabel}><Clock size={14} /> Pending</span>
              <span className={styles.summaryValue}>{counts.pending}</span>
              <span className={styles.summaryMeta}>Awaiting review</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><ClipboardCheck size={14} /> In Progress</span>
              <span className={styles.summaryValue}>{counts.inprogress}</span>
              <span className={styles.summaryMeta}>Currently being reviewed</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><CheckCircle2 size={14} /> Approved</span>
              <span className={styles.summaryValue}>{counts.approved}</span>
              <span className={styles.summaryMeta}>Ready for assessment</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><AlertTriangle size={14} /> Returned / On Hold</span>
              <span className={styles.summaryValue}>{counts.returned}</span>
              <span className={styles.summaryMeta}>Needs attention</span>
            </div>
          </div>

          <div className={styles.tabBar}>
            {([["all", "All"], ["pending", "Pending"], ["inprogress", "In Progress"], ["approved", "Approved"], ["returned", "Returned"]] as [Tab, string][]).map(([key, label]) => (
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

            <Select value={assignedFilter} onValueChange={(v) => { setAssignedFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reviewers</SelectItem>
                <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                <SelectItem value="Pedro Garcia">Pedro Garcia</SelectItem>
                <SelectItem value="Elena Reyes">Elena Reyes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.resultsMeta}>
            Showing <strong>{pageData.length}</strong> of <strong>{filtered.length}</strong> reviews
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Permit ID</th>
                  <th>Business</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Assigned To</th>
                  <th>Submitted</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Days</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageData.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.mono}>{r.permitId}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <strong>{r.businessName}</strong>
                        <small>{r.owner}</small>
                      </div>
                    </td>
                    <td><span className={styles.badge}>{r.applicationType}</span></td>
                    <td>{r.department}</td>
                    <td>{r.assignedTo}</td>
                    <td className={styles.mono}>{formatDate(r.dateSubmitted)}</td>
                    <td>
                      <span>
                        <span className={`${styles.priorityDot} ${priorityClass(r.priority)}`} />
                        {r.priority}
                      </span>
                    </td>
                    <td><span className={`${styles.badge} ${statusClass(r.status)}`}>{r.status}</span></td>
                    <td className={styles.mono}>{r.daysInQueue > 0 ? r.daysInQueue : "—"}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.actionBtn}
                          type="button"
                          title="More actions"
                          onClick={() => setOpenActionId(openActionId === r.id ? null : r.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openActionId === r.id && (
                          <div className={styles.actionMenu}>
                            <Link href={`/applications/${r.id}`} onClick={() => setOpenActionId(null)}>
                              <Eye size={14} /> View Application
                            </Link>
                            <button type="button" className={styles.actionSuccess} onClick={() => setOpenActionId(null)}>
                              <Check size={14} /> Approve
                            </button>
                            <button type="button" onClick={() => setOpenActionId(null)}>
                              <Send size={14} /> Forward
                            </button>
                            <div className={styles.actionDivider} />
                            <button type="button" className={styles.actionDanger} onClick={() => setOpenActionId(null)}>
                              <XCircle size={14} /> Return
                            </button>
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
