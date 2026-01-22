import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AgeGroup, getAgeGroupConfig } from '../utils/ageGroups';

interface Theme {
  ageGroup: AgeGroup;
  colors: ReturnType<typeof getAgeGroupConfig>['colors'];
  fontSize: ReturnType<typeof getAgeGroupConfig>['fontSize'];
}

interface ThemeContextType {
  theme: Theme;
  setAgeGroup: (ageGroup: AgeGroup) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [ageGroup, setAgeGroupState] = useState<AgeGroup>('G3');

  const config = getAgeGroupConfig(ageGroup);

  const theme: Theme = {
    ageGroup,
    colors: config.colors,
    fontSize: config.fontSize,
  };

  const setAgeGroup = (newAgeGroup: AgeGroup) => {
    setAgeGroupState(newAgeGroup);
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
