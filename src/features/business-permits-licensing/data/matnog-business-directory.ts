import type {
  BusinessActivityCategory,
  BusinessDirectoryOrganization,
  BusinessDirectoryRecord,
  BusinessDirectoryStatus,
  BusinessRiskLevel,
} from "../types/business-directory";

export const MATNOG_BARANGAYS = [
  "Balocawe",
  "Banogao",
  "Banuangdaan",
  "Bariis",
  "Bolo",
  "Bon-Ot Big",
  "Bon-Ot Small",
  "Cabagahan",
  "Calayuan",
  "Calintaan",
  "Caloocan",
  "Calpi",
  "Camachiles",
  "Camcaman",
  "Coron-coron",
  "Culasi",
  "Gadgaron",
  "Genablan Occidental",
  "Genablan Oriental",
  "Hidhid",
  "Laboy",
  "Lajong",
  "Mambajog",
  "Manjunlad",
  "Manurabi",
  "Naburacan",
  "Paghuliran",
  "Pangi",
  "Pawa",
  "Poropandan",
  "Santa Isabel",
  "Sinalmacan",
  "Sinang-Atan",
  "Sinibaran",
  "Sisigon",
  "Sua",
  "Sulangan",
  "Tablac",
  "Tabunan",
  "Tugas",
] as const;

type ActivitySeed = {
  category: BusinessActivityCategory;
  label: string;
  suffix: string;
  psicCode: string;
  risk: BusinessRiskLevel;
};

const ACTIVITIES: readonly ActivitySeed[] = [
  {
    category: "Accommodation and food",
    label: "Restaurant and prepared food service",
    suffix: "Kitchen",
    psicCode: "56101",
    risk: "Medium",
  },
  {
    category: "Accommodation and food",
    label: "Transient lodging and guest accommodation",
    suffix: "Lodge",
    psicCode: "55109",
    risk: "Medium",
  },
  {
    category: "Agriculture and fisheries",
    label: "Wholesale and retail of fresh seafood",
    suffix: "Fresh Catch",
    psicCode: "47212",
    risk: "Medium",
  },
  {
    category: "Agriculture and fisheries",
    label: "Agricultural supplies and farm inputs retail",
    suffix: "Agri Supply",
    psicCode: "47737",
    risk: "Low",
  },
  {
    category: "Construction and hardware",
    label: "Retail of hardware and construction materials",
    suffix: "Builders Depot",
    psicCode: "47521",
    risk: "Medium",
  },
  {
    category: "Financial and professional services",
    label: "Bookkeeping and business support services",
    suffix: "Business Solutions",
    psicCode: "69200",
    risk: "Low",
  },
  {
    category: "Health and personal care",
    label: "Retail pharmacy and medical supplies",
    suffix: "Community Pharmacy",
    psicCode: "47721",
    risk: "High",
  },
  {
    category: "Health and personal care",
    label: "Barbershop and personal care services",
    suffix: "Grooming Studio",
    psicCode: "96020",
    risk: "Low",
  },
  {
    category: "Manufacturing",
    label: "Production of baked goods and pastries",
    suffix: "Bakehouse",
    psicCode: "10710",
    risk: "Medium",
  },
  {
    category: "Retail and wholesale",
    label: "Neighborhood grocery and general merchandise",
    suffix: "General Merchandise",
    psicCode: "47110",
    risk: "Low",
  },
  {
    category: "Retail and wholesale",
    label: "Consumer electronics and mobile accessories retail",
    suffix: "Digital Hub",
    psicCode: "47411",
    risk: "Low",
  },
  {
    category: "Transportation and logistics",
    label: "Freight forwarding and cargo support services",
    suffix: "Cargo Services",
    psicCode: "52292",
    risk: "High",
  },
  {
    category: "Transportation and logistics",
    label: "Passenger transport and vehicle rental",
    suffix: "Transport Services",
    psicCode: "49220",
    risk: "High",
  },
  {
    category: "Travel and tourism",
    label: "Tour booking and visitor assistance",
    suffix: "Tours and Travel",
    psicCode: "79110",
    risk: "Medium",
  },
  {
    category: "Other services",
    label: "Printing, photocopying, and document services",
    suffix: "Print Center",
    psicCode: "82190",
    risk: "Low",
  },
] as const;

const ROOT_NAMES = [
  "Abaca",
  "Bicolandia",
  "Blue Harbor",
  "Buenavista",
  "Gateway",
  "Juag Lagoon",
  "Maharlika",
  "Matnog Bay",
  "Pacific South",
  "Pili Grove",
  "San Bernardino",
  "Sorsogon Prime",
  "Subic Coast",
  "Sunrise",
  "Talisay",
  "Tikling Island",
] as const;

const FIRST_NAMES = [
  "Maria Lourdes",
  "Roberto",
  "Ana Marie",
  "Joel",
  "Elena",
  "Ramon",
  "Josefina",
  "Carlo",
  "Maricel",
  "Rogelio",
  "Catherine",
  "Francisco",
  "Lorna",
  "Danilo",
  "Jennylyn",
  "Nestor",
] as const;

