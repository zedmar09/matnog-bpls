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
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "../permits.module.css";

type IssuedPermit = {
  id: string;
  permitNumber: string;
  permitId: string;
  businessName: string;
  tradeName: string;
  owner: string;
  address: string;
  permitType: "Mayor's Permit" | "Business Permit" | "Special Permit";
  dateIssued: string;
  validFrom: string;
  validUntil: string;
  status: "Active" | "Expired" | "Revoked" | "Suspended";
  amount: string;
};

const DUMMY: IssuedPermit[] = [
  { id: "1", permitNumber: "MP-2025-0005", permitId: "BP-2025-0009", businessName: "Matnog Rice Trading", tradeName: "MRT Rice", owner: "Lourdes B. Villanueva", address: "Poblacion, Matnog", permitType: "Mayor's Permit", dateIssued: "2025-03-18", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱9,800.00" },
  { id: "2", permitNumber: "MP-2025-0006", permitId: "BP-2025-0012", businessName: "Matnog Fishing Supplies", tradeName: "Fisher's Choice", owner: "Ricardo P. Santos", address: "Brgy. Calintaan, Matnog", permitType: "Mayor's Permit", dateIssued: "2025-03-12", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱7,200.00" },
  { id: "3", permitNumber: "MP-2025-0007", permitId: "BP-2025-0020", businessName: "Matnog Bakery & Snack House", tradeName: "Pan de Matnog", owner: "Carmen S. Diaz", address: "Brgy. Rizal, Matnog", permitType: "Mayor's Permit", dateIssued: "2025-03-08", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱5,650.00" },
  { id: "4", permitNumber: "MP-2025-0008", permitId: "BP-2025-0002", businessName: "Sorsogon Strait Shipping Co.", tradeName: "SS Shipping", owner: "Fernando A. Mendoza", address: "Port Area, Matnog", permitType: "Mayor's Permit", dateIssued: "2025-03-20", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱35,000.00" },
  { id: "5", permitNumber: "MP-2024-0012", permitId: "BP-2024-0012", businessName: "Matnog General Merchandise", tradeName: "MGM Store", owner: "Eduardo T. Lim", address: "Poblacion, Matnog", permitType: "Mayor's Permit", dateIssued: "2024-02-15", validFrom: "2024-01-01", validUntil: "2024-12-31", status: "Expired", amount: "₱11,400.00" },
  { id: "6", permitNumber: "MP-2024-0018", permitId: "BP-2024-0018", businessName: "Bicol Express Eatery", tradeName: "Bicol Express", owner: "Josefina M. Reyes", address: "Brgy. Sta. Magdalena, Matnog", permitType: "Mayor's Permit", dateIssued: "2024-03-05", validFrom: "2024-01-01", validUntil: "2024-12-31", status: "Expired", amount: "₱6,800.00" },
  { id: "7", permitNumber: "SP-2024-0003", permitId: "BP-2024-0025", businessName: "Matnog Beach Resort", tradeName: "Subic Beach Resort", owner: "Patricia L. Tan", address: "Brgy. Subic, Matnog", permitType: "Special Permit", dateIssued: "2024-04-10", validFrom: "2024-01-01", validUntil: "2024-12-31", status: "Expired", amount: "₱25,000.00" },
  { id: "8", permitNumber: "MP-2025-0009", permitId: "BP-2025-0030", businessName: "Matnog Agri-Supply Center", tradeName: "Agri-Supply", owner: "Armando G. Bautista", address: "Brgy. Bolo, Matnog", permitType: "Mayor's Permit", dateIssued: "2025-03-25", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱8,900.00" },
  { id: "9", permitNumber: "BP-2025-0004", permitId: "BP-2025-0031", businessName: "Matnog Printing Press", tradeName: "QuickPrint", owner: "Nelson C. Ramos", address: "Poblacion, Matnog", permitType: "Business Permit", dateIssued: "2025-03-28", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱4,500.00" },
  { id: "10", permitNumber: "MP-2024-0005", permitId: "BP-2024-0005", businessName: "Matnog Vulcanizing Shop", tradeName: "Quick Tire Fix", owner: "Reynaldo S. Cruz", address: "Brgy. Rizal, Matnog", permitType: "Mayor's Permit", dateIssued: "2024-02-20", validFrom: "2024-01-01", validUntil: "2024-12-31", status: "Revoked", amount: "₱3,200.00" },
  { id: "11", permitNumber: "MP-2025-0010", permitId: "BP-2025-0033", businessName: "Matnog Cellphone Accessories", tradeName: "TechMobile", owner: "Grace P. Enriquez", address: "Poblacion, Matnog", permitType: "Mayor's Permit", dateIssued: "2025-04-01", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱3,800.00" },
  { id: "12", permitNumber: "SP-2025-0003", permitId: "BP-2025-0035", businessName: "Matnog Dive Shop", tradeName: "Deep Blue Diving", owner: "Miguel R. Torres", address: "Brgy. Calintaan, Matnog", permitType: "Special Permit", dateIssued: "2025-04-05", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱15,600.00" },
  { id: "13", permitNumber: "MP-2024-0022", permitId: "BP-2024-0022", businessName: "Matnog Videoke Bar", tradeName: "StarLight KTV", owner: "Roberto N. Gonzales", address: "Brgy. Sta. Magdalena, Matnog", permitType: "Mayor's Permit", dateIssued: "2024-03-15", validFrom: "2024-01-01", validUntil: "2024-12-31", status: "Suspended", amount: "₱8,500.00" },
  { id: "14", permitNumber: "MP-2025-0011", permitId: "BP-2025-0036", businessName: "Matnog Lumber & Construction", tradeName: "BuildRight Lumber", owner: "Antonio V. Dela Cruz", address: "Brgy. Bolo, Matnog", permitType: "Mayor's Permit", dateIssued: "2025-04-08", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱18,200.00" },
  { id: "15", permitNumber: "MP-2025-0012", permitId: "BP-2025-0038", businessName: "Matnog Veterinary Clinic", tradeName: "PetCare Vet", owner: "Dr. Marilyn B. Santos", address: "Poblacion, Matnog", permitType: "Mayor's Permit", dateIssued: "2025-04-10", validFrom: "2025-01-01", validUntil: "2025-12-31", status: "Active", amount: "₱7,600.00" },
];

function statusClass(s: IssuedPermit["status"]) {
  if (s === "Active") return styles.success;
  if (s === "Expired") return styles.warning;
  if (s === "Revoked") return styles.danger;
  if (s === "Suspended") return styles.danger;
  return "";
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

type Tab = "all" | "active" | "expired" | "revoked";

const PAGE_SIZE = 10;

export default function IssuedPermitsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [tab, setTab] = useState<Tab>("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = DUMMY;
    if (tab === "active") list = list.filter((p) => p.status === "Active");
    else if (tab === "expired") list = list.filter((p) => p.status === "Expired");
    else if (tab === "revoked") list = list.filter((p) => p.status === "Revoked" || p.status === "Suspended");
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
    if (yearFilter !== "all") list = list.filter((p) => p.dateIssued.startsWith(yearFilter));
    return list;
  }, [search, typeFilter, yearFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const counts = {
    all: DUMMY.length,
    active: DUMMY.filter((p) => p.status === "Active").length,
    expired: DUMMY.filter((p) => p.status === "Expired").length,
    revoked: DUMMY.filter((p) => p.status === "Revoked" || p.status === "Suspended").length,
  };

  const previewItem = previewId ? DUMMY.find((p) => p.id === previewId) : null;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Issued Permits</h1>
            <p>Complete registry of all business permits issued by the municipality.</p>
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
              <span className={styles.summaryLabel}><FileText size={14} /> Total Issued</span>
              <span className={styles.summaryValue}>{counts.all}</span>
              <span className={styles.summaryMeta}>All issued permits</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><CheckCircle2 size={14} /> Active</span>
              <span className={styles.summaryValue}>{counts.active}</span>
              <span className={styles.summaryMeta}>Currently valid</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Clock size={14} /> Expired</span>
              <span className={styles.summaryValue}>{counts.expired}</span>
              <span className={styles.summaryMeta}>Past validity period</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><XCircle size={14} /> Revoked / Suspended</span>
              <span className={styles.summaryValue}>{counts.revoked}</span>
              <span className={styles.summaryMeta}>Enforcement action</span>
            </div>
          </div>

          <div className={styles.tabBar}>
            {([["all", "All"], ["active", "Active"], ["expired", "Expired"], ["revoked", "Revoked"]] as [Tab, string][]).map(([key, label]) => (
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

            <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
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
                  <th>Address</th>
                  <th>Permit Type</th>
                  <th>Issued</th>
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
                    <td>{p.address}</td>
                    <td>{p.permitType}</td>
                    <td className={styles.mono}>{formatDate(p.dateIssued)}</td>
                    <td className={styles.mono}>{formatDate(p.validUntil)}</td>
                    <td className={styles.mono}>{p.amount}</td>
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
                            {p.status === "Expired" && (
                              <>
                                <div className={styles.actionDivider} />
                                <button type="button" className={styles.actionSuccess} onClick={() => setOpenActionId(null)}>
                                  <RefreshCw size={14} /> Initiate Renewal
                                </button>
                              </>
                            )}
                            {p.status === "Active" && (
                              <>
                                <div className={styles.actionDivider} />
                                <button type="button" className={styles.actionDanger} onClick={() => setOpenActionId(null)}>
                                  <XCircle size={14} /> Revoke
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
                  <dt>Business Address</dt>
                  <dd>{previewItem.address}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Date Issued</dt>
                  <dd>{formatDate(previewItem.dateIssued)}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Valid From</dt>
                  <dd>{formatDate(previewItem.validFrom)}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Valid Until</dt>
                  <dd>{formatDate(previewItem.validUntil)}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Amount Paid</dt>
                  <dd>{previewItem.amount}</dd>
                </div>
                <div className={styles.permitField}>
                  <dt>Status</dt>
                  <dd><span className={`${styles.badge} ${statusClass(previewItem.status)}`}>{previewItem.status}</span></dd>
                </div>
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
