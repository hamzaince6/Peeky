export type AgeGroup = 'G1' | 'G2' | 'G3' | 'G4' | 'G5';

export interface AgeGroupConfig {
  id: AgeGroup;
  label: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontSize: {
    title: number;
    body: number;
    button: number;
  };
  description: string;
}

export const AGE_GROUPS: Record<AgeGroup, AgeGroupConfig> = {
  G1: {
    id: 'G1',
    label: 'Bebekler',
    ageRange: '0-3 yaş',
    minAge: 0,
    maxAge: 3,
    colors: {
      primary: '#FFB6C1', // Light pink
      secondary: '#FFC0CB', // Pink
      accent: '#FF69B4', // Hot pink
      background: '#FFF0F5', // Lavender blush
      text: '#8B0000', // Dark red
    },
    fontSize: {
      title: 32,
      body: 20,
      button: 24,
    },
    description: 'Renk tanıma ve temel şekiller',
  },
  G2: {
    id: 'G2',
    label: 'Okul Öncesi',
    ageRange: '3-5 yaş',
    minAge: 3,
    maxAge: 5,
    colors: {
      primary: '#87CEEB', // Sky blue
      secondary: '#87CEFA', // Light sky blue
      accent: '#4169E1', // Royal blue
      background: '#E0FFFF', // Light cyan
      text: '#1E90FF', // Dodger blue
    },
    fontSize: {
      title: 28,
      body: 18,
      button: 20,
    },
    description: 'Sayılar, hayvanlar, temel sözcükler',
  },
  G3: {
    id: 'G3',
    label: 'İlkokul (Başlangıç)',
    ageRange: '5-8 yaş',
    minAge: 5,
    maxAge: 8,
    colors: {
      primary: '#FFD700', // Gold
      secondary: '#FFA500', // Orange
      accent: '#FF8C00', // Dark orange
      background: '#FFFACD', // Light yellow
      text: '#FF6347', // Tomato
    },
    fontSize: {
      title: 26,
      body: 16,
      button: 18,
    },
    description: 'Matematik, okuma, bilim temeleri',
  },
  G4: {
    id: 'G4',
    label: 'İlkokul (İleri)',
    ageRange: '8-12 yaş',
    minAge: 8,
    maxAge: 12,
    colors: {
      primary: '#98FB98', // Pale green
      secondary: '#00FA9A', // Medium spring green
      accent: '#00B050', // Green
      background: '#E0FFE0', // Light green
      text: '#006400', // Dark green
    },
    fontSize: {
      title: 24,
      body: 15,
      button: 17,
    },
    description: 'Zorlayıcı matematik, fen bilimleri, mantık',
  },
  G5: {
    id: 'G5',
    label: 'Ortaokul',
    ageRange: '12-15 yaş',
    minAge: 12,
    maxAge: 15,
    colors: {
      primary: '#DDA0DD', // Plum
      secondary: '#DA70D6', // Orchid
      accent: '#8B00FF', // Violet
      background: '#F0E6FF', // Light lavender
      text: '#4B0082', // Indigo
    },
    fontSize: {
      title: 22,
      body: 14,
      button: 16,
    },
    description: 'Karmaşık problemler, eleştirel düşünme',
  },
};

export const getAgeGroupConfig = (ageGroup: AgeGroup): AgeGroupConfig => {
  return AGE_GROUPS[ageGroup];
};

export const getAgeGroupByAge = (age: number): AgeGroup => {
  if (age < 3) return 'G1';
  if (age < 5) return 'G2';
  if (age < 8) return 'G3';
  if (age < 12) return 'G4';
  return 'G5';
};
