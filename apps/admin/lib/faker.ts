/** Test içeriği için basit rastgele Türkçe metin üreteci. */

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const KONULAR = [
  "Ekonomide yeni dönem", "Belediyeden dev yatırım", "Hava durumu uyarısı", "Eğitimde reform adımı",
  "Sağlıkta çığır açan gelişme", "Teknoloji devinden açıklama", "Spor camiasında hareketli saatler",
  "Tarımda rekor hasat", "Ulaşıma yeni hat", "Kültür-sanat dünyasından haberler", "Enerji projesinde son durum",
  "Turizmde sezon açıldı", "Bilim insanlarından kritik uyarı", "Piyasalarda dalgalı seyir",
  "Yerel yönetimden müjde", "Gençlere yönelik destek paketi", "Sanayide üretim arttı", "Borsada güne başlangıç",
];
const EKLER = [
  "uzmanlar değerlendirdi", "vatandaş ne düşünüyor", "rakamlar açıklandı", "detaylar belli oldu",
  "harekete geçildi", "gündeme oturdu", "merak konusu oldu", "açıklama geldi", "inceleme başladı",
  "yeni veriler paylaşıldı", "kararı duyuruldu", "çalışmalar hız kazandı",
];
const PARAGRAFLAR = [
  "Konuya ilişkin yapılan açıklamada, sürecin titizlikle yürütüldüğü ve tüm paydaşların bilgilendirildiği belirtildi.",
  "Yetkililer, atılan adımların orta vadede olumlu sonuçlar doğurmasının beklendiğini ifade etti.",
  "Vatandaşların yoğun ilgi gösterdiği gelişme, kısa sürede sosyal medyada da gündem oldu.",
  "Yapılan değerlendirmelerde, önümüzdeki dönemde yeni düzenlemelerin gündeme gelebileceği vurgulandı.",
  "Uzmanlar, sürecin şeffaf biçimde yönetilmesinin güveni artıracağını kaydetti.",
  "Açıklanan veriler, beklentilerin üzerinde bir tabloya işaret ediyor.",
  "İlgili birimler, çalışmaların aksamadan sürdürülmesi için ek tedbirler aldı.",
  "Bölge halkı, gelişmenin günlük yaşama olumlu yansımasını umuyor.",
  "Konunun takipçisi olacaklarını belirten yetkililer, gelişmeleri kamuoyuyla paylaşacaklarını söyledi.",
  "Sektör temsilcileri, kararın rekabeti ve kaliteyi artıracağını dile getirdi.",
];
const FIRMA_ADLARI = ["Yıldız", "Anadolu", "Güven", "Star", "Mavi", "Altın", "Deniz", "Pınar", "Zirve", "Öz", "Net", "Akın"];
const FIRMA_TURU = ["İnşaat", "Gıda", "Otomotiv", "Tekstil", "Bilişim", "Mobilya", "Lojistik", "Enerji", "Turizm", "Danışmanlık"];
const ISIMLER = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Mustafa", "Hüseyin", "Hatice", "Ali", "Emine", "Hasan", "İbrahim", "Zeynep"];
const SOYISIMLER = ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Aydın", "Öztürk", "Arslan", "Doğan", "Kılıç", "Aslan"];
const SEHIRLER = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kayseri", "Mersin"];

export function baslik(): string {
  return `${pick(KONULAR)}: ${pick(EKLER)}`;
}
/** Slug çakışmasını önlemek için benzersiz sonek ekler. */
export function benzersiz(s: string): string {
  return `${s} (${Date.now().toString(36).slice(-3)}${rand(10, 99)})`;
}
export function ozet(): string {
  return PARAGRAFLAR[rand(0, PARAGRAFLAR.length - 1)];
}
export function govdeHtml(): string {
  const n = rand(3, 6);
  const ps: string[] = [];
  for (let i = 0; i < n; i++) ps.push(`<p>${pick(PARAGRAFLAR)} ${pick(PARAGRAFLAR)}</p>`);
  return ps.join("\n");
}
export function firmaAdi(): string {
  return `${pick(FIRMA_ADLARI)} ${pick(FIRMA_TURU)}`;
}
export function kisiAdi(): string {
  return `${pick(ISIMLER)} ${pick(SOYISIMLER)}`;
}
export function sehir(): string {
  return pick(SEHIRLER);
}
export function telefon(): string {
  return `0${rand(500, 555)} ${rand(100, 999)} ${rand(10, 99)} ${rand(10, 99)}`;
}
