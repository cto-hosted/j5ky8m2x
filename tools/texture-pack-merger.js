// ============================================
// Texture Pack Merger
// ============================================

import { readZipEntries, detectPackType } from '../js/pack-utils.js';
import { downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const fileListWrap = document.getElementById('file-list-wrap');
const fileTbody = document.getElementById('file-tbody');
const btnMerge = document.getElementById('btn-merge');
const log = document.getElementById('log');

let packs = []; // { name, type, entries }
let merged = new Map(); // path -> { source, entry }

setupDropZone(dropZone, async (files) => {
  for (const file of files) {
    try {
      const { entries } = await readZipEntries(file);
      const type = detectPackType(entries);
      packs.push({ name: file.name, type, entries });
      for (const e of entries) {
        if (e.entry.dir) continue;
        const existing = merged.get(e.path);
        if (!existing) {
          merged.set(e.path, { source: file.name, entry: e.entry });
        } else {
          existing.conflict = true;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
  renderList();
});

function renderList() {
  fileTbody.innerHTML = '';
  if (!merged.size) {
    fileListWrap.style.display = 'none';
    return;
  }
  fileListWrap.style.display = '';
  const seen = new Set();
  for (const [path, info] of merged) {
    const tr = document.createElement('tr');
    const conflict = info.conflict ? '<span style="color:var(--accent-red);">YES</span>' : 'No';
    tr.innerHTML = `<td>${path}</td><td>${info.source}</td><td>${conflict}</td>`;
    fileTbody.appendChild(tr);
    seen.add(path);
  }
}

btnMerge.addEventListener('click', async () => {
  if (!merged.size) return alert('Upload at least one pack.');
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
  const zip = new JSZip();
  let count = 0;
  for (const [path, info] of merged) {
    const blob = await info.entry.async('blob');
    zip.file(path, blob);
    count++;
  }
  log.textContent = `Merged ${count} files from ${packs.length} pack(s).`;
  await downloadZip(zip, 'merged-pack.zip');
});
