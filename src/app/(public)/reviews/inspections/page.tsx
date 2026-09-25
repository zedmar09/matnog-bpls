"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  MapPin,
  MoreHorizontal,
  Search,
  XCircle,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "../reviews.module.css";

type Inspection = {
  id: string;
  permitId: string;
  businessName: string;
  owner: string;
  address: string;
  type: "Fire Safety" | "Sanitary" | "Zoning" | "Environmental" | "Building";
  inspector: string;
  dateScheduled: string;
  dateCompleted: string | null;
  status: "Scheduled" | "Completed" | "Failed" | "Cancelled" | "Overdue";
  findings: string;
};

const DUMMY: Inspection[] = [
  { id: "1", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", owner: "Ana R. Reyes", address: "Brgy. Sta. Magdalena, Matnog", type: "Fire Safety", inspector: "Pedro Garcia", dateScheduled: "2025-04-10", dateCompleted: null, status: "Scheduled", findings: "" },
  { id: "2", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", owner: "Dr. Carlos V. Tan", address: "Poblacion, Matnog", type: "Sanitary", inspector: "Elena Reyes", dateScheduled: "2025-04-08", dateCompleted: null, status: "Overdue", findings: "" },
  { id: "3", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", owner: "Rosa M. Flores", address: "Brgy. Rizal, Matnog", type: "Sanitary", inspector: "Elena Reyes", dateScheduled: "2025-04-05", dateCompleted: "2025-04-05", status: "Failed", findings: "Food handling certificate expired; kitchen ventilation insufficient" },
  { id: "4", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", owner: "Ernesto R. Baluyot", address: "Port Area, Brgy. Calintaan, Matnog", type: "Zoning", inspector: "Maria Santos", dateScheduled: "2025-04-12", dateCompleted: null, status: "Scheduled", findings: "" },
  { id: "5", permitId: "BP-2025-0017", businessName: "Matnog Piggery Farm", owner: "Benjamin S. Torres", address: "Brgy. Bolo, Matnog", type: "Environmental", inspector: "Elena Reyes", dateScheduled: "2025-04-06", dateCompleted: "2025-04-06", status: "Failed", findings: "Waste management plan inadequate; drainage needs improvement" },
  { id: "6", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", owner: "Danilo C. Ramos", address: "Brgy. Sta. Magdalena, Matnog", type: "Fire Safety", inspector: "Pedro Garcia", dateScheduled: "2025-03-22", dateCompleted: "2025-03-22", status: "Completed", findings: "Fire extinguishers present; emergency exits properly marked" },
  { id: "7", permitId: "BP-2025-0005", businessName: "Southern Hardware Supply", owner: "Roberto M. Lim", address: "Poblacion, Matnog", type: "Fire Safety", inspector: "Pedro Garcia", dateScheduled: "2025-03-24", dateCompleted: "2025-03-24", status: "Completed", findings: "All fire safety requirements met" },
  { id: "8", permitId: "BP-2025-0005", businessName: "Southern Hardware Supply", owner: "Roberto M. Lim", address: "Poblacion, Matnog", type: "Building", inspector: "Maria Santos", dateScheduled: "2025-03-25", dateCompleted: "2025-03-25", status: "Completed", findings: "Building structure sound; compliant with building code" },
  { id: "9", permitId: "BP-2025-0022", businessName: "Sorsogon Bay Seafood Restaurant", owner: "Maricel T. Ong", address: "Brgy. Calintaan, Matnog", type: "Sanitary", inspector: "Elena Reyes", dateScheduled: "2025-04-15", dateCompleted: null, status: "Scheduled", findings: "" },
  { id: "10", permitId: "BP-2025-0022", businessName: "Sorsogon Bay Seafood Restaurant", owner: "Maricel T. Ong", address: "Brgy. Calintaan, Matnog", type: "Fire Safety", inspector: "Pedro Garcia", dateScheduled: "2025-04-14", dateCompleted: null, status: "Scheduled", findings: "" },
  { id: "11", permitId: "BP-2025-0027", businessName: "Casa Matnog Pension House", owner: "Felicidad M. Gutierrez", address: "Poblacion, Matnog", type: "Fire Safety", inspector: "Pedro Garcia", dateScheduled: "2025-04-11", dateCompleted: null, status: "Scheduled", findings: "" },
  { id: "12", permitId: "BP-2025-0027", businessName: "Casa Matnog Pension House", owner: "Felicidad M. Gutierrez", address: "Poblacion, Matnog", type: "Building", inspector: "Maria Santos", dateScheduled: "2025-04-13", dateCompleted: null, status: "Scheduled", findings: "" },
  { id: "13", permitId: "BP-2025-0019", businessName: "Matnog Dry Goods Center", owner: "Teresita V. Chua", address: "Brgy. Rizal, Matnog", type: "Fire Safety", inspector: "Pedro Garcia", dateScheduled: "2025-04-03", dateCompleted: null, status: "Overdue", findings: "" },
  { id: "14", permitId: "BP-2025-0015", businessName: "Bicolana Beauty Parlor", owner: "Gloria P. Navarro", address: "Poblacion, Matnog", type: "Sanitary", inspector: "Elena Reyes", dateScheduled: "2025-04-02", dateCompleted: "2025-04-02", status: "Completed", findings: "Sanitary conditions acceptable" },
  { id: "15", permitId: "BP-2025-0026", businessName: "Matnog Livestock Feeds", owner: "Norberto C. Espiritu", address: "Brgy. Bolo, Matnog", type: "Zoning", inspector: "Maria Santos", dateScheduled: "2025-04-09", dateCompleted: null, status: "Cancelled", findings: "Cancelled — awaiting zoning reclassification" },
];

function statusClass(s: Inspection["status"]) {
  if (s === "Completed") return styles.success;
  if (s === "Scheduled") return styles.info;
  if (s === "Failed") return styles.danger;
  if (s === "Overdue") return styles.warning;
  return "";
}

function priorityForStatus(s: Inspection["status"]) {
  if (s === "Overdue") return styles.priorityHigh;
  if (s === "Scheduled") return styles.priorityMedium;
  return styles.priorityLow;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

type Tab = "all" | "scheduled" | "completed" | "failed" | "overdue";

const PAGE_SIZE = 10;

export default function InspectionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tab, setTab] = useState<Tab>("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = DUMMY;
    if (tab === "scheduled") list = list.filter((i) => i.status === "Scheduled");
    else if (tab === "completed") list = list.filter((i) => i.status === "Completed");
    else if (tab === "failed") list = list.filter((i) => i.status === "Failed");
    else if (tab === "overdue") list = list.filter((i) => i.status === "Overdue");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) => i.permitId.toLowerCase().includes(q) || i.businessName.toLowerCase().includes(q) || i.address.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") list = list.filter((i) => i.type === typeFilter);
    return list;
  }, [search, typeFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const counts = {
    all: DUMMY.length,
    scheduled: DUMMY.filter((i) => i.status === "Scheduled").length,
    completed: DUMMY.filter((i) => i.status === "Completed").length,
    failed: DUMMY.filter((i) => i.status === "Failed").length,
    overdue: DUMMY.filter((i) => i.status === "Overdue").length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Inspections</h1>
            <p>Schedule and track on-site inspections for business permit applications.</p>
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
              <span className={styles.summaryLabel}><Calendar size={14} /> Scheduled</span>
              <span className={styles.summaryValue}>{counts.scheduled}</span>
              <span className={styles.summaryMeta}>Upcoming inspections</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><CheckCircle2 size={14} /> Completed</span>
              <span className={styles.summaryValue}>{counts.completed}</span>
              <span className={styles.summaryMeta}>Inspections done</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><AlertTriangle size={14} /> Failed</span>
              <span className={styles.summaryValue}>{counts.failed}</span>
              <span className={styles.summaryMeta}>Did not pass</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Clock size={14} /> Overdue</span>
              <span className={styles.summaryValue}>{counts.overdue}</span>
              <span className={styles.summaryMeta}>Past schedule date</span>
            </div>
          </div>

          <div className={styles.tabBar}>
            {([["all", "All"], ["scheduled", "Scheduled"], ["completed", "Completed"], ["failed", "Failed"], ["overdue", "Overdue"]] as [Tab, string][]).map(([key, label]) => (
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
                placeholder="Search by permit ID, business, or address..."
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
                <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                <SelectItem value="Sanitary">Sanitary</SelectItem>
                <SelectItem value="Zoning">Zoning</SelectItem>
                <SelectItem value="Environmental">Environmental</SelectItem>
                <SelectItem value="Building">Building</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.resultsMeta}>
            Showing <strong>{pageData.length}</strong> of <strong>{filtered.length}</strong> inspections
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Permit ID</th>
                  <th>Business</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Inspector</th>
                  <th>Scheduled</th>
                  <th>Completed</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageData.map((i) => (
                  <tr key={i.id}>
                    <td className={styles.mono}>{i.permitId}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <strong>{i.businessName}</strong>
                        <small>{i.owner}</small>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={12} style={{ color: "#999", flexShrink: 0 }} /> {i.address}
                      </span>
                    </td>
                    <td><span className={styles.badge}>{i.type}</span></td>
                    <td>{i.inspector}</td>
                    <td className={styles.mono}>{formatDate(i.dateScheduled)}</td>
                    <td className={styles.mono}>{i.dateCompleted ? formatDate(i.dateCompleted) : "—"}</td>
                    <td><span className={`${styles.badge} ${statusClass(i.status)}`}>{i.status}</span></td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.actionBtn}
                          type="button"
                          title="More actions"
                          onClick={() => setOpenActionId(openActionId === i.id ? null : i.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openActionId === i.id && (
                          <div className={styles.actionMenu}>
                            <Link href={`/applications/${i.id}`} onClick={() => setOpenActionId(null)}>
                              <Eye size={14} /> View Application
                            </Link>
                            {(i.status === "Scheduled" || i.status === "Overdue") && (
                              <>
                                <button type="button" className={styles.actionSuccess} onClick={() => setOpenActionId(null)}>
                                  <Check size={14} /> Mark Completed
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
