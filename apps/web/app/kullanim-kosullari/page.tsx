import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Kullanım Koşulları" };

export default function KullanimKosullari() {
  return (
    <LegalPage
      title="Kullanım Koşulları"
      updated="Temmuz 2026"
      intro="Son Kaynak'ı kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Lütfen dikkatle okuyunuz."
      sections={[
        {
          h: "1. İçeriklerin Kullanımı",
          p: [
            "Sitede yer alan haber, görsel ve diğer içerikler telif hakkıyla korunmaktadır. Kaynak gösterilmeden ve izin alınmadan kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.",
          ],
        },
        {
          h: "2. Sorumluluk",
          p: [
            "İçerikler yayımlandıkları an itibarıyla doğru olacak şekilde özenle hazırlanır; ancak güncellik ve kesinlik konusunda garanti verilmez. Kullanıcı, içerikleri kendi sorumluluğunda değerlendirir.",
            "Site üzerinden erişilen üçüncü taraf bağlantılarının içeriğinden Son Kaynak sorumlu değildir.",
          ],
        },
        {
          h: "3. Kullanıcı Davranışı",
          p: [
            "Kullanıcılar; hukuka aykırı, hakaret içeren, yanıltıcı veya üçüncü kişilerin haklarını ihlal eden içerik paylaşamaz. Aksi durumda erişim engellenebilir.",
          ],
        },
        {
          h: "4. Değişiklikler",
          p: ["Son Kaynak, bu koşulları önceden bildirmeksizin güncelleme hakkını saklı tutar. Güncel sürüm bu sayfada yayımlanır."],
        },
      ]}
    />
  );
}
