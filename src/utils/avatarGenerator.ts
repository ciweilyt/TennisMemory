import { Gender, PlayStyle } from '@/types/player';

const SKIN_COLORS = ['#FFDBB4', '#F5C5A3', '#E8B48A', '#D4956B'];
const HAIR_COLORS_MALE = ['#2C1810', '#4A3728', '#1A1A2E', '#6B4226', '#8B6914'];
const HAIR_COLORS_FEMALE = ['#2C1810', '#4A3728', '#8B4513', '#D4A76A', '#C0392B', '#2C3E50'];
const SHIRT_COLORS = ['#4A90D9', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#3498DB'];
const RACKET_COLORS = ['#8B4513', '#2C3E50', '#C0392B'];

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

export function generateAvatarSVG(
  name: string,
  gender: Gender,
  playStyle: PlayStyle,
  ntrpLevel: string,
  isLefty: boolean
): string {
  const h = hashCode(name);
  const skinColor = pickByHash(SKIN_COLORS, h);
  const hairColor = gender === 'female' ? pickByHash(HAIR_COLORS_FEMALE, h) : pickByHash(HAIR_COLORS_MALE, h);
  const shirtColor = pickByHash(SHIRT_COLORS, h + 1);
  const racketColor = pickByHash(RACKET_COLORS, h + 2);
  const isMale = gender === 'male';

  let hairSVG = '';
  if (isMale) {
    const styleIdx = h % 3;
    if (styleIdx === 0) {
      hairSVG = `<rect x="28" y="12" width="44" height="20" rx="10" fill="${hairColor}"/>`;
    } else if (styleIdx === 1) {
      hairSVG = `<rect x="25" y="10" width="50" height="16" rx="8" fill="${hairColor}"/>
                 <rect x="22" y="20" width="12" height="20" rx="4" fill="${hairColor}"/>
                 <rect x="66" y="20" width="12" height="20" rx="4" fill="${hairColor}"/>`;
    } else {
      hairSVG = `<rect x="26" y="8" width="48" height="22" rx="12" fill="${hairColor}"/>`;
    }
  } else {
    const styleIdx = h % 3;
    if (styleIdx === 0) {
      hairSVG = `<rect x="24" y="10" width="52" height="18" rx="10" fill="${hairColor}"/>
                 <rect x="20" y="22" width="14" height="40" rx="7" fill="${hairColor}"/>
                 <rect x="66" y="22" width="14" height="40" rx="7" fill="${hairColor}"/>`;
    } else if (styleIdx === 1) {
      hairSVG = `<rect x="22" y="8" width="56" height="20" rx="12" fill="${hairColor}"/>
                 <ellipse cx="30" cy="50" rx="10" ry="20" fill="${hairColor}"/>
                 <ellipse cx="70" cy="50" rx="10" ry="20" fill="${hairColor}"/>`;
    } else {
      hairSVG = `<rect x="24" y="6" width="52" height="24" rx="12" fill="${hairColor}"/>
                 <rect x="20" y="24" width="60" height="12" rx="6" fill="${hairColor}"/>`;
    }
  }

  const eyeY = 42;
  const eyeSpacing = 12;
  const eyeSize = isMale ? 3 : 4;
  const mouthY = isMale ? 54 : 52;
  const blushOpacity = isMale ? 0.2 : 0.35;

  let accessorySVG = '';
  const accIdx = h % 5;
  if (accIdx === 0) {
    accessorySVG = `<circle cx="38" cy="${eyeY}" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
                    <circle cx="62" cy="${eyeY}" r="8" fill="none" stroke="#333" stroke-width="1.5"/>
                    <line x1="46" y1="${eyeY}" x2="54" y2="${eyeY}" stroke="#333" stroke-width="1.5"/>`;
  } else if (accIdx === 1) {
    accessorySVG = `<rect x="36" y="8" width="28" height="4" rx="2" fill="#333"/>`;
  }

  let racketSVG = '';
  const showRacket = h % 2 === 0;
  if (showRacket) {
    const rx = isLefty ? 12 : 88;
    const ry = 40;
    const angle = isLefty ? -30 : 30;
    racketSVG = `<g transform="rotate(${angle} ${rx} ${ry})">
      <rect x="${rx - 2}" y="${ry}" width="4" height="24" rx="2" fill="${racketColor}"/>
      <ellipse cx="${rx}" cy="${ry - 6}" rx="10" ry="14" fill="none" stroke="${racketColor}" stroke-width="2"/>
      <line x1="${rx - 8}" y1="${ry - 6}" x2="${rx + 8}" y2="${ry - 6}" stroke="${racketColor}" stroke-width="0.5" opacity="0.5"/>
      <line x1="${rx}" y1="${ry - 18}" x2="${rx}" y2="${ry + 6}" stroke="${racketColor}" stroke-width="0.5" opacity="0.5"/>
    </g>`;
  }

  const ntrpNum = parseFloat(ntrpLevel) || 0;
  const skillBadge = ntrpNum >= 4.5 ? '⭐' : ntrpNum >= 4.0 ? '✦' : '';
  const skillBadgeSVG = skillBadge
    ? `<text x="82" y="22" font-size="14" text-anchor="middle">${skillBadge}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <defs>
    <clipPath id="circleClip"><circle cx="50" cy="50" r="48"/></clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
    <circle cx="50" cy="50" r="48" fill="#F0F4F0"/>
    <rect x="20" y="65" width="60" height="40" rx="4" fill="${shirtColor}"/>
    <circle cx="50" cy="38" r="22" fill="${skinColor}"/>
    ${hairSVG}
    <circle cx="${50 - eyeSpacing}" cy="${eyeY}" r="${eyeSize}" fill="#2C1810"/>
    <circle cx="${50 + eyeSpacing}" cy="${eyeY}" r="${eyeSize}" fill="#2C1810"/>
    <circle cx="${50 - eyeSpacing + 1}" cy="${eyeY - 1}" r="1.2" fill="white"/>
    <circle cx="${50 + eyeSpacing + 1}" cy="${eyeY - 1}" r="1.2" fill="white"/>
    <ellipse cx="${50 - 16}" cy="50" rx="6" ry="3" fill="#FF9999" opacity="${blushOpacity}"/>
    <ellipse cx="${50 + 16}" cy="50" rx="6" ry="3" fill="#FF9999" opacity="${blushOpacity}"/>
    <path d="M 44 ${mouthY} Q 50 ${mouthY + 6} 56 ${mouthY}" fill="none" stroke="#2C1810" stroke-width="1.5" stroke-linecap="round"/>
    ${accessorySVG}
    ${racketSVG}
    ${skillBadgeSVG}
  </g>
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
