import { loadImage, extractFace, extractBodyPreview } from '../js/skin-utils.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const scaleInput = document.getElementById('scale');
const hatCheck = document.getElementById('hat');
const fullBodyCheck = document.getElementById('full-body');
const downloadBtn = document.getElementById('download');

let currentImg = null;

function render() {
  if (!currentImg) return;
  const scale = parseInt(scaleInput.value, 10);
  const withHat = hatCheck.checked;
  const fullBody = fullBodyCheck.checked;

  if (fullBody) {
    extractBodyPreview(preview, currentImg, scale);
  } else {
    extractFace(preview, currentImg, withHat);
    // upscale to desired scale
    const temp = document.createElement('canvas');
    temp.width = 8;
    temp.height = 8;
    const tctx = temp.getContext('2d');
    tctx.drawImage(preview, 0, 0);
    preview.width = 8 * scale;
    preview.height = 8 * scale;
    const ctx = preview.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(temp, 0, 0, preview.width, preview.height);
  }
}

async function handleFile(file) {
  currentImg = await loadImage(file);
  render();
}

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) handleFile(file);
});

scaleInput.addEventListener('input', render);
hatCheck.addEventListener('change', render);
fullBodyCheck.addEventListener('change', render);

downloadBtn.addEventListener('click', () => {
  if (!currentImg) return;
  const link = document.createElement('a');
  link.download = 'avatar.png';
  link.href = preview.toDataURL('image/png');
  link.click();
});
