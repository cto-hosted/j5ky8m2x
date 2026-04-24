import { readZipEntries, downloadZip } from '../js/zip-utils.js';
import { detectPackType } from '../js/pack-utils.js';
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const packsList = document.getElementById('packs-list');
const logPanel = document.getElementById('log');

let packs = []; // { file, type, entries, zip }

function log(msg, cls = 'log-ok') {
  const line = document.createElement('div');
  line.className = cls;
  line.textContent = msg;
  logPanel.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
}

function refreshList() {
  packsList.innerHTML = '';
  packs.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'mc-panel';
    div.style.padding = '0.5rem 0.75rem';
    div.style.marginBottom = '0.5rem';
    div.textContent = `${i + 1}. ${p.file.name} (${p.type}) — ${p.entries.length} entries`;
    packsList.appendChild(div);
  });
}

async function handleFiles(fileList) {
  for (const file of fileList) {
    try {
      const { zip, entries } = await readZipEntries(file);
      const type = detectPackType(entries);
      packs.push({ file, type, entries, zip });
      log(`Loaded ${file.name} (${type})`);
    } catch (err) {
      log(`Failed to read ${file.name}: ${err.message}`, 'log-err');
    }
  }
  refreshList();
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

document.getElementById('merge').addEventListener('click', async () => {
  if (packs.length < 2) return alert('Upload at least two packs to merge.');

  const merged = new JSZip();
  const seen = new Map(); // path -> pack index

  for (let i = 0; i < packs.length; i++) {
    const p = packs[i];
    for (const entry of p.entries) {
      if (entry.dir) continue;
      if (seen.has(entry.path)) {
        log(`Conflict: ${entry.path} (overwritten by ${p.file.name})`, 'log-warn');
      } else {
        log(`Adding ${entry.path}`);
      }
      seen.set(entry.path, i);
      const content = await entry.blob();
      merged.file(entry.path, content);
    }
  }

  const blob = await merged.generateAsync({ type: 'blob' });
  const { saveAs } = await import('https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm');
  saveAs(blob, 'merged_pack.zip');
  log('Merged pack downloaded!');
});
