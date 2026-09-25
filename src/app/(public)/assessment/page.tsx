"use client";

import { useMemo, useState } from "react";

import {
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  Filter,
  Landmark,
  ReceiptText,
  Save,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

import tableStyles from "../applications/applications.module.css";
import styles from "./assessment.module.css";

type AssessmentStatus = "For Assessment" | "Draft" | "Recompute" | "Ready for SOA" | "Sent to Treasury";
type AssessmentRecord = {
  id: string;
  applicationNo: string;
  businessName: string;
  owner: string;
  type: "New" | "Renewal" | "Amendment";
  barangay: string;
  lineOfBusiness: string;
  grossSales: number;
  capital: number;
  area: number;
  employees: number;
  risk: "Low" | "Medium" | "High";
  assessor: string;
  status: AssessmentStatus;
  filed: string;
};

type FeeRow = {
  name: string;
  basis: string;
  amount: number;
  adjustable?: boolean;
};

const QUEUE: AssessmentRecord[] = [
  { id: "ASM-001", applicationNo: "APP-2026-00318", businessName: "Matnog Fisheries Corp.", owner: "Juan D. Cruz", type: "Renewal", barangay: "Poblacion", lineOfBusiness: "Agriculture & Fishery", grossSales: 3860000, capital: 1250000, area: 310, employees: 24, risk: "Medium", assessor: "M. Dela Cruz", status: "For Assessment", filed: "2026-01-08" },
  { id: "ASM-002", applicationNo: "APP-2026-00319", businessName: "Sorsogon Rice Trading", owner: "Maria S. Santos", type: "Renewal", barangay: "Bago", lineOfBusiness: "Wholesale Trade", grossSales: 1320000, capital: 480000, area: 84, employees: 6, risk: "Low", assessor: "A. Reyes", status: "Draft", filed: "2026-01-08" },
  { id: "ASM-003", applicationNo: "APP-2026-00320", businessName: "Matnog Pharmacy Inc.", owner: "Dr. Carlos V. Tan", type: "Renewal", barangay: "Poblacion", lineOfBusiness: "Pharmaceutical", grossSales: 3715000, capital: 950000, area: 72, employees: 9, risk: "High", assessor: "M. Dela Cruz", status: "Recompute", filed: "2026-01-09" },
  { id: "ASM-004", applicationNo: "APP-2026-00321", businessName: "Southern Hardware Supply", owner: "Roberto M. Lim", type: "New", barangay: "Sta. Elena", lineOfBusiness: "Retail Trade", grossSales: 0, capital: 2140000, area: 190, employees: 11, risk: "Medium", assessor: "J. Rivera", status: "For Assessment", filed: "2026-01-10" },
  { id: "ASM-005", applicationNo: "APP-2026-00322", businessName: "Bicol Eatery & Catering", owner: "Lorna T. Mendoza", type: "Renewal", barangay: "Calayuan", lineOfBusiness: "Food Service", grossSales: 730000, capital: 260000, area: 64, employees: 5, risk: "Medium", assessor: "A. Reyes", status: "Ready for SOA", filed: "2026-01-10" },
  { id: "ASM-006", applicationNo: "APP-2026-00323", businessName: "Ticao Strait Cargo Forwarding", owner: "Ernesto R. Baluyot", type: "Amendment", barangay: "Camachile", lineOfBusiness: "Transportation", grossSales: 5980000, capital: 1800000, area: 280, employees: 20, risk: "Medium", assessor: "J. Rivera", status: "For Assessment", filed: "2026-01-11" },
  { id: "ASM-007", applicationNo: "APP-2026-00324", businessName: "Sorsogon Bay Seafood Restaurant", owner: "Maricel T. Ong", type: "Renewal", barangay: "Poblacion", lineOfBusiness: "Food Service", grossSales: 2820000, capital: 920000, area: 150, employees: 16, risk: "High", assessor: "M. Dela Cruz", status: "Recompute", filed: "2026-01-11" },
  { id: "ASM-008", applicationNo: "APP-2026-00325", businessName: "Tindahan ni Aling Nena", owner: "Nena F. Hernandez", type: "Renewal", barangay: "Bago", lineOfBusiness: "Retail Trade", grossSales: 275000, capital: 90000, area: 24, employees: 2, risk: "Low", assessor: "A. Reyes", status: "Sent to Treasury", filed: "2026-01-12" },
  { id: "ASM-009", applicationNo: "APP-2026-00326", businessName: "Casa Matnog Pension House", owner: "Felicidad M. Gutierrez", type: "Renewal", barangay: "Poblacion", lineOfBusiness: "Accommodation", grossSales: 6380000, capital: 2500000, area: 420, employees: 22, risk: "High", assessor: "J. Rivera", status: "For Assessment", filed: "2026-01-12" },
  { id: "ASM-010", applicationNo: "APP-2026-00327", businessName: "Matnog Welding & Fabrication", owner: "Armando T. dela Cruz", type: "Amendment", barangay: "Sta. Elena", lineOfBusiness: "Manufacturing", grossSales: 1080000, capital: 530000, area: 115, employees: 7, risk: "Medium", assessor: "M. Dela Cruz", status: "Draft", filed: "2026-01-13" },
];

function currency(value: number) {
  return "PHP " + value.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function statusClass(status: AssessmentStatus) {
  if (status === "Ready for SOA" || status === "Sent to Treasury") return tableStyles.success;
  if (status === "Draft") return tableStyles.info;
  if (status === "Recompute") return tableStyles.warning;
  return "";
}

function computeFees(record: AssessmentRecord): FeeRow[] {
  const base = record.type === "New" ? record.capital : record.grossSales;
  const businessRate = record.lineOfBusiness.includes("Pharmaceutical") ? 0.008
    : record.lineOfBusiness.includes("Food") ? 0.0065
    : record.lineOfBusiness.includes("Transportation") ? 0.007
    : record.lineOfBusiness.includes("Accommodation") ? 0.009
    : 0.0055;
  const riskFee = record.risk === "High" ? 1500 : record.risk === "Medium" ? 750 : 250;

  return [
    { name: "Business Tax", basis: `${record.type === "New" ? "Capital" : "Gross sales"} x ${(businessRate * 100).toFixed(2)}%`, amount: Math.max(1200, base * businessRate) },
    { name: "Mayor's Permit Fee", basis: "Base permit fee by business type", amount: record.type === "New" ? 2500 : 2000 },
    { name: "Sanitary Permit Fee", basis: `${record.employees} employee(s) + line of business`, amount: 350 + record.employees * 45 + (record.lineOfBusiness.includes("Food") ? 800 : 0) },
    { name: "Zoning Clearance Fee", basis: `${record.area} sq.m. declared area`, amount: 300 + record.area * 4 },
    { name: "Fire Inspection Fee", basis: `${record.risk} risk profile`, amount: 900 + riskFee },
    { name: "Garbage / Environmental Fee", basis: "Barangay collection class", amount: record.barangay === "Poblacion" ? 900 : 650 },
    { name: "Regulatory Fee", basis: "LGU regulatory charge", amount: 1200 },
    { name: "Signboard / Sticker Fee", basis: "Annual sticker and signage", amount: 350, adjustable: true },
    { name: "Occupational Permit Fee", basis: `${record.employees} employee(s) x PHP 120`, amount: record.employees * 120 },
  ];
}

export default function AssessmentPage() {
  const [selectedId, setSelectedId] = useState(QUEUE[0].id);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [manualFee, setManualFee] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [surcharge, setSurcharge] = useState("0");
  const [remarks, setRemarks] = useState("Computed using dummy Matnog LGU ordinance rules for UI review.");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return QUEUE.filter((item) => {
      const matchesSearch = !q || [item.applicationNo, item.businessName, item.owner, item.barangay, item.lineOfBusiness].some((value) => value.toLowerCase().includes(q));
      const matchesStatus = status === "all" || item.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const selected = QUEUE.find((item) => item.id === selectedId) ?? QUEUE[0];
  const fees = computeFees(selected);
  const subtotal = fees.reduce((sum, row) => sum + row.amount, 0);
  const manual = Number(manualFee) || 0;
  const discountAmount = Number(discount) || 0;
  const surchargeAmount = Number(surcharge) || 0;
  const total = Math.max(0, subtotal + manual + surchargeAmount - discountAmount);

  return (
    <div className={tableStyles.page}>
      <div className={tableStyles.hero}>
        <div className={tableStyles.heroInner}>
          <div>
            <h1>Assessment Fee Computation</h1>
            <p>Compute business permit fees using dummy LGU ordinance rules, manual assessor adjustments, and SOA-ready summaries.</p>
          </div>
          <div className={tableStyles.heroActions}>
            <button className={tableStyles.btnPrimary} type="button"><FileSpreadsheet size={15} /> Generate SOA</button>
            <button className={tableStyles.btnSecondary} type="button"><Download size={15} /> Export</button>
          </div>
        </div>
      </div>

      <div className={tableStyles.body}>
        <div className={styles.workspace}>
          <section className={styles.queueCard}>
            <div className={styles.panelHeader}>
              <div>
                <h3>Assessment Queue</h3>
                <p>{filtered.length} application records ready for computation or recomputation.</p>
              </div>
              <Filter size={16} />
            </div>
            <div className={tableStyles.toolbar}>
              <div className={tableStyles.searchBox}>
                <Search size={15} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search application, business, owner..." />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className={tableStyles.compactSelect}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="For Assessment">For Assessment</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Recompute">Recompute</SelectItem>
                  <SelectItem value="Ready for SOA">Ready for SOA</SelectItem>
                  <SelectItem value="Sent to Treasury">Sent to Treasury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={styles.queueList}>
              {filtered.map((item) => (
                <button
                  className={`${styles.queueItem} ${item.id === selected.id ? styles.queueItemActive : ""}`}
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className={styles.queueTop}>
                    <span className={styles.queueName}>
                      <strong>{item.businessName}</strong>
                      <span>{item.applicationNo} | {item.owner}</span>
                    </span>
                    <span className={`${tableStyles.badge} ${statusClass(item.status)}`}>{item.status}</span>
                  </div>
                  <div className={styles.queueMeta}>
                    <span>{item.type}</span>
                    <span>{item.barangay}</span>
                    <span>{item.lineOfBusiness}</span>
                    <span>{item.assessor}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.computeCard}>
            <div className={styles.panelHeader}>
              <div>
                <h3>Computation Detail</h3>
                <p>Selected record fee breakdown and assessor adjustments.</p>
              </div>
              <Calculator size={17} />
            </div>
            <div className={styles.computeBody}>
              <div className={styles.businessStrip}>
                <div>
                  <h2>{selected.businessName}</h2>
                  <p>{selected.applicationNo} | {selected.type} | {selected.owner} | {selected.barangay}</p>
                </div>
                <span className={`${tableStyles.badge} ${selected.risk === "High" ? tableStyles.danger : selected.risk === "Medium" ? tableStyles.warning : tableStyles.success}`}>{selected.risk} risk</span>
              </div>

              <div className={styles.miniStats}>
                <article><span>Gross sales</span><strong>{currency(selected.grossSales)}</strong></article>
                <article><span>Capital</span><strong>{currency(selected.capital)}</strong></article>
                <article><span>Area</span><strong>{selected.area} sq.m.</strong></article>
                <article><span>Employees</span><strong>{selected.employees}</strong></article>
              </div>

              <section className={styles.summaryCard}>
                <div className={styles.panelHeader}>
                  <div>
                    <h3>Fee Breakdown</h3>
                    <p>Dummy computation based on business type, receipts/capital, area, employees, and risk.</p>
                  </div>
                </div>
                <table className={styles.feeTable}>
                  <thead>
                    <tr>
                      <th>Fee</th>
                      <th>Basis</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((row) => (
                      <tr key={row.name}>
                        <td><span className={styles.feeName}><strong>{row.name}</strong>{row.adjustable ? <small>Assessor adjustable</small> : null}</span></td>
                        <td>{row.basis}</td>
                        <td className={styles.amount}>{currency(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className={styles.summaryCard}>
                <div className={styles.panelHeader}>
                  <div>
                    <h3>Adjustments</h3>
                    <p>Manual assessor values for exceptional fees, discounts, penalties, or notes.</p>
                  </div>
                </div>
                <div className={styles.computeBody}>
                  <div className={styles.adjustmentGrid}>
                    <label className={styles.field}><span>Manual fee</span><input type="number" value={manualFee} onChange={(event) => setManualFee(event.target.value)} /></label>
                    <label className={styles.field}><span>Discount / waiver</span><input type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>
                    <label className={styles.field}><span>Surcharge / penalty</span><input type="number" value={surcharge} onChange={(event) => setSurcharge(event.target.value)} /></label>
                  </div>
                  <label className={styles.field}><span>Assessment remarks</span><textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} /></label>
                </div>
              </section>

              <section className={styles.summaryCard}>
                <div className={styles.panelHeader}>
                  <div>
                    <h3>Assessment Summary</h3>
                    <p>SOA-ready totals for Treasury handoff.</p>
                  </div>
                  <ReceiptText size={17} />
                </div>
                <div className={styles.computeBody}>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryRow}><span>Computed subtotal</span><strong>{currency(subtotal)}</strong></div>
                    <div className={styles.summaryRow}><span>Manual fee</span><strong>{currency(manual)}</strong></div>
                    <div className={styles.summaryRow}><span>Surcharge / penalty</span><strong>{currency(surchargeAmount)}</strong></div>
                    <div className={styles.summaryRow}><span>Discount / waiver</span><strong>-{currency(discountAmount)}</strong></div>
                    <div className={styles.summaryTotal}><span>Total Due</span><strong>{currency(total)}</strong></div>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button className={tableStyles.secondaryButton} type="button"><Save size={14} /> Save Draft</button>
                  <button className={tableStyles.secondaryButton} type="button"><Landmark size={14} /> Send to Treasury</button>
                  <button className={tableStyles.btnPrimary} type="button"><Send size={14} /> Generate SOA</button>
                </div>
              </section>

              <section className={styles.summaryCard}>
                <div className={styles.panelHeader}>
                  <div>
                    <h3>Audit Notes</h3>
                    <p>Assessment activity trail for accountability.</p>
                  </div>
                  <ShieldCheck size={17} />
                </div>
                <div className={styles.computeBody}>
                  <div className={styles.queueMeta}>
                    <span><CircleDollarSign size={13} /> Rule set: Matnog BPLS dummy ordinance v1</span>
                    <span><ChevronRight size={13} /> Assessor: {selected.assessor}</span>
                    <span><ChevronRight size={13} /> Filed: {selected.filed}</span>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
