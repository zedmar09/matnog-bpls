export type BusinessStatus = "Active" | "For Renewal" | "Expired" | "Suspended" | "Closed" | "With Deficiency";
export type RiskLevel = "Low" | "Medium" | "High";
export type BusinessType = "Sole Proprietorship" | "Partnership" | "Corporation" | "Cooperative" | "OPC";

export type BusinessRecord = {
  id: string;
  permitNo: string;
  businessName: string;
  tradeName: string;
  owner: string;
  barangay: string;
  address: string;
  lineOfBusiness: string;
  businessType: BusinessType;
  status: BusinessStatus;
  riskLevel: RiskLevel;
  lastPermitYear: string;
  expiryDate: string;
  grossSales: number;
  employees: number;
  area: number;
  lastInspection: string;
  tin: string;
  registrationNo: string;
  contact: string;
  email: string;
  ownerAddress: string;
  capitalInvestment: number;
  remarks: string;
  latitude: string;
  longitude: string;
  documents: string[];
  permits: Array<{ year: string; permitNo: string; status: string; issued: string; expiry: string; amount: number }>;
  inspections: Array<{ office: string; date: string; result: string; notes: string }>;
  activities: Array<{ action: string; date: string; actor: string }>;
};

export type MapBusiness = {
  id: string;
  name: string;
  barangay: string;
  lineOfBusiness: string;
  status: BusinessStatus;
  latitude: number;
  longitude: number;
};

export const BUSINESS_DOCUMENTS = [
  "DTI / SEC / CDA Registration",
  "Barangay Business Clearance",
  "Community Tax Certificate",
  "Zoning Clearance",
  "Sanitary Permit",
  "Fire Safety Inspection Certificate",
  "BIR Registration",
  "Lease Contract / Land Title",
  "SSS / PhilHealth / Pag-IBIG Registration",
  "Environmental Compliance Certificate",
];

