// ============================================
// Cape Editor
// ============================================

const canvas = document.getElementById('cape-canvas');
const ctx = canvas.getContext('2d');
const toolSel = document.getElementById('tool');
const colorInput = document.getElementById('color');
const uploadInput = document.getElementById('upload');
const btnUndo = document.getElementById('btn-undo');
const btnClear = document.getElementById('btn-clear');
const btnDownload = document.getElementById('btn-download');

const W = 64, H = 32;
let undoStack = [];
let drawing = false;

function pushUndo() {
  if (undoStack.length > 30) undoStack.shift();
  undoStack.push(ctx.getImageData(0, 0, W, H));
}

function popUndo() {
  if (!undoStack.length) return;
  ctx.putImageData(undoStack.pop(), 0, 0);
}

function getPixel(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);
  return { x, y };
}

function hexToRgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

function getPixelColor(imgData, x, y) {
  const i = (y * W + x) * 4;
  return imgData.data.slice(i, i + 4);
}

function putPixel(imgData, x, y, color) {
  const i = (y * W + x) * 4;
  imgData.data[i] = color[0];
  imgData.data[i + 1] = color[1];
  imgData.data[i + 2] = color[2];
  imgData.data[i + 3] = color[3];
}

function colorsEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function floodFill(sx, sy, fillColor) {
  const imgData = ctx.getImageData(0, 0, W, H);
  const target = getPixelColor(imgData, sx, sy);
  if (colorsEqual(target, fillColor)) return;
  const stack = [[sx, sy]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= W || y < 0 || y >= H) continue;
    if (!colorsEqual(getPixelColor(imgData, x, y), target)) continue;
    putPixel(imgData, x, y, fillColor);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawAt(e) {
  const { x, y } = getPixel(e);
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const tool = toolSel.value;
  if (tool === 'pencil') {
    ctx.fillStyle = colorInput.value;
    ctx.fillRect(x, y, 1, 1);
  } else if (tool === 'eraser') {
    ctx.clearRect(x, y, 1, 1);
  }
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  pushUndo();
  const { x, y } = getPixel(e);
  if (toolSel.value === 'fill') {
    floodFill(x, y, hexToRgba(colorInput.value));
    return;
  }
  drawAt(e);
});

window.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  if (toolSel.value !== 'fill') drawAt(e);
});

window.addEventListener('mouseup', () => { drawing = false; });

btnUndo.addEventListener('click', popUndo);
btnClear.addEventListener('click', () => {
  pushUndo();
  ctx.clearRect(0, 0, W, H);
});

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    pushUndo();
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
  };
  img.src = URL.createObjectURL(file);
});

btnDownload.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'cape.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// init transparent
ctx.clearRect(0, 0, W, H);
