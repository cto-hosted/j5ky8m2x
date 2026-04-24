// ============================================
// Totem Generator
// ============================================

import { loadImage, drawPixelated } from '../js/skin-utils.js';
import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const preview = document.getElementById('preview');
const editionSel = document.getElementById('edition');
const sizeSel = document.getElementById('size');
const btnGenerate = document.getElementById('btn-generate');

let currentFile = null;

setupDropZone(dropZone, (files) => {
  currentFile = files[0];
  updatePreview();
});

async function updatePreview() {
  if (!currentFile) return;
  const size = parseInt(sizeSel.value, 10);
  preview.width = size;
  preview.height = size;
  const img = await loadImage(currentFile);
  drawPixelated(preview, img, size, size);
}

sizeSel.addEventListener('change', updatePreview);

btnGenerate.addEventListener('click', async () => {
  if (!currentFile) return alert('Upload an image first.');
  const size = parseInt(sizeSel.value, 10);
  const edition = editionSel.value;
  preview.width = size;
  preview.height = size;
  const img = await loadImage(currentFile);
  drawPixelated(preview, img, size, size);

  const blob = await new Promise(res => preview.toBlob(res, 'image/png'));
  const filesMap = {};

  if (edition === 'java') {
    filesMap['assets/minecraft/textures/item/totem_of_undying.png'] = blob;
    const zip = await createJavaPack('Totem Pack', 'Custom totem texture', filesMap);
    await downloadZip(zip, 'totem-pack.zip');
  } else {
    filesMap['textures/items/totem_of_undying.png'] = blob;
    const zip = await createBedrockPack('Totem Pack', 'Custom totem texture', filesMap);
    await downloadZip(zip, 'totem-pack.mcpack');
  }
});
