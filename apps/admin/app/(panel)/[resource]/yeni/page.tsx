import { FORM_SCHEMAS } from "@/lib/forms";
import { GenericForm } from "@/components/GenericForm";
import { Placeholder } from "@/components/Placeholder";
import { pf } from "@/lib/payload";

export const dynamic = "force-dynamic";

async function loadOptions(slug: string) {
  if (slug !== "users") return undefined;
  const r = await pf("/roles?limit=100&depth=0");
  return { roleRef: (r.data?.docs ?? []).map((x: any) => ({ id: x.id, label: x.label })) };
}

export default async function NewResource({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const schema = FORM_SCHEMAS[resource];
  if (!schema) return <Placeholder title="Yeni Kayıt" note="Bu bölüm için form yakında." />;
  const options = await loadOptions(schema.slug);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-black tracking-tight text-ink">Yeni {schema.singular}</h1>
      <GenericForm schema={schema} options={options} />
    </div>
  );
}
