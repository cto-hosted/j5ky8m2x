import { loadImage } from '../js/skin-utils.js';
import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const editionSel = document.getElementById('edition');
const slots = document.querySelectorAll('.hud-input');

slots.forEach(input => {
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const canvas = input.nextElementSibling;
    const ctx = canvas.getContext('2d');
    const img = await loadImage(file);
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
  });
});

document.getElementById('generate').addEventListener('click', async () => {
  const edition = editionSel.value;
  const files = {};
  let hasAny = false;

  slots.forEach(input => {
    const file = input.files[0];
    if (!file) return;
    hasAny = true;
    const canvas = input.nextElementSibling;
    const path = edition === 'java' ? input.dataset.pathJava : input.dataset.pathBedrock;
    files[path] = canvas.toDataURL('image/png');
  });

  if (!hasAny) return alert('Upload at least one HUD image.');

  const zip = edition === 'java'
    ? createJavaPack('HUD Pack', 'Custom HUD icons', files)
    : createBedrockPack('HUD Pack', 'Custom HUD icons', files);

  await downloadZip(zip, 'hud_pack.zip');
});
