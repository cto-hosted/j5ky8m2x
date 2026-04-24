import { createBedrockPack, downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const tableBody = document.getElementById('skin-table');

let skins = []; // { file, name }

function refreshTable() {
  tableBody.innerHTML = '';
  skins.forEach((skin, idx) => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = skin.file.name;
    const tdInput = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = skin.name;
    input.style.background = 'var(--bg)';
    input.style.color = 'var(--text)';
    input.style.border = '2px solid var(--border-light)';
    input.style.padding = '0.35rem 0.5rem';
    input.style.width = '100%';
    input.addEventListener('input', () => { skins[idx].name = input.value; });
    tdInput.appendChild(input);
    tr.appendChild(tdName);
    tr.appendChild(tdInput);
    tableBody.appendChild(tr);
  });
}

function handleFiles(fileList) {
  for (const file of fileList) {
    if (!file.type.startsWith('image/')) continue;
    skins.push({ file, name: file.name.replace(/\.png$/i, '') });
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
  if (!skins.length) return alert('Upload at least one skin.');

  const files = {};
  const skinsJson = [];
  const langEntries = [];

  for (let i = 0; i < skins.length; i++) {
    const s = skins[i];
    const filename = `skin_${i}.png`;
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(s.file);
    });
    files[filename] = dataUrl;
    skinsJson.push({
      localization_name: `skin_${i}`,
      texture: filename,
      type: 'free'
    });
    langEntries.push(`skin.skin_pack.skin_${i}=${s.name}`);
  }

  files['skins.json'] = JSON.stringify({ skins: skinsJson }, null, 2);
  files['texts/en_US.lang'] = ['skinpack.custom=Custom Skin Pack', ...langEntries].join('\n');
  files['manifest.json'] = JSON.stringify({
    format_version: 1,
    header: {
      name: 'Custom Skin Pack',
      uuid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      }),
      version: [1, 0, 0]
    },
    modules: [
      {
        type: 'skin_pack',
        uuid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        }),
        version: [1, 0, 0]
      }
    ]
  }, null, 2);

  // Override generic bedrock pack builder for skin pack specifics
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
  const { saveAs } = await import('https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm');
  const zip = new JSZip();
  Object.entries(files).forEach(([path, content]) => {
    if (typeof content === 'string' && content.startsWith('data:')) {
      zip.file(path, content.split(',')[1], { base64: true });
    } else {
      zip.file(path, content);
    }
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'custom_skin_pack.mcpack');
});
