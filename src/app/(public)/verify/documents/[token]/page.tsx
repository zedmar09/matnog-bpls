import { PublicPermitVerificationView } from "@/features/business-permits-licensing/views/public-permit-verification-view";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PublicPermitVerificationView token={token} />;
}
