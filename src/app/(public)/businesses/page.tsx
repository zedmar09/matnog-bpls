"use client";

import { useDeferredValue, useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  Download,
  Eye,
  FilePenLine,
  FileText,
  Filter,
  MapPinned,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "../applications/applications.module.css";

type Business = {
  id: string;
  permitNo: string;
  businessName: string;
  tradeName: string;
  owner: string;
  barangay: string;
  address: string;
  lineOfBusiness: string;
  businessType: "Sole Proprietorship" | "Partnership" | "Corporation" | "Cooperative" | "OPC";
  status: "Active" | "For Renewal" | "Expired" | "Suspended" | "Closed" | "With Deficiency";
  riskLevel: "Low" | "Medium" | "High";
  lastPermitYear: string;
  expiryDate: string;
  grossSales: number;
  employees: number;
  area: number;
  lastInspection: string;
};

const BUSINESSES: Business[] = [
  { id: "BUS-001", permitNo: "BP-2025-0001", businessName: "Matnog Fisheries Corp.", tradeName: "Matnog Fish Market", owner: "Juan D. Cruz", barangay: "Poblacion", address: "Fish Port Road, Poblacion", lineOfBusiness: "Agriculture & Fishery", businessType: "Corporation", status: "Active", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 3860000, employees: 24, area: 310, lastInspection: "2025-08-14" },
  { id: "BUS-002", permitNo: "BP-2025-0002", businessName: "Sorsogon Rice Trading", tradeName: "SR Trading", owner: "Maria S. Santos", barangay: "Bago", address: "Maharlika Highway, Bago", lineOfBusiness: "Wholesale Trade", businessType: "Sole Proprietorship", status: "For Renewal", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 1320000, employees: 6, area: 84, lastInspection: "2025-07-21" },
  { id: "BUS-003", permitNo: "BP-2025-0003", businessName: "Island Sari-Sari Store", tradeName: "Island Mart", owner: "Pedro L. Garcia", barangay: "Camachile", address: "Zone 2, Camachile", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 420000, employees: 2, area: 28, lastInspection: "2025-06-03" },
  { id: "BUS-004", permitNo: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", owner: "Ana R. Reyes", barangay: "Poblacion", address: "Port Road, Poblacion", lineOfBusiness: "Transportation", businessType: "Corporation", status: "For Renewal", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 4850000, employees: 18, area: 160, lastInspection: "2025-09-02" },
  { id: "BUS-005", permitNo: "BP-2025-0005", businessName: "Southern Hardware Supply", tradeName: "Southern Hardware", owner: "Roberto M. Lim", barangay: "Sta. Elena", address: "Sta. Elena Commercial Road", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 2140000, employees: 11, area: 190, lastInspection: "2025-05-19" },
  { id: "BUS-006", permitNo: "BP-2025-0006", businessName: "Bicol Eatery & Catering", tradeName: "Bicol Eatery", owner: "Lorna T. Mendoza", barangay: "Calayuan", address: "Calayuan Public Road", lineOfBusiness: "Food Service", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 730000, employees: 5, area: 64, lastInspection: "2025-08-08" },
  { id: "BUS-007", permitNo: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", owner: "Dr. Carlos V. Tan", barangay: "Poblacion", address: "Rizal Street, Poblacion", lineOfBusiness: "Pharmaceutical", businessType: "Corporation", status: "With Deficiency", riskLevel: "High", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 3715000, employees: 9, area: 72, lastInspection: "2025-09-10" },
  { id: "BUS-008", permitNo: "BP-2025-0008", businessName: "Pacific Internet Cafe", tradeName: "Pacific Net", owner: "Mark A. Fernandez", barangay: "Balocawe", address: "Balocawe Center", lineOfBusiness: "Services", businessType: "Sole Proprietorship", status: "Expired", riskLevel: "Medium", lastPermitYear: "2024", expiryDate: "2024-12-31", grossSales: 690000, employees: 4, area: 52, lastInspection: "2024-11-18" },
  { id: "BUS-009", permitNo: "BP-2025-0009", businessName: "Green Agri Supplies", tradeName: "Green Farm Supply", owner: "Elena B. Villanueva", barangay: "Bago", address: "Bago Farm Road", lineOfBusiness: "Agriculture & Fishery", businessType: "Partnership", status: "Active", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 1640000, employees: 8, area: 118, lastInspection: "2025-04-27" },
  { id: "BUS-010", permitNo: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", tradeName: "MAR Auto", owner: "Danilo C. Ramos", barangay: "Camachile", address: "Camachile National Road", lineOfBusiness: "Services", businessType: "Sole Proprietorship", status: "For Renewal", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 965000, employees: 5, area: 120, lastInspection: "2025-06-29" },
  { id: "BUS-011", permitNo: "BP-2025-0011", businessName: "Sunshine Bakeshop", tradeName: "Sunshine Bakery", owner: "Rosa M. Flores", barangay: "Poblacion", address: "Market Street, Poblacion", lineOfBusiness: "Food Service", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 880000, employees: 7, area: 58, lastInspection: "2025-07-12" },
  { id: "BUS-012", permitNo: "BP-2025-0012", businessName: "Matnog Water Refilling Station", tradeName: "AquaPure", owner: "Joel P. Aquino", barangay: "Sta. Elena", address: "Sta. Elena Road", lineOfBusiness: "Manufacturing", businessType: "Sole Proprietorship", status: "Active", riskLevel: "High", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 1110000, employees: 6, area: 70, lastInspection: "2025-09-06" },
  { id: "BUS-013", permitNo: "BP-2025-0013", businessName: "Del Rosario General Merchandise", tradeName: "DRM Store", owner: "Conchita D. Rosario", barangay: "Poblacion", address: "Public Market Annex", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 765000, employees: 4, area: 45, lastInspection: "2025-08-25" },
  { id: "BUS-014", permitNo: "BP-2025-0014", businessName: "Matnog Copra Buying Station", tradeName: "MCB Station", owner: "Ricardo E. Magsino", barangay: "Bago", address: "Bago Warehouse Compound", lineOfBusiness: "Agriculture & Fishery", businessType: "Partnership", status: "For Renewal", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 5220000, employees: 12, area: 240, lastInspection: "2025-07-31" },
  { id: "BUS-015", permitNo: "BP-2025-0015", businessName: "Bicolana Beauty Parlor", tradeName: "Bicolana Salon", owner: "Gloria P. Navarro", barangay: "Poblacion", address: "Quezon Avenue, Poblacion", lineOfBusiness: "Services", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 390000, employees: 3, area: 36, lastInspection: "2025-03-20" },
  { id: "BUS-016", permitNo: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", tradeName: "Ticao Cargo", owner: "Ernesto R. Baluyot", barangay: "Camachile", address: "Camachile Port Access", lineOfBusiness: "Transportation", businessType: "Corporation", status: "Active", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 5980000, employees: 20, area: 280, lastInspection: "2025-08-30" },
  { id: "BUS-017", permitNo: "BP-2025-0017", businessName: "Matnog Piggery Farm", tradeName: "MPF Livestock", owner: "Benjamin S. Torres", barangay: "Calayuan", address: "Calayuan Farm Road", lineOfBusiness: "Agriculture & Fishery", businessType: "Sole Proprietorship", status: "With Deficiency", riskLevel: "High", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 1360000, employees: 9, area: 520, lastInspection: "2025-09-15" },
  { id: "BUS-018", permitNo: "BP-2025-0018", businessName: "JMR Construction Supply", tradeName: "JMR Builders", owner: "Jose M. Rivera", barangay: "Poblacion", address: "Diversion Road, Poblacion", lineOfBusiness: "Construction", businessType: "Corporation", status: "For Renewal", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 7130000, employees: 21, area: 310, lastInspection: "2025-06-16" },
  { id: "BUS-019", permitNo: "BP-2025-0019", businessName: "Matnog Dry Goods Center", tradeName: "MDG Center", owner: "Teresita V. Chua", barangay: "Balocawe", address: "Balocawe Commercial Strip", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", status: "For Renewal", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 1180000, employees: 7, area: 80, lastInspection: "2025-05-22" },
  { id: "BUS-020", permitNo: "BP-2025-0020", businessName: "Sampaguita Flower Shop", tradeName: "Sampaguita Blooms", owner: "Carmen A. Lacuesta", barangay: "Poblacion", address: "Rizal Street, Poblacion", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 320000, employees: 2, area: 30, lastInspection: "2025-04-02" },
  { id: "BUS-021", permitNo: "BP-2025-0021", businessName: "Matnog Vulcanizing & Tire Shop", tradeName: "MV Tires", owner: "Alfredo G. Bautista", barangay: "Sta. Elena", address: "Sta. Elena Highway", lineOfBusiness: "Services", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 610000, employees: 4, area: 85, lastInspection: "2025-07-04" },
  { id: "BUS-022", permitNo: "BP-2025-0022", businessName: "Sorsogon Bay Seafood Restaurant", tradeName: "Sorsogon Bay Resto", owner: "Maricel T. Ong", barangay: "Poblacion", address: "Baywalk, Poblacion", lineOfBusiness: "Food Service", businessType: "Sole Proprietorship", status: "Suspended", riskLevel: "High", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 2820000, employees: 16, area: 150, lastInspection: "2025-09-19" },
  { id: "BUS-023", permitNo: "BP-2025-0023", businessName: "RollOn Motorcycle Parts", tradeName: "RollOn Moto", owner: "Dennis L. Padilla", barangay: "Bago", address: "Bago Highway", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 990000, employees: 5, area: 74, lastInspection: "2025-02-14" },
  { id: "BUS-024", permitNo: "BP-2025-0024", businessName: "Matnog Printing Press", tradeName: "QuickPrint Matnog", owner: "Luzviminda R. Salazar", barangay: "Poblacion", address: "Municipal Road, Poblacion", lineOfBusiness: "Services", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 840000, employees: 6, area: 62, lastInspection: "2025-08-01" },
  { id: "BUS-025", permitNo: "BP-2025-0025", businessName: "Bicol Express Courier", tradeName: "BE Courier", owner: "Raul N. Dimaculangan", barangay: "Camachile", address: "Camachile Terminal Arcade", lineOfBusiness: "Transportation", businessType: "Corporation", status: "Active", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 2460000, employees: 14, area: 96, lastInspection: "2025-08-20" },
  { id: "BUS-026", permitNo: "BP-2025-0026", businessName: "Matnog Livestock Feeds", tradeName: "MLF Feeds", owner: "Norberto C. Espiritu", barangay: "Calayuan", address: "Calayuan Farm Road", lineOfBusiness: "Agriculture & Fishery", businessType: "Sole Proprietorship", status: "For Renewal", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 1810000, employees: 8, area: 132, lastInspection: "2025-05-11" },
  { id: "BUS-027", permitNo: "BP-2025-0027", businessName: "Casa Matnog Pension House", tradeName: "Casa Matnog Inn", owner: "Felicidad M. Gutierrez", barangay: "Poblacion", address: "Ticao Road, Poblacion", lineOfBusiness: "Accommodation", businessType: "Partnership", status: "With Deficiency", riskLevel: "High", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 6380000, employees: 22, area: 420, lastInspection: "2025-09-12" },
  { id: "BUS-028", permitNo: "BP-2025-0028", businessName: "SM Gadget Hub", tradeName: "SM Gadgets", owner: "Kevin B. Sy", barangay: "Poblacion", address: "Commercial Lane, Poblacion", lineOfBusiness: "Retail Trade", businessType: "OPC", status: "Closed", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-06-30", grossSales: 1210000, employees: 5, area: 52, lastInspection: "2025-06-18" },
  { id: "BUS-029", permitNo: "BP-2025-0029", businessName: "Matnog Welding & Fabrication", tradeName: "MW Fabrication", owner: "Armando T. dela Cruz", barangay: "Sta. Elena", address: "Sta. Elena Industrial Road", lineOfBusiness: "Manufacturing", businessType: "Sole Proprietorship", status: "Active", riskLevel: "Medium", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 1080000, employees: 7, area: 115, lastInspection: "2025-04-29" },
  { id: "BUS-030", permitNo: "BP-2025-0030", businessName: "Tindahan ni Aling Nena", tradeName: "Aling Nena Store", owner: "Nena F. Hernandez", barangay: "Bago", address: "Zone 3, Bago", lineOfBusiness: "Retail Trade", businessType: "Sole Proprietorship", status: "For Renewal", riskLevel: "Low", lastPermitYear: "2025", expiryDate: "2025-12-31", grossSales: 275000, employees: 2, area: 24, lastInspection: "2025-03-07" },
];

const BARANGAYS = ["Poblacion", "Bago", "Camachile", "Sta. Elena", "Calayuan", "Balocawe"];
const LINES = ["Retail Trade", "Wholesale Trade", "Food Service", "Services", "Agriculture & Fishery", "Transportation", "Manufacturing", "Pharmaceutical", "Construction", "Accommodation"];

const columns = ["permitNo", "business", "owner", "barangay", "lineOfBusiness", "status", "riskLevel", "expiryDate", "grossSales", "employees", "actions"] as const;
type Column = (typeof columns)[number];
type SortKey = "permitNo" | "businessName" | "owner" | "barangay" | "lineOfBusiness" | "status" | "riskLevel" | "expiryDate" | "grossSales" | "employees";

const labels: Record<Column, string> = {
  permitNo: "Permit No.",
  business: "Business",
  owner: "Owner",
  barangay: "Barangay",
  lineOfBusiness: "Line of Business",
  status: "Status",
  riskLevel: "Risk",
  expiryDate: "Expiry",
  grossSales: "Gross Sales",
  employees: "Employees",
  actions: "",
};

const sortable: Partial<Record<Column, SortKey>> = {
  permitNo: "permitNo",
  business: "businessName",
  owner: "owner",
  barangay: "barangay",
  lineOfBusiness: "lineOfBusiness",
  status: "status",
  riskLevel: "riskLevel",
  expiryDate: "expiryDate",
  grossSales: "grossSales",
  employees: "employees",
};

const fixed = new Set<Column>(["business", "actions"]);
const defaultHidden = new Set<Column>(["employees"]);
const PAGE_SIZE = 12;

function statusClass(status: Business["status"]) {
  if (status === "Active") return styles.success;
  if (status === "For Renewal" || status === "With Deficiency") return styles.warning;
  if (status === "Expired" || status === "Suspended" || status === "Closed") return styles.danger;
  return styles.info;
}

function riskClass(risk: Business["riskLevel"]) {
  if (risk === "Low") return styles.success;
  if (risk === "Medium") return styles.warning;
  return styles.danger;
}

function formatCurrency(value: number) {
  return "PHP " + value.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function BusinessesPage() {
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [lineFilter, setLineFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [moreOpen, setMoreOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("businessName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState<Set<Column>>(() => {
    const initial = new Set(columns as readonly Column[]);
    for (const column of defaultHidden) initial.delete(column);
    return initial;
  });

  const advancedCount = [barangayFilter !== "all", lineFilter !== "all", yearFilter !== "all"].filter(Boolean).length;

  const filtered = useMemo(() => {
    let list = BUSINESSES;
    if (deferred) {
      const q = deferred.toLowerCase();
      list = list.filter((business) =>
        [
          business.permitNo,
          business.businessName,
          business.tradeName,
          business.owner,
          business.barangay,
          business.lineOfBusiness,
          business.address,
        ].some((value) => value.toLowerCase().includes(q)),
      );
    }
    if (statusFilter !== "all") list = list.filter((business) => business.status === statusFilter);
    if (riskFilter !== "all") list = list.filter((business) => business.riskLevel === riskFilter);
    if (barangayFilter !== "all") list = list.filter((business) => business.barangay === barangayFilter);
    if (lineFilter !== "all") list = list.filter((business) => business.lineOfBusiness === lineFilter);
    if (yearFilter !== "all") list = list.filter((business) => business.lastPermitYear === yearFilter);
    return list;
  }, [deferred, statusFilter, riskFilter, barangayFilter, lineFilter, yearFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const activeCount = BUSINESSES.filter((business) => business.status === "Active").length;
  const renewalCount = BUSINESSES.filter((business) => business.status === "For Renewal").length;
  const highRiskCount = BUSINESSES.filter((business) => business.riskLevel === "High").length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const toggleColumn = (column: Column) => {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });
  };

  const clearAdvanced = () => {
    setBarangayFilter("all");
    setLineFilter("all");
    setYearFilter("all");
    setPage(0);
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Business Registry</h1>
            <p>Masterlist of registered businesses in Matnog with permit status, classification, renewal standing, and compliance risk.</p>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href="/applications/new">
              <Plus size={15} /> Register Business
            </Link>
            <Link className={styles.btnSecondary} href="/applications/renewals">
              <RefreshCw size={15} /> Renew Business
            </Link>
            <button className={styles.btnSecondary} type="button">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.resultsMeta}>
            <span><strong>{BUSINESSES.length}</strong> registry records</span>
            <span><strong>{activeCount}</strong> active | <strong>{renewalCount}</strong> for renewal | <strong>{highRiskCount}</strong> high risk</span>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search permit no., business, owner, barangay, address..."
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(0); }}
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="For Renewal">For Renewal</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="With Deficiency">With Deficiency</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={(value) => { setRiskFilter(value); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risks</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>

            <button className={`${styles.secondaryButton} ${styles.filterButton}`} type="button" onClick={() => setMoreOpen((open) => !open)}>
              <Filter size={14} />
              More Filters
              {advancedCount > 0 && <span className={styles.filterCount}>{advancedCount}</span>}
            </button>

            <div className={styles.columnsMenu}>
              <button className={styles.secondaryButton} type="button" onClick={() => setColumnsOpen((open) => !open)}>
                <Columns3 size={14} /> Columns
              </button>
              {columnsOpen && (
                <div className={styles.columnsPopover}>
                  {columns.filter((column) => !fixed.has(column)).map((column) => (
                    <label key={column}>
                      <input type="checkbox" checked={visible.has(column)} onChange={() => toggleColumn(column)} />
                      {labels[column]}
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
                  <Select value={barangayFilter} onValueChange={(value) => { setBarangayFilter(value); setPage(0); }}>
                    <SelectTrigger className={styles.compactSelect}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All barangays</SelectItem>
                      {BARANGAYS.map((barangay) => <SelectItem key={barangay} value={barangay}>{barangay}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.field}>
                  <span>Line of Business</span>
                  <Select value={lineFilter} onValueChange={(value) => { setLineFilter(value); setPage(0); }}>
                    <SelectTrigger className={styles.compactSelect}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {LINES.map((line) => <SelectItem key={line} value={line}>{line}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.field}>
                  <span>Permit Year</span>
                  <Select value={yearFilter} onValueChange={(value) => { setYearFilter(value); setPage(0); }}>
                    <SelectTrigger className={styles.compactSelect}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All years</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className={styles.resultsMeta}>
            <span>Showing <strong>{pageData.length}</strong> of <strong>{sorted.length}</strong> businesses</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.filter((column) => visible.has(column)).map((column) => {
                    const key = sortable[column];
                    return (
                      <th key={column}>
                        {key ? (
                          <button className={styles.sortButton} type="button" onClick={() => handleSort(key)}>
                            {labels[column]}
                            <ChevronsUpDown size={13} />
                          </button>
                        ) : labels[column]}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageData.map((business) => (
                  <tr key={business.id}>
                    {visible.has("permitNo") && <td className={styles.mono}>{business.permitNo}</td>}
                    {visible.has("business") && (
                      <td>
                        <div className={styles.nameCell}>
                          <strong>{business.businessName}</strong>
                          <small>{business.tradeName} | {business.businessType}</small>
                        </div>
                      </td>
                    )}
                    {visible.has("owner") && <td>{business.owner}</td>}
                    {visible.has("barangay") && <td>{business.barangay}</td>}
                    {visible.has("lineOfBusiness") && <td>{business.lineOfBusiness}</td>}
                    {visible.has("status") && (
                      <td><span className={`${styles.badge} ${statusClass(business.status)}`}>{business.status}</span></td>
                    )}
                    {visible.has("riskLevel") && (
                      <td><span className={`${styles.badge} ${riskClass(business.riskLevel)}`}>{business.riskLevel}</span></td>
                    )}
                    {visible.has("expiryDate") && <td className={styles.mono}>{formatDate(business.expiryDate)}</td>}
                    {visible.has("grossSales") && <td className={styles.mono}>{formatCurrency(business.grossSales)}</td>}
                    {visible.has("employees") && <td className={styles.mono}>{business.employees}</td>}
                    {visible.has("actions") && (
                      <td>
                        <div className={styles.rowActions}>
                          <button className={styles.actionBtn} type="button" title="More actions" onClick={() => setOpenActionId(openActionId === business.id ? null : business.id)}>
                            <MoreHorizontal size={16} />
                          </button>
                          {openActionId === business.id && (
                            <div className={styles.actionMenu}>
                              <Link href={`/businesses/${business.id}`} onClick={() => setOpenActionId(null)}>
                                <Eye size={14} /> View Profile
                              </Link>
                              <Link href={`/businesses/${business.id}/edit`} onClick={() => setOpenActionId(null)}>
                                <FilePenLine size={14} /> Edit Registry
                              </Link>
                              <Link href={`/applications/renewals?businessId=${business.id}`} onClick={() => setOpenActionId(null)}>
                                <RefreshCw size={14} /> Start Renewal
                              </Link>
                              <Link href={`/businesses/${business.id}/permits`} onClick={() => setOpenActionId(null)}>
                                <FileText size={14} /> Permit History
                              </Link>
                              <Link href={`/businesses/${business.id}/compliance`} onClick={() => setOpenActionId(null)}>
                                <ShieldCheck size={14} /> Compliance
                              </Link>
                              <Link href={`/businesses/${business.id}/map`} onClick={() => setOpenActionId(null)}>
                                <MapPinned size={14} /> Map Location
                              </Link>
                              <div className={styles.actionDivider} />
                              <button type="button" className={styles.actionDanger} onClick={() => setOpenActionId(null)}>
                                <Trash2 size={14} /> Archive
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
            <span>Page {page + 1} of {totalPages}</span>
            <button className={styles.pageBtn} type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeft size={15} />
            </button>
            <button className={styles.pageBtn} type="button" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
