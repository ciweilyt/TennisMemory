import { Gender, PlayStyle } from '@/types/player';

const BG_COLORS = [
  '#1A6B4C', '#2E8B6A', '#4CAF7D',
  '#E74C3C', '#FF6B6B',
  '#3498DB', '#5DADE2',
  '#F39C12', '#F5B041',
  '#9B59B6', '#AF7AC5',
  '#1ABC9C', '#48C9B0',
  '#E67E22', '#EB984E',
  '#2C3E50', '#34495E',
  '#D4F34A', '#FF6B9D',
  '#00BCD4', '#8BC34A',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function base64Encode(str: string): string {
  try {
    if (typeof btoa === 'function') {
      return btoa(unescape(encodeURIComponent(str)));
    }
  } catch {}
  try {
    const arr = [];
    for (let i = 0; i < str.length; i++) {
      arr.push(str.charCodeAt(i));
    }
    const uint8 = new Uint8Array(arr);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    if (typeof btoa === 'function') {
      return btoa(binary);
    }
    return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
  } catch {
    return encodeURIComponent(str);
  }
}

export function generateAvatarSVG(
  name: string,
  _gender?: Gender,
  _playStyle?: PlayStyle,
  _ntrpLevel?: string,
  _isLefty?: boolean
): string {
  const h = hashCode(name);
  const bgColor = BG_COLORS[h % BG_COLORS.length];
  const initial = name.charAt(0).toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <rect x="0" y="0" width="100" height="100" rx="16" fill="${bgColor}"/>
  <text x="50" y="62" font-size="48" font-weight="bold" text-anchor="middle" fill="white" font-family="system-ui, sans-serif">${initial}</text>
</svg>`;
}

export function svgToDataURI(svg: string): string {
  const encoded = base64Encode(svg);
  return 'data:image/svg+xml;base64,' + encoded;
}

export function generateAvatarURI(
  name: string,
  gender?: Gender,
  playStyle?: PlayStyle,
  ntrpLevel?: string,
  isLefty?: boolean
): string {
  try {
    const svg = generateAvatarSVG(name, gender, playStyle, ntrpLevel, isLefty);
    return svgToDataURI(svg);
  } catch (e) {
    console.error('[AvatarGenerator] generateAvatarURI error:', e);
    return '';
  }
}
