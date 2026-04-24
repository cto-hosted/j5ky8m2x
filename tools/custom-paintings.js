// ============================================
// Custom Paintings
// ============================================

import { loadImage, drawPixelated } from '../js/skin-utils.js';
import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const PAINTINGS = [
  { name: 'Kebab', file: 'kebab', w: 16, h: 16 },
  { name: 'Aztec', file: 'aztec', w: 16, h: 16 },
  { name: 'Alban', file: 'alban', w: 16, h: 16 },
  { name: 'Aztec2', file: 'aztec2', w: 16, h: 16 },
  { name: 'Bomb', file: 'bomb', w: 16, h: 16 },
  { name: 'Plant', file: 'plant', w: 16, h: 16 },
  { name: 'Wasteland', file: 'wasteland', w: 16, h: 16 },
  { name: 'Pool', file: 'pool', w: 32, h: 16 },
  { name: 'Courbet', file: 'courbet', w: 32, h: 16 },
  { name: 'Sea', file: 'sea', w: 32, h: 16 },
  { name: 'Sunset', file: 'sunset', w: 32, h: 16 },
  { name: 'Creebet', file: 'creebet', w: 32, h: 16 },
  { name: 'Wanderer', file: 'wanderer', w: 16, h: 32 },
  { name: 'Graham', file: 'graham', w: 16, h: 32 },
  { name: 'Match', file: 'match', w: 32, h: 32 },
  { name: 'Bust', file: 'bust', w: 32, h: 32 },
  { name: 'Stage', file: 'stage', w: 32, h: 32 },
  { name: 'Void', file: 'void', w: 32, h: 32 },
  { name: 'SkullAndRoses', file: 'skull_and_roses', w: 32, h: 32 },
  { name: 'Wither', file: 'wither', w: 32, h: 32 },
  { name: 'Fighters', file: 'fighters', w: 64, h: 32 },
  { name: 'Pointer', file: 'pointer', w: 64, h: 64 },
  { name: 'Pigscene', file: 'pigscene', w: 64, h: 64 },
  { name: 'Burning Skull', file: 'burning_skull', w: 64, h: 64 },
  { name: 'Skeleton', file: 'skeleton', w: 64, h: 48 },
  { name: 'Donkey Kong', file: 'donkey_kong', w: 64, h: 48 },
];

const paintingSel = document.getElementById('painting');
PAINTINGS.forEach(p => {
  const opt = document.createElement('option');
  opt.value = JSON.stringify(p);
  opt.textContent = `${p.name} (${p.w}x${p.h})`;
  paintingSel.appendChild(opt);
});

const dropZone = document.getElementById('drop-zone');
const preview = document.getElementById('preview');
const dimHint = document.getElementById('dim-hint');
const editionSel = document.getElementById('edition');
const btnGenerate = document.getElementById('btn-generate');

let currentFile = null;

function currentPainting() {
  return JSON.parse(paintingSel.value);
}

setupDropZone(dropZone, (files) => {
  currentFile = files[0];
  updatePreview();
});

async function updatePreview() {
  if (!currentFile) return;
  const p = currentPainting();
  preview.width = p.w;
  preview.height = p.h;
  const img = await loadImage(currentFile);
  drawPixelated(preview, img, p.w, p.h);
  dimHint.textContent = `Dimensions: ${p.w}x${p.h}`;
}

paintingSel.addEventListener('change', updatePreview);

btnGenerate.addEventListener('click', async () => {
  if (!currentFile) return alert('Upload an image first.');
  const p = currentPainting();
  const edition = editionSel.value;
  preview.width = p.w;
  preview.height = p.h;
  const img = await loadImage(currentFile);
  drawPixelated(preview, img, p.w, p.h);
  const blob = await new Promise(res => preview.toBlob(res, 'image/png'));
  const filesMap = {};

  if (edition === 'java') {
    filesMap[`assets/minecraft/textures/painting/${p.file}.png`] = blob;
    const zip = await createJavaPack('Painting Pack', `Replaces ${p.name}`, filesMap);
    await downloadZip(zip, 'painting-pack.zip');
  } else {
    filesMap[`textures/painting/${p.file}.png`] = blob;
    const zip = await createBedrockPack('Painting Pack', `Replaces ${p.name}`, filesMap);
    await downloadZip(zip, 'painting-pack.mcpack');
  }
});
