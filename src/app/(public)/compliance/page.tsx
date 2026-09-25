"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Flag,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "./compliance.module.css";

type ComplianceRecord = {
  id: string;
  permitNumber: string;
  businessName: string;
  tradeName: string;
  owner: string;
  address: string;
  barangay: string;
  permitExpiry: string;
  lastInspection: string | null;
  nextInspection: string | null;
  complianceStatus: "Compliant" | "Non-Compliant" | "Under Review" | "Expired Permit" | "Suspended";
  violations: number;
  riskLevel: "High" | "Medium" | "Low";
  issues: string[];
};

const DUMMY: ComplianceRecord[] = [
  { id: "1", permitNumber: "MP-2025-0005", businessName: "Matnog Rice Trading", tradeName: "MRT Rice", owner: "Lourdes B. Villanueva", address: "Poblacion", barangay: "Poblacion", permitExpiry: "2025-12-31", lastInspection: "2025-03-20", nextInspection: "2025-09-20", complianceStatus: "Compliant", violations: 0, riskLevel: "Low", issues: [] },
  { id: "2", permitNumber: "MP-2025-0008", businessName: "Sorsogon Strait Shipping Co.", tradeName: "SS Shipping", owner: "Fernando A. Mendoza", address: "Port Area", barangay: "Calintaan", permitExpiry: "2025-12-31", lastInspection: "2025-03-25", nextInspection: "2025-06-25", complianceStatus: "Compliant", violations: 0, riskLevel: "Low", issues: [] },
  { id: "3", permitNumber: "MP-2025-0007", businessName: "Matnog Bakery & Snack House", tradeName: "Pan de Matnog", owner: "Carmen S. Diaz", address: "Market St.", barangay: "Rizal", permitExpiry: "2025-12-31", lastInspection: "2025-04-05", nextInspection: "2025-10-05", complianceStatus: "Non-Compliant", violations: 2, riskLevel: "High", issues: ["Expired food handling certificate", "Kitchen ventilation insufficient"] },
  { id: "4", permitNumber: "MP-2025-0011", businessName: "Matnog Lumber & Construction", tradeName: "BuildRight Lumber", owner: "Antonio V. Dela Cruz", address: "National Highway", barangay: "Bolo", permitExpiry: "2025-12-31", lastInspection: "2025-04-10", nextInspection: "2025-07-10", complianceStatus: "Compliant", violations: 0, riskLevel: "Low", issues: [] },
  { id: "5", permitNumber: "MP-2025-0006", businessName: "Matnog Fishing Supplies", tradeName: "Fisher's Choice", owner: "Ricardo P. Santos", address: "Port Road", barangay: "Calintaan", permitExpiry: "2025-12-31", lastInspection: "2025-03-15", nextInspection: "2025-09-15", complianceStatus: "Compliant", violations: 0, riskLevel: "Low", issues: [] },
  { id: "6", permitNumber: "MP-2024-0012", businessName: "Matnog General Merchandise", tradeName: "MGM Store", owner: "Eduardo T. Lim", address: "Poblacion", barangay: "Poblacion", permitExpiry: "2024-12-31", lastInspection: "2024-06-10", nextInspection: null, complianceStatus: "Expired Permit", violations: 1, riskLevel: "High", issues: ["Operating with expired permit since Jan 2025"] },
  { id: "7", permitNumber: "MP-2024-0018", businessName: "Bicol Express Eatery", tradeName: "Bicol Express", owner: "Josefina M. Reyes", address: "Quezon St.", barangay: "Sta. Magdalena", permitExpiry: "2024-12-31", lastInspection: "2024-08-15", nextInspection: null, complianceStatus: "Expired Permit", violations: 1, riskLevel: "High", issues: ["Operating with expired permit since Jan 2025"] },
  { id: "8", permitNumber: "MP-2025-0009", businessName: "Matnog Agri-Supply Center", tradeName: "Agri-Supply", owner: "Armando G. Bautista", address: "National Highway", barangay: "Bolo", permitExpiry: "2025-12-31", lastInspection: "2025-04-01", nextInspection: "2025-10-01", complianceStatus: "Under Review", violations: 1, riskLevel: "Medium", issues: ["Pesticide storage compliance check pending"] },
  { id: "9", permitNumber: "MP-2025-0010", businessName: "Matnog Cellphone Accessories", tradeName: "TechMobile", owner: "Grace P. Enriquez", address: "Bonifacio St.", barangay: "Poblacion", permitExpiry: "2025-12-31", lastInspection: "2025-04-08", nextInspection: "2025-10-08", complianceStatus: "Compliant", violations: 0, riskLevel: "Low", issues: [] },
  { id: "10", permitNumber: "MP-2024-0005", businessName: "Matnog Vulcanizing Shop", tradeName: "Quick Tire Fix", owner: "Reynaldo S. Cruz", address: "Rizal", barangay: "Rizal", permitExpiry: "2024-12-31", lastInspection: "2024-05-20", nextInspection: null, complianceStatus: "Suspended", violations: 3, riskLevel: "High", issues: ["Permit revoked", "Environmental hazard — improper tire disposal", "Operating without fire safety clearance"] },
  { id: "11", permitNumber: "MP-2025-0012", businessName: "Matnog Veterinary Clinic", tradeName: "PetCare Vet", owner: "Dr. Marilyn B. Santos", address: "Mabini St.", barangay: "Poblacion", permitExpiry: "2025-12-31", lastInspection: "2025-04-12", nextInspection: "2025-10-12", complianceStatus: "Compliant", violations: 0, riskLevel: "Low", issues: [] },
  { id: "12", permitNumber: "MP-2024-0022", businessName: "Matnog Videoke Bar", tradeName: "StarLight KTV", owner: "Roberto N. Gonzales", address: "Sta. Magdalena", barangay: "Sta. Magdalena", permitExpiry: "2024-12-31", lastInspection: "2024-07-10", nextInspection: null, complianceStatus: "Suspended", violations: 2, riskLevel: "High", issues: ["Noise ordinance violation", "Operating past curfew hours"] },
  { id: "13", permitNumber: "MP-2025-0013", businessName: "Matnog Pharmacy Plus", tradeName: "PharmPlus", owner: "Dr. Helena C. Tan", address: "Luna St.", barangay: "Poblacion", permitExpiry: "2025-12-31", lastInspection: "2025-04-15", nextInspection: "2025-07-15", complianceStatus: "Under Review", violations: 0, riskLevel: "Medium", issues: ["Awaiting FDA compliance verification"] },
  { id: "14", permitNumber: "MP-2025-0014", businessName: "Matnog Hardware & Electrical", tradeName: "Spark Hardware", owner: "Roberto V. Gonzales", address: "National Highway", barangay: "Rizal", permitExpiry: "2025-12-31", lastInspection: "2025-04-18", nextInspection: "2025-10-18", complianceStatus: "Compliant", violations: 0, riskLevel: "Low", issues: [] },
  { id: "15", permitNumber: "MP-2025-0017", businessName: "Matnog Piggery Farm", tradeName: "MPF Livestock", owner: "Benjamin S. Torres", address: "Brgy. Bolo", barangay: "Bolo", permitExpiry: "2025-12-31", lastInspection: "2025-04-06", nextInspection: "2025-05-06", complianceStatus: "Non-Compliant", violations: 2, riskLevel: "High", issues: ["Waste management plan inadequate", "Drainage system needs improvement"] },
];

