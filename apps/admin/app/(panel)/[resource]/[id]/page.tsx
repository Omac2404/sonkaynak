import { notFound } from "next/navigation";
import { FORM_SCHEMAS } from "@/lib/forms";
import { GenericForm } from "@/components/GenericForm";
import { pf } from "@/lib/payload";
import { Placeholder } from "@/components/Placeholder";

export const dynamic = "force-dynamic";

export default async function EditResource({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const schema = FORM_SCHEMAS[resource];
  if (!schema) return <Placeholder title="Düzenle" note="Bu bölüm için form yakında." />;

  const res = await pf(`/${schema.slug}/${id}?depth=1`);
  if (!res.ok || !res.data?.id) notFound();

  let options;
  if (schema.slug === "users") {
    const r = await pf("/roles?limit=100&depth=0");
    options = { roleRef: (r.data?.docs ?? []).map((x: any) => ({ id: x.id, label: x.label })) };
  }

  return (
    <div>
      <h1 className="mb-5 text-2xl font-black tracking-tight text-ink">{schema.singular} Düzenle</h1>
      <GenericForm schema={schema} doc={res.data} options={options} />
    </div>
  );
}
