import { loadImage } from '../js/skin-utils.js';
import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const editionSel = document.getElementById('edition');
const generateBtn = document.getElementById('generate');

let currentImg = null;

async function handleFile(file) {
  currentImg = await loadImage(file);
  preview.width = 64;
  preview.height = 32;
  const ctx = preview.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(currentImg, 0, 0, 64, 32);
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

generateBtn.addEventListener('click', async () => {
  if (!currentImg) return alert('Upload a skin first.');
  const edition = editionSel.value;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(currentImg, 0, 0, 64, 32);
  const dataUrl = canvas.toDataURL('image/png');

  const files = {};
  if (edition === 'java') {
    files['assets/minecraft/textures/entity/armorstand/wood.png'] = dataUrl;
  } else {
    files['textures/entity/armor_stand.png'] = dataUrl;
  }

  const zip = edition === 'java'
    ? createJavaPack('Armor Stand Pack', 'Custom armor stand texture', files)
    : createBedrockPack('Armor Stand Pack', 'Custom armor stand texture', files);

  await downloadZip(zip, 'armor_stand_pack.zip');
});
