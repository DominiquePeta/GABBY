// Design tokens lifted from the Claude Design prototype (project/GABBY.dc.html).
// Client side = light/warm; driver side = dark/high-contrast; admin = neutral dark header.

export const color = {
  appBg: '#E8E2DC',

  client: {
    bg: '#FAF6F3',
    chip: '#F1EAE4',
    text: '#221E1C',
    textMuted: '#6E6660',
    textFaint: '#8A817C',
    textFainter: '#A6968C',
    border: 'rgba(34,30,28,.10)',
    borderStrong: 'rgba(34,30,28,.14)',
    accent: '#A14D72',
    accentHover: '#8E4364',
    onAccent: '#FFFFFF',
    dark: '#221E1C',
    darkHover: '#100E0D',
    onDark: '#F2EFEA',
    onDarkAmber: '#E8B33D',
  },

  driver: {
    bg: '#17161A',
    panel: '#221F26',
    panelAlt: '#1A181E',
    text: '#F2EFEA',
    textMuted: '#918B97',
    textFaint: '#6E6875',
    textFainter: '#C8C2CE',
    border: 'rgba(242,239,234,.10)',
    borderFaint: 'rgba(242,239,234,.07)',
    amber: '#E8B33D',
    amberHover: '#D8A32E',
    onAmber: '#17161A',
  },

  admin: {
    bg: '#F4F2EF',
    header: '#221E1C',
  },

  success: '#2F6B52',
  successBg: '#EAF1EC',
  successBgDark: 'rgba(47,107,82,.16)',
  danger: '#B5432F',
  dangerBorder: 'rgba(181,67,47,.35)',
} as const;

export const radius = {
  sm: 11,
  md: 14,
  lg: 18,
  xl: 20,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const font = {
  regular: 'Archivo_400Regular',
  medium: 'Archivo_500Medium',
  semibold: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  mono: 'Menlo',
};

export const fontsToLoad = {
  Archivo_400Regular: require('@expo-google-fonts/archivo/400Regular/Archivo_400Regular.ttf'),
  Archivo_500Medium: require('@expo-google-fonts/archivo/500Medium/Archivo_500Medium.ttf'),
  Archivo_600SemiBold: require('@expo-google-fonts/archivo/600SemiBold/Archivo_600SemiBold.ttf'),
  Archivo_700Bold: require('@expo-google-fonts/archivo/700Bold/Archivo_700Bold.ttf'),
};
