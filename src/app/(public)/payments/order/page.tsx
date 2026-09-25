"use client";

import { useState } from "react";

import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Printer,
  Search,
} from "lucide-react";

import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "../payments.module.css";

type OrderOfPayment = {
  id: string;
  opNumber: string;
  permitId: string;
  businessName: string;
  tradeName: string;
  assessedBy: string;
  dateIssued: string;
  dueDate: string;
  totalAmount: number;
  status: "Unpaid" | "Paid" | "Overdue" | "Cancelled";
  items: Array<{ fee: string; amount: number }>;
};

const DUMMY: OrderOfPayment[] = [
  { id: "1", opNumber: "OP-2025-0001", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", assessedBy: "Maria Santos", dateIssued: "2025-03-28", dueDate: "2025-04-28", totalAmount: 15000, status: "Unpaid", items: [{ fee: "Business Tax", amount: 6500 }, { fee: "Mayor's Permit", amount: 3500 }, { fee: "Regulatory Fee", amount: 2000 }, { fee: "Sanitary Permit", amount: 800 }, { fee: "Fire Inspection", amount: 1200 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 900 }] },
  { id: "2", opNumber: "OP-2025-0002", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", assessedBy: "Pedro Garcia", dateIssued: "2025-04-02", dueDate: "2025-05-02", totalAmount: 22000, status: "Unpaid", items: [{ fee: "Business Tax", amount: 10000 }, { fee: "Mayor's Permit", amount: 5000 }, { fee: "Regulatory Fee", amount: 3000 }, { fee: "Sanitary Permit", amount: 1500 }, { fee: "Fire Inspection", amount: 1500 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 900 }] },
  { id: "3", opNumber: "OP-2025-0003", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", tradeName: "Sunshine Bakery", assessedBy: "Maria Santos", dateIssued: "2025-04-05", dueDate: "2025-05-05", totalAmount: 3800, status: "Unpaid", items: [{ fee: "Business Tax", amount: 1200 }, { fee: "Mayor's Permit", amount: 1000 }, { fee: "Sanitary Permit", amount: 500 }, { fee: "Fire Inspection", amount: 500 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 500 }] },
  { id: "4", opNumber: "OP-2025-0004", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", tradeName: "Ticao Cargo", assessedBy: "Pedro Garcia", dateIssued: "2025-04-08", dueDate: "2025-05-08", totalAmount: 25000, status: "Unpaid", items: [{ fee: "Business Tax", amount: 12000 }, { fee: "Mayor's Permit", amount: 5500 }, { fee: "Regulatory Fee", amount: 3500 }, { fee: "Zoning Fee", amount: 1000 }, { fee: "Fire Inspection", amount: 1500 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 1400 }] },
  { id: "5", opNumber: "OP-2025-0005", permitId: "BP-2025-0017", businessName: "Matnog Piggery Farm", tradeName: "MPF Livestock", assessedBy: "Maria Santos", dateIssued: "2025-04-10", dueDate: "2025-05-10", totalAmount: 8900, status: "Unpaid", items: [{ fee: "Business Tax", amount: 3500 }, { fee: "Mayor's Permit", amount: 2000 }, { fee: "Regulatory Fee", amount: 1200 }, { fee: "Sanitary Permit", amount: 800 }, { fee: "Fire Inspection", amount: 800 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 500 }] },
  { id: "6", opNumber: "OP-2025-0006", permitId: "BP-2025-0001", businessName: "Matnog Fisheries Corp.", tradeName: "Matnog Fish Market", assessedBy: "Pedro Garcia", dateIssued: "2025-01-18", dueDate: "2025-02-18", totalAmount: 12500, status: "Paid", items: [{ fee: "Business Tax", amount: 4800 }, { fee: "Mayor's Permit", amount: 2500 }, { fee: "Regulatory Fee", amount: 1200 }, { fee: "Sanitary Permit", amount: 500 }, { fee: "Fire Inspection", amount: 1000 }, { fee: "Garbage Fee", amount: 600 }, { fee: "Occupational Permit", amount: 600 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 900 }, { fee: "Zoning Fee", amount: 300 }] },
  { id: "7", opNumber: "OP-2025-0007", permitId: "BP-2025-0002", businessName: "Sorsogon Rice Trading", tradeName: "SR Trading", assessedBy: "Maria Santos", dateIssued: "2025-01-22", dueDate: "2025-02-22", totalAmount: 8750, status: "Paid", items: [{ fee: "Business Tax", amount: 3500 }, { fee: "Mayor's Permit", amount: 2000 }, { fee: "Regulatory Fee", amount: 1200 }, { fee: "Sanitary Permit", amount: 500 }, { fee: "Fire Inspection", amount: 800 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 650 }] },
  { id: "8", opNumber: "OP-2025-0008", permitId: "BP-2025-0006", businessName: "Bicol Eatery & Catering", tradeName: "Bicol Eatery", assessedBy: "Pedro Garcia", dateIssued: "2025-01-25", dueDate: "2025-02-25", totalAmount: 4500, status: "Paid", items: [{ fee: "Business Tax", amount: 1500 }, { fee: "Mayor's Permit", amount: 1200 }, { fee: "Sanitary Permit", amount: 600 }, { fee: "Fire Inspection", amount: 500 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 600 }] },
  { id: "9", opNumber: "OP-2025-0009", permitId: "BP-2025-0010", businessName: "Matnog Auto Repair Shop", tradeName: "MAR Auto", assessedBy: "Maria Santos", dateIssued: "2025-02-01", dueDate: "2025-03-01", totalAmount: 5600, status: "Overdue", items: [{ fee: "Business Tax", amount: 2000 }, { fee: "Mayor's Permit", amount: 1500 }, { fee: "Regulatory Fee", amount: 800 }, { fee: "Fire Inspection", amount: 600 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 600 }] },
  { id: "10", opNumber: "OP-2025-0010", permitId: "BP-2025-0005", businessName: "Southern Hardware Supply", tradeName: "Southern Hardware", assessedBy: "Pedro Garcia", dateIssued: "2025-02-05", dueDate: "2025-03-05", totalAmount: 6800, status: "Overdue", items: [{ fee: "Business Tax", amount: 2500 }, { fee: "Mayor's Permit", amount: 1800 }, { fee: "Regulatory Fee", amount: 1000 }, { fee: "Fire Inspection", amount: 700 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 700 }] },
  { id: "11", opNumber: "OP-2025-0011", permitId: "BP-2025-0015", businessName: "Bicolana Beauty Parlor", tradeName: "Bicolana Salon", assessedBy: "Maria Santos", dateIssued: "2025-03-15", dueDate: "2025-04-15", totalAmount: 2400, status: "Overdue", items: [{ fee: "Business Tax", amount: 800 }, { fee: "Mayor's Permit", amount: 700 }, { fee: "Sanitary Permit", amount: 300 }, { fee: "Fire Inspection", amount: 300 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 200 }] },
  { id: "12", opNumber: "OP-2025-0012", permitId: "BP-2025-0008", businessName: "Pacific Internet Cafe", tradeName: "Pacific Net", assessedBy: "Pedro Garcia", dateIssued: "2025-01-10", dueDate: "2025-02-10", totalAmount: 2800, status: "Cancelled", items: [{ fee: "Business Tax", amount: 1000 }, { fee: "Mayor's Permit", amount: 800 }, { fee: "Regulatory Fee", amount: 400 }, { fee: "Fire Inspection", amount: 300 }, { fee: "Sticker Fee", amount: 100 }, { fee: "Community Tax", amount: 200 }] },
];

const fmt = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
};

function statusClass(status: OrderOfPayment["status"]) {
  if (status === "Paid") return styles.success;
  if (status === "Unpaid") return styles.warning;
  if (status === "Overdue") return styles.danger;
  if (status === "Cancelled") return "";
  return "";
}

type SortKey = "opNumber" | "businessName" | "dateIssued" | "totalAmount";

const PAGE_SIZE = 10;

export default function OrderOfPaymentPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOP, setSelectedOP] = useState<OrderOfPayment | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("dateIssued");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const filtered = DUMMY.filter((op) => {
    if (statusFilter !== "all" && op.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        op.opNumber.toLowerCase().includes(q) ||
        op.permitId.toLowerCase().includes(q) ||
        op.businessName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

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

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Order of Payment</h1>
            <p>Manage assessment orders and track payment status for business permit fees.</p>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href="/payments/order/new">
              <FileText size={15} /> Generate Order
            </Link>
            <button className={styles.btnSecondary} type="button">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {selectedOP ? (
          <div className={styles.opCard}>
            <div className={styles.opHeader}>
              <h3>Order of Payment — {selectedOP.opNumber}</h3>
              <button className={styles.secondaryButton} type="button" onClick={() => setSelectedOP(null)}>
                Back to list
              </button>
            </div>
            <div className={styles.opBody}>
              <div className={styles.opGrid}>
                <div className={styles.opField}>
                  <span>OP Number</span>
                  <strong>{selectedOP.opNumber}</strong>
                </div>
                <div className={styles.opField}>
                  <span>Permit ID</span>
                  <strong>{selectedOP.permitId}</strong>
                </div>
                <div className={styles.opField}>
                  <span>Business Name</span>
                  <strong>{selectedOP.businessName}</strong>
                </div>
                <div className={styles.opField}>
                  <span>Trade Name</span>
                  <strong>{selectedOP.tradeName}</strong>
                </div>
                <div className={styles.opField}>
                  <span>Date Issued</span>
                  <strong>{formatDate(selectedOP.dateIssued)}</strong>
                </div>
                <div className={styles.opField}>
                  <span>Due Date</span>
                  <strong>{formatDate(selectedOP.dueDate)}</strong>
                </div>
                <div className={styles.opField}>
                  <span>Assessed By</span>
                  <strong>{selectedOP.assessedBy}</strong>
                </div>
                <div className={styles.opField}>
                  <span>Status</span>
                  <strong><span className={`${styles.badge} ${statusClass(selectedOP.status)}`}>{selectedOP.status}</span></strong>
                </div>
              </div>

              <table className={styles.opTable}>
                <thead>
                  <tr>
                    <th>Fee / Charge</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOP.items.map((item) => (
                    <tr key={item.fee}>
                      <td>{item.fee}</td>
                      <td style={{ textAlign: "right" }}>{fmt(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total Amount Due</td>
                    <td style={{ textAlign: "right" }}>{fmt(selectedOP.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className={styles.opFooter}>
              <button className={styles.opPrintButton} type="button">
                <Printer size={14} /> Print Order
              </button>
              <button className={styles.opOutlineButton} type="button">
                <Banknote size={14} /> Record Payment
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.card}>
            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search by OP number, permit ID, or business..."
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
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.resultsMeta}>
              <span>
                Showing <strong>{pageData.length}</strong> of <strong>{sorted.length}</strong> orders
              </span>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <button className={styles.sortButton} type="button" onClick={() => handleSort("opNumber")}>
                        OP Number <ChevronsUpDown size={13} />
                      </button>
                    </th>
                    <th>Permit ID</th>
                    <th>
                      <button className={styles.sortButton} type="button" onClick={() => handleSort("businessName")}>
                        Business <ChevronsUpDown size={13} />
                      </button>
                    </th>
                    <th>Assessed By</th>
                    <th>
                      <button className={styles.sortButton} type="button" onClick={() => handleSort("dateIssued")}>
                        Date Issued <ChevronsUpDown size={13} />
                      </button>
                    </th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>
                      <button className={styles.sortButton} type="button" onClick={() => handleSort("totalAmount")}>
                        Amount <ChevronsUpDown size={13} />
                      </button>
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((op) => (
                    <tr key={op.id}>
                      <td className={styles.mono}>{op.opNumber}</td>
                      <td className={styles.mono}>{op.permitId}</td>
                      <td>
                        <div className={styles.nameCell}>
                          <strong>{op.businessName}</strong>
                          <small>{op.tradeName}</small>
                        </div>
                      </td>
                      <td>{op.assessedBy}</td>
                      <td className={styles.mono}>{formatDate(op.dateIssued)}</td>
                      <td className={styles.mono}>{formatDate(op.dueDate)}</td>
                      <td><span className={`${styles.badge} ${statusClass(op.status)}`}>{op.status}</span></td>
                      <td className={styles.amount}>{fmt(op.totalAmount)}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.actionBtn}
                            type="button"
                            title="More actions"
                            onClick={() => setOpenActionId(openActionId === op.id ? null : op.id)}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openActionId === op.id && (
                            <div className={styles.actionMenu}>
                              <button type="button" onClick={() => { setSelectedOP(op); setOpenActionId(null); }}>
                                <Eye size={14} /> View Details
                              </button>
                              <button type="button" onClick={() => setOpenActionId(null)}>
                                <Printer size={14} /> Print Order
                              </button>
                              <Link href={`/applications/${op.id}`} onClick={() => setOpenActionId(null)}>
                                <FileText size={14} /> View Application
                              </Link>
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
        )}
      </div>
    </div>
  );
}
