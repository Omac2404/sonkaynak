import { pf } from "@/lib/payload";
import { TickerForm } from "@/components/curation/TickerForm";

export const dynamic = "force-dynamic";

export default async function TickerPage() {
  const g = await pf("/globals/ticker");
  return <TickerForm initial={g.data ?? {}} />;
}
