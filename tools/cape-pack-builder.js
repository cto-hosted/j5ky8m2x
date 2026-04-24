import { downloadZip, createJavaPack } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const tableBody = document.getElementById('cape-table');

let capes = []; // { file, name }

function refreshTable() {
  tableBody.innerHTML = '';
  capes.forEach((cape, idx) => {
    const tr = document.createElement('tr');
    const tdFile = document.createElement('td');
    tdFile.textContent = cape.file.name;
    const tdInput = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = cape.name;
    input.style.background = 'var(--bg)';
    input.style.color = 'var(--text)';
    input.style.border = '2px solid var(--border-light)';
    input.style.padding = '0.35rem 0.5rem';
    input.style.width = '100%';
    input.addEventListener('input', () => { capes[idx].name = input.value; });
    tdInput.appendChild(input);
    tr.appendChild(tdFile);
    tr.appendChild(tdInput);
    tableBody.appendChild(tr);
  });
}

function handleFiles(fileList) {
  for (const file of fileList) {
    if (!file.type.startsWith('image/')) continue;
    capes.push({ file, name: file.name.replace(/\.png$/i, '') });
  }
  refreshTable();
}

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

document.getElementById('generate').addEventListener('click', async () => {
  if (!capes.length) return alert('Upload at least one cape.');

  const files = {};
  for (const cape of capes) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(cape.file);
    });
    files[`assets/minecraft/optifine/capes/${cape.name}.png`] = dataUrl;
    files[`assets/minecraft/textures/capes/${cape.name}.png`] = dataUrl;
  }

  const zip = createJavaPack('Cape Pack', 'OptiFine cape pack', files);
  await downloadZip(zip, 'cape_pack.zip');
});
