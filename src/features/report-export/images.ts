import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/** An image ready for export: a data: URL plus its aspect ratio (width / height). */
export interface ExportImage { data: string; aspect: number }

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image could not be loaded'));
    img.src = src;
  });
}

/**
 * Loads an image URL (Cloudinary, the API media route or a bundled asset) and
 * re-encodes it as PNG/JPEG so every export format can embed it. Returns null
 * when the image is missing or cannot be read — reports then show initials.
 */
export async function fetchImage(url: string | null | undefined, maxPx = 800): Promise<ExportImage | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return null;
    const source = await blobToDataUrl(await response.blob());
    const img = await loadImage(source);
    const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const isJpeg = /jpe?g/i.test(source.slice(5, 20));
    return { data: canvas.toDataURL(isJpeg ? 'image/jpeg' : 'image/png', 0.9), aspect: canvas.width / canvas.height };
  } catch {
    return null;
  }
}

/** Crops an image to `aspect` around its centre (for full-bleed covers). */
export async function cropToAspect(image: ExportImage, aspect: number): Promise<ExportImage> {
  if (Math.abs(image.aspect - aspect) < 0.01) return image;
  const img = await loadImage(image.data);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const cw = image.aspect > aspect ? h * aspect : w;
  const ch = image.aspect > aspect ? h : w / aspect;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cw);
  canvas.height = Math.round(ch);
  const ctx = canvas.getContext('2d');
  if (!ctx) return image;
  ctx.drawImage(img, (w - cw) / 2, (h - ch) / 2, cw, ch, 0, 0, canvas.width, canvas.height);
  return { data: canvas.toDataURL('image/jpeg', 0.88), aspect };
}

/** Rasterises SVG markup to a PNG data URL at `scale`× its size. */
export async function svgToPng(svg: string, width: number, height: number, scale = 2): Promise<ExportImage> {
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { data: canvas.toDataURL('image/png'), aspect: width / height };
}

/** A lucide icon as a PNG (used for SWOT, insights and navigation icons). */
export function iconPng(Icon: ComponentType<Record<string, unknown>>, color: string, size = 96, strokeWidth = 2): Promise<ExportImage> {
  const markup = renderToStaticMarkup(createElement(Icon, { color, size, strokeWidth, xmlns: 'http://www.w3.org/2000/svg' }));
  return svgToPng(markup, size, size, 2);
}

/** Initials for people and companies without a picture: "Aliko Dangote" → "AD". */
export function initials(name: string): string {
  const parts = name.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return `${parts[0].charAt(0)}${parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''}`.toUpperCase();
}

let measureCtx: CanvasRenderingContext2D | null = null;

/** Width of `text` in inches at `size` pt (Arial/Helvetica metrics). */
export function textWidth(text: string, size: number, bold = false): number {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) return text.length * size * 0.5 / 72;
  measureCtx.font = `${bold ? 'bold ' : ''}${size}px Arial, Helvetica, sans-serif`;
  return measureCtx.measureText(text).width / 72;
}

/** Word-wraps `text` into lines no wider than `width` inches. */
export function wrapText(text: string, width: number, size: number, bold = false): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && textWidth(next, size, bold) > width) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Largest font size (≤ max) at which `text` fits in the box. */
export function fitFontSize(text: string, w: number, h: number, max: number, min = 7, bold = false, lineHeight = 1.2): number {
  for (let size = max; size > min; size -= 0.5) {
    if (wrapText(text, w, size, bold).length * size * lineHeight / 72 <= h) return size;
  }
  return min;
}
