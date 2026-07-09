import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Gizlilik Politikası ve KVKK Aydınlatma Metni" };

export default function Gizlilik() {
  return (
    <LegalPage
      title="Gizlilik Politikası ve KVKK Aydınlatma Metni"
      updated="Temmuz 2026"
      intro="Son Kaynak olarak kişisel verilerinizin güvenliğine önem veriyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hangi verileri, hangi amaçla işlediğimizi ve haklarınızı açıklar."
      sections={[
        {
          h: "1. Veri Sorumlusu",
          p: ["Bu sitede işlenen kişisel verilere ilişkin veri sorumlusu Son Kaynak'tır. İletişim için sitedeki İletişim sayfasını kullanabilirsiniz."],
        },
        {
          h: "2. İşlenen Kişisel Veriler",
          p: [
            "Siteyi kullanımınız sırasında; IP adresi, tarayıcı ve cihaz bilgileri, ziyaret edilen sayfalar ve çerez verileri gibi teknik veriler otomatik olarak işlenebilir.",
            "İletişim formu, bülten aboneliği veya yorum gibi gönüllü paylaştığınız durumlarda ad ve e-posta gibi veriler işlenebilir.",
          ],
        },
        {
          h: "3. İşleme Amaçları",
          p: [
            "Verileriniz; sitenin işletilmesi, içeriklerin sunulması, güvenliğin sağlanması, kullanım istatistiklerinin analizi ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.",
          ],
        },
        {
          h: "4. Verilerin Aktarımı",
          p: [
            "Kişisel verileriniz, hizmet aldığımız altyapı ve analiz sağlayıcılarıyla, yalnızca hizmetin gerektirdiği ölçüde ve yasal çerçevede paylaşılabilir. Verileriniz üçüncü kişilere pazarlama amacıyla satılmaz.",
          ],
        },
        {
          h: "5. Haklarınız",
          p: [
            "KVKK'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz.",
            "Taleplerinizi İletişim sayfasındaki kanallardan bize iletebilirsiniz.",
          ],
        },
        {
          h: "6. Değişiklikler",
          p: ["Bu politika zaman zaman güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır."],
        },
      ]}
    />
  );
}
