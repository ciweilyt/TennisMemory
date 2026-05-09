import { Gender, PlayStyle } from '@/types/player';

const PIXEL_COLORS = [
  ['#1A6B4C', '#2E8B6A', '#4CAF7D'],
  ['#E74C3C', '#FF6B6B', '#FF8E8E'],
  ['#3498DB', '#5DADE2', '#85C1E9'],
  ['#F39C12', '#F5B041', '#F7C561'],
  ['#9B59B6', '#AF7AC5', '#C39BD3'],
  ['#1ABC9C', '#48C9B0', '#76D7C4'],
  ['#E67E22', '#EB984E', '#F0B27A'],
  ['#2C3E50', '#34495E', '#5D6D7E'],
  ['#D4F34A', '#DFF96A', '#E8FC8A'],
  ['#FF6B9D', '#FF8DB5', '#FFAFCD'],
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

function pickByHash<T>(arr: T[], hash: number): T {
  return arr[hash % arr.length];
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

function generatePixelGrid(hash: number): number[][] {
  const grid: number[][] = [];
  const size = 5;
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < Math.ceil(size / 2); x++) {
      const val = (hash >> (y * 3 + x)) & 1;
      row.push(val);
    }
    const fullRow = [...row];
    for (let x = Math.floor(size / 2) - 1; x >= 0; x--) {
      fullRow.push(row[x]);
    }
    grid.push(fullRow.slice(0, size));
  }
  return grid;
}

export function generateAvatarSVG(
  name: string,
  gender: Gender,
  playStyle: PlayStyle,
  ntrpLevel: string,
  isLefty: boolean
): string {
  const h = hashCode(name);
  const palette = pickByHash(PIXEL_COLORS, h);
  const bgColor = palette[0];
  const fgColor = palette[1];
  const accentColor = palette[2];

  const grid = generatePixelGrid(h + 7);

  const pixelSize = 16;
  const padding = 10;
  const svgSize = grid.length * pixelSize + padding * 2;

  let pixelsSVG = '';
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x]) {
        const px = padding + x * pixelSize;
        const py = padding + y * pixelSize;
        pixelsSVG += `<rect x="${px}" y="${py}" width="${pixelSize}" height="${pixelSize}" fill="${fgColor}"/>`;
      }
    }
  }

  let borderSVG = '';
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x]) {
        const hasTop = y === 0 || !grid[y - 1][x];
        const hasBottom = y === grid.length - 1 || !grid[y + 1][x];
        const hasLeft = x === 0 || !grid[y][x - 1];
        const hasRight = x === grid[y].length - 1 || !grid[y][x + 1];
        const px = padding + x * pixelSize;
        const py = padding + y * pixelSize;
        if (hasTop) borderSVG += `<line x1="${px}" y1="${py}" x2="${px + pixelSize}" y2="${py}" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>`;
        if (hasBottom) borderSVG += `<line x1="${px}" y1="${py + pixelSize}" x2="${px + pixelSize}" y2="${py + pixelSize}" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>`;
        if (hasLeft) borderSVG += `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + pixelSize}" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>`;
        if (hasRight) borderSVG += `<line x1="${px + pixelSize}" y1="${py}" x2="${px + pixelSize}" y2="${py + pixelSize}" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>`;
      }
    }
  }

  const ntrpNum = parseFloat(ntrpLevel) || 0;
  let badgeSVG = '';
  if (ntrpNum >= 4.5) {
    badgeSVG = `<circle cx="${svgSize - 8}" cy="12" r="8" fill="${accentColor}"/>
                <text x="${svgSize - 8}" y="16" font-size="10" text-anchor="middle" fill="white" font-weight="bold">★</text>`;
  } else if (ntrpNum >= 4.0) {
    badgeSVG = `<circle cx="${svgSize - 8}" cy="12" r="8" fill="${fgColor}"/>
                <text x="${svgSize - 8}" y="16" font-size="10" text-anchor="middle" fill="white" font-weight="bold">✦</text>`;
  }

  const playStyleIcon = playStyle === 'serve_volley' ? '🏐' : playStyle === 'baseline' ? '🎯' : playStyle === 'all_court' ? '⚡' : '🛡️';
  const styleBadgeSVG = `<text x="12" y="${svgSize - 4}" font-size="12" text-anchor="middle">${playStyleIcon}</text>`;

  const leftyBadge = isLefty ? `<text x="${svgSize - 4}" y="${svgSize - 4}" font-size="10" text-anchor="end">🤚</text>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="200" height="200">
  <defs>
    <clipPath id="pixelClip"><rect x="0" y="0" width="${svgSize}" height="${svgSize}" rx="8"/></clipPath>
  </defs>
  <g clip-path="url(#pixelClip)">
    <rect x="0" y="0" width="${svgSize}" height="${svgSize}" fill="${bgColor}"/>
    ${pixelsSVG}
    ${borderSVG}
  </g>
  ${badgeSVG}
  ${styleBadgeSVG}
  ${leftyBadge}
</svg>`;
}

export function svgToDataURI(svg: string): string {
  const encoded = base64Encode(svg);
  return 'data:image/svg+xml;base64,' + encoded;
}

export function generateAvatarURI(
  name: string,
  gender: Gender,
  playStyle: PlayStyle,
  ntrpLevel: string,
  isLefty: boolean
): string {
  try {
    const svg = generateAvatarSVG(name, gender, playStyle, ntrpLevel, isLefty);
    return svgToDataURI(svg);
  } catch (e) {
    console.error('[AvatarGenerator] generateAvatarURI error:', e);
    return '';
  }
}
