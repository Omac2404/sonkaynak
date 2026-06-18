import { pf } from "@/lib/payload";
import { SettingsForm } from "@/components/curation/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AyarlarPage() {
  const g = await pf("/globals/site-settings?depth=1");
  return <SettingsForm s={g.data ?? {}} />;
}
