import { ApplicationDetailView } from "@/features/business-permits-licensing/views/application-detail-view";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationDetailView applicationId={id} />;
}