function statusClass(s: ComplianceRecord["complianceStatus"]) {
  if (s === "Compliant") return styles.success;
  if (s === "Non-Compliant") return styles.danger;
  if (s === "Under Review") return styles.info;
  if (s === "Expired Permit") return styles.warning;
  if (s === "Suspended") return styles.danger;
  return "";
}

function riskClass(r: ComplianceRecord["riskLevel"]) {
  if (r === "High") return styles.priorityHigh;
  if (r === "Medium") return styles.priorityMedium;
  return styles.priorityLow;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

type Tab = "all" | "compliant" | "noncompliant" | "expired" | "suspended";

const PAGE_SIZE = 10;

export default function CompliancePage() {
  const [search, setSearch] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [tab, setTab] = useState<Tab>("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = DUMMY;
    if (tab === "compliant") list = list.filter((c) => c.complianceStatus === "Compliant");
    else if (tab === "noncompliant") list = list.filter((c) => c.complianceStatus === "Non-Compliant" || c.complianceStatus === "Under Review");
    else if (tab === "expired") list = list.filter((c) => c.complianceStatus === "Expired Permit");
    else if (tab === "suspended") list = list.filter((c) => c.complianceStatus === "Suspended");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.businessName.toLowerCase().includes(q) ||
          c.owner.toLowerCase().includes(q) ||
          c.permitNumber.toLowerCase().includes(q)
      );
    }
    if (barangayFilter !== "all") list = list.filter((c) => c.barangay === barangayFilter);
    if (riskFilter !== "all") list = list.filter((c) => c.riskLevel === riskFilter);
    return list;
  }, [search, barangayFilter, riskFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const counts = {
    all: DUMMY.length,
    compliant: DUMMY.filter((c) => c.complianceStatus === "Compliant").length,
    noncompliant: DUMMY.filter((c) => c.complianceStatus === "Non-Compliant" || c.complianceStatus === "Under Review").length,
    expired: DUMMY.filter((c) => c.complianceStatus === "Expired Permit").length,
    suspended: DUMMY.filter((c) => c.complianceStatus === "Suspended").length,
  };

  const totalViolations = DUMMY.reduce((sum, c) => sum + c.violations, 0);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Compliance Monitoring</h1>
            <p>Monitor business compliance status, violations, and enforcement actions across the municipality.</p>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.btnSecondary} type="button">
              <Download size={15} /> Export Report
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.summaryStrip}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><ShieldCheck size={14} /> Compliant</span>
              <span className={styles.summaryValue}>{counts.compliant}</span>
              <span className={styles.summaryMeta}>In good standing</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><AlertTriangle size={14} /> Non-Compliant</span>
              <span className={styles.summaryValue}>{counts.noncompliant}</span>
              <span className={styles.summaryMeta}>With violations or under review</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Clock size={14} /> Expired Permits</span>
              <span className={styles.summaryValue}>{counts.expired}</span>
              <span className={styles.summaryMeta}>Overdue for renewal</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Flag size={14} /> Total Violations</span>
              <span className={styles.summaryValue}>{totalViolations}</span>
              <span className={styles.summaryMeta}>Active violations on record</span>
            </div>
          </div>

          <div className={styles.tabBar}>
            {([["all", "All"], ["compliant", "Compliant"], ["noncompliant", "Non-Compliant"], ["expired", "Expired"], ["suspended", "Suspended"]] as [Tab, string][]).map(([key, label]) => (
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
                placeholder="Search by business, owner, or permit..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>

            <Select value={barangayFilter} onValueChange={(v) => { setBarangayFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All barangays</SelectItem>
                <SelectItem value="Poblacion">Poblacion</SelectItem>
                <SelectItem value="Calintaan">Calintaan</SelectItem>
                <SelectItem value="Rizal">Rizal</SelectItem>
                <SelectItem value="Bolo">Bolo</SelectItem>
                <SelectItem value="Sta. Magdalena">Sta. Magdalena</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risk levels</SelectItem>
                <SelectItem value="High">High risk</SelectItem>
                <SelectItem value="Medium">Medium risk</SelectItem>
                <SelectItem value="Low">Low risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.resultsMeta}>
            Showing <strong>{pageData.length}</strong> of <strong>{filtered.length}</strong> businesses
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Permit No.</th>
                  <th>Business</th>
                  <th>Barangay</th>
                  <th>Permit Expiry</th>
                  <th>Last Inspection</th>
                  <th>Risk</th>
                  <th>Violations</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageData.map((c) => (
                  <tr key={c.id}>
                    <td className={styles.mono}>{c.permitNumber}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <strong>{c.businessName}</strong>
                        <small>{c.owner}</small>
                      </div>
                    </td>
                    <td>{c.barangay}</td>
                    <td className={styles.mono}>{formatDate(c.permitExpiry)}</td>
                    <td className={styles.mono}>{c.lastInspection ? formatDate(c.lastInspection) : "—"}</td>
                    <td>
                      <span>
                        <span className={`${styles.priorityDot} ${riskClass(c.riskLevel)}`} />
                        {c.riskLevel}
                      </span>
                    </td>
                    <td className={styles.mono}>{c.violations > 0 ? c.violations : "—"}</td>
                    <td><span className={`${styles.badge} ${statusClass(c.complianceStatus)}`}>{c.complianceStatus}</span></td>
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
                            <button type="button" onClick={() => setOpenActionId(null)}>
                              <FileText size={14} /> View Compliance History
                            </button>
                            {c.complianceStatus !== "Compliant" && (
                              <button type="button" onClick={() => setOpenActionId(null)}>
                                <Send size={14} /> Send Notice
                              </button>
                            )}
                            {c.complianceStatus === "Expired Permit" && (
                              <button type="button" className={styles.actionSuccess} onClick={() => setOpenActionId(null)}>
                                <CheckCircle2 size={14} /> Initiate Renewal
                              </button>
                            )}
                            {(c.complianceStatus === "Non-Compliant" || c.complianceStatus === "Under Review") && (
                              <>
                                <button type="button" className={styles.actionSuccess} onClick={() => setOpenActionId(null)}>
                                  <CheckCircle2 size={14} /> Mark Compliant
                                </button>
                                <div className={styles.actionDivider} />
                                <button type="button" className={styles.actionDanger} onClick={() => setOpenActionId(null)}>
                                  <Ban size={14} /> Suspend Permit
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
