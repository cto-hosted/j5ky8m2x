// ============================================
// MCTools — Skin image helpers
// ============================================

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function loadImageSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function drawPixelated(canvas, img, w, h) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, w, h);
}

export function extractFace(canvas, img, withHelm = true) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // face
  ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 8, 8);
  // hat layer
  if (withHelm) {
    ctx.drawImage(img, 40, 8, 8, 8, 0, 0, 8, 8);
  }
}

export function resizeCanvas(canvas, scale) {
  const small = document.createElement('canvas');
  small.width = canvas.width;
  small.height = canvas.height;
  small.getContext('2d').drawImage(canvas, 0, 0);

  canvas.width = canvas.width * scale;
  canvas.height = canvas.height * scale;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
}
