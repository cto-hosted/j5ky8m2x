/* ============================================
   MCTools - ZIP & Pack Utilities
   ============================================ */

import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';
import { saveAs } from 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function createJavaPack(name, description, filesMap, packFormat = 15) {
  const zip = new JSZip();
  zip.file('pack.mcmeta', JSON.stringify({
    pack: {
      pack_format: packFormat,
      description: description || name
    }
  }, null, 2));

  // Optional default pack.png
  if (!filesMap['pack.png']) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#5D8C22';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MC', 128, 128);
    const data = canvas.toDataURL('image/png').split(',')[1];
    zip.file('pack.png', data, { base64: true });
  }

  Object.entries(filesMap).forEach(([path, content]) => {
    if (typeof content === 'string' && content.startsWith('data:')) {
      const base64 = content.split(',')[1];
      zip.file(path, base64, { base64: true });
    } else {
      zip.file(path, content);
    }
  });

  return zip;
}

export function createBedrockPack(name, description, filesMap) {
  const zip = new JSZip();
  const headerUUID = generateUUID();
  const moduleUUID = generateUUID();

  zip.file('manifest.json', JSON.stringify({
    format_version: 2,
    header: {
      name: name,
      description: description || name,
      uuid: headerUUID,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 0]
    },
    modules: [
      {
        type: 'resources',
        uuid: moduleUUID,
        version: [1, 0, 0]
      }
    ]
  }, null, 2));

  if (!filesMap['pack_icon.png']) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#5D8C22';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MC', 128, 128);
    const data = canvas.toDataURL('image/png').split(',')[1];
    zip.file('pack_icon.png', data, { base64: true });
  }

  Object.entries(filesMap).forEach(([path, content]) => {
    if (typeof content === 'string' && content.startsWith('data:')) {
      const base64 = content.split(',')[1];
      zip.file(path, base64, { base64: true });
    } else {
      zip.file(path, content);
    }
  });

  return zip;
}

export async function downloadZip(zip, filename) {
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, filename);
}

export async function readZipEntries(file) {
  const zip = await JSZip.loadAsync(file);
  const entries = [];
  zip.forEach((relativePath, zipEntry) => {
    entries.push({
      path: relativePath,
      dir: zipEntry.dir,
      async blob(type = 'application/octet-stream') {
        return zipEntry.async('blob').then(b => new Blob([b], { type }));
      },
      async text() {
        return zipEntry.async('text');
      },
      async base64() {
        return zipEntry.async('base64');
      }
    });
  });
  return { zip, entries };
}
