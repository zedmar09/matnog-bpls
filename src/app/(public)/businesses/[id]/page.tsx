import { BusinessProfileView } from "@/features/business-permits-licensing/views/business-profile-view";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BusinessProfileView businessId={id} />;
}