const BASE_RECORDS: BusinessRecord[] = [
  {
    id: "BUS-001",
    permitNo: "BP-2025-0001",
    businessName: "Matnog Fisheries Corp.",
    tradeName: "Matnog Fish Market",
    owner: "Juan D. Cruz",
    barangay: "Poblacion",
    address: "Fish Port Road, Poblacion, Matnog, Sorsogon",
    lineOfBusiness: "Agriculture & Fishery",
    businessType: "Corporation",
    status: "Active",
    riskLevel: "Medium",
    lastPermitYear: "2025",
    expiryDate: "2025-12-31",
    grossSales: 3860000,
    employees: 24,
    area: 310,
    lastInspection: "2025-08-14",
    tin: "123-456-789-000",
    registrationNo: "SEC-CS-2025-001234",
    contact: "0917-430-1182",
    email: "matnogfisheries@example.com",
    ownerAddress: "Rizal Street, Poblacion, Matnog",
    capitalInvestment: 1250000,
    remarks: "Cold storage and fish trading operations. For annual fire and sanitary monitoring.",
    latitude: "12.5858",
    longitude: "124.0843",
    documents: BUSINESS_DOCUMENTS.slice(0, 9),
    permits: [
      { year: "2025", permitNo: "BP-2025-0001", status: "Issued", issued: "2025-02-12", expiry: "2025-12-31", amount: 12500 },
      { year: "2024", permitNo: "BP-2024-0087", status: "Issued", issued: "2024-01-29", expiry: "2024-12-31", amount: 11800 },
      { year: "2023", permitNo: "BP-2023-0064", status: "Issued", issued: "2023-02-02", expiry: "2023-12-31", amount: 10550 },
    ],
    inspections: [
      { office: "Fire", date: "2025-08-14", result: "Passed", notes: "Extinguishers updated and exit aisle cleared." },
      { office: "Health", date: "2025-07-30", result: "For monitoring", notes: "Cold storage sanitation log required monthly." },
      { office: "Zoning", date: "2025-01-15", result: "Compliant", notes: "Use conforms with port commercial activity." },
    ],
    activities: [
      { action: "Business profile reviewed", date: "Sep 18, 2025", actor: "BPLO Staff" },
      { action: "Fire inspection encoded", date: "Aug 14, 2025", actor: "BFP Matnog" },
      { action: "2025 permit released", date: "Feb 12, 2025", actor: "Mayor's Office" },
      { action: "Assessment paid", date: "Feb 10, 2025", actor: "Treasury" },
    ],
  },
  {
    id: "BUS-002",
    permitNo: "BP-2025-0002",
    businessName: "Sorsogon Rice Trading",
    tradeName: "SR Trading",
    owner: "Maria S. Santos",
    barangay: "Bago",
    address: "Maharlika Highway, Bago, Matnog, Sorsogon",
    lineOfBusiness: "Wholesale Trade",
    businessType: "Sole Proprietorship",
    status: "For Renewal",
    riskLevel: "Low",
    lastPermitYear: "2025",
    expiryDate: "2025-12-31",
    grossSales: 1320000,
    employees: 6,
    area: 84,
    lastInspection: "2025-07-21",
    tin: "223-456-781-000",
    registrationNo: "DTI-BN-2025-01882",
    contact: "0917-882-4410",
    email: "srtrading@example.com",
    ownerAddress: "Barangay Bago, Matnog, Sorsogon",
    capitalInvestment: 480000,
    remarks: "Clean renewal candidate. No unresolved compliance flags.",
    latitude: "12.5739",
    longitude: "124.0718",
    documents: BUSINESS_DOCUMENTS.slice(0, 8),
    permits: [
      { year: "2025", permitNo: "BP-2025-0002", status: "Issued", issued: "2025-01-25", expiry: "2025-12-31", amount: 8750 },
      { year: "2024", permitNo: "BP-2024-0032", status: "Issued", issued: "2024-01-22", expiry: "2024-12-31", amount: 8200 },
    ],
    inspections: [
      { office: "Treasury", date: "2025-07-21", result: "No arrears", notes: "Ledger reconciled through Q3." },
      { office: "Zoning", date: "2025-01-18", result: "Compliant", notes: "Wholesale storage allowed." },
    ],
    activities: [
      { action: "Marked for 2026 renewal", date: "Sep 20, 2025", actor: "BPLO Staff" },
      { action: "Business registry updated", date: "Jul 21, 2025", actor: "Treasury" },
    ],
  },
  {
    id: "BUS-007",
    permitNo: "BP-2025-0007",
    businessName: "Matnog Pharmacy Inc.",
    tradeName: "HealthPlus Pharmacy",
    owner: "Dr. Carlos V. Tan",
    barangay: "Poblacion",
    address: "Rizal Street, Poblacion, Matnog, Sorsogon",
    lineOfBusiness: "Pharmaceutical",
    businessType: "Corporation",
    status: "With Deficiency",
    riskLevel: "High",
    lastPermitYear: "2025",
    expiryDate: "2025-12-31",
    grossSales: 3715000,
    employees: 9,
    area: 72,
    lastInspection: "2025-09-10",
    tin: "331-887-204-000",
    registrationNo: "SEC-CS-2021-774120",
    contact: "0918-700-3321",
    email: "healthplus.matnog@example.com",
    ownerAddress: "Sorsogon City, Sorsogon",
    capitalInvestment: 950000,
    remarks: "Pending updated sanitary clearance attachment before renewal endorsement.",
    latitude: "12.5871",
    longitude: "124.0831",
    documents: BUSINESS_DOCUMENTS.filter((doc) => doc !== "Sanitary Permit"),
    permits: [
      { year: "2025", permitNo: "BP-2025-0007", status: "Issued", issued: "2025-03-18", expiry: "2025-12-31", amount: 22000 },
      { year: "2024", permitNo: "BP-2024-0044", status: "Issued", issued: "2024-02-08", expiry: "2024-12-31", amount: 21000 },
    ],
    inspections: [
      { office: "Health", date: "2025-09-10", result: "With deficiency", notes: "Upload updated sanitary permit." },
      { office: "Fire", date: "2025-08-26", result: "Passed", notes: "No fire safety issue noted." },
    ],
    activities: [
      { action: "Deficiency notice encoded", date: "Sep 10, 2025", actor: "Health Office" },
      { action: "Renewal pre-check started", date: "Sep 8, 2025", actor: "BPLO Staff" },
    ],
  },
];

