import { PermitDetailView } from "@/features/business-permits-licensing/views/permit-detail-view";

export default async function Page({ params }: { params: Promise<{ documentNumber: string }> }) {
  const { documentNumber } = await params;
  return <PermitDetailView documentNumber={documentNumber} />;
}
