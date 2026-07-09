import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Çerez (Cookie) Politikası" };

export default function CerezPolitikasi() {
  return (
    <LegalPage
      title="Çerez (Cookie) Politikası"
      updated="Temmuz 2026"
      intro="Bu sitede deneyiminizi iyileştirmek, kullanım istatistiklerini ölçmek ve içerikleri kişiselleştirmek için çerezler kullanılır. Bu metin hangi çerezleri neden kullandığımızı açıklar."
      sections={[
        {
          h: "1. Çerez Nedir?",
          p: ["Çerezler, ziyaret ettiğiniz siteler tarafından tarayıcınıza kaydedilen küçük metin dosyalarıdır. Tercihlerinizi hatırlamak ve siteyi daha verimli sunmak için kullanılır."],
        },
        {
          h: "2. Kullanılan Çerez Türleri",
          p: [
            "Zorunlu çerezler: Sitenin temel işlevleri (ör. tema tercihi, oturum) için gereklidir.",
            "Analitik çerezler: Ziyaretçi davranışını anonim olarak ölçerek siteyi iyileştirmemizi sağlar.",
            "İşlevsel çerezler: Tercihlerinizi (ör. karanlık mod) hatırlar.",
          ],
        },
        {
          h: "3. Çerezleri Yönetme",
          p: [
            "Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Ancak zorunlu çerezleri devre dışı bırakmak sitenin bazı bölümlerinin düzgün çalışmamasına yol açabilir.",
          ],
        },
        {
          h: "4. Üçüncü Taraf Çerezleri",
          p: ["Analiz ve içerik hizmetleri için üçüncü taraf çerezleri kullanılabilir. Bu sağlayıcıların kendi gizlilik politikaları geçerlidir."],
        },
      ]}
    />
  );
}
