export type AgeGroupId =
  | 'PRESCHOOL'
  | 'EARLY_PRIMARY'
  | 'LATE_PRIMARY'
  | 'MIDDLE_SCHOOL'
  | 'HIGH_SCHOOL'
  | 'ADULT';

export type AgeGroupPromptProfile = {
  label: string;
  /**
   * Yaşa göre dil/karmaşıklık rehberi.
   * Burayı sen rahatça “daha iyi prompt” olacak şekilde genişletebilirsin.
   */
  rules: string[];
};

export const AGE_GROUP_PROFILES: Record<AgeGroupId, AgeGroupPromptProfile> = {
  PRESCHOOL: {
    label: '3-5 yaş (Okul Öncesi)',
    rules: [
      'Okuma-yazma varsayma; çok kısa ve basit sorular yaz.',
      'Renkler, şekiller, temel kavramlar ve günlük yaşam üzerinden git.',
      'Sayı soruları çok küçük aralıkta olsun (0-10) ve çok basit tut.',
      'Seçenekler tek kelime ya da kısa ifade olsun.',
    ],
  },
  EARLY_PRIMARY: {
    label: '5-8 yaş (İlkokul Başlangıç)',
    rules: [
      'Sade Türkçe, 1-2 cümleyi geçmeyen sorular yaz.',
      'Temel toplama/çıkarma, basit okuma-anlama, temel fen kavramları.',
      'Kandırmaca/trick soru yazma; tek doğru cevabı garanti et.',
    ],
  },
  LATE_PRIMARY: {
    label: '8-12 yaş (İlkokul İleri)',
    rules: [
      'Kısa problem soruları olabilir ama gereksiz uzunluk yapma.',
      'Seçenekler mantıklı çeldiriciler içersin, aşırı bariz olmasın.',
      'Tek doğru cevap kuralına sıkı uy.',
    ],
  },
  MIDDLE_SCHOOL: {
    label: '12-15 yaş (Ortaokul)',
    rules: [
      'Biraz daha analitik sorular yaz ama net/ölçülebilir olsun.',
      'Kavram + uygulama karışık sorular olabilir; tek doğru cevabı koru.',
      'Aşırı uzmanlık / tartışmalı cevaplardan kaçın.',
    ],
  },
  HIGH_SCHOOL: {
    label: '15-18 yaş (Lise)',
    rules: [
      'Daha zorlayıcı ama kısa ve net sorular yaz.',
      'Çeldiriciler mantıklı olsun; tek doğru cevabı net tut.',
      'Aşırı ezber/tarih-saat gibi gereksiz ayrıntıdan kaçın.',
    ],
  },
  ADULT: {
    label: '18+ (Yetişkin)',
    rules: [
      'Yetişkin seviyesine uygun genel kültür, mantık ve okuma-anlama soruları yaz.',
      'Hassas içerik, politika, nefret dili gibi alanlardan kaçın.',
      'Tek doğru cevap, net ve ölçülebilir sorular üret.',
    ],
  },
};

