'use client';

/**
 * Artwork Color Extraction & Dynamic Palette Engine
 * 
 * Migrated from reference GULLYGANG architecture (app.js).
 * Extracts dominant, secondary, accent, and deep shadow tones directly
 * from the active song's center artwork (100% dynamic, no hardcoded colors).
 */

export interface ArtworkPalette {
  dominant: string;
  secondary: string;
  accent: string;
  darkBase: string;
}

export const DEFAULT_PALETTE: ArtworkPalette = {
  dominant: 'rgb(42, 58, 78)',
  secondary: 'rgb(24, 38, 52)',
  accent: 'rgb(80, 118, 160)',
  darkBase: 'rgb(8, 11, 16)',
};

const paletteCache = new Map<string, ArtworkPalette>();

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function extractFromImageData(imgData: Uint8ClampedArray): ArtworkPalette {
  if (!imgData || imgData.length === 0) return DEFAULT_PALETTE;

  const pixels: Array<{ r: number; g: number; b: number; h: number; s: number; l: number; score: number }> = [];
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  let whiteCount = 0, blackCount = 0;

  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];
    if (a < 128) continue;

    sumR += r;
    sumG += g;
    sumB += b;
    count++;

    const [h, s, l] = rgbToHsl(r, g, b);

    if (l >= 90 && s < 12) whiteCount++;
    if (l <= 8) blackCount++;

    if (l >= 8 && l <= 88) {
      const score = s * 2.2 + (100 - Math.abs(50 - l) * 1.3);
      pixels.push({ r, g, b, h, s, l, score });
    }
  }

  if (count === 0) return DEFAULT_PALETTE;

  // Minimalist / Monochromatic cover fallback
  if (pixels.length < 20) {
    const avgR = Math.round(sumR / count);
    const avgG = Math.round(sumG / count);
    const avgB = Math.round(sumB / count);
    const isWhiteDom = whiteCount / count > 0.45;
    const isBlackDom = blackCount / count > 0.45;

    if (isWhiteDom) {
      return {
        dominant: 'rgb(45, 48, 55)',
        secondary: 'rgb(25, 28, 35)',
        accent: 'rgb(180, 185, 195)',
        darkBase: 'rgb(8, 9, 12)',
      };
    }
    if (isBlackDom) {
      return {
        dominant: 'rgb(24, 25, 30)',
        secondary: 'rgb(14, 15, 18)',
        accent: 'rgb(80, 85, 95)',
        darkBase: 'rgb(4, 5, 7)',
      };
    }
    return {
      dominant: `rgb(${avgR}, ${avgG}, ${avgB})`,
      secondary: `rgb(${Math.round(avgR * 0.7)}, ${Math.round(avgG * 0.7)}, ${Math.round(avgB * 0.7)})`,
      accent: `rgb(${Math.min(255, Math.round(avgR * 1.5))}, ${Math.min(255, Math.round(avgG * 1.5))}, ${Math.min(255, Math.round(avgB * 1.5))})`,
      darkBase: `rgb(${Math.round(avgR * 0.2)}, ${Math.round(avgG * 0.2)}, ${Math.round(avgB * 0.2)})`,
    };
  }

  // Group into 12 hue bins (30 deg slices)
  const bins: Array<{
    count: number;
    totalScore: number;
    sumR: number;
    sumG: number;
    sumB: number;
    sumH: number;
    sumS: number;
    sumL: number;
    pixels: typeof pixels;
  }> = Array.from({ length: 12 }, () => ({
    count: 0,
    totalScore: 0,
    sumR: 0,
    sumG: 0,
    sumB: 0,
    sumH: 0,
    sumS: 0,
    sumL: 0,
    pixels: [],
  }));

  for (const p of pixels) {
    const binIdx = Math.min(11, Math.floor(p.h / 30));
    const bin = bins[binIdx];
    bin.count++;
    bin.totalScore += p.score;
    bin.sumR += p.r;
    bin.sumG += p.g;
    bin.sumB += p.b;
    bin.sumH += p.h;
    bin.sumS += p.s;
    bin.sumL += p.l;
    bin.pixels.push(p);
  }

  // Sort bins by quality score
  const sortedBins = bins
    .filter((b) => b.count >= 4)
    .sort((a, b) => b.totalScore - a.totalScore);

  if (sortedBins.length === 0) return DEFAULT_PALETTE;

  const topBin = sortedBins[0];
  const domH = topBin.sumH / topBin.count;
  const domS = topBin.sumS / topBin.count;
  const domL = topBin.sumL / topBin.count;

  // Boost dominant color saturation & luminance so dark album covers still cast rich ambient gradients
  const [domR, domG, domB] = hslToRgb(
    domH,
    Math.min(100, Math.max(35, Math.round(domS * 1.15))),
    Math.min(55, Math.max(26, Math.round(domL * 1.15)))
  );

  // Find contrasting secondary bin
  let secH = (domH + 45) % 360;
  let secS = domS;
  let secL = domL;
  let hasContrastingBin = false;

  for (let i = 1; i < sortedBins.length; i++) {
    const b = sortedBins[i];
    const bH = b.sumH / b.count;
    const hueDiff = Math.abs(domH - bH);
    const circularDiff = Math.min(hueDiff, 360 - hueDiff);
    if (circularDiff >= 30) {
      secH = bH;
      secS = b.sumS / b.count;
      secL = b.sumL / b.count;
      hasContrastingBin = true;
      break;
    }
  }

  const [secR, secG, secB] = hslToRgb(
    secH,
    Math.min(100, Math.max(30, Math.round(secS * 1.1))),
    Math.min(48, Math.max(20, Math.round(secL * 1.05)))
  );

  // Accent: boosted saturation and luminance
  const [accR, accG, accB] = hslToRgb(
    hasContrastingBin ? secH : (domH + 30) % 360,
    Math.min(100, Math.max(50, Math.round(domS * 1.35 + 20))),
    Math.min(75, Math.max(45, Math.round(domL * 1.25 + 15)))
  );

  // Dark Base: deep foundation
  const [darkR, darkG, darkB] = hslToRgb(
    domH,
    Math.min(55, Math.round(domS * 0.5)),
    Math.max(4, Math.min(10, Math.round(domS * 0.06 + 4)))
  );

  return {
    dominant: `rgb(${domR}, ${domG}, ${domB})`,
    secondary: `rgb(${secR}, ${secG}, ${secB})`,
    accent: `rgb(${accR}, ${accG}, ${accB})`,
    darkBase: `rgb(${darkR}, ${darkG}, ${darkB})`,
  };
}

