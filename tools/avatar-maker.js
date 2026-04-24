// ============================================
// Avatar Maker
// ============================================

import { loadImage, extractFace } from '../js/skin-utils.js';

const dropZone = document.getElementById('drop-zone');
const preview = document.getElementById('preview');
const scaleSel = document.getElementById('scale');
const hatCheck = document.getElementById('hat');
const fullCheck = document.getElementById('fullbody');
const btnDownload = document.getElementById('btn-download');

let currentImg = null;

function render() {
  if (!currentImg) return;
  const scale = parseInt(scaleSel.value, 10);
  const withHat = hatCheck.checked;
  const fullBody = fullCheck.checked;

  if (fullBody) {
    preview.width = 16 * scale;
    preview.height = 32 * scale;
    const ctx = preview.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, preview.width, preview.height);

    // Head
    ctx.drawImage(currentImg, 8, 8, 8, 8, 4 * scale, 0, 8 * scale, 8 * scale);
    if (withHat) ctx.drawImage(currentImg, 40, 8, 8, 8, 4 * scale, 0, 8 * scale, 8 * scale);

    // Body
    ctx.drawImage(currentImg, 20, 20, 8, 12, 4 * scale, 8 * scale, 8 * scale, 12 * scale);

    // Arms
    ctx.drawImage(currentImg, 44, 20, 4, 12, 0, 8 * scale, 4 * scale, 12 * scale);
    ctx.drawImage(currentImg, 52, 20, 4, 12, 12 * scale, 8 * scale, 4 * scale, 12 * scale);

    // Legs
    ctx.drawImage(currentImg, 4, 20, 4, 12, 4 * scale, 20 * scale, 4 * scale, 12 * scale);
    ctx.drawImage(currentImg, 20, 20, 4, 12, 8 * scale, 20 * scale, 4 * scale, 12 * scale);
  } else {
    preview.width = 8 * scale;
    preview.height = 8 * scale;
    extractFace(preview, currentImg, withHat);
    // scale up nearest-neighbor manually because extractFace draws at 8x8
    if (scale > 1) {
      const tmp = document.createElement('canvas');
      tmp.width = 8;
      tmp.height = 8;
      tmp.getContext('2d').drawImage(preview, 0, 0);
      preview.width = 8 * scale;
      preview.height = 8 * scale;
      const ctx = preview.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 0, 0, preview.width, preview.height);
    }
  }
}

setupDropZone(dropZone, async (files) => {
  const file = files.find(f => f.type === 'image/png') || files[0];
  if (!file) return;
  currentImg = await loadImage(file);
  render();
});

scaleSel.addEventListener('change', render);
hatCheck.addEventListener('change', render);
fullCheck.addEventListener('change', render);

btnDownload.addEventListener('click', () => {
  if (!currentImg) return;
  const link = document.createElement('a');
  link.download = 'avatar.png';
  link.href = preview.toDataURL('image/png');
  link.click();
});
