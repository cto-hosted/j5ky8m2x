// ============================================
// HUD Customizer
// ============================================

import { loadImage, drawPixelated } from '../js/skin-utils.js';
import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const SLOTS = [
  { label: 'Hotbar', java: 'assets/minecraft/textures/gui/sprites/hud/hotbar.png', bedrock: 'textures/gui/hotbar.png', w: 182, h: 22 },
  { label: 'Hotbar Selection', java: 'assets/minecraft/textures/gui/sprites/hud/hotbar_selection.png', bedrock: 'textures/gui/hotbar_selected.png', w: 24, h: 24 },
  { label: 'Crosshair', java: 'assets/minecraft/textures/gui/sprites/hud/crosshair.png', bedrock: 'textures/gui/crosshair.png', w: 15, h: 15 },
  { label: 'Hearts', java: 'assets/minecraft/textures/gui/sprites/hud/heart/full.png', bedrock: 'textures/gui/icons/heart.png', w: 9, h: 9 },
  { label: 'Hunger', java: 'assets/minecraft/textures/gui/sprites/hud/food_empty.png', bedrock: 'textures/gui/icons/food_empty.png', w: 9, h: 9 },
  { label: 'Armor', java: 'assets/minecraft/textures/gui/sprites/hud/armor_full.png', bedrock: 'textures/gui/icons/armor_full.png', w: 9, h: 9 },
];

const slotsContainer = document.getElementById('slots');
const previewsContainer = document.getElementById('previews');
const editionSel = document.getElementById('edition');
const btnGenerate = document.getElementById('btn-generate');

const uploads = {};

SLOTS.forEach((slot, i) => {
  const row = document.createElement('div');
  row.className = 'form-row';
  row.innerHTML = `
    <label>${slot.label} (${slot.w}x${slot.h})</label>
    <input type="file" accept="image/*" data-index="${i}">
  `;
  slotsContainer.appendChild(row);

  const previewWrap = document.createElement('div');
  previewWrap.className = 'canvas-wrap';
  previewWrap.innerHTML = `<canvas id="preview-${i}" width="${slot.w}" height="${slot.h}" style="width:${slot.w*4}px; height:${slot.h*4}px;"></canvas>`;
  previewsContainer.appendChild(previewWrap);

  const input = row.querySelector('input');
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploads[i] = file;
    const canvas = document.getElementById(`preview-${i}`);
    const img = await loadImage(file);
    drawPixelated(canvas, img, slot.w, slot.h);
  });
});

btnGenerate.addEventListener('click', async () => {
  const edition = editionSel.value;
  const filesMap = {};
  for (const [idx, file] of Object.entries(uploads)) {
    const slot = SLOTS[idx];
    const canvas = document.createElement('canvas');
    canvas.width = slot.w;
    canvas.height = slot.h;
    const img = await loadImage(file);
    drawPixelated(canvas, img, slot.w, slot.h);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const path = edition === 'java' ? slot.java : slot.bedrock;
    filesMap[path] = blob;
  }
  if (!Object.keys(filesMap).length) return alert('Upload at least one image.');

  if (edition === 'java') {
    const zip = await createJavaPack('HUD Pack', 'Custom HUD textures', filesMap);
    await downloadZip(zip, 'hud-pack.zip');
  } else {
    const zip = await createBedrockPack('HUD Pack', 'Custom HUD textures', filesMap);
    await downloadZip(zip, 'hud-pack.mcpack');
  }
});
