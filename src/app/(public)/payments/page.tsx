"use client";

import { useDeferredValue, useMemo, useState } from "react";

import Link from "next/link";

import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  Download,
  Eye,
  MoreHorizontal,
  Printer,
  Receipt,
  Search,
  XCircle,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import styles from "./payments.module.css";

type Payment = {
  id: string;
  orNumber: string;
  permitId: string;
  businessName: string;
  tradeName: string;
  payerName: string;
  paymentDate: string;
  amount: number;
  method: "Cash" | "Check" | "Bank Transfer" | "GCash" | "Maya";
  status: "Completed" | "Pending" | "Voided" | "Partial";
  collectedBy: string;
};

const DUMMY: Payment[] = [
  { id: "1", orNumber: "OR-2025-001234", permitId: "BP-2025-0001", businessName: "Matnog Fisheries Corp.", tradeName: "Matnog Fish Market", payerName: "Juan D. Cruz", paymentDate: "2025-02-10", amount: 12500, method: "Cash", status: "Completed", collectedBy: "Maria Santos" },
  { id: "2", orNumber: "OR-2025-001235", permitId: "BP-2025-0002", businessName: "Sorsogon Rice Trading", tradeName: "SR Trading", payerName: "Maria S. Santos", paymentDate: "2025-02-12", amount: 8750, method: "Check", status: "Completed", collectedBy: "Pedro Garcia" },
  { id: "3", orNumber: "OR-2025-001236", permitId: "BP-2025-0006", businessName: "Bicol Eatery & Catering", tradeName: "Bicol Eatery", payerName: "Lorna T. Mendoza", paymentDate: "2025-02-15", amount: 4500, method: "GCash", status: "Completed", collectedBy: "Maria Santos" },
  { id: "4", orNumber: "OR-2025-001237", permitId: "BP-2025-0009", businessName: "Green Agri Supplies", tradeName: "Green Farm Supply", payerName: "Elena B. Villanueva", paymentDate: "2025-02-18", amount: 9400, method: "Cash", status: "Completed", collectedBy: "Pedro Garcia" },
  { id: "5", orNumber: "OR-2025-001238", permitId: "BP-2025-0012", businessName: "Matnog Water Refilling Station", tradeName: "AquaPure", payerName: "Joel P. Aquino", paymentDate: "2025-02-22", amount: 7200, method: "Bank Transfer", status: "Completed", collectedBy: "Maria Santos" },
  { id: "6", orNumber: "OR-2025-001239", permitId: "BP-2025-0013", businessName: "Del Rosario General Merchandise", tradeName: "DRM Store", payerName: "Conchita D. Rosario", paymentDate: "2025-03-01", amount: 11200, method: "Cash", status: "Completed", collectedBy: "Pedro Garcia" },
  { id: "7", orNumber: "OR-2025-001240", permitId: "BP-2025-0014", businessName: "Matnog Copra Buying Station", tradeName: "MCB Station", payerName: "Ricardo E. Magsino", paymentDate: "2025-03-05", amount: 18500, method: "Check", status: "Completed", collectedBy: "Maria Santos" },
  { id: "8", orNumber: "OR-2025-001241", permitId: "BP-2025-0018", businessName: "JMR Construction Supply", tradeName: "JMR Builders", payerName: "Jose M. Rivera", paymentDate: "2025-03-10", amount: 16700, method: "Cash", status: "Completed", collectedBy: "Pedro Garcia" },
  { id: "9", orNumber: "OR-2025-001242", permitId: "BP-2025-0021", businessName: "Matnog Vulcanizing & Tire Shop", tradeName: "MV Tires", payerName: "Alfredo G. Bautista", paymentDate: "2025-03-15", amount: 4100, method: "Maya", status: "Completed", collectedBy: "Maria Santos" },
  { id: "10", orNumber: "OR-2025-001243", permitId: "BP-2025-0024", businessName: "Matnog Printing Press", tradeName: "QuickPrint Matnog", payerName: "Luzviminda R. Salazar", paymentDate: "2025-03-18", amount: 6200, method: "Cash", status: "Completed", collectedBy: "Pedro Garcia" },
  { id: "11", orNumber: "OR-2025-001244", permitId: "BP-2025-0025", businessName: "Bicol Express Courier", tradeName: "BE Courier", payerName: "Raul N. Dimaculangan", paymentDate: "2025-03-22", amount: 9800, method: "Bank Transfer", status: "Completed", collectedBy: "Maria Santos" },
  { id: "12", orNumber: "OR-2025-001245", permitId: "BP-2025-0030", businessName: "Tindahan ni Aling Nena", tradeName: "Aling Nena Store", payerName: "Nena F. Hernandez", paymentDate: "2025-03-25", amount: 1500, method: "Cash", status: "Completed", collectedBy: "Pedro Garcia" },
  { id: "13", orNumber: "OR-2025-001246", permitId: "BP-2025-0020", businessName: "Sampaguita Flower Shop", tradeName: "Sampaguita Blooms", payerName: "Carmen A. Lacuesta", paymentDate: "2025-04-01", amount: 1800, method: "GCash", status: "Completed", collectedBy: "Maria Santos" },
  { id: "14", orNumber: "OR-2025-001247", permitId: "BP-2025-0029", businessName: "Matnog Welding & Fabrication", tradeName: "MW Fabrication", payerName: "Armando T. dela Cruz", paymentDate: "2025-04-05", amount: 5500, method: "Cash", status: "Completed", collectedBy: "Pedro Garcia" },
  { id: "15", orNumber: "OR-2025-001248", permitId: "BP-2025-0004", businessName: "Matnog Transport Services", tradeName: "MTS Logistics", payerName: "Ana R. Reyes", paymentDate: "2025-04-10", amount: 7500, method: "Check", status: "Partial", collectedBy: "Maria Santos" },
  { id: "16", orNumber: "OR-2025-001249", permitId: "BP-2025-0016", businessName: "Ticao Strait Cargo Forwarding", tradeName: "Ticao Cargo", payerName: "Ernesto R. Baluyot", paymentDate: "2025-04-14", amount: 12500, method: "Bank Transfer", status: "Partial", collectedBy: "Pedro Garcia" },
  { id: "17", orNumber: "OR-2025-001250", permitId: "BP-2025-0007", businessName: "Matnog Pharmacy Inc.", tradeName: "HealthPlus Pharmacy", payerName: "Dr. Carlos V. Tan", paymentDate: "2025-04-18", amount: 22000, method: "Check", status: "Pending", collectedBy: "Maria Santos" },
  { id: "18", orNumber: "OR-2025-001251", permitId: "BP-2025-0011", businessName: "Sunshine Bakeshop", tradeName: "Sunshine Bakery", payerName: "Rosa M. Flores", paymentDate: "2025-04-22", amount: 3800, method: "Cash", status: "Pending", collectedBy: "Pedro Garcia" },
  { id: "19", orNumber: "OR-2025-001252", permitId: "BP-2025-0017", businessName: "Matnog Piggery Farm", tradeName: "MPF Livestock", payerName: "Benjamin S. Torres", paymentDate: "2025-04-25", amount: 8900, method: "Cash", status: "Pending", collectedBy: "Maria Santos" },
  { id: "20", orNumber: "OR-2025-001253", permitId: "BP-2025-0008", businessName: "Pacific Internet Cafe", tradeName: "Pacific Net", payerName: "Mark A. Fernandez", paymentDate: "2025-01-20", amount: 2800, method: "Cash", status: "Voided", collectedBy: "Pedro Garcia" },
];

