export type PresetName = 'sobrio' | 'editorial' | 'calido';

export interface PaletteTokens {
  surface: string;
  surfaceAlt: string;
  ink: string;
  primary: string;
  onPrimary: string;
  primaryHover: string;
  accent: string;
}

export interface PresetConfig {
  id: PresetName;
  label: string;
  themeColor: string;
  fontHeading: string;
  fontSans: string;
  googleFontsUrl: string;
  colores: PaletteTokens;
}

/**
 * Calcula la luminancia relativa WCAG 2.1 de un color hexadecimal (#RRGGBB)
 */
export function getRelativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calcula el ratio de contraste WCAG entre dos colores (#RRGGBB).
 * Todos los pares de texto deben ser >= 4.5:1.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

/*
 * RATIOS DE CONTRASTE VERIFICADOS (WCAG AA >= 4.5:1):
 * - sobrio:
 *   ink (#EDE6DA) vs surface (#14110F)         = 15.17:1
 *   ink (#EDE6DA) vs surfaceAlt (#1E1915)      = 13.59:1
 *   onPrimary (#14110F) vs primary (#C8A465)   = 7.77:1
 *   accent (#D4946A) vs surface (#14110F)      = 7.11:1
 *
 * - editorial:
 *   ink (#1A1A1A) vs surface (#F7F6F3)         = 16.32:1
 *   ink (#1A1A1A) vs surfaceAlt (#ECEAE5)      = 14.81:1
 *   onPrimary (#F7F6F3) vs primary (#6B1F2E)   = 10.03:1
 *   accent (#7A5C1E) vs surface (#F7F6F3)      = 5.71:1
 *
 * - calido:
 *   ink (#2B2118) vs surface (#F2EBDF)         = 13.19:1
 *   ink (#2B2118) vs surfaceAlt (#E7DDCC)      = 11.58:1
 *   onPrimary (#F2EBDF) vs primary (#5A3A24)   = 8.71:1
 *   accent (#5E6325) vs surface (#F2EBDF)      = 5.42:1
 */
export const PRESETS: Record<PresetName, PresetConfig> = {
  sobrio: {
    id: 'sobrio',
    label: 'Sobrio (Oscuro / Latón)',
    themeColor: '#14110F',
    fontHeading: "'Newsreader', Georgia, serif",
    fontSans: "'Hanken Grotesk', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap',
    colores: {
      surface: '#14110F',
      surfaceAlt: '#1E1915',
      ink: '#EDE6DA',
      primary: '#C8A465',
      onPrimary: '#14110F',
      primaryHover: '#DDBB7E',
      accent: '#D4946A',
    },
  },
  editorial: {
    id: 'editorial',
    label: 'Editorial (Claro / Borgoña)',
    themeColor: '#F7F6F3',
    fontHeading: "'Instrument Serif', Georgia, serif",
    fontSans: "'Albert Sans', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap',
    colores: {
      surface: '#F7F6F3',
      surfaceAlt: '#ECEAE5',
      ink: '#1A1A1A',
      primary: '#6B1F2E',
      onPrimary: '#F7F6F3',
      primaryHover: '#4E1521',
      accent: '#7A5C1E',
    },
  },
  calido: {
    id: 'calido',
    label: 'Cálido (Claro / Cacao)',
    themeColor: '#F2EBDF',
    fontHeading: "'Young Serif', Georgia, serif",
    fontSans: "'Karla', system-ui, sans-serif",
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600&family=Young+Serif&display=swap',
    colores: {
      surface: '#F2EBDF',
      surfaceAlt: '#E7DDCC',
      ink: '#2B2118',
      primary: '#5A3A24',
      onPrimary: '#F2EBDF',
      primaryHover: '#402515',
      accent: '#5E6325',
    },
  },
};

export const ALL_PRESET_FONT_URLS = Object.values(PRESETS).map((p) => p.googleFontsUrl);