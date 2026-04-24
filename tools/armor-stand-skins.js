// ============================================
// Armor Stand Skins
// ============================================

import { loadImage, drawPixelated } from '../js/skin-utils.js';
import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const preview = document.getElementById('preview');
const editionSel = document.getElementById('edition');
const btnGenerate = document.getElementById('btn-generate');

let currentFile = null;

setupDropZone(dropZone, (files) => {
  currentFile = files[0];
  updatePreview();
});

async function updatePreview() {
  if (!currentFile) return;
  preview.width = 64;
  preview.height = 32;
  const img = await loadImage(currentFile);
  drawPixelated(preview, img, 64, 32);
}

btnGenerate.addEventListener('click', async () => {
  if (!currentFile) return alert('Upload a skin first.');
  const edition = editionSel.value;
  preview.width = 64;
  preview.height = 32;
  const img = await loadImage(currentFile);
  drawPixelated(preview, img, 64, 32);
  const blob = await new Promise(res => preview.toBlob(res, 'image/png'));
  const filesMap = {};

  if (edition === 'java') {
    filesMap['assets/minecraft/textures/entity/armorstand/wood.png'] = blob;
    const zip = await createJavaPack('Armor Stand Pack', 'Custom armor stand texture', filesMap);
    await downloadZip(zip, 'armor-stand-pack.zip');
  } else {
    filesMap['textures/entity/armor_stand.png'] = blob;
    const zip = await createBedrockPack('Armor Stand Pack', 'Custom armor stand texture', filesMap);
    await downloadZip(zip, 'armor-stand-pack.mcpack');
  }
});
