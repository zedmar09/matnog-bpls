import type {
  RevenueCollectionStatus,
  RevenuePaymentChannel,
  RevenueReconciliationStatus,
  RevenueTransaction,
} from "../types/revenue-report";

const businesses = [
  ["Matnog Bay Tours and Transport Services", "Maria Lourdes Dela Cruz"],
  ["Subic Beach Haven Resort", "Leonardo G. Frilles"],
  ["Matnog Central General Merchandise", "Luzviminda G. Espinas"],
  ["Calintaan Island Tours and Services", "Rogelio M. Guban"],
  ["Allen-Matnog Ferry Services", "Rosalinda P. Domasig"],
  ["Pacific South Hardware and Supply", "Noel B. Deyto"],
  ["Juag Lagoon Seafood Trading", "Marites H. Gacosta"],
  ["Poblacion Pharmacy and Medical Supply", "Dr. Elena R. Gallardo"],
  ["Matnog Farmers Agricultural Supply", "Josefino L. Grutas"],
  ["Tikling Island Homestay", "Analyn C. Fajardo"],
  ["Balocawe Fuel and Service Center", "Ramon A. Labalan"],
  ["Matnog Digital Printing Services", "Catherine V. Escoto"],
] as const;

const barangays = [
  "Poblacion",
  "Camcaman",
  "Calintaan",
  "Balocawe",
  "Gadgaron",
  "Sinang-atan",
  "Tabunan",
  "Tugas",
  "Genablan Oriental",
  "Genablan Occidental",
] as const;
const officers = ["Ana M. Labalan", "Rina V. Estuye", "Marco P. Frilles", "Leah B. Guban"] as const;
const channels: RevenuePaymentChannel[] = ["Cashier", "GCash", "Maya", "Bank e-channel"];
const categories = [
  "Mayor's permit fee",
  "Business tax",
  "Regulatory fee",
  "Garbage fee",
  "Inspection fee",
  "Documentary fee",
] as const;
const applicationTypes = ["New", "Renewal", "Renewal", "Renewal", "Amendment", "Closure"] as const;

function statusFor(index: number): RevenueCollectionStatus {
  if (index % 29 === 0) return "Rejected";
  if (index % 23 === 0) return "Reversed";
  if (index % 19 === 0) return "Refunded";
  if (index % 13 === 0) return "Pending";
  if (index % 7 === 0) return "Partial";
  return "Confirmed";
}

function reconciliationFor(
  index: number,
  channel: RevenuePaymentChannel,
  status: RevenueCollectionStatus,
): RevenueReconciliationStatus {
  if (channel === "Cashier") return "Not applicable";
  if (status === "Pending") return "Pending settlement";
  if (index % 17 === 0 || status === "Rejected") return "Exception";
  if (index % 11 === 0) return "Pending settlement";
  return "Matched";
}

export const MATNOG_REVENUE_TRANSACTIONS: RevenueTransaction[] = Array.from({ length: 108 }, (_, offset) => {
  const index = offset + 1;
  const [businessName, ownerName] = businesses[offset % businesses.length];
  const channel = channels[(offset * 3) % channels.length];
  const status = statusFor(index);
  const assessmentAmount = 95000 + ((index * 173900) % 2850000);
  const collectedAmount =
    status === "Pending" || status === "Rejected"
      ? 0
      : status === "Partial"
        ? Math.floor(assessmentAmount * 0.55)
        : assessmentAmount;
  const adjustmentAmount =
    status === "Reversed" ? -collectedAmount : status === "Refunded" ? -Math.floor(collectedAmount * 0.4) : 0;
  const netAmount = collectedAmount + adjustmentAmount;
  const dayOffset = offset % 84;
  const date = new Date(Date.UTC(2026, 6, 1 + dayOffset));
  const paymentDate = date.toISOString().slice(0, 10);
  const serial = String(index).padStart(5, "0");

  return {
    id: `REV-2026-${serial}`,
    paymentDate,
    officialReceiptNumber: collectedAmount > 0 && status !== "Reversed" ? `OR-2026-${serial}` : undefined,
    applicationId: `APP-2026-${String(210 + index).padStart(5, "0")}`,
    businessName,
    ownerName,
    barangay: barangays[(offset * 7) % barangays.length],
    applicationType: applicationTypes[offset % applicationTypes.length],
    feeCategory: categories[(offset * 5) % categories.length],
    assessmentAmount,
    collectedAmount,
    adjustmentAmount,
    netAmount,
    outstandingAmount: Math.max(0, assessmentAmount - collectedAmount),
    channel,
    status,
    reconciliationStatus: reconciliationFor(index, channel, status),
    receivingOfficer: officers[(offset * 3) % officers.length],
    paymentReference:
      channel === "Cashier" ? `MTO-${serial}` : `${channel.replaceAll(" ", "-").toUpperCase()}-${serial}`,
  };
});