const LAST_NAMES = [
  "Fajardo",
  "Frilles",
  "Hababag",
  "Guban",
  "Gacosta",
  "Funes",
  "Dino",
  "Espenida",
  "Gubat",
  "Fortes",
  "Hernandez",
  "Llaneta",
  "Monreal",
  "Oropesa",
  "Rañola",
  "Siblante",
] as const;

const STREET_NAMES = ["National Road", "Rizal Street", "Bonifacio Street", "Port Road", "Coastal Road", "Market Road"];
const ORGANIZATIONS: readonly BusinessDirectoryOrganization[] = [
  "Sole proprietorship",
  "Partnership",
  "Corporation",
  "One person corporation",
  "Cooperative",
];
const STATUSES: readonly BusinessDirectoryStatus[] = [
  "Active",
  "Active",
  "Active",
  "Active",
  "Expiring soon",
  "Active",
  "Expired",
  "Active",
  "Suspended",
  "Active",
  "Closed",
  "Active",
];

function pad(value: number, length = 4) {
  return String(value).padStart(length, "0");
}

function dateFor(index: number, year: number, dayOffset = 0) {
  const month = (index * 5 + dayOffset) % 12;
  const day = ((index * 7 + dayOffset) % 25) + 1;
  return `${year}-${pad(month + 1, 2)}-${pad(day, 2)}`;
}

function createRecord(index: number): BusinessDirectoryRecord {
  const sequence = index + 1;
  const activity = ACTIVITIES[index % ACTIVITIES.length];
  const root = ROOT_NAMES[index % ROOT_NAMES.length];
  const barangay = MATNOG_BARANGAYS[(index * 7) % MATNOG_BARANGAYS.length];
  const organizationType = ORGANIZATIONS[index % ORGANIZATIONS.length];
  const registrationAuthority =
    organizationType === "Sole proprietorship" ? "DTI" : organizationType === "Cooperative" ? "CDA" : "SEC";
  const status = STATUSES[index % STATUSES.length];
  const ownerName = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${String.fromCharCode(65 + (index % 20))}. ${LAST_NAMES[(index * 3) % LAST_NAMES.length]}`;
  const yearRegistered = 2012 + (index % 14);
  const permitYear = status === "Expired" || status === "Closed" ? 2025 : 2026;
  const permitValidUntil =
    status === "Expiring soon"
      ? index % 2 === 0
        ? "2026-10-31"
        : "2026-11-30"
      : status === "Expired" || status === "Closed"
        ? "2025-12-31"
        : "2026-12-31";
  const tradeName = `${root} ${activity.suffix}${index >= ROOT_NAMES.length ? ` ${Math.floor(index / ROOT_NAMES.length) + 1}` : ""}`;
  const entitySuffix =
    organizationType === "Corporation" || organizationType === "One person corporation"
      ? " Corporation"
      : organizationType === "Cooperative"
        ? " Cooperative"
        : organizationType === "Partnership"
          ? " Partners"
          : " Enterprise";

  return {
    id: `BIZ-2026-${pad(sequence)}`,
    registeredName: `${tradeName}${entitySuffix}`,
    tradeName,
    organizationType,
    registrationAuthority,
    registrationNumber: `${registrationAuthority}-${yearRegistered}-${pad(20000 + sequence, 6)}`,
    registrationDate: dateFor(index, yearRegistered),
    establishmentType: index % 9 === 0 ? "Branch" : "Main office",
    ownerName,
    contactNumber: `09${pad(15 + (index % 5), 2)} ${pad(310 + index, 3)} ${pad(4200 + index * 3, 4)}`,
    email: index % 11 === 0 ? "" : `${root.toLowerCase().replaceAll(" ", ".")}@example.com`,
    tin: `${pad(300 + index, 3)}-${pad(410 + index * 2, 3)}-${pad(520 + index * 3, 3)}-000`,
    activityCategory: activity.category,
    primaryActivity: activity.label,
    psicCode: activity.psicCode,
    riskLevel: index % 13 === 0 ? "High" : activity.risk,
    barangay,
    address: `${STREET_NAMES[index % STREET_NAMES.length]}, Barangay ${barangay}, Matnog, Sorsogon`,
    employeeCount: 1 + ((index * 7) % 58),
    capitalization: 75_000 + (index % 18) * 125_000,
    grossSales: 180_000 + (index % 24) * 210_000,
    status,
    permitNumber: `BP-${permitYear}-${pad(100 + sequence, 5)}`,
    permitIssuedAt: dateFor(index, permitYear, 3),
    permitValidUntil,
    createdAt: `${dateFor(index, yearRegistered)} 09:00`,
    updatedAt: `${dateFor(index, 2026, 9)} ${pad(8 + (index % 9), 2)}:${index % 2 === 0 ? "15" : "40"}`,
  };
}

export const MATNOG_BUSINESS_DIRECTORY: readonly BusinessDirectoryRecord[] = Array.from({ length: 128 }, (_, index) =>
  createRecord(index),
);

export const BUSINESS_ACTIVITY_CATEGORIES = [...new Set(ACTIVITIES.map((activity) => activity.category))].sort();
