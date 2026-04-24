import { loadImage } from '../js/skin-utils.js';
import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const paintingSel = document.getElementById('painting');
const editionSel = document.getElementById('edition');
const generateBtn = document.getElementById('generate');

let currentImg = null;

function getTargetSize() {
  const opt = paintingSel.options[paintingSel.selectedIndex];
  return {
    name: paintingSel.value,
    w: parseInt(opt.dataset.w, 10),
    h: parseInt(opt.dataset.h, 10)
  };
}

async function handleFile(file) {
  currentImg = await loadImage(file);
  const { w, h } = getTargetSize();
  preview.width = w;
  preview.height = h;
  const ctx = preview.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(currentImg, 0, 0, w, h);
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

paintingSel.addEventListener('change', () => {
  if (currentImg) handleFile(currentImg);
});

generateBtn.addEventListener('click', async () => {
  if (!currentImg) return alert('Upload an image first.');
  const edition = editionSel.value;
  const { name, w, h } = getTargetSize();
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(currentImg, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/png');

  const files = {};
  if (edition === 'java') {
    files[`assets/minecraft/textures/painting/${name}.png`] = dataUrl;
  } else {
    files[`textures/painting/${name}.png`] = dataUrl;
  }

  const zip = edition === 'java'
    ? createJavaPack('Painting Pack', `Replaces ${name}`, files)
    : createBedrockPack('Painting Pack', `Replaces ${name}`, files);

  await downloadZip(zip, 'painting_pack.zip');
});
