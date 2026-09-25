"use client";

import { useDeferredValue, useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "./applications.module.css";

type Application = {
  id: string;
  permitId: string;
  businessName: string;
  tradeName: string;
  owner: string;
  type: "New" | "Renewal" | "Amendment";
  status: "Pending" | "Under Review" | "Assessed" | "Approved" | "Released" | "Rejected";
  dateFiled: string;
  amount: number;
  barangay: string;
  lineOfBusiness: string;
};

const DUMMY: Application[] = [
  { id: "1", permitId: "BP-2025-0001", businessName: "Matnog Fisheries Corp.", tradeName: "Matnog Fish Market", owner: "Juan D. Cruz", type: "New", status: "Released", dateFiled: "2025-01-10", amount: 12500, barangay: "Poblacion", lineOfBusiness: "Fishery" },
  { id: "2", permitId: "BP-2025-0002", businessName: "Sorsogon Rice Trading", tradeName: "SR Trading", owner: "Maria S. Santos", type: "Renewal", status: "Approved", dateFiled: "2025-01-15", amount: 8750, barangay: "Bago", lineOfBusiness: "Trading" },
  { id: "3", permitId: "BP-2025-0003", businessName: "Island Sari-Sari Store", tradeName: "Island Mart", owner: "Pedro L. Garcia", type: "New", status: "Under Review", dateFiled: "2025-02-01", amount: 3200, barangay: "Camachile", lineOfBusiness: "Retail" },
  { id: "4", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", owner: "Ana R. Reyes", type: "Renewal", status: "Assessed", dateFiled: "2025-02-08", amount: 15000, barangay: "Poblacion", lineOfBusiness: "Transportation" },
  { id: "5", permitId: "BP-2025-0005", businessName: "Southern Hardware Supply", tradeName: "Southern Hardware", owner: "Roberto M. Lim", type: "New", status: "Pending", dateFiled: "2025-02-14", amount: 6800, barangay: "Sta. Elena", lineOfBusiness: "Retail" },
  { id: "6", permitId: "BP-2025-0006", businessName: "Bicol Eatery & Catering", tradeName: "Bicol Eatery", owner: "Lorna T. Mendoza", type: "New", status: "Released", dateFiled: "2025-02-20", amount: 4500, barangay: "Calayuan", lineOfBusiness: "Food Service" },
  { id: "7", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", owner: "Dr. Carlos V. Tan", type: "Renewal", status: "Under Review", dateFiled: "2025-03-01", amount: 22000, barangay: "Poblacion", lineOfBusiness: "Pharmaceutical" },
  { id: "8", permitId: "BP-2025-0008", businessName: "Pacific Internet Cafe", tradeName: "Pacific Net", owner: "Mark A. Fernandez", type: "New", status: "Rejected", dateFiled: "2025-03-05", amount: 2800, barangay: "Balocawe", lineOfBusiness: "Services" },
  { id: "9", permitId: "BP-2025-0009", businessName: "Green Agri Supplies", tradeName: "Green Farm Supply", owner: "Elena B. Villanueva", type: "Amendment", status: "Approved", dateFiled: "2025-03-12", amount: 9400, barangay: "Bago", lineOfBusiness: "Agriculture" },
  { id: "10", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", tradeName: "MAR Auto", owner: "Danilo C. Ramos", type: "Renewal", status: "Pending", dateFiled: "2025-03-18", amount: 5600, barangay: "Camachile", lineOfBusiness: "Services" },
  { id: "11", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", tradeName: "Sunshine Bakery", owner: "Rosa M. Flores", type: "New", status: "Assessed", dateFiled: "2025-03-22", amount: 3800, barangay: "Poblacion", lineOfBusiness: "Food Service" },
  { id: "12", permitId: "BP-2025-0012", businessName: "Matnog Water Refilling Station", tradeName: "AquaPure", owner: "Joel P. Aquino", type: "New", status: "Released", dateFiled: "2025-04-01", amount: 7200, barangay: "Sta. Elena", lineOfBusiness: "Manufacturing" },
  { id: "13", permitId: "BP-2025-0013", businessName: "Del Rosario General Merchandise", tradeName: "DRM Store", owner: "Conchita D. Rosario", type: "Renewal", status: "Released", dateFiled: "2025-04-05", amount: 11200, barangay: "Poblacion", lineOfBusiness: "Retail" },
  { id: "14", permitId: "BP-2025-0014", businessName: "Matnog Copra Buying Station", tradeName: "MCB Station", owner: "Ricardo E. Magsino", type: "Renewal", status: "Approved", dateFiled: "2025-04-10", amount: 18500, barangay: "Bago", lineOfBusiness: "Agriculture" },
  { id: "15", permitId: "BP-2025-0015", businessName: "Bicolana Beauty Parlor", tradeName: "Bicolana Salon", owner: "Gloria P. Navarro", type: "New", status: "Under Review", dateFiled: "2025-04-14", amount: 2400, barangay: "Poblacion", lineOfBusiness: "Services" },
  { id: "16", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", tradeName: "Ticao Cargo", owner: "Ernesto R. Baluyot", type: "New", status: "Assessed", dateFiled: "2025-04-18", amount: 25000, barangay: "Camachile", lineOfBusiness: "Transportation" },
  { id: "17", permitId: "BP-2025-0017", businessName: "Matnog Piggery Farm", tradeName: "MPF Livestock", owner: "Benjamin S. Torres", type: "New", status: "Pending", dateFiled: "2025-04-22", amount: 8900, barangay: "Calayuan", lineOfBusiness: "Agriculture" },
  { id: "18", permitId: "BP-2025-0018", businessName: "JMR Construction Supply", tradeName: "JMR Builders", owner: "Jose M. Rivera", type: "Renewal", status: "Released", dateFiled: "2025-04-28", amount: 16700, barangay: "Poblacion", lineOfBusiness: "Construction" },
  { id: "19", permitId: "BP-2025-0019", businessName: "Matnog Dry Goods Center", tradeName: "MDG Center", owner: "Teresita V. Chua", type: "Renewal", status: "Under Review", dateFiled: "2025-05-02", amount: 5300, barangay: "Balocawe", lineOfBusiness: "Retail" },
  { id: "20", permitId: "BP-2025-0020", businessName: "Sampaguita Flower Shop", tradeName: "Sampaguita Blooms", owner: "Carmen A. Lacuesta", type: "New", status: "Approved", dateFiled: "2025-05-08", amount: 1800, barangay: "Poblacion", lineOfBusiness: "Retail" },
  { id: "21", permitId: "BP-2025-0021", businessName: "Matnog Vulcanizing & Tire Shop", tradeName: "MV Tires", owner: "Alfredo G. Bautista", type: "New", status: "Released", dateFiled: "2025-05-12", amount: 4100, barangay: "Sta. Elena", lineOfBusiness: "Services" },
  { id: "22", permitId: "BP-2025-0022", businessName: "Sorsogon Bay Seafood Restaurant", tradeName: "Sorsogon Bay Resto", owner: "Maricel T. Ong", type: "New", status: "Pending", dateFiled: "2025-05-18", amount: 13600, barangay: "Poblacion", lineOfBusiness: "Food Service" },
  { id: "23", permitId: "BP-2025-0023", businessName: "RollOn Motorcycle Parts", tradeName: "RollOn Moto", owner: "Dennis L. Padilla", type: "Amendment", status: "Assessed", dateFiled: "2025-05-22", amount: 7800, barangay: "Bago", lineOfBusiness: "Retail" },
  { id: "24", permitId: "BP-2025-0024", businessName: "Matnog Printing Press", tradeName: "QuickPrint Matnog", owner: "Luzviminda R. Salazar", type: "New", status: "Released", dateFiled: "2025-05-28", amount: 6200, barangay: "Poblacion", lineOfBusiness: "Services" },
  { id: "25", permitId: "BP-2025-0025", businessName: "Bicol Express Courier", tradeName: "BE Courier", owner: "Raul N. Dimaculangan", type: "Renewal", status: "Approved", dateFiled: "2025-06-01", amount: 9800, barangay: "Camachile", lineOfBusiness: "Transportation" },
  { id: "26", permitId: "BP-2025-0026", businessName: "Matnog Livestock Feeds", tradeName: "MLF Feeds", owner: "Norberto C. Espiritu", type: "Renewal", status: "Under Review", dateFiled: "2025-06-05", amount: 14300, barangay: "Calayuan", lineOfBusiness: "Agriculture" },
  { id: "27", permitId: "BP-2025-0027", businessName: "Casa Matnog Pension House", tradeName: "Casa Matnog Inn", owner: "Felicidad M. Gutierrez", type: "New", status: "Pending", dateFiled: "2025-06-10", amount: 19500, barangay: "Poblacion", lineOfBusiness: "Accommodation" },
  { id: "28", permitId: "BP-2025-0028", businessName: "SM Gadget Hub", tradeName: "SM Gadgets", owner: "Kevin B. Sy", type: "New", status: "Rejected", dateFiled: "2025-06-15", amount: 8200, barangay: "Poblacion", lineOfBusiness: "Retail" },
  { id: "29", permitId: "BP-2025-0029", businessName: "Matnog Welding & Fabrication", tradeName: "MW Fabrication", owner: "Armando T. dela Cruz", type: "Amendment", status: "Approved", dateFiled: "2025-06-20", amount: 5500, barangay: "Sta. Elena", lineOfBusiness: "Manufacturing" },
  { id: "30", permitId: "BP-2025-0030", businessName: "Tindahan ni Aling Nena", tradeName: "Aling Nena Store", owner: "Nena F. Hernandez", type: "Renewal", status: "Released", dateFiled: "2025-06-25", amount: 1500, barangay: "Bago", lineOfBusiness: "Retail" },
];

const BARANGAY_OPTIONS = ["Poblacion", "Bago", "Camachile", "Sta. Elena", "Calayuan", "Balocawe"];
const LOB_OPTIONS = ["Retail", "Food Service", "Services", "Agriculture", "Transportation", "Manufacturing", "Fishery", "Pharmaceutical", "Trading", "Construction", "Accommodation"];

const columns = ["permitId", "business", "owner", "type", "barangay", "status", "dateFiled", "amount", "actions"] as const;
type Column = (typeof columns)[number];
const labels: Record<Column, string> = {
  permitId: "Permit ID",
  business: "Business",
  owner: "Owner",
  type: "Type",
  barangay: "Barangay",
  status: "Status",
  dateFiled: "Date Filed",
  amount: "Amount",
  actions: "",
};
const fixed = new Set<Column>(["business", "actions"]);
const defaultHidden = new Set<Column>(["barangay"]);

type SortKey = "permitId" | "businessName" | "owner" | "type" | "dateFiled" | "amount";
const sortable: Partial<Record<Column, SortKey>> = {
  permitId: "permitId",
  business: "businessName",
  owner: "owner",
  type: "type",
  dateFiled: "dateFiled",
  amount: "amount",
};

function statusClass(status: Application["status"]) {
  if (status === "Released") return styles.success;
  if (status === "Approved") return styles.success;
  if (status === "Rejected") return styles.danger;
  if (status === "Pending") return styles.warning;
  if (status === "Under Review") return styles.info;
  if (status === "Assessed") return styles.info;
  return "";
}

function typeClass(type: Application["type"]) {
  if (type === "Amendment") return styles.warning;
  return "";
}

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [lobFilter, setLobFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visible, setVisible] = useState<Set<Column>>(() => {
    const initial = new Set(columns as readonly Column[]);
    for (const c of defaultHidden) initial.delete(c);
    return initial;
  });
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("dateFiled");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const advancedCount = [barangayFilter !== "all", lobFilter !== "all", dateFrom !== "", dateTo !== ""].filter(Boolean).length;

  const filtered = useMemo(() => {
    let list = DUMMY;
    if (deferred) {
      const q = deferred.toLowerCase();
      list = list.filter(
        (a) =>
          a.permitId.toLowerCase().includes(q) ||
          a.businessName.toLowerCase().includes(q) ||
          a.tradeName.toLowerCase().includes(q) ||
          a.owner.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (typeFilter !== "all") list = list.filter((a) => a.type === typeFilter);
    if (barangayFilter !== "all") list = list.filter((a) => a.barangay === barangayFilter);
    if (lobFilter !== "all") list = list.filter((a) => a.lineOfBusiness === lobFilter);
    if (dateFrom) list = list.filter((a) => a.dateFiled >= dateFrom);
    if (dateTo) list = list.filter((a) => a.dateFiled <= dateTo);
    return list;
  }, [deferred, statusFilter, typeFilter, barangayFilter, lobFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const toggleColumn = (col: Column) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const clearAdvanced = () => {
    setBarangayFilter("all");
    setLobFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  };

  const formatCurrency = (n: number) =>
    "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>All Applications</h1>
            <p>
              Track and manage business permit applications — from filing to release.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href="/applications/new">
              <Plus size={15} /> New Application
            </Link>
            <Link className={styles.btnSecondary} href="/applications/renewals">
              <RefreshCw size={15} /> Renew Application
            </Link>
            <button className={styles.btnSecondary} type="button">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search by permit ID, business name, or owner..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Assessed">Assessed</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Released">Released</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Renewal">Renewal</SelectItem>
                <SelectItem value="Amendment">Amendment</SelectItem>
              </SelectContent>
            </Select>

            <button
              className={`${styles.secondaryButton} ${styles.filterButton}`}
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
            >
              <Filter size={14} />
              More Filters
              {advancedCount > 0 && <span className={styles.filterCount}>{advancedCount}</span>}
            </button>

            <div className={styles.columnsMenu}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setColumnsOpen((o) => !o)}
              >
                <Columns3 size={14} /> Columns
              </button>
              {columnsOpen && (
                <div className={styles.columnsPopover}>
                  {columns.filter((c) => !fixed.has(c)).map((col) => (
                    <label key={col}>
                      <input
                        type="checkbox"
                        checked={visible.has(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      {labels[col]}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {moreOpen && (
            <div className={styles.advancedPanel}>
              <div className={styles.advancedHeader}>
                <h3>Advanced Filters</h3>
                {advancedCount > 0 && (
                  <button className={styles.clearBtn} type="button" onClick={clearAdvanced}>
                    <X size={13} /> Clear all
                  </button>
                )}
              </div>
              <div className={styles.filterGrid}>
                <div className={styles.field}>
                  <span>Barangay</span>
                  <Select value={barangayFilter} onValueChange={(v) => { setBarangayFilter(v); setPage(0); }}>
                    <SelectTrigger className={styles.compactSelect}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All barangays</SelectItem>
                      {BARANGAY_OPTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.field}>
                  <span>Line of Business</span>
                  <Select value={lobFilter} onValueChange={(v) => { setLobFilter(v); setPage(0); }}>
                    <SelectTrigger className={styles.compactSelect}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {LOB_OPTIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.field}>
                  <span>Date Filed (From)</span>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                  />
                </div>
                <div className={styles.field}>
                  <span>Date Filed (To)</span>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className={styles.resultsMeta}>
            <span>
              Showing <strong>{pageData.length}</strong> of <strong>{sorted.length}</strong> applications
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.filter((c) => visible.has(c)).map((col) => {
                    const sk = sortable[col];
                    return (
                      <th key={col}>
                        {sk ? (
                          <button className={styles.sortButton} type="button" onClick={() => handleSort(sk)}>
                            {labels[col]}
                            <ChevronsUpDown size={13} />
                          </button>
                        ) : (
                          labels[col]
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageData.map((app) => (
                  <tr key={app.id}>
                    {visible.has("permitId") && (
                      <td className={styles.mono}>{app.permitId}</td>
                    )}
                    {visible.has("business") && (
                      <td>
                        <div className={styles.nameCell}>
                          <strong>{app.businessName}</strong>
                          <small>{app.tradeName}</small>
                        </div>
                      </td>
                    )}
                    {visible.has("owner") && <td>{app.owner}</td>}
                    {visible.has("type") && (
                      <td>
                        <span className={`${styles.badge} ${typeClass(app.type)}`}>{app.type}</span>
                      </td>
                    )}
                    {visible.has("barangay") && <td>{app.barangay}</td>}
                    {visible.has("status") && (
                      <td>
                        <span className={`${styles.badge} ${statusClass(app.status)}`}>{app.status}</span>
                      </td>
                    )}
                    {visible.has("dateFiled") && <td className={styles.mono}>{formatDate(app.dateFiled)}</td>}
                    {visible.has("amount") && <td className={styles.mono}>{formatCurrency(app.amount)}</td>}
                    {visible.has("actions") && (
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.actionBtn}
                            type="button"
                            title="More actions"
                            onClick={() => setOpenActionId(openActionId === app.id ? null : app.id)}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openActionId === app.id && (
                            <div className={styles.actionMenu}>
                              <Link href={`/applications/${app.id}`} onClick={() => setOpenActionId(null)}>
                                <Eye size={14} /> View Application
                              </Link>
                              <Link href={`/applications/${app.id}/edit`} onClick={() => setOpenActionId(null)}>
                                <Pencil size={14} /> Edit Application
                              </Link>
                              <div className={styles.actionDivider} />
                              <button type="button" className={styles.actionDanger} onClick={() => setOpenActionId(null)}>
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              className={styles.pageBtn}
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
