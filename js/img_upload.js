/* ═══════════════════════════════════════════
   Subida y previsualización de imágenes
   Poker SRP BTN vs BB — img_upload.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  IMAGE UPLOAD
// ══════════════════════════════════════════════
function triggerImgPick(street) {
  document.getElementById(street+'-img-file')?.click();
}
function handleImgUpload(street, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result; // base64 data URL
    document.getElementById(street+'-nb-img').value = data;
    const preview = document.getElementById(street+'-img-preview');
    if (preview) { preview.src = data; preview.style.display = 'block'; }
    const wrap = document.getElementById(street+'-img-wrap');
    if (wrap) wrap.classList.add('has-img');
    const hint = document.getElementById(street+'-img-hint');
    if (hint) hint.textContent = '✓ ' + file.name;
    // Show caption input
    const cap = document.getElementById(street+'-nb-img-cap-text');
    if (cap) cap.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function handleEditImgUpload(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('eb-img').value = e.target.result;
    const p = document.getElementById('eb-img-preview');
    if (p) { p.src = e.target.result; p.style.display = 'block'; }
    const h = document.getElementById('eb-img-hint');
    if (h) h.textContent = '✓ ' + file.name;
  };
  reader.readAsDataURL(file);
}

function resetImgUpload(street) {
  const el = document.getElementById(street+'-nb-img');
  if (el) el.value = '';
  const preview = document.getElementById(street+'-img-preview');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  const wrap = document.getElementById(street+'-img-wrap');
  if (wrap) wrap.classList.remove('has-img');
  const hint = document.getElementById(street+'-img-hint');
  if (hint) hint.textContent = 'Haz clic para subir imagen';
  const cap = document.getElementById(street+'-nb-img-cap-text');
  if (cap) { cap.style.display = 'none'; cap.value = ''; }
  const file = document.getElementById(street+'-img-file');
  if (file) file.value = '';
}

// init picker when form opens
const _origOpenAddBoard = window.openAddBoard;