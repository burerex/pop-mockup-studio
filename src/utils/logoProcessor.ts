import { InkMode, LogoAsset } from '../types';

export function readFileAsLogoAsset(file: File): Promise<LogoAsset> {
  return new Promise((resolve, reject) => {
    const isVector =
      file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 300;
        const h = img.naturalHeight || 300;
        resolve({
          id: `upload-${Date.now()}`,
          name: file.name,
          originalUrl: dataUrl,
          isVector,
          aspectRatio: w / h,
          removeWhiteBg: !isVector && (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')),
        });
      };
      img.onerror = () => reject(new Error('Formato de imagen no compatible.'));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Generates a high-resolution PNG data URL representing the logo
 * in Full Color, Pure White, Pure Black, or Custom 1-Ink color,
 * with optional smart white-background removal for raster files.
 */
export async function processLogoForInk(
  asset: LogoAsset,
  inkMode: InkMode,
  customInkHex: string
): Promise<string> {
  // Fast path: full color without white-bg removal
  if (inkMode === 'full' && !asset.removeWhiteBg) {
    return asset.originalUrl;
  }

  const img = await loadImage(asset.originalUrl);
  const maxDim = 960;
  const naturalW = img.naturalWidth || 600;
  const naturalH = img.naturalHeight || 600;
  const scale = Math.min(maxDim / naturalW, maxDim / naturalH, 2.5);
  const width = Math.max(64, Math.round(naturalW * scale));
  const height = Math.max(64, Math.round(naturalH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return asset.originalUrl;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Optional smart white-background removal (great for JPG/PNG logos with white box)
  if (asset.removeWhiteBg) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a === 0) continue;
      // Compute closeness to pure white
      const minC = Math.min(r, g, b);
      const maxC = Math.max(r, g, b);
      const saturation = maxC - minC;
      if (minC > 236 && saturation < 22) {
        data[i + 3] = 0;
      } else if (minC > 210 && saturation < 28) {
        // Soft anti-aliased edge feathering
        const factor = (236 - minC) / 26;
        data[i + 3] = Math.round(a * Math.max(0, Math.min(1, factor)));
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  if (inkMode === 'full') {
    return canvas.toDataURL('image/png');
  }

  // Tint non-transparent pixels to the selected 1-ink screenprint color
  const targetColor =
    inkMode === 'white'
      ? '#FFFFFF'
      : inkMode === 'black'
        ? '#111827'
        : customInkHex || '#D4AF37';

  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = targetColor;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';

  return canvas.toDataURL('image/png');
}
