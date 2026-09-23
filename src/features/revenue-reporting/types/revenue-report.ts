export type RevenuePaymentChannel = "Cashier" | "GCash" | "Maya" | "Bank e-channel";
export type RevenueCollectionStatus = "Confirmed" | "Partial" | "Pending" | "Rejected" | "Reversed" | "Refunded";
export type RevenueReconciliationStatus = "Matched" | "Pending settlement" | "Exception" | "Not applicable";

export type RevenueTransaction = {
  id: string;
  paymentDate: string;
  officialReceiptNumber?: string;
  applicationId: string;
  businessName: string;
  ownerName: string;
  barangay: string;
  applicationType: "New" | "Renewal" | "Amendment" | "Closure";
  feeCategory: string;
  assessmentAmount: number;
  collectedAmount: number;
  adjustmentAmount: number;
  netAmount: number;
  outstandingAmount: number;
  channel: RevenuePaymentChannel;
  status: RevenueCollectionStatus;
  reconciliationStatus: RevenueReconciliationStatus;
  receivingOfficer: string;
  paymentReference: string;
};

export type RevenueReportFilters = {
  query: string;
  dateFrom: string;
  dateTo: string;
  barangay: string;
  applicationType: string;
  channel: string;
  status: string;
  reconciliationStatus: string;
  receivingOfficer: string;
};

export type RevenueReportSummary = {
  grossCollections: number;
  adjustments: number;
  netCollections: number;
  outstandingBalance: number;
  officialReceipts: number;
  onlineShare: number;
  reconciliationExceptions: number;
};
