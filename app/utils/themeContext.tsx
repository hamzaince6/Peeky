import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AgeGroup, AGE_GROUPS, getAgeGroupConfig, normalizeAgeGroup } from './ageGroups';

interface Theme {
  ageGroup: AgeGroup;
  colors: ReturnType<typeof getAgeGroupConfig>['colors'];
  fontSize: ReturnType<typeof getAgeGroupConfig>['fontSize'];
}

interface ThemeContextType {
  theme: Theme;
  setAgeGroup: (ageGroup: AgeGroup | string | null | undefined) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [ageGroup, setAgeGroupState] = useState<AgeGroup>(normalizeAgeGroup('EARLY_PRIMARY'));

  // Defensive: ageGroup might come from legacy/invalid persisted values
  const config = getAgeGroupConfig(ageGroup) ?? AGE_GROUPS.EARLY_PRIMARY;

  const theme: Theme = {
    ageGroup,
    colors: config.colors,
    fontSize: config.fontSize,
  };

  const setAgeGroup = (newAgeGroup: AgeGroup | string | null | undefined) => {
    setAgeGroupState(normalizeAgeGroup(newAgeGroup));
  };

  return (
    <ThemeContext.Provider value={{ theme, setAgeGroup }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
