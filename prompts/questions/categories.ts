export type CategoryId =
  | 'matematik'
  | 'fen'
  | 'turkce'
  | 'tarih'
  | 'cografya'
  | 'genel-kultur';

export type CategoryPromptProfile = {
  label: string;
  topic: string;
  /**
   * Kategoriye özel prompt “baharatı”.
   * Burayı sen kategori bazında daha yaratıcı/kaliteli hale getirebilirsin.
   */
  rules: string[];
};

export const CATEGORY_PROFILES: Record<CategoryId, CategoryPromptProfile> = {
  matematik: {
    label: 'Matematik',
    topic: 'math',
    rules: [
      'İşlem soruları kısa olsun; gereksiz metin kullanma.',
      'Seçenekler yakın değerlerde çeldirici içersin (ör: +1, -1, yanlış işlem).',
      'Negatif/ondalık kullanma (G4+ hariç; yine de gerekmedikçe kullanma).',
    ],
  },
  fen: {
    label: 'Fen Bilimleri',
    topic: 'science',
    rules: [
      'Günlük hayattan gözlemlenebilir fen örnekleri kullan.',
      'Tartışmalı/yorum soruları yazma; tek doğru cevabı olan soru üret.',
      'Deney güvenliği, doğa olayları, canlılar gibi temel konular.',
    ],
  },
  turkce: {
    label: 'Türkçe',
    topic: 'reading',
    rules: [
      'Sadece DİL BİLGİSİ odaklı soru yaz: paragraf/cümlede anlam, yorum, ana fikir, çıkarım gibi okuma-anlama isteme.',
      'Kapsam (yaşa uygun seç): sözcük türleri, ekler (çekim/yapım), kök-ek, çoğul/iyelik/hal ekleri, zaman-kip, kişi ekleri, olumsuzluk, soru eki, yazım-noktalama (temel).',
      'Soru kökü net ve kısa olsun; tek bir kazanımı ölçsün. Gereksiz hikâye/metin ekleme.',
      'Şıklarda biçim tutarlılığı zorunlu: hepsi tek kelime/hepsi ekli biçim/hepsi kısa ifade. Uzun cümle kurma.',
      'Çeldiriciler mantıklı olsun: en sık yapılan hatalara dayansın (benzer ek, benzer sözcük türü, benzer zaman). Rastgele/absürt seçenek yazma.',
      'Tek doğru cevap üret; doğru cevabı dil bilgisi kuralıyla doğrulanabilir yap. Muğlak/iki doğruya açık kurgudan kaçın.',
      'Özel ad yazımı, kısaltmalar, yabancı kelimeler ve tartışmalı imla detaylarından kaçın (G4+ hariç yine de sade tut).',
    ],
  },
  tarih: {
    label: 'Tarih',
    topic: 'history',
    rules: [
      'Tartışmalı, yoruma açık sorulardan kaçın.',
      'Temel kavramlar, önemli olaylar/kişiler (yaşa uygun).',
      'İmkansız ayrıntı (tarih/ay/gün) sorma.',
    ],
  },
  cografya: {
    label: 'Coğrafya',
    topic: 'geography',
    rules: [
      'Harita gerektirmeyen, temel coğrafya bilgisi sor.',
      'Yer şekilleri, iklim, temel kavramlar (deniz/dağ/ova).',
      'Çok spesifik detaylardan kaçın (küçük ilçe/dağ adı vb.).',
    ],
  },
  'genel-kultur': {
    label: 'Genel Kültür',
    topic: 'general_knowledge',
    rules: [
      'Günlük hayat, temel bilgiler, çocukların bildiği kavramlar.',
      'Tek doğru cevabı olan, net sorular üret.',
      'Aşırı “yetişkin” bilgi (politika, hassas konular) sorma.',
    ],
  },
};

