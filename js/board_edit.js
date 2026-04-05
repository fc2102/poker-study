/* ═══════════════════════════════════════════
   Modal de edición de boards existentes
   Poker SRP BTN vs BB — board_edit.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  EDIT BOARD MODAL
// ══════════════════════════════════════════════
let modalState = null;
let editFCCount = 0;

function openModal(title, body, state) {
  modalState = state;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  modalState = null;
}
function saveModal() {
  if (!modalState) return;
  if (modalState.type === 'board')  saveBoardModal();
  if (modalState.type === 'teoria') saveTeoriaModal();
}

let editDespCount = 0;
function addEditDespRow() {
  const c = document.getElementById('edit-desp-rows');
  if (!c) return;
  const id = 'edr-new-' + (editDespCount++);
  const d = document.createElement('div');
  d.className = 'desp-row'; d.id = id;
  d.innerHTML = `<input placeholder="Título" class="desp-title"><textarea class="desp-content" rows="3" placeholder="Contenido..."></textarea><button class="btn-del-fc" onclick="document.getElementById('${id}').remove()">✕</button>`;
  c.appendChild(d);
}

function addEditFCRow() {
  const c = document.getElementById('edit-fc-rows');
  const id = 'efcr-' + (editFCCount++);
  const d = document.createElement('div');
  d.className = 'fc-row'; d.id = id;
  d.innerHTML = `<input placeholder="Pregunta" class="fc-q"><input placeholder="Respuesta" class="ans fc-a"><button class="btn-del-fc" onclick="document.getElementById('${id}').remove()">✕</button>`;
  c.appendChild(d);
}

function openEditBoard(street, id) {
  const all = getAllHands(street);
  const h = all[id];
  if (!h) return;
  const fcs = h.flashcards||[];
  const fcRows = fcs.map((fc,i) => {
    const rid = 'efcr-'+i;
    return `<div class="fc-row" id="${rid}"><input placeholder="Pregunta" class="fc-q" value="${fc.q.replace(/"/g,'&quot;')}"><input placeholder="Respuesta" class="ans fc-a" value="${fc.a.replace(/"/g,'&quot;')}"><button class="btn-del-fc" onclick="document.getElementById('${rid}').remove()">✕</button></div>`;
  }).join('');
  const secs = h.sections||[];
  const despRows = secs.map((s,i) => {
    const rid = 'edr-'+i;
    return `<div class="desp-row" id="${rid}"><input placeholder="Título" class="desp-title" value="${(s.title||'').replace(/"/g,'&quot;')}"><textarea class="desp-content" rows="3">${s.content||''}</textarea><button class="btn-del-fc" onclick="document.getElementById('${rid}').remove()">✕</button></div>`;
  }).join('');

  const body = `
    <div class="fld" style="margin-bottom:1rem;"><label>Board</label><input id="eb-name" value="${h.label||''}"></div>
    <div class="fld" style="margin-bottom:1rem;"><label>Estrategia</label><input id="eb-strat" value="${h.strategy||''}"></div>
    <div class="fld" style="margin-bottom:1rem;"><label>Notas</label><textarea id="eb-notes" rows="3">${h.notes||''}</textarea></div>
    <div class="fld" style="margin-bottom:1rem;">
      <label>📸 Imagen (solver, wizard...) — opcional</label>
      <label class="img-upload-wrap ${h.customImg?'has-img':''}" onclick="document.getElementById('eb-img-file').click()">
        <div class="img-upload-hint" id="eb-img-hint">${h.customImg ? '✓ Imagen guardada (clic para cambiar)' : 'Haz clic para subir imagen'}</div>
        ${h.customImg ? `<img src="${h.customImg}" class="img-preview">` : '<img id="eb-img-preview" class="img-preview" style="display:none;">'}
        <input type="file" id="eb-img-file" accept="image/*" style="display:none;" onchange="handleEditImgUpload(this)">
      </label>
      <input type="hidden" id="eb-img" value="${h.customImg||''}">
      <input id="eb-img-cap" placeholder="Pie de foto" value="${h.customImgCaption||''}" style="margin-top:0.4rem;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:0.5rem 0.7rem;color:var(--text);font-size:0.82rem;outline:none;width:100%;">
    </div>
    <div class="form-grid-3" style="margin-bottom:1rem;">
      <div class="fld"><label>✅ Value</label><input id="eb-value" value="${h.value||''}"></div>
      <div class="fld"><label>🎲 Bluffs</label><input id="eb-bluffs" value="${h.bluffs||''}"></div>
      <div class="fld"><label>⏸️ Checks</label><input id="eb-checks" value="${h.checks||''}"></div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:1rem;margin-bottom:0.75rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
        <span class="fc-sub-title">📂 Desplegables</span>
        <button class="btn-sm" onclick="addEditDespRow()">+ Añadir</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:0.5rem;margin-bottom:0.4rem;">
        <span style="font-family:'Space Mono';font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Título</span>
        <span style="font-family:'Space Mono';font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Contenido</span>
        <span></span>
      </div>
      <div id="edit-desp-rows">${despRows}</div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
        <span class="fc-sub-title">🃏 Flashcards</span>
        <button class="btn-sm" onclick="addEditFCRow()">+ Añadir</button>
      </div>
      <div id="edit-fc-rows">${fcRows}</div>
    </div>`;
  openModal('Editar: ' + h.label, body, { type:'board', street, id });
}

function saveBoardModal() {
  const { street, id } = modalState;
  const all = getAllHands(street);
  const orig = all[id] || {};
  const rawLabel = document.getElementById('eb-name').value.trim() || orig.label;
  // Parse and sort cards from label
  const editedCards = sortCards(parseBoard(rawLabel));
  const label  = editedCards.length ? editedCards.map(c=>c.r+c.s).join(' ') : rawLabel;
  const strat  = document.getElementById('eb-strat').value.trim();
  const notes  = document.getElementById('eb-notes').value.trim();
  const value  = document.getElementById('eb-value').value.trim();
  const bluffs = document.getElementById('eb-bluffs').value.trim();
  const checks = document.getElementById('eb-checks').value.trim();
  const customImg        = document.getElementById('eb-img')?.value || orig.customImg || '';
  const customImgCaption = document.getElementById('eb-img-cap')?.value.trim() || '';
  const fcs = Array.from(document.getElementById('edit-fc-rows').querySelectorAll('.fc-row'))
    .map(r => ({ q:r.querySelector('.fc-q')?.value.trim()||'', a:r.querySelector('.fc-a')?.value.trim()||'' }))
    .filter(f => f.q && f.a);
  const desps = Array.from((document.getElementById('edit-desp-rows')||{querySelectorAll:()=>[]}).querySelectorAll('.desp-row'))
    .map(r => ({ title:r.querySelector('.desp-title')?.value.trim()||'', content:r.querySelector('.desp-content')?.value.trim()||'' }))
    .filter(d => d.title || d.content);
  if (!customHands[street]) customHands[street] = {};
  const newCards = editedCards.length ? editedCards : parseBoard(label);
  if (newCards.length && isDuplicateBoard(street, newCards, orig.turnCard||null, orig.riverCard||null, id)) {
    alert('⚠️ Ya existe un board con estas mismas cartas.');
    return;
  }
  customHands[street][id] = { ...orig, label, strategy:strat, notes, value, bluffs, checks, flashcards:fcs, sections:desps, customImg, customImgCaption, cards:newCards };
  persistCustomHands();
  renderHandTabs(street);
  renderHandContent(street, id);
  closeModal();
}