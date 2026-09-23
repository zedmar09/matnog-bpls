import { BusinessRegistrationFormView } from "@/features/business-permits-licensing/views/business-registration-form-view";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BusinessRegistrationFormView businessId={id} />;
}
