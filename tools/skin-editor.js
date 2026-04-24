import { loadImage } from '../js/skin-utils.js';

const canvas = document.getElementById('editor');
const ctx = canvas.getContext('2d');
const zoomInput = document.getElementById('zoom');
const colorPicker = document.getElementById('color-picker');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const mirrorCheck = document.getElementById('mirror');
const hatOnlyCheck = document.getElementById('hat-only');
const viewerWrap = document.getElementById('viewer-wrap');

const W = 64;
const H = 64;
canvas.width = W;
canvas.height = H;

ctx.fillStyle = '#1e1b2e';
ctx.fillRect(0, 0, W, H);

let tool = 'pencil';
let undoStack = [];
let redoStack = [];
let viewer = null;
let skinview3dLoaded = false;

function pushUndo() {
  undoStack.push(ctx.getImageData(0, 0, W, H));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
}

function setTool(name) {
  tool = name;
  ['pencil','eraser','fill','darken','lighten'].forEach(t => {
    const btn = document.getElementById('tool-' + t);
    if (btn) btn.classList.toggle('secondary', t !== name);
  });
}

['pencil','eraser','fill','darken','lighten'].forEach(t => {
  const btn = document.getElementById('tool-' + t);
  if (btn) btn.addEventListener('click', () => setTool(t));
});

document.getElementById('undo').addEventListener('click', () => {
  if (!undoStack.length) return;
  redoStack.push(ctx.getImageData(0, 0, W, H));
  ctx.putImageData(undoStack.pop(), 0, 0);
  update3D();
});

document.getElementById('redo').addEventListener('click', () => {
  if (!redoStack.length) return;
  undoStack.push(ctx.getImageData(0, 0, W, H));
  ctx.putImageData(redoStack.pop(), 0, 0);
  update3D();
});

function getXY(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.floor((e.clientX - rect.left) * scaleX),
    y: Math.floor((e.clientY - rect.top) * scaleY)
  };
}

function hexToRgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

function getPixel(imgData, x, y) {
  const i = (y * imgData.width + x) * 4;
  return imgData.data.slice(i, i + 4);
}

function setPixel(imgData, x, y, col) {
  const i = (y * imgData.width + x) * 4;
  imgData.data[i] = col[0];
  imgData.data[i + 1] = col[1];
  imgData.data[i + 2] = col[2];
  imgData.data[i + 3] = col[3];
}

function colorEq(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function floodFill(sx, sy, hex) {
  const imgData = ctx.getImageData(0, 0, W, H);
  const target = getPixel(imgData, sx, sy);
  const repl = hexToRgba(hex);
  if (colorEq(target, repl)) return;
  const stack = [[sx, sy]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= W || y < 0 || y >= H) continue;
    if (!colorEq(getPixel(imgData, x, y), target)) continue;
    setPixel(imgData, x, y, repl);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  ctx.putImageData(imgData, 0, 0);
}

function adjustPixel(x, y, amount) {
  const p = ctx.getImageData(x, y, 1, 1).data;
  const clamp = v => Math.max(0, Math.min(255, v));
  const newCol = [clamp(p[0] + amount), clamp(p[1] + amount), clamp(p[2] + amount), p[3]];
  ctx.fillStyle = `rgba(${newCol[0]},${newCol[1]},${newCol[2]},${newCol[3]/255})`;
  ctx.fillRect(x, y, 1, 1);
}

function drawPixel(x, y) {
  const hatOnly = hatOnlyCheck.checked;
  const inHat = (x >= 32 && x < 64 && y >= 0 && y < 16) || (x >= 48 && x < 64 && y >= 16 && y < 48);
  if (hatOnly && !inHat) return;

  if (tool === 'pencil') {
    ctx.fillStyle = colorPicker.value;
    ctx.fillRect(x, y, 1, 1);
  } else if (tool === 'eraser') {
    ctx.clearRect(x, y, 1, 1);
  } else if (tool === 'darken') {
    adjustPixel(x, y, -20);
  } else if (tool === 'lighten') {
    adjustPixel(x, y, 20);
  }

  if (mirrorCheck.checked) {
    const mx = W - 1 - x;
    if (tool === 'pencil') {
      ctx.fillStyle = colorPicker.value;
      ctx.fillRect(mx, y, 1, 1);
    } else if (tool === 'eraser') {
      ctx.clearRect(mx, y, 1, 1);
    } else if (tool === 'darken') {
      adjustPixel(mx, y, -20);
    } else if (tool === 'lighten') {
      adjustPixel(mx, y, 20);
    }
  }
}

let isDrawing = false;
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  pushUndo();
  const { x, y } = getXY(e);
  if (tool === 'fill') {
    floodFill(x, y, colorPicker.value);
  } else {
    drawPixel(x, y);
  }
  update3D();
});
window.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const { x, y } = getXY(e);
  drawPixel(x, y);
  update3D();
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const { x, y } = getXY(e);
  const p = ctx.getImageData(x, y, 1, 1).data;
  const hex = '#' + [p[0], p[1], p[2]].map(v => v.toString(16).padStart(2, '0')).join('');
  colorPicker.value = hex;
});

function updateZoom() {
  const z = parseInt(zoomInput.value, 10);
  canvas.style.width = (W * z) + 'px';
  canvas.style.height = (H * z) + 'px';
}
zoomInput.addEventListener('input', updateZoom);
updateZoom();

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    pushUndo();
    const img = await loadImage(file);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    update3D();
  }
});
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  pushUndo();
  const img = await loadImage(file);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  update3D();
});

document.getElementById('download').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'skin.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

document.getElementById('clear').addEventListener('click', () => {
  pushUndo();
  ctx.clearRect(0, 0, W, H);
  update3D();
});

// Lazy-load skinview3d
async function initViewer() {
  if (skinview3dLoaded) return;
  skinview3dLoaded = true;
  const { SkinViewer, createOrbitControls } = await import('https://unpkg.com/skinview3d@3.4.1/bundles/skinview3d.bundle.js');
  viewerWrap.innerHTML = '';
  viewer = new SkinViewer({
    canvas: viewerWrap,
    width: viewerWrap.clientWidth,
    height: 400,
    skin: canvas.toDataURL('image/png')
  });
  createOrbitControls(viewer);
}

function update3D() {
  if (!viewer) {
    initViewer();
    return;
  }
  viewer.loadSkin(canvas.toDataURL('image/png'));
}
