export interface PreprocessOptions {
  grayscale?: boolean;
  contrast?: number; // -100 to 100
  brightness?: number; // -100 to 100
  threshold?: number; // 0 to 255, -1 to disable
  sharpen?: boolean;
}

/**
 * Preprocesses an image using HTML5 Canvas to enhance OCR quality
 */
export async function preprocessImage(
  imageDataUrl: string,
  options: PreprocessOptions = {
    grayscale: true,
    contrast: 25,
    brightness: 10,
    threshold: -1,
    sharpen: false,
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }

        // Limit dimensions to max 1600px for speed & OCR clarity
        const maxDimension = 1600;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original
        ctx.drawImage(img, 0, 0, width, height);

        // If no adjustments required, return canvas output
        if (!options.grayscale && !options.contrast && !options.brightness && (options.threshold ?? -1) < 0) {
          resolve(canvas.toDataURL('image/jpeg', 0.92));
          return;
        }

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        const contrastFactor = (259 * ((options.contrast || 0) + 255)) / (255 * (259 - (options.contrast || 0)));
        const brightness = options.brightness || 0;
        const threshold = options.threshold ?? -1;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Grayscale
          if (options.grayscale || threshold >= 0) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = gray;
            g = gray;
            b = gray;
          }

          // Brightness
          if (brightness !== 0) {
            r += brightness;
            g += brightness;
            b += brightness;
          }

          // Contrast
          if (options.contrast !== 0) {
            r = contrastFactor * (r - 128) + 128;
            g = contrastFactor * (g - 128) + 128;
            b = contrastFactor * (b - 128) + 128;
          }

          // Binarize / Threshold
          if (threshold >= 0) {
            const val = r >= threshold ? 255 : 0;
            r = val;
            g = val;
            b = val;
          }

          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        console.warn('Preprocessing canvas error, falling back to original image:', err);
        resolve(imageDataUrl);
      }
    };
    img.onerror = (e) => {
      console.warn('Failed to load image for preprocessing:', e);
      resolve(imageDataUrl);
    };
    img.src = imageDataUrl;
  });
}
