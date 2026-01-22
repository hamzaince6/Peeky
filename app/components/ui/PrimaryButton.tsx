import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../utils/themeContext';

interface PrimaryButtonProps {
  onPress: () => void;
  label: string;
  style?: ViewStyle;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const PrimaryButton = ({
  onPress,
  label,
  style,
  disabled = false,
  size = 'medium',
}: PrimaryButtonProps) => {
  const { theme } = useTheme();

  const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> =
    {
      small: {
        container: { paddingVertical: 10, paddingHorizontal: 20 },
        text: { fontSize: Number(theme.fontSize.button) - 4 },
      },
      medium: {
        container: { paddingVertical: 14, paddingHorizontal: 28 },
        text: { fontSize: Number(theme.fontSize.button) },
      },
      large: {
        container: { paddingVertical: 18, paddingHorizontal: 36 },
        text: { fontSize: Number(theme.fontSize.button) + 2 },
      },
    };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? '#ccc' : theme.colors.primary,
          ...currentSize.container,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: theme.colors.text,
            ...currentSize.text,
            fontWeight: 'bold',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    textAlign: 'center',
  },
});
