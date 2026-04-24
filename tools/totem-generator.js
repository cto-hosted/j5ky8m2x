import { loadImage } from '../js/skin-utils.js';
import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const editionSel = document.getElementById('edition');
const sizeSel = document.getElementById('size');
const generateBtn = document.getElementById('generate');

let currentImg = null;

async function handleFile(file) {
  currentImg = await loadImage(file);
  const size = parseInt(sizeSel.value, 10);
  preview.width = size;
  preview.height = size;
  const ctx = preview.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(currentImg, 0, 0, size, size);
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

sizeSel.addEventListener('change', () => {
  if (currentImg) handleFile(currentImg);
});

generateBtn.addEventListener('click', async () => {
  if (!currentImg) return alert('Upload an image first.');
  const edition = editionSel.value;
  const size = parseInt(sizeSel.value, 10);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(currentImg, 0, 0, size, size);
  const dataUrl = canvas.toDataURL('image/png');

  const files = {};
  if (edition === 'java') {
    files[`assets/minecraft/textures/item/totem_of_undying.png`] = dataUrl;
  } else {
    files[`textures/items/totem_of_undying.png`] = dataUrl;
  }

  const zip = edition === 'java'
    ? createJavaPack('Totem Pack', 'Custom totem texture', files)
    : createBedrockPack('Totem Pack', 'Custom totem texture', files);

  await downloadZip(zip, 'totem_pack.zip');
});
