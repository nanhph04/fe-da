import { theme } from "@/design-system/tokens/theme";

export const colors = {
  primary: (shade: number) =>
    theme.colors.primary[shade as keyof typeof theme.colors.primary],
  secondary: (shade: number) =>
    theme.colors.secondary[shade as keyof typeof theme.colors.secondary],
  background: (shade: number) =>
    theme.colors.background[shade as keyof typeof theme.colors.background],
  text: (shade: number) =>
    theme.colors.text[shade as keyof typeof theme.colors.text],
  border: (shade: number) =>
    theme.colors.border[shade as keyof typeof theme.colors.border],
  success: (shade: number) =>
    theme.colors.success[shade as keyof typeof theme.colors.success],
  error: (shade: number) =>
    theme.colors.error[shade as keyof typeof theme.colors.error],
  warning: (shade: number) =>
    theme.colors.warning[shade as keyof typeof theme.colors.warning],
  info: (shade: number) =>
    theme.colors.info[shade as keyof typeof theme.colors.info],
};

export const colorSchemes = {
  primaryButton: {
    bg: colors.primary(600),
    hover: colors.primary(700),
    text: 'text-black',
    border: colors.border(700),
  },
  secondaryButton: {
    bg: colors.secondary(600),
    hover: colors.secondary(700),
    text: 'text-black',
    border: colors.border(700),
  },
  card: {
    bg: colors.background(950),
    border: colors.border(700),
    text: {
      primary: colors.text(50),
      secondary: colors.text(400),
    },
  },
  input: {
    bg: colors.background(950),
    border: colors.border(700),
    focus: colors.primary(600),
    text: colors.text(50),
  },
};
