"use client";

import { useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Printer,
  Search,
} from "lucide-react";

import styles from "./mayors-permit.module.css";

type Business = {
  id: string;
  permitNumber: string;
  businessName: string;
  tradeName: string;
  owner: string;
  address: string;
  barangay: string;
  businessType: string;
  businessActivity: string;
  capitalInvestment: string;
  grossSales: string;
  numberOfEmployees: number;
  contactNumber: string;
  dtiSecNumber: string;
  tinNumber: string;
  dateIssued: string;
  validFrom: string;
  validUntil: string;
  orNumber: string;
  amountPaid: string;
  status: "Active" | "Expired";
};

const DUMMY: Business[] = [
  { id: "1", permitNumber: "MP-2025-0005", businessName: "Matnog Rice Trading", tradeName: "MRT Rice", owner: "Lourdes B. Villanueva", address: "123 Rizal St., Poblacion", barangay: "Poblacion", businessType: "Sole Proprietorship", businessActivity: "Rice & Grains Trading", capitalInvestment: "₱500,000.00", grossSales: "₱2,400,000.00", numberOfEmployees: 5, contactNumber: "0917-123-4567", dtiSecNumber: "DTI-05-0012345", tinNumber: "123-456-789-000", dateIssued: "2025-03-18", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000842", amountPaid: "₱9,800.00", status: "Active" },
  { id: "2", permitNumber: "MP-2025-0006", businessName: "Matnog Fishing Supplies", tradeName: "Fisher's Choice", owner: "Ricardo P. Santos", address: "45 Port Road", barangay: "Calintaan", businessType: "Sole Proprietorship", businessActivity: "Fishing Equipment & Supplies", capitalInvestment: "₱350,000.00", grossSales: "₱1,800,000.00", numberOfEmployees: 3, contactNumber: "0918-234-5678", dtiSecNumber: "DTI-05-0012346", tinNumber: "234-567-890-000", dateIssued: "2025-03-12", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000798", amountPaid: "₱7,200.00", status: "Active" },
  { id: "3", permitNumber: "MP-2025-0007", businessName: "Matnog Bakery & Snack House", tradeName: "Pan de Matnog", owner: "Carmen S. Diaz", address: "78 Market St.", barangay: "Rizal", businessType: "Sole Proprietorship", businessActivity: "Bakery & Food Products", capitalInvestment: "₱200,000.00", grossSales: "₱960,000.00", numberOfEmployees: 4, contactNumber: "0919-345-6789", dtiSecNumber: "DTI-05-0012347", tinNumber: "345-678-901-000", dateIssued: "2025-03-08", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000756", amountPaid: "₱5,650.00", status: "Active" },
  { id: "4", permitNumber: "MP-2025-0008", businessName: "Sorsogon Strait Shipping Co.", tradeName: "SS Shipping", owner: "Fernando A. Mendoza", address: "Port Terminal, Pier 1", barangay: "Calintaan", businessType: "Corporation", businessActivity: "Maritime Passenger & Cargo Transport", capitalInvestment: "₱15,000,000.00", grossSales: "₱48,000,000.00", numberOfEmployees: 85, contactNumber: "0920-456-7890", dtiSecNumber: "SEC-2019-0001234", tinNumber: "456-789-012-000", dateIssued: "2025-03-20", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000867", amountPaid: "₱35,000.00", status: "Active" },
  { id: "5", permitNumber: "MP-2025-0009", businessName: "Matnog Agri-Supply Center", tradeName: "Agri-Supply", owner: "Armando G. Bautista", address: "National Highway", barangay: "Bolo", businessType: "Sole Proprietorship", businessActivity: "Agricultural Supplies & Equipment", capitalInvestment: "₱450,000.00", grossSales: "₱1,600,000.00", numberOfEmployees: 4, contactNumber: "0921-567-8901", dtiSecNumber: "DTI-05-0012348", tinNumber: "567-890-123-000", dateIssued: "2025-03-25", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000889", amountPaid: "₱8,900.00", status: "Active" },
  { id: "6", permitNumber: "MP-2025-0010", businessName: "Matnog Cellphone Accessories", tradeName: "TechMobile", owner: "Grace P. Enriquez", address: "22 Bonifacio St.", barangay: "Poblacion", businessType: "Sole Proprietorship", businessActivity: "Cellphone Accessories & Repair", capitalInvestment: "₱150,000.00", grossSales: "₱720,000.00", numberOfEmployees: 2, contactNumber: "0922-678-9012", dtiSecNumber: "DTI-05-0012349", tinNumber: "678-901-234-000", dateIssued: "2025-04-01", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000912", amountPaid: "₱3,800.00", status: "Active" },
  { id: "7", permitNumber: "MP-2025-0011", businessName: "Matnog Lumber & Construction", tradeName: "BuildRight Lumber", owner: "Antonio V. Dela Cruz", address: "National Highway", barangay: "Bolo", businessType: "Partnership", businessActivity: "Lumber & Construction Materials", capitalInvestment: "₱2,500,000.00", grossSales: "₱8,400,000.00", numberOfEmployees: 12, contactNumber: "0923-789-0123", dtiSecNumber: "DTI-05-0012350", tinNumber: "789-012-345-000", dateIssued: "2025-04-08", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000945", amountPaid: "₱18,200.00", status: "Active" },
  { id: "8", permitNumber: "MP-2025-0012", businessName: "Matnog Veterinary Clinic", tradeName: "PetCare Vet", owner: "Dr. Marilyn B. Santos", address: "56 Mabini St.", barangay: "Poblacion", businessType: "Sole Proprietorship", businessActivity: "Veterinary Services", capitalInvestment: "₱300,000.00", grossSales: "₱1,200,000.00", numberOfEmployees: 3, contactNumber: "0924-890-1234", dtiSecNumber: "DTI-05-0012351", tinNumber: "890-123-456-000", dateIssued: "2025-04-10", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000960", amountPaid: "₱7,600.00", status: "Active" },
  { id: "9", permitNumber: "MP-2024-0012", businessName: "Matnog General Merchandise", tradeName: "MGM Store", owner: "Eduardo T. Lim", address: "Market Area, Poblacion", barangay: "Poblacion", businessType: "Sole Proprietorship", businessActivity: "General Merchandise & Retail", capitalInvestment: "₱800,000.00", grossSales: "₱3,200,000.00", numberOfEmployees: 6, contactNumber: "0925-901-2345", dtiSecNumber: "DTI-05-0012320", tinNumber: "901-234-567-000", dateIssued: "2024-02-15", validFrom: "2024-01-01", validUntil: "2024-12-31", orNumber: "OR-2024-000312", amountPaid: "₱11,400.00", status: "Expired" },
  { id: "10", permitNumber: "MP-2024-0018", businessName: "Bicol Express Eatery", tradeName: "Bicol Express", owner: "Josefina M. Reyes", address: "89 Quezon St.", barangay: "Sta. Magdalena", businessType: "Sole Proprietorship", businessActivity: "Restaurant & Food Services", capitalInvestment: "₱250,000.00", grossSales: "₱1,080,000.00", numberOfEmployees: 5, contactNumber: "0926-012-3456", dtiSecNumber: "DTI-05-0012325", tinNumber: "012-345-678-000", dateIssued: "2024-03-05", validFrom: "2024-01-01", validUntil: "2024-12-31", orNumber: "OR-2024-000445", amountPaid: "₱6,800.00", status: "Expired" },
  { id: "11", permitNumber: "MP-2025-0013", businessName: "Matnog Pharmacy Plus", tradeName: "PharmPlus", owner: "Dr. Helena C. Tan", address: "12 Luna St.", barangay: "Poblacion", businessType: "Corporation", businessActivity: "Pharmacy & Drugstore", capitalInvestment: "₱1,200,000.00", grossSales: "₱5,600,000.00", numberOfEmployees: 8, contactNumber: "0927-123-4568", dtiSecNumber: "SEC-2020-0005678", tinNumber: "111-222-333-000", dateIssued: "2025-04-12", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000978", amountPaid: "₱16,500.00", status: "Active" },
  { id: "12", permitNumber: "MP-2025-0014", businessName: "Matnog Hardware & Electrical", tradeName: "Spark Hardware", owner: "Roberto V. Gonzales", address: "National Highway", barangay: "Rizal", businessType: "Sole Proprietorship", businessActivity: "Hardware & Electrical Supplies", capitalInvestment: "₱600,000.00", grossSales: "₱2,800,000.00", numberOfEmployees: 4, contactNumber: "0928-234-5679", dtiSecNumber: "DTI-05-0012360", tinNumber: "222-333-444-000", dateIssued: "2025-04-15", validFrom: "2025-01-01", validUntil: "2025-12-31", orNumber: "OR-2025-000995", amountPaid: "₱10,200.00", status: "Active" },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });

const formatDateShort = (d: string) =>
  new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

const PAGE_SIZE = 8;

export default function MayorsPermitPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("1");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return DUMMY;
    const q = search.toLowerCase();
    return DUMMY.filter(
      (b) =>
        b.businessName.toLowerCase().includes(q) ||
        b.owner.toLowerCase().includes(q) ||
        b.permitNumber.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const selected = DUMMY.find((b) => b.id === selectedId) ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <h1>Mayor&apos;s Permit</h1>
            <p>View and print Mayor&apos;s Permit certificates for registered businesses.</p>
          </div>
          <div className={styles.heroActions}>
            <button className={styles.btnSecondary} type="button">
              <Download size={15} /> Export All
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.split}>
          {/* Left: Business list */}
          <div className={styles.listPanel}>
            <div className={styles.listHeader}>
              <h2>Businesses</h2>
              <p>{filtered.length} permits found</p>
              <div className={styles.listSearch}>
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search business or owner..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
            </div>

            <div className={styles.listBody}>
              {pageData.map((b) => (
                <div
                  key={b.id}
                  className={`${styles.listItem} ${selectedId === b.id ? styles.listItemActive : ""}`}
                  onClick={() => setSelectedId(b.id)}
                >
                  <div className={styles.listItemInfo}>
                    <strong>{b.businessName}</strong>
                    <small>{b.owner} &middot; {b.permitNumber}</small>
                  </div>
                  <span className={`${styles.listItemBadge} ${b.status === "Expired" ? styles.listItemBadgeExpired : ""}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.listFooter}>
              <span>Page {page + 1} of {totalPages}</span>
              <div className={styles.pageBtns}>
                <button className={styles.pageBtn} type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft size={14} />
                </button>
                <button className={styles.pageBtn} type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Permit certificate */}
          <div className={styles.permitPanel}>
            <div className={styles.permitToolbar}>
              <h2>{selected ? selected.permitNumber : "Select a business"}</h2>
              {selected && (
                <div className={styles.permitToolbarActions}>
                  <button className={styles.btnPrint} type="button"><Printer size={13} /> Print</button>
                  <button className={styles.btnDownload} type="button"><Download size={13} /> Download</button>
                </div>
              )}
            </div>

            {selected ? (
              <div className={styles.permitBody}>
                <div className={styles.certificate}>
                    {/* Header */}
                    <div className={styles.certHeader}>
                      <div className={styles.certLogo}>
                        <div className={styles.certSeal}>LGU<br />Matnog</div>
                        <div className={styles.certHeaderText}>
                          <p className={styles.republic}>Republic of the Philippines</p>
                          <p className={styles.province}>Province of Sorsogon</p>
                          <p className={styles.municipality}>Municipality of Matnog</p>
                          <p className={styles.office}>Office of the Municipal Mayor</p>
                        </div>
                        <div className={styles.certSeal}>BPLO<br />Seal</div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className={styles.certTitle}>
                      <h2>Mayor&apos;s Permit</h2>
                      <p>To Operate a Business / Activity Within the Municipality</p>
                    </div>

                    {/* Preamble */}
                    <p className={styles.certPreamble}>
                      This permit is hereby granted to the business establishment described below,<br />
                      subject to existing laws, ordinances, and regulations of the Municipality of Matnog.
                    </p>

                    {/* Details */}
                    <div className={styles.certBody}>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Permit Number</span>
                        <span className={styles.certValueMono}>{selected.permitNumber}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Business Name</span>
                        <span className={styles.certValue}>{selected.businessName}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Trade Name</span>
                        <span className={styles.certValue}>{selected.tradeName}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Owner / Operator</span>
                        <span className={styles.certValue}>{selected.owner}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Business Address</span>
                        <span className={styles.certValue}>{selected.address}, Brgy. {selected.barangay}, Matnog, Sorsogon</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Business Type</span>
                        <span className={styles.certValue}>{selected.businessType}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Business Activity</span>
                        <span className={styles.certValue}>{selected.businessActivity}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>DTI / SEC No.</span>
                        <span className={styles.certValueMono}>{selected.dtiSecNumber}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>TIN</span>
                        <span className={styles.certValueMono}>{selected.tinNumber}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Capital Investment</span>
                        <span className={styles.certValueMono}>{selected.capitalInvestment}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Gross Sales</span>
                        <span className={styles.certValueMono}>{selected.grossSales}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>No. of Employees</span>
                        <span className={styles.certValue}>{selected.numberOfEmployees}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>OR Number</span>
                        <span className={styles.certValueMono}>{selected.orNumber}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Amount Paid</span>
                        <span className={styles.certValueMono}>{selected.amountPaid}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Date Issued</span>
                        <span className={styles.certValue}>{formatDate(selected.dateIssued)}</span>
                      </div>
                      <div className={styles.certRow}>
                        <span className={styles.certLabel}>Validity Period</span>
                        <span className={styles.certValue}>{formatDate(selected.validFrom)} — {formatDate(selected.validUntil)}</span>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className={styles.certConditions}>
                      <h4>Conditions</h4>
                      <ol>
                        <li>This permit shall be displayed in a conspicuous place within the business establishment.</li>
                        <li>This permit is non-transferable and shall be valid only for the period stated above.</li>
                        <li>The permittee shall comply with all laws, ordinances, rules, and regulations.</li>
                        <li>This permit may be revoked for violation of any condition or applicable regulation.</li>
                      </ol>
                    </div>

                    {/* Signatures */}
                    <div className={styles.certSignatures}>
                      <div className={styles.certSignature}>
                        <div className={styles.certSignatureLine} />
                        <p className={styles.name}>Hon. Mario G. Escaño</p>
                        <p className={styles.title}>Municipal Mayor</p>
                      </div>
                      <div className={styles.certSignature}>
                        <div className={styles.certSignatureLine} />
                        <p className={styles.name}>Maria L. Santos</p>
                        <p className={styles.title}>BPLO Head</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.certFooter}>
                      <p>Municipal Hall, Poblacion, Matnog, Sorsogon 4708 &middot; Tel: (056) 123-4567</p>
                    </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <FileText size={48} />
                <h3>No permit selected</h3>
                <p>Select a business from the list to view their Mayor&apos;s Permit.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