export async function extractPaletteFromArtwork(
  imageUrl: string,
  cacheKey?: string
): Promise<ArtworkPalette> {
  if (typeof window === 'undefined' || !imageUrl) return DEFAULT_PALETTE;

  const key = cacheKey || imageUrl;
  if (paletteCache.has(key)) {
    return paletteCache.get(key)!;
  }

  return new Promise<ArtworkPalette>((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      resolve(DEFAULT_PALETTE);
      return;
    }

    const timeout = setTimeout(() => {
      paletteCache.set(key, DEFAULT_PALETTE);
      resolve(DEFAULT_PALETTE);
    }, 2500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        ctx.drawImage(img, 0, 0, 48, 48);
        const imgData = ctx.getImageData(0, 0, 48, 48).data;
        const pal = extractFromImageData(imgData);
        paletteCache.set(key, pal);
        resolve(pal);
      } catch {
        paletteCache.set(key, DEFAULT_PALETTE);
        resolve(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      paletteCache.set(key, DEFAULT_PALETTE);
      resolve(DEFAULT_PALETTE);
    };

    img.src = imageUrl;
  });
}

export function applyArtworkPalette(palette: ArtworkPalette) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--artwork-dominant', palette.dominant);
  root.style.setProperty('--artwork-secondary', palette.secondary);
  root.style.setProperty('--artwork-accent', palette.accent);
  root.style.setProperty('--artwork-dark', palette.darkBase);

  // Format glow color with alpha
  const accMatch = palette.accent.match(/\d+/g);
  if (accMatch && accMatch.length >= 3) {
    root.style.setProperty(
      '--artwork-glow',
      `rgba(${accMatch[0]}, ${accMatch[1]}, ${accMatch[2]}, 0.22)`
    );
  }
}
