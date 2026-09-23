import type { ApplicationDirectoryType } from "@/features/business-permits-licensing/types/application-directory";
import { ApplicationWizardView } from "@/features/business-permits-licensing/views/application-wizard-view";

const APPLICATION_TYPES: Record<string, ApplicationDirectoryType> = {
  new: "New",
  renewal: "Renewal",
  amendment: "Amendment",
  closure: "Closure",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; businessId?: string }>;
}) {
  const { type = "new", businessId = "" } = await searchParams;

  return <ApplicationWizardView initialType={APPLICATION_TYPES[type] ?? "New"} initialBusinessId={businessId} />;
}
