import { createJavaPack, createBedrockPack, downloadZip } from '../js/zip-utils.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const discSel = document.getElementById('disc');
const editionSel = document.getElementById('edition');
const convertBtn = document.getElementById('convert');
const previewBtn = document.getElementById('preview-btn');
const status = document.getElementById('status');
const logPanel = document.getElementById('log');

let currentFile = null;
let convertedBlob = null;
let ffmpeg = null;

function log(msg, cls = 'log-ok') {
  const line = document.createElement('div');
  line.className = cls;
  line.textContent = msg;
  logPanel.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
}

async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;
  status.textContent = 'Loading ffmpeg.wasm (may take a moment)…';
  const { FFmpeg } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/+esm');
  const { fetchFile } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/+esm');
  ffmpeg = new FFmpeg();
  await ffmpeg.load();
  ffmpeg.fetchFile = fetchFile;
  status.textContent = 'ffmpeg.wasm ready.';
  return ffmpeg;
}

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    currentFile = file;
    log(`Loaded ${file.name}`);
    previewBtn.disabled = true;
    convertedBlob = null;
  }
});
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    currentFile = file;
    log(`Loaded ${file.name}`);
    previewBtn.disabled = true;
    convertedBlob = null;
  }
});

convertBtn.addEventListener('click', async () => {
  if (!currentFile) return alert('Upload an audio file first.');
  const disc = discSel.value;
  const edition = editionSel.value;

  let oggBlob;
  if (currentFile.name.toLowerCase().endsWith('.ogg')) {
    oggBlob = currentFile;
    log('Source is already OGG, skipping conversion.');
  } else {
    const ff = await loadFFmpeg();
    log('Transcoding to OGG…');
    const inputName = 'input' + currentFile.name.substring(currentFile.name.lastIndexOf('.'));
    const outputName = 'output.ogg';
    await ffmpeg.writeFile(inputName, await ffmpeg.fetchFile(currentFile));
    await ffmpeg.exec(['-i', inputName, '-c:a', 'libvorbis', '-q:a', '4', outputName]);
    const data = await ffmpeg.readFile(outputName);
    oggBlob = new Blob([data.buffer], { type: 'audio/ogg' });
    log('Transcoding complete.');
  }

  convertedBlob = oggBlob;
  previewBtn.disabled = false;

  const oggDataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(oggBlob);
  });

  const files = {};
  if (edition === 'java') {
    files[`assets/minecraft/sounds/records/${disc}.ogg`] = oggDataUrl;
    const soundEvents = {};
    soundEvents[`music_disc.${disc}`] = {
      sounds: [{ name: `records/${disc}`, stream: true }]
    };
    files['assets/minecraft/sounds.json'] = JSON.stringify(soundEvents, null, 2);
  } else {
    files[`sounds/music/game/records/${disc}.ogg`] = oggDataUrl;
    const defs = {
      format_version: '1.20.0',
      sound_definitions: {}
    };
    defs.sound_definitions[`record.${disc}`] = {
      category: 'music',
      sounds: [`sounds/music/game/records/${disc}`]
    };
    files['sounds/sound_definitions.json'] = JSON.stringify(defs, null, 2);
  }

  const zip = edition === 'java'
    ? createJavaPack('Music Disc Pack', `Custom ${disc} disc`, files)
    : createBedrockPack('Music Disc Pack', `Custom ${disc} disc`, files);

  await downloadZip(zip, 'music_disc_pack.zip');
  log('Pack generated and downloaded!');
});

previewBtn.addEventListener('click', () => {
  if (!convertedBlob) return;
  const url = URL.createObjectURL(convertedBlob);
  const audio = new Audio(url);
  audio.play();
  log('Playing preview…');
  audio.addEventListener('ended', () => URL.revokeObjectURL(url));
});
