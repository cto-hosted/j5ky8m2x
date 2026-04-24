import { readZipEntries } from '../js/zip-utils.js';
import { detectPackType, javaToBedrockPath, bedrockToJavaPath } from '../js/pack-utils.js';
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const detectedInput = document.getElementById('detected');
const targetSel = document.getElementById('target');
const logPanel = document.getElementById('log');

let currentPack = null; // { file, type, entries, zip }

function log(msg, cls = 'log-ok') {
  const line = document.createElement('div');
  line.className = cls;
  line.textContent = msg;
  logPanel.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
}

async function handleFile(file) {
  try {
    const { zip, entries } = await readZipEntries(file);
    const type = detectPackType(entries);
    currentPack = { file, type, entries, zip };
    detectedInput.value = type.toUpperCase();
    targetSel.value = type === 'java' ? 'bedrock' : 'java';
    log(`Detected ${type} pack with ${entries.length} entries.`);
  } catch (err) {
    log(`Error reading pack: ${err.message}`, 'log-err');
  }
}

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) handleFile(file);
});

document.getElementById('convert').addEventListener('click', async () => {
  if (!currentPack) return alert('Upload a pack first.');
  const target = targetSel.value;
  if (currentPack.type === target) {
    return alert('Source and target are the same. Choose a different target.');
  }

  const outZip = new JSZip();
  log(`Converting to ${target}…`);

  for (const entry of currentPack.entries) {
    if (entry.dir) continue;

    if (entry.path === 'pack.mcmeta' && target === 'bedrock') {
      // Convert mcmeta description into manifest
      const text = await entry.text();
      let desc = 'Converted pack';
      try {
        desc = JSON.parse(text).pack?.description || desc;
      } catch { /* ignore */ }
      outZip.file('manifest.json', JSON.stringify({
        format_version: 2,
        header: {
          name: currentPack.file.name.replace(/\.zip$/i, ''),
          description: desc,
          uuid: generateUUID(),
          version: [1, 0, 0],
          min_engine_version: [1, 20, 0]
        },
        modules: [{
          type: 'resources',
          uuid: generateUUID(),
          version: [1, 0, 0]
        }]
      }, null, 2));
      log('Converted pack.mcmeta → manifest.json');
      continue;
    }

    if (entry.path === 'manifest.json' && target === 'java') {
      const text = await entry.text();
      let desc = 'Converted pack';
      try {
        desc = JSON.parse(text).header?.description || desc;
      } catch { /* ignore */ }
      outZip.file('pack.mcmeta', JSON.stringify({
        pack: {
          pack_format: 15,
          description: desc
        }
      }, null, 2));
      log('Converted manifest.json → pack.mcmeta');
      continue;
    }

    if (entry.path.toLowerCase() === 'pack.png' && target === 'bedrock') {
      const blob = await entry.blob();
      outZip.file('pack_icon.png', blob);
      log('Renamed pack.png → pack_icon.png');
      continue;
    }

    if (entry.path.toLowerCase() === 'pack_icon.png' && target === 'java') {
      const blob = await entry.blob();
      outZip.file('pack.png', blob);
      log('Renamed pack_icon.png → pack.png');
      continue;
    }

    const newPath = currentPack.type === 'java'
      ? javaToBedrockPath(entry.path)
      : bedrockToJavaPath(entry.path);

    if (newPath !== entry.path) {
      log(`Mapped ${entry.path} → ${newPath}`);
    }

    const blob = await entry.blob();
    outZip.file(newPath, blob);
  }

  const blob = await outZip.generateAsync({ type: 'blob' });
  const { saveAs } = await import('https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm');
  saveAs(blob, target === 'java' ? 'converted_java.zip' : 'converted_bedrock.mcpack');
  log('Conversion complete!');
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
