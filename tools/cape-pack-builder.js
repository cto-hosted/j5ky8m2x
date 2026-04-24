// ============================================
// Cape Pack Builder
// ============================================

import { downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const capeTableWrap = document.getElementById('cape-table-wrap');
const capeTbody = document.getElementById('cape-tbody');
const btnGenerate = document.getElementById('btn-generate');

let capes = [];

setupDropZone(dropZone, (files) => {
  const pngs = files.filter(f => f.type === 'image/png');
  pngs.forEach(file => {
    capes.push({ file, name: file.name.replace(/\.png$/i, '') });
  });
  renderTable();
});

function renderTable() {
  capeTbody.innerHTML = '';
  if (!capes.length) {
    capeTableWrap.style.display = 'none';
    return;
  }
  capeTableWrap.style.display = '';
  capes.forEach((cape, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cape.file.name}</td>
      <td><input type="text" value="${cape.name}" data-index="${i}" style="width:100%;"></td>
    `;
    capeTbody.appendChild(tr);
  });
  capeTbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      capes[+input.dataset.index].name = input.value;
    });
  });
}

btnGenerate.addEventListener('click', async () => {
  if (!capes.length) return alert('Upload at least one cape.');
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
  const zip = new JSZip();

  capes.forEach(cape => {
    // OptiFine path
    zip.file(`assets/minecraft/optifine/capes/${cape.name}.png`, cape.file);
    // Standard fallback
    zip.file(`assets/minecraft/textures/capes/${cape.name}.png`, cape.file);
  });

  await downloadZip(zip, 'cape-pack.zip');
});
