/* ═══════════════════════════════════════════
   Redimensionar imágenes con el ratón
   Poker SRP BTN vs BB — resize.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  RESIZE IMAGE
// ══════════════════════════════════════════════
let _resizeTarget = null;
let _resizeStartX = 0;
let _resizeStartW = 0;

let _resizeDim = 'w'; // 'w' or 'h'
let _resizeStartY = 0;
let _resizeStartH = 0;

function startResize(e, wrapperId, dim) {
  e.preventDefault();
  e.stopPropagation();
  _resizeTarget = document.getElementById(wrapperId);
  if (!_resizeTarget) return;
  _resizeDim = dim || 'w';
  _resizeStartX = e.clientX;
  _resizeStartY = e.clientY;
  _resizeStartW = _resizeTarget.offsetWidth;
  _resizeStartH = _resizeTarget.offsetHeight || _resizeTarget.querySelector('img')?.offsetHeight || 200;
  document.addEventListener('mousemove', _onResize);
  document.addEventListener('mouseup', _stopResize);
}

function _onResize(e) {
  if (!_resizeTarget) return;
  if (_resizeDim === 'w') {
    const dx = e.clientX - _resizeStartX;
    const newW = Math.max(80, Math.min(_resizeStartW + dx, 960));
    _resizeTarget.style.width = newW + 'px';
  } else {
    const dy = e.clientY - _resizeStartY;
    const newH = Math.max(60, Math.min(_resizeStartH + dy, 800));
    const img = _resizeTarget.querySelector('img');
    if (img) img.style.height = newH + 'px';
  }
}

function _stopResize() {
  if (_resizeTarget) {
    // Save size to the hand object so it persists
    const wrapId = _resizeTarget.id; // e.g. riw-solver-custom-123 or riw-custom-custom-123
    const m = wrapId.match(/^riw-(solver|custom)-(.+)$/);
    if (m) {
      const imgType = m[1]; // 'solver' or 'custom'
      const boardId = m[2];
      // Find which street this board belongs to
      for (const street of ['flop','turn','river']) {
        const all = getAllHands(street);
        if (all[boardId]) {
          if (!customHands[street]) customHands[street] = {};
          if (!customHands[street][boardId]) customHands[street][boardId] = { ...all[boardId] };
          const sizeKey = imgType === 'solver' ? 'solverImgSize' : 'customImgSize';
          const img = _resizeTarget.querySelector('img');
          customHands[street][boardId][sizeKey] = {
            w: _resizeTarget.offsetWidth,
            h: img ? (img.style.height ? parseInt(img.style.height) : null) : null
          };
          persistCustomHands();
          break;
        }
      }
    }
  }
  _resizeTarget = null;
  document.removeEventListener('mousemove', _onResize);
  document.removeEventListener('mouseup', _stopResize);
}