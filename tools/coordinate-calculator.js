import { copyToClipboard } from '../js/shared.js';

function $(id) { return document.getElementById(id); }

$('btn-to-nether').addEventListener('click', () => {
  const x = parseFloat($('ow-x').value) || 0;
  const z = parseFloat($('ow-z').value) || 0;
  const y = $('ow-y').value;
  const nx = Math.floor(x / 8);
  const nz = Math.floor(z / 8);
  const text = y !== '' ? `X: ${nx}, Y: ${y}, Z: ${nz}` : `X: ${nx}, Z: ${nz}`;
  $('result-nether').textContent = text;
});

$('btn-to-overworld').addEventListener('click', () => {
  const x = parseFloat($('ne-x').value) || 0;
  const z = parseFloat($('ne-z').value) || 0;
  const y = $('ne-y').value;
  const ox = Math.floor(x * 8);
  const oz = Math.floor(z * 8);
  const text = y !== '' ? `X: ${ox}, Y: ${y}, Z: ${oz}` : `X: ${ox}, Z: ${oz}`;
  $('result-overworld').textContent = text;
});

$('copy-nether').addEventListener('click', () => {
  copyToClipboard($('result-nether').textContent);
});

$('copy-overworld').addEventListener('click', () => {
  copyToClipboard($('result-overworld').textContent);
});