export function getBusinessById(id: string): BusinessRecord {
  const direct = BASE_RECORDS.find((business) => business.id === id);
  if (direct) return direct;

  const match = id.match(/BUS-(\d+)/);
  const number = match ? Number(match[1]) : 1;
  const permitNo = `BP-2025-${String(number).padStart(4, "0")}`;
  const barangays = ["Poblacion", "Bago", "Camachile", "Sta. Elena", "Calayuan", "Balocawe"];
  const lines = ["Retail Trade", "Food Service", "Services", "Agriculture & Fishery", "Transportation", "Manufacturing"];
  const status: BusinessStatus = number % 11 === 0 ? "With Deficiency" : number % 8 === 0 ? "Expired" : number % 5 === 0 ? "For Renewal" : "Active";
  const riskLevel: RiskLevel = status === "With Deficiency" || number % 9 === 0 ? "High" : number % 3 === 0 ? "Medium" : "Low";
  const barangay = barangays[number % barangays.length];
  const lineOfBusiness = lines[number % lines.length];
  const coordinates = MATNOG_COORDINATES[number % MATNOG_COORDINATES.length];

  return {
    id,
    permitNo,
    businessName: `Matnog Registry Business ${number}`,
    tradeName: `MRB ${number}`,
    owner: `Registered Owner ${number}`,
    barangay,
    address: `Zone ${number % 7 + 1}, ${barangay}, Matnog, Sorsogon`,
    lineOfBusiness,
    businessType: number % 4 === 0 ? "Corporation" : "Sole Proprietorship",
    status,
    riskLevel,
    lastPermitYear: status === "Expired" ? "2024" : "2025",
    expiryDate: status === "Expired" ? "2024-12-31" : "2025-12-31",
    grossSales: 250000 + number * 185000,
    employees: 2 + (number % 22),
    area: 24 + number * 7,
    lastInspection: "2025-08-15",
    tin: `900-${String(100 + number).padStart(3, "0")}-${String(200 + number).padStart(3, "0")}-000`,
    registrationNo: `DTI-BN-2025-${String(3000 + number).padStart(5, "0")}`,
    contact: `0917-555-${String(1000 + number).slice(-4)}`,
    email: `business${number}@example.com`,
    ownerAddress: `${barangay}, Matnog, Sorsogon`,
    capitalInvestment: 150000 + number * 50000,
    remarks: "Generated registry profile for demo navigation and UI review.",
    latitude: coordinates.latitude.toFixed(4),
    longitude: coordinates.longitude.toFixed(4),
    documents: BUSINESS_DOCUMENTS.slice(0, 7 + (number % 3)),
    permits: [
      { year: "2025", permitNo, status: status === "Expired" ? "Expired" : "Issued", issued: "2025-02-15", expiry: status === "Expired" ? "2024-12-31" : "2025-12-31", amount: 3500 + number * 400 },
      { year: "2024", permitNo: `BP-2024-${String(number).padStart(4, "0")}`, status: "Issued", issued: "2024-02-10", expiry: "2024-12-31", amount: 3200 + number * 350 },
    ],
    inspections: [
      { office: "BPLO", date: "2025-08-15", result: riskLevel === "High" ? "For monitoring" : "Compliant", notes: "Routine registry validation completed." },
      { office: "Fire", date: "2025-07-18", result: "Passed", notes: "No critical findings." },
    ],
    activities: [
      { action: "Registry profile opened for review", date: "Sep 25, 2026", actor: "BPLO Staff" },
      { action: "Latest inspection note synced", date: "Aug 15, 2025", actor: "Inspection Desk" },
    ],
  };
}

export const MATNOG_COORDINATES: MapBusiness[] = [
  { id: "BUS-001", name: "Matnog Fisheries Corp.", barangay: "Poblacion", lineOfBusiness: "Agriculture & Fishery", status: "Active", latitude: 12.5858, longitude: 124.0843 },
  { id: "BUS-002", name: "Sorsogon Rice Trading", barangay: "Bago", lineOfBusiness: "Wholesale Trade", status: "For Renewal", latitude: 12.5739, longitude: 124.0718 },
  { id: "BUS-007", name: "Matnog Pharmacy Inc.", barangay: "Poblacion", lineOfBusiness: "Pharmaceutical", status: "With Deficiency", latitude: 12.5871, longitude: 124.0831 },
  { id: "BUS-010", name: "Matnog Auto Repair Shop", barangay: "Camachile", lineOfBusiness: "Services", status: "For Renewal", latitude: 12.5688, longitude: 124.0916 },
  { id: "BUS-014", name: "Matnog Copra Buying Station", barangay: "Bago", lineOfBusiness: "Agriculture & Fishery", status: "For Renewal", latitude: 12.5756, longitude: 124.0664 },
  { id: "BUS-018", name: "JMR Construction Supply", barangay: "Poblacion", lineOfBusiness: "Construction", status: "For Renewal", latitude: 12.5902, longitude: 124.0786 },
  { id: "BUS-022", name: "Sorsogon Bay Seafood Restaurant", barangay: "Poblacion", lineOfBusiness: "Food Service", status: "Suspended", latitude: 12.5824, longitude: 124.0888 },
  { id: "BUS-027", name: "Casa Matnog Pension House", barangay: "Poblacion", lineOfBusiness: "Accommodation", status: "With Deficiency", latitude: 12.5882, longitude: 124.0803 },
  { id: "BUS-030", name: "Tindahan ni Aling Nena", barangay: "Bago", lineOfBusiness: "Retail Trade", status: "For Renewal", latitude: 12.5703, longitude: 124.0689 },
];

export function formatCurrency(value: number) {
  return "PHP " + value.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
