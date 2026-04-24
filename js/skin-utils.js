/* ============================================
   MCTools - Skin Image Utilities
   ============================================ */

export function loadImage(fileOrSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (typeof fileOrSrc === 'string') {
      img.src = fileOrSrc;
    } else {
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(fileOrSrc);
    }
  });
}

export function drawPixelated(canvas, img, w, h) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, w, h);
}

export function extractFace(canvas, img, withHelm = true) {
  const size = 8;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  // Face base
  ctx.drawImage(img, 8, 8, size, size, 0, 0, size, size);
  if (withHelm) {
    ctx.drawImage(img, 40, 8, size, size, 0, 0, size, size);
  }
  return canvas;
}

export function extractBodyPreview(canvas, img, scale = 1) {
  // Simple full-body composite on a 16x32 or 16x36 canvas
  // For a quick preview we draw a minimal front-facing body
  const slim = img.width === 64 && img.height === 64 ? false : (img.width === 64 && img.height === 64);
  const w = 16 * scale;
  const h = 32 * scale;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const s = scale;
  // Head
  ctx.drawImage(img, 8, 8, 8, 8, 4 * s, 0, 8 * s, 8 * s);
  ctx.drawImage(img, 40, 8, 8, 8, 4 * s, 0, 8 * s, 8 * s); // hat
  // Body
  ctx.drawImage(img, 20, 20, 8, 12, 4 * s, 8 * s, 8 * s, 12 * s);
  // Arms
  const armW = slim ? 3 : 4;
  ctx.drawImage(img, 44, 20, armW, 12, (4 - armW) * s, 8 * s, armW * s, 12 * s); // left arm
  ctx.drawImage(img, 36, 52, armW, 12, 12 * s, 8 * s, armW * s, 12 * s); // right arm
  // Legs
  ctx.drawImage(img, 4, 20, 4, 12, 4 * s, 20 * s, 4 * s, 12 * s);
  ctx.drawImage(img, 20, 52, 4, 12, 8 * s, 20 * s, 4 * s, 12 * s);

  return canvas;
}
