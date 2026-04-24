// ============================================
// Skin Pack Maker (Bedrock .mcpack)
// ============================================

import { uuidv4, downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const skinTableWrap = document.getElementById('skin-table-wrap');
const skinTbody = document.getElementById('skin-tbody');
const btnGenerate = document.getElementById('btn-generate');

let skins = []; // { file, name }

setupDropZone(dropZone, (files) => {
  const pngs = files.filter(f => f.type === 'image/png');
  pngs.forEach(file => {
    skins.push({ file, name: file.name.replace(/\.png$/i, '') });
  });
  renderTable();
});

function renderTable() {
  skinTbody.innerHTML = '';
  if (!skins.length) {
    skinTableWrap.style.display = 'none';
    return;
  }
  skinTableWrap.style.display = '';
  skins.forEach((skin, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${skin.file.name}</td>
      <td><input type="text" value="${skin.name}" data-index="${i}" style="width:100%;"></td>
    `;
    skinTbody.appendChild(tr);
  });
  skinTbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      skins[+input.dataset.index].name = input.value;
    });
  });
}

btnGenerate.addEventListener('click', async () => {
  if (!skins.length) return alert('Upload at least one skin.');
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
  const zip = new JSZip();

  const headerUuid = uuidv4();
  const moduleUuid = uuidv4();

  zip.file('manifest.json', JSON.stringify({
    format_version: 2,
    header: {
      name: 'Skin Pack',
      description: 'Custom skin pack',
      uuid: headerUuid,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 0]
    },
    modules: [
      { type: 'skin_pack', uuid: moduleUuid, version: [1, 0, 0] }
    ]
  }, null, 2));

  const skinsJson = { skins: [], serialize_name: 'SkinPack', localization_name: 'SkinPack' };
  const langLines = ['skinpack.SkinPack=Skin Pack'];

  skins.forEach((skin, i) => {
    const textureName = `skin_${i}.png`;
    zip.file(textureName, skin.file);
    skinsJson.skins.push({
      localization_name: `skin_${i}`,
      texture: textureName,
      type: 'free'
    });
    langLines.push(`skin.SkinPack.skin_${i}=${skin.name}`);
  });

  zip.file('skins.json', JSON.stringify(skinsJson, null, 2));
  zip.file('texts/en_US.lang', langLines.join('\n'));

  await downloadZip(zip, 'skin-pack.mcpack');
});
