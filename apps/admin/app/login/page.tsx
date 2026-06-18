import { loginAction } from "@/lib/actions";

const ERRORS: Record<string, string> = {
  missing: "E-posta ve şifre gerekli.",
  invalid: "E-posta veya şifre hatalı.",
  server: "Sunucuya ulaşılamadı. Lütfen tekrar deneyin.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Sol marka paneli */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-panel p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(700px 400px at 80% 0%, rgba(212,20,28,.5), transparent 60%)" }}
        />
        <div className="relative flex items-center gap-2 text-2xl font-black">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sk-red text-base">SK</span>
          SON<span className="text-sk-red">KAYNAK</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-black leading-tight">Yönetim Paneli</h1>
          <p className="mt-3 max-w-sm text-neutral-400">
            Haberlerini, manşetlerini ve tüm içeriğini tek yerden yönet. Hızlı, modern ve sade.
          </p>
        </div>
        <div className="relative text-xs text-neutral-500">© {new Date().getFullYear()} Son Kaynak</div>
      </div>

      {/* Sağ form */}
      <div className="flex items-center justify-center bg-neutral-50 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <div className="inline-flex items-center gap-2 text-2xl font-black text-ink">
              SON<span className="text-sk-red">KAYNAK</span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-ink">Giriş Yap</h2>
          <p className="mt-1 text-sm text-neutral-500">Panele erişmek için bilgilerini gir.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-sk-red-dark">
              {ERRORS[error] ?? "Bir hata oluştu."}
            </div>
          )}

          <form action={loginAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">E-posta</label>
              <input
                type="email"
                name="email"
                required
                autoFocus
                placeholder="ornek@sonkaynak.com"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition focus:border-sk-red focus:ring-4 focus:ring-sk-red/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Şifre</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition focus:border-sk-red focus:ring-4 focus:ring-sk-red/10"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-sk-red py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sk-red-dark"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
