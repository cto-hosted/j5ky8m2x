// ============================================
// MCTools — ZIP / Pack utilities
// ============================================

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createJavaPack(name, description, filesMap, packPngBlob = null) {
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
  const zip = new JSZip();

  zip.file('pack.mcmeta', JSON.stringify({
    pack: {
      pack_format: 15,
      description: description || name
    }
  }, null, 2));

  if (packPngBlob) {
    zip.file('pack.png', packPngBlob);
  }

  for (const [path, data] of Object.entries(filesMap)) {
    zip.file(path, data);
  }

  return zip;
}

export async function createBedrockPack(name, description, filesMap, packIconBlob = null) {
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
  const zip = new JSZip();

  const headerUuid = uuidv4();
  const moduleUuid = uuidv4();

  zip.file('manifest.json', JSON.stringify({
    format_version: 2,
    header: {
      name: name,
      description: description || name,
      uuid: headerUuid,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 0]
    },
    modules: [
      {
        type: 'resources',
        uuid: moduleUuid,
        version: [1, 0, 0]
      }
    ]
  }, null, 2));

  if (packIconBlob) {
    zip.file('pack_icon.png', packIconBlob);
  }

  for (const [path, data] of Object.entries(filesMap)) {
    zip.file(path, data);
  }

  return zip;
}

export async function downloadZip(zip, filename) {
  const { saveAs } = await import('https://cdn.jsdelivr.net/npm/file-saver@2.0.5/+esm');
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, filename);
}
