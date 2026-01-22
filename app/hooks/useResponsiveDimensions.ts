import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

interface ResponsiveDimensions {
  isTablet: boolean;
  width: number;
  height: number;
  isLandscape: boolean;
  screenType: 'phone' | 'tablet';
  contentPadding: number;
  gridColumns: number;
}

export const useResponsiveDimensions = (): ResponsiveDimensions => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isLandscape = width > height;
    // Tablet detection: width >= 600dp (common tablet minimum)
    const isTablet = width >= 600;
    const screenType = isTablet ? 'tablet' : 'phone';

    // Responsive padding based on screen size
    const contentPadding = isTablet ? 24 : 16;

    // Grid columns for tablet layouts
    let gridColumns = 1;
    if (isTablet) {
      if (isLandscape) {
        gridColumns = 4;
      } else {
        gridColumns = 2;
      }
    }

    return {
      isTablet,
      width,
      height,
      isLandscape,
      screenType,
      contentPadding,
      gridColumns,
    };
  }, [width, height]);
};

export const useResponsiveFont = () => {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const isTablet = width >= 600;
    const scale = isTablet ? 1.2 : 1;

    return {
      xs: 12 * scale,
      sm: 14 * scale,
      base: 16 * scale,
      lg: 18 * scale,
      xl: 20 * scale,
      '2xl': 24 * scale,
      '3xl': 30 * scale,
      '4xl': 36 * scale,
    };
  }, [width]);
};
