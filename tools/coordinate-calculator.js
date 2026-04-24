// ============================================
// Coordinate Calculator
// ============================================

function $(id) { return document.getElementById(id); }

function calcOwToNether() {
  const x = parseFloat($('ow-x').value) || 0;
  const z = parseFloat($('ow-z').value) || 0;
  const y = $('ow-y').value;
  const nx = Math.floor(x / 8);
  const nz = Math.floor(z / 8);
  const ny = y !== '' ? Math.floor(parseFloat(y)) : '—';
  $('result-ow').textContent = `X: ${nx}  Y: ${ny}  Z: ${nz}`;
}

function calcNToOw() {
  const x = parseFloat($('n-x').value) || 0;
  const z = parseFloat($('n-z').value) || 0;
  const y = $('n-y').value;
  const ox = Math.floor(x * 8);
  const oz = Math.floor(z * 8);
  const oy = y !== '' ? Math.floor(parseFloat(y)) : '—';
  $('result-n').textContent = `X: ${ox}  Y: ${oy}  Z: ${oz}`;
}

$('btn-ow-to-nether').addEventListener('click', calcOwToNether);
$('btn-n-to-ow').addEventListener('click', calcNToOw);

// auto-calculate on Enter
['ow-x','ow-z','ow-y','n-x','n-z','n-y'].forEach(id => {
  $(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (id.startsWith('ow')) calcOwToNether();
      else calcNToOw();
    }
  });
});
