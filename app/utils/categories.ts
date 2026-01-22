export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'matematik',
    name: 'Matematik',
    emoji: '🔢',
    description: 'Sayılar, işlemler, problemler',
  },
  {
    id: 'fen',
    name: 'Fen Bilimleri',
    emoji: '🔬',
    description: 'Doğa, hayvanlar, bilim',
  },
  {
    id: 'turkce',
    name: 'Türkçe',
    emoji: '📖',
    description: 'Okuma, yazma, dilbilgisi',
  },
  {
    id: 'tarih',
    name: 'Tarih',
    emoji: '🏛️',
    description: 'Geçmiş, olaylar, medeniyetler',
  },
  {
    id: 'cografya',
    name: 'Coğrafya',
    emoji: '🌍',
    description: 'Ülkeler, şehirler, doğa',
  },
  {
    id: 'genel-kultur',
    name: 'Genel Kültür',
    emoji: '🧠',
    description: 'Genel bilgi, kültür',
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoriesByIds = (ids: string[]): Category[] => {
  return CATEGORIES.filter((cat) => ids.includes(cat.id));
};
