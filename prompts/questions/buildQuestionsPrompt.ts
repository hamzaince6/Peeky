import { AGE_GROUP_PROFILES, AgeGroupId } from './ageGroups';
import { CATEGORY_PROFILES, CategoryId } from './categories';

export type BuildQuestionsPromptInput = {
  ageGroup: string;
  count: number;
  category?: string;
  categories?: string[];
};

const normalizeAgeGroup = (ageGroup: string): AgeGroupId => {
  const key = (ageGroup || '').trim();
  if (
    key === 'PRESCHOOL' ||
    key === 'EARLY_PRIMARY' ||
    key === 'LATE_PRIMARY' ||
    key === 'MIDDLE_SCHOOL' ||
    key === 'HIGH_SCHOOL' ||
    key === 'ADULT'
  ) {
    return key;
  }

  // Legacy values (old G1..G5)
  const legacy = (key || '').toUpperCase();
  switch (legacy) {
    case 'G2':
      return 'PRESCHOOL';
    case 'G3':
      return 'EARLY_PRIMARY';
    case 'G4':
      return 'LATE_PRIMARY';
    case 'G5':
      return 'MIDDLE_SCHOOL';
    default:
      return 'EARLY_PRIMARY';
  }
};

const normalizeCategory = (cat: string): CategoryId | null => {
  const key = (cat || '').trim();
  if (
    key === 'matematik' ||
    key === 'fen' ||
    key === 'turkce' ||
    key === 'tarih' ||
    key === 'cografya' ||
    key === 'genel-kultur'
  ) {
    return key;
  }
  return null;
};

/**
 * Yaş grubu + kategori promptlarını ayrı dosyalardan toplayıp
 * tek bir “final prompt” üretir.
 *
 * Sen artık yaş ve kategori bazında `prompts/questions/*` altındaki dosyaları
 * istediğin gibi güzelleştirebilirsin.
 */
export function buildQuestionsPrompt(input: BuildQuestionsPromptInput): string {
  const ageId = normalizeAgeGroup(input.ageGroup);
  const ageProfile = AGE_GROUP_PROFILES[ageId];

  const selectedCatsRaw = input.categories && input.categories.length > 0
    ? input.categories
    : input.category
      ? [input.category]
      : ['genel-kultur'];

  const selectedCats = selectedCatsRaw
    .map(normalizeCategory)
    .filter((x): x is CategoryId => Boolean(x));

  const catsForPrompt = selectedCats.length > 0 ? selectedCats : (['genel-kultur'] as CategoryId[]);

  const categoryLabels = catsForPrompt.map((c) => CATEGORY_PROFILES[c].label).join(', ');
  const allowedTopics = catsForPrompt.map((c) => CATEGORY_PROFILES[c].topic).join(', ');

  const categoryRulesBlock = catsForPrompt
    .map((c) => {
      const p = CATEGORY_PROFILES[c];
      return [
        `- ${p.label} (topic: ${p.topic})`,
        ...p.rules.map((r) => `  - ${r}`),
      ].join('\n');
    })
    .join('\n');

  const ageRulesBlock = ageProfile.rules.map((r) => `- ${r}`).join('\n');

  return [
    // Rol / amaç
    `Sen Peeky AI’sın. ${ageProfile.label} için ${input.count} adet çoktan seçmeli soru üreteceksin.`,
    ``,
    `Kategoriler: ${categoryLabels}`,
    ``,
    `FORMAT (ÇOK ÖNEMLİ):`,
    `- Sadece ve sadece geçerli bir JSON array döndür (markdown, açıklama, metin yok).`,
    `- Array elemanları şu şemada olsun:`,
    `  { "text": string, "options": [string,string,string,string], "correct_index": 0|1|2|3, "topic"?: string }`,
    ``,
    `GENEL KURALLAR:`,
    `- Her soru 4 seçenekli olmalı.`,
    `- Tek bir doğru cevap olmalı; belirsiz/tartışmalı soru yazma.`,
    `- Şıklar birbirine benzer formatta olsun; “hepsi/hiçbiri” gibi seçeneklerden kaçın.`,
    `- correct_index mutlaka options içindeki doğru şıkla uyuşsun.`,
    `- "topic" alanı şu değerlerden biri olmalı: ${allowedTopics}`,
    ``,
    `YAŞ GRUBU KURALLARI (${ageProfile.label}):`,
    ageRulesBlock,
    ``,
    `KATEGORİ KURALLARI:`,
    categoryRulesBlock,
    ``,
    `DAĞILIM:`,
    catsForPrompt.length > 1
      ? `- Soruları kategoriler arasında olabildiğince dengeli dağıt (her kategoriye en az 1 soru).`
      : `- Tüm sorular bu kategoriye uygun olsun.`,
    ``,
    `ÇIKTI:`,
    `- Tam olarak ${input.count} adet soru içeren JSON array döndür.`,
  ].join('\n');
}

