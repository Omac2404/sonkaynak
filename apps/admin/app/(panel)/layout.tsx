import { redirect } from "next/navigation";
import { getMe, getEffectivePerms } from "@/lib/payload";
import { Shell } from "@/components/Shell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me) redirect("/login");
  const perms = await getEffectivePerms(me);

  return (
    <Shell user={me} perms={perms}>
      {children}
    </Shell>
  );
}