const fmt = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
};

function statusClass(status: Payment["status"]) {
  if (status === "Completed") return styles.success;
  if (status === "Pending") return styles.warning;
  if (status === "Voided") return styles.danger;
  if (status === "Partial") return styles.info;
  return "";
}

type SortKey = "orNumber" | "businessName" | "paymentDate" | "amount";

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("paymentDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = DUMMY;
    if (deferred) {
      const q = deferred.toLowerCase();
      list = list.filter(
        (p) =>
          p.orNumber.toLowerCase().includes(q) ||
          p.permitId.toLowerCase().includes(q) ||
          p.businessName.toLowerCase().includes(q) ||
          p.payerName.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (methodFilter !== "all") list = list.filter((p) => p.method === methodFilter);
    return list;
  }, [deferred, statusFilter, methodFilter]);

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

  const totalCollected = DUMMY.filter((p) => p.status === "Completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = DUMMY.filter((p) => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = DUMMY.length;
  const completedCount = DUMMY.filter((p) => p.status === "Completed").length;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Payment Records</h1>
            <p>Track and manage business permit payment transactions and official receipts.</p>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} href="/payments/new">
              <Receipt size={15} /> New Payment
            </Link>
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
              <span className={styles.summaryLabel}><Banknote size={14} /> Total Collected</span>
              <span className={styles.summaryValue}>{fmt(totalCollected)}</span>
              <span className={styles.summaryMeta}>{completedCount} completed payments</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Clock size={14} /> Pending Amount</span>
              <span className={styles.summaryValue}>{fmt(pendingAmount)}</span>
              <span className={styles.summaryMeta}>{DUMMY.filter((p) => p.status === "Pending").length} awaiting payment</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Receipt size={14} /> Total Transactions</span>
              <span className={styles.summaryValue}>{totalTransactions}</span>
              <span className={styles.summaryMeta}>All payment records</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}><Check size={14} /> Collection Rate</span>
              <span className={styles.summaryValue}>{Math.round((completedCount / totalTransactions) * 100)}%</span>
              <span className={styles.summaryMeta}>Of total assessments</span>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search by OR number, permit ID, business, or payer..."
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
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Voided">Voided</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(0); }}>
              <SelectTrigger className={styles.compactSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="GCash">GCash</SelectItem>
                <SelectItem value="Maya">Maya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.resultsMeta}>
            <span>
              Showing <strong>{pageData.length}</strong> of <strong>{sorted.length}</strong> records
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <button className={styles.sortButton} type="button" onClick={() => handleSort("orNumber")}>
                      OR Number <ChevronsUpDown size={13} />
                    </button>
                  </th>
                  <th>Permit ID</th>
                  <th>
                    <button className={styles.sortButton} type="button" onClick={() => handleSort("businessName")}>
                      Business <ChevronsUpDown size={13} />
                    </button>
                  </th>
                  <th>Payer</th>
                  <th>
                    <button className={styles.sortButton} type="button" onClick={() => handleSort("paymentDate")}>
                      Date <ChevronsUpDown size={13} />
                    </button>
                  </th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>
                    <button className={styles.sortButton} type="button" onClick={() => handleSort("amount")}>
                      Amount <ChevronsUpDown size={13} />
                    </button>
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageData.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.mono}>{p.orNumber}</td>
                    <td className={styles.mono}>{p.permitId}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <strong>{p.businessName}</strong>
                        <small>{p.tradeName}</small>
                      </div>
                    </td>
                    <td>{p.payerName}</td>
                    <td className={styles.mono}>{formatDate(p.paymentDate)}</td>
                    <td><span className={styles.badge}>{p.method}</span></td>
                    <td><span className={`${styles.badge} ${statusClass(p.status)}`}>{p.status}</span></td>
                    <td className={styles.amount}>{fmt(p.amount)}</td>
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
                            <Link href={`/applications/${p.id}`} onClick={() => setOpenActionId(null)}>
                              <Eye size={14} /> View Application
                            </Link>
                            <button type="button" onClick={() => setOpenActionId(null)}>
                              <Printer size={14} /> Print Receipt
                            </button>
                            <div className={styles.actionDivider} />
                            <button type="button" className={styles.actionDanger} onClick={() => setOpenActionId(null)}>
                              <XCircle size={14} /> Void Payment
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
