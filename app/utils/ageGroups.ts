// Age groups start from preschool, up to adult.
export type AgeGroup =
  | 'PRESCHOOL' // 3-5
  | 'EARLY_PRIMARY' // 5-8
  | 'LATE_PRIMARY' // 8-12
  | 'MIDDLE_SCHOOL' // 12-15
  | 'HIGH_SCHOOL' // 15-18
  | 'ADULT'; // 18+

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
  PRESCHOOL: {
    id: 'PRESCHOOL',
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
    description: 'Renkler, şekiller, basit sayma',
  },
  EARLY_PRIMARY: {
    id: 'EARLY_PRIMARY',
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
    description: 'Temel matematik, okuma, fen',
  },
  LATE_PRIMARY: {
    id: 'LATE_PRIMARY',
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
    description: 'Zorlayıcı matematik, fen, mantık',
  },
  MIDDLE_SCHOOL: {
    id: 'MIDDLE_SCHOOL',
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
  HIGH_SCHOOL: {
    id: 'HIGH_SCHOOL',
    label: 'Lise',
    ageRange: '15-18 yaş',
    minAge: 15,
    maxAge: 18,
    colors: {
      primary: '#60A5FA', // Blue
      secondary: '#3B82F6', // Blue
      accent: '#1D4ED8', // Dark blue
      background: '#EFF6FF', // Light blue bg
      text: '#0F172A', // Slate
    },
    fontSize: {
      title: 20,
      body: 14,
      button: 16,
    },
    description: 'Daha analitik sorular, sağlam çeldiriciler',
  },
  ADULT: {
    id: 'ADULT',
    label: 'Yetişkin',
    ageRange: '18+',
    minAge: 18,
    maxAge: 120,
    colors: {
      primary: '#0F172A', // Slate
      secondary: '#1F2937', // Gray
      accent: '#7000FF', // Brand purple
      background: '#F8FAFC', // App bg
      text: '#0F172A',
    },
    fontSize: {
      title: 20,
      body: 14,
      button: 16,
    },
    description: 'Yetişkinlere uygun genel kültür ve mantık',
  },
};

export const getAgeGroupConfig = (ageGroup: AgeGroup): AgeGroupConfig => {
  return AGE_GROUPS[ageGroup];
};

export const getAgeGroupByAge = (age: number): AgeGroup => {
  if (age < 5) return 'PRESCHOOL';
  if (age < 8) return 'EARLY_PRIMARY';
  if (age < 12) return 'LATE_PRIMARY';
  if (age < 15) return 'MIDDLE_SCHOOL';
  if (age < 18) return 'HIGH_SCHOOL';
  return 'ADULT';
};

export const normalizeAgeGroup = (ageGroup: string | null | undefined): AgeGroup => {
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

  // Legacy support (old G1..G5 stored in AsyncStorage)
  switch ((key || '').toUpperCase()) {
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
