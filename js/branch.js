/* ═══════════════════════════════════════════
   Formulario inline para añadir ramas
   Poker SRP BTN vs BB — branch.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  BRANCH FORM — inline "añadir rama" 
// ══════════════════════════════════════════════
let branchFCCount = 0;

function openBranchForm(street, parentId) {
  const all = getAllHands(street);
  const parent = all[parentId];
  if (!parent) return;
  const el = document.getElementById('branch-form-' + street + '-' + parentId);
  if (!el) return;

  // Build mini picker panel id keys
  const bKey = 'branch-' + street + '-' + parentId;

  el.innerHTML = `
    <div class="card" style="margin-bottom:1rem;border-color:var(--accent2);">
      <div class="card-title" style="color:var(--accent2);">＋ Nueva rama desde este board</div>
      
      <!-- Show parent flop cards as context -->
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;padding:0.5rem 0.75rem;background:var(--bg3);border-radius:8px;">
        <span style="font-family:'Space Mono';font-size:0.6rem;color:var(--muted);text-transform:uppercase;margin-right:0.3rem;">Flop:</span>
        <div style="display:flex;gap:0.3rem;">${(parent.cards||[]).map(c=>`<div class="branch-card ${c.red?'red':'black'}">${c.r}<br>${c.s}</div>`).join('')}</div>
      </div>

      <!-- Turn card picker -->
      <div style="margin-bottom:0.75rem;">
        <div class="picker-label">Turn — elige carta</div>
        <div class="extra-slots" id="${bKey}-turn-slots">
          <div class="extra-slot" onclick="activateExtraSlot_branch('${bKey}','turn',0)">
            <span class="slot-hint" style="font-size:0.55rem;color:var(--muted);">Turn</span>
          </div>
        </div>
      </div>

      <!-- River card picker (optional) -->
      <div style="margin-bottom:0.75rem;">
        <div class="picker-label">River — elige carta (opcional)</div>
        <div class="extra-slots" id="${bKey}-river-slots">
          <div class="extra-slot" onclick="activateExtraSlot_branch('${bKey}','river',0)">
            <span class="slot-hint" style="font-size:0.55rem;color:var(--muted);">River</span>
          </div>
        </div>
      </div>

      <!-- Mini picker panel -->
      <div class="picker-panel open" id="${bKey}-panel" style="margin-bottom:0.75rem;">
        <div class="rank-row" id="${bKey}-ranks"></div>
        <div class="suit-row" id="${bKey}-suits"></div>
        <div style="margin-top:0.4rem;">
          <button class="pk-confirm" onclick="confirmBranchCard('${bKey}')">Añadir carta</button>
          <button class="pk-clear" onclick="clearBranchSlot('${bKey}')">Quitar</button>
        </div>
      </div>

      <!-- Notes + strategy -->
      <div class="form-grid-2" style="margin-bottom:0.75rem;">
        <div class="fld"><label>Notas / estrategia</label><textarea id="${bKey}-notes" rows="2" placeholder="Ej: Turn 9♠ — barrel range, check AA..."></textarea></div>
        <div class="fld"><label>Estrategia (size)</label><input id="${bKey}-strat" placeholder="40% polar / check"></div>
      </div>

      <!-- Value / Bluffs / Checks -->
      <div class="form-grid-3" style="margin-bottom:0.75rem;">
        <div class="fld"><label>✅ Value</label><input id="${bKey}-value" placeholder="AA, KK..."></div>
        <div class="fld"><label>🎲 Bluffs</label><input id="${bKey}-bluffs" placeholder="J9, A4o..."></div>
        <div class="fld"><label>⏸️ Checks</label><input id="${bKey}-checks" placeholder="AA, AK♥..."></div>
      </div>

      <!-- Desplegables & Flashcards shortcuts -->
      <div style="border-top:1px solid var(--border);padding-top:0.75rem;margin-bottom:0.75rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
          <span class="fc-sub-title">📂 Desplegables</span>
          <button class="btn-sm" onclick="addBranchDespRow('${bKey}')">+ Añadir</button>
        </div>
        <div id="${bKey}-desp-rows"></div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:0.75rem;margin-bottom:0.75rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
          <span class="fc-sub-title">🃏 Flashcards</span>
          <button class="btn-sm" onclick="addBranchFCRow('${bKey}')">+ Añadir</button>
        </div>
        <div id="${bKey}-fc-rows"></div>
      </div>

      <div class="form-btns">
        <button class="btn-save" onclick="saveBranchBoard('${street}','${parentId}','${bKey}')">💾 Guardar rama</button>
        <button class="btn-cancel" onclick="closeBranchForm('${street}','${parentId}')">Cancelar</button>
      </div>
    </div>
  `;
  el.style.display = 'block';

  // Init mini picker
  initBranchPicker(bKey);
}

function closeBranchForm(street, parentId) {
  const el = document.getElementById('branch-form-' + street + '-' + parentId);
  if (el) { el.style.display = 'none'; el.innerHTML = ''; }
}

// ── Branch card picker (reuses RANKS/SUITS from main picker) ──
const branchPickerState  = {}; // bKey -> { turn: card|null, river: card|null }
const branchPickerActive = {}; // bKey -> { which: 'turn'|'river' }
const branchPickerSel    = {}; // bKey -> { rank, suit }

function initBranchPicker(bKey) {
  branchPickerState[bKey]  = { turn: null, river: null };
  branchPickerActive[bKey] = 'turn';
  branchPickerSel[bKey]    = { rank: null, suit: null };
  renderBranchRanks(bKey);
  renderBranchSuits(bKey);
  // Highlight turn slot as active
  const slot = document.querySelector('#' + bKey + '-turn-slots .extra-slot');
  if (slot) slot.classList.add('active-slot');
}

function renderBranchRanks(bKey) {
  const el = document.getElementById(bKey + '-ranks');
  if (!el) return;
  const sel = branchPickerSel[bKey]?.rank;
  el.innerHTML = RANKS.map(r =>
    `<button class="pk-rank${sel===r?' sel':''}" onclick="selectBranchRank('${bKey}','${r}')">${r}</button>`
  ).join('');
}
function renderBranchSuits(bKey) {
  const el = document.getElementById(bKey + '-suits');
  if (!el) return;
  const sel = branchPickerSel[bKey]?.suit;
  el.innerHTML = SUITS.map(s =>
    `<button class="pk-suit${sel===s.s?' sel '+s.cls:''}" onclick="selectBranchSuit('${bKey}','${s.s}')">${s.s}</button>`
  ).join('');
}
function selectBranchRank(bKey, r) {
  if (!branchPickerSel[bKey]) branchPickerSel[bKey] = {};
  branchPickerSel[bKey].rank = r;
  renderBranchRanks(bKey);
  if (branchPickerSel[bKey].suit) confirmBranchCard(bKey);
}
function selectBranchSuit(bKey, s) {
  if (!branchPickerSel[bKey]) branchPickerSel[bKey] = {};
  branchPickerSel[bKey].suit = s;
  renderBranchSuits(bKey);
  if (branchPickerSel[bKey].rank) confirmBranchCard(bKey);
}
function activateExtraSlot_branch(bKey, which, idx) {
  branchPickerActive[bKey] = which;
  // Update slot highlights
  ['turn','river'].forEach(w => {
    const slot = document.querySelector('#' + bKey + '-' + w + '-slots .extra-slot');
    if (slot) slot.classList.toggle('active-slot', w === which);
  });
  branchPickerSel[bKey] = { rank: null, suit: null };
  renderBranchRanks(bKey);
  renderBranchSuits(bKey);
}
function confirmBranchCard(bKey) {
  const sel = branchPickerSel[bKey];
  if (!sel || !sel.rank || !sel.suit) return;
  const suitObj = SUITS.find(s => s.s === sel.suit);
  const which = branchPickerActive[bKey] || 'turn';
  branchPickerState[bKey][which] = { r: sel.rank, s: sel.suit, red: suitObj?.red || false };
  branchPickerSel[bKey] = { rank: null, suit: null };
  renderBranchRanks(bKey);
  renderBranchSuits(bKey);
  // Update the slot visually
  renderBranchSlot(bKey, which);
  // Auto-advance to river if turn was just filled
  if (which === 'turn') activateExtraSlot_branch(bKey, 'river', 0);
}
function clearBranchSlot(bKey) {
  const which = branchPickerActive[bKey] || 'turn';
  if (branchPickerState[bKey]) branchPickerState[bKey][which] = null;
  renderBranchSlot(bKey, which);
}
function renderBranchSlot(bKey, which) {
  const slot = document.querySelector('#' + bKey + '-' + which + '-slots .extra-slot');
  if (!slot) return;
  const card = branchPickerState[bKey]?.[which];
  if (card) {
    slot.className = 'extra-slot filled' + (card.red ? ' red' : ' black');
    slot.innerHTML = `${card.r}<br><span style="font-size:0.95rem;">${card.s}</span><button class="remove-card" onclick="event.stopPropagation();clearBranchSlot('${bKey}')">✕</button>`;
  } else {
    slot.className = 'extra-slot' + (branchPickerActive[bKey] === which ? ' active-slot' : '');
    slot.innerHTML = `<span class="slot-hint" style="font-size:0.55rem;color:var(--muted);">${which.charAt(0).toUpperCase()+which.slice(1)}</span>`;
  }
}

function addBranchDespRow(bKey) {
  const c = document.getElementById(bKey + '-desp-rows');
  if (!c) return;
  const id = 'bdr-' + (branchFCCount++);
  const d = document.createElement('div');
  d.className = 'desp-row'; d.id = id;
  d.innerHTML = `<input placeholder="Título" class="desp-title"><textarea class="desp-content" rows="2" placeholder="Contenido..."></textarea><button class="btn-del-fc" onclick="document.getElementById('${id}').remove()">✕</button>`;
  c.appendChild(d);
}
function addBranchFCRow(bKey) {
  const c = document.getElementById(bKey + '-fc-rows');
  if (!c) return;
  const id = 'bfr-' + (branchFCCount++);
  const d = document.createElement('div');
  d.className = 'fc-row'; d.id = id;
  d.innerHTML = `<input placeholder="Pregunta" class="fc-q"><input placeholder="Respuesta" class="ans fc-a"><button class="btn-del-fc" onclick="document.getElementById('${id}').remove()">✕</button>`;
  c.appendChild(d);
}

function saveBranchBoard(street, parentId, bKey) {
  const turnCard  = branchPickerState[bKey]?.turn  || null;
  const riverCard = branchPickerState[bKey]?.river || null;
  if (!turnCard && !riverCard) { alert('Añade al menos la carta del Turn'); return; }

  const all = getAllHands(street);
  const parent = all[parentId];
  // Check duplicate: same flop + same turn/river combination
  const parentCards = parent?.cards || [];
  const effectiveTurnForCheck  = (parent?.turnCard) ? null : turnCard;
  const effectiveRiverForCheck = (parent?.turnCard) ? turnCard : riverCard;
  if (isDuplicateBoard(street, parentCards, effectiveTurnForCheck, effectiveRiverForCheck, null)) {
    alert('⚠️ Ya existe una rama con estas mismas cartas de Turn/River.');
    return;
  }
  const notes  = document.getElementById(bKey + '-notes')?.value.trim() || '';
  const strat  = document.getElementById(bKey + '-strat')?.value.trim() || '';
  const value  = document.getElementById(bKey + '-value')?.value.trim() || '';
  const bluffs = document.getElementById(bKey + '-bluffs')?.value.trim() || '';
  const checks = document.getElementById(bKey + '-checks')?.value.trim() || '';

  // Build label: show only the new cards added in this branch
  // If parent already has a turnCard (we're adding river), prefix differently
  const parentHasTurn = !!(parent?.turnCard);
  const flopCards = (parent?.cards||[]).map(c => c.r+c.s).join(' ');
  const parentTurn  = parentHasTurn ? ' T:' + parent.turnCard.r + parent.turnCard.s : '';
  const newTurnLabel  = (!parentHasTurn && turnCard)  ? ' T:' + turnCard.r + turnCard.s  : '';
  const newRivLabel   = riverCard ? ' R:' + riverCard.r + riverCard.s : '';
  // If branching from a turn board (parent has turnCard), turn here = river
  const effectiveTurnCard  = parentHasTurn ? null : turnCard;
  const effectiveRiverCard = parentHasTurn ? turnCard : riverCard; // first card becomes river
  const label = flopCards + parentTurn + newTurnLabel + newRivLabel;

  // Collect desplegables
  const desps = Array.from((document.getElementById(bKey+'-desp-rows')||{querySelectorAll:()=>[]}).querySelectorAll('.desp-row'))
    .map(r => ({ title: r.querySelector('.desp-title')?.value.trim()||'', content: r.querySelector('.desp-content')?.value.trim()||'' }))
    .filter(d => d.title || d.content);

  // Collect flashcards
  const fcs = Array.from((document.getElementById(bKey+'-fc-rows')||{querySelectorAll:()=>[]}).querySelectorAll('.fc-row'))
    .map(r => ({ q: r.querySelector('.fc-q')?.value.trim()||'', a: r.querySelector('.fc-a')?.value.trim()||'' }))
    .filter(f => f.q && f.a);

  const id = 'custom-' + Date.now();
  if (!customHands[street]) customHands[street] = {};
  customHands[street][id] = {
    label, cards: parent?.cards || [],
    turnCard: parentHasTurn ? (parent.turnCard) : effectiveTurnCard,
    riverCard: parentHasTurn ? effectiveRiverCard : effectiveRiverCard,
    groupFlop: parentId,
    strategy: strat || 'Sin estrategia', stratBadge: 'neutral',
    notes, value, bluffs, checks, flashcards: fcs, sections: desps
  };
  persistCustomHands();
  closeBranchForm(street, parentId);
  updateSelectorPreview(street);
  renderHandContent(street, parentId); // re-render parent to show new child
}

function parseBoard(str) {
  const suits={'♥':'♥','♦':'♦','♣':'♣','♠':'♠','h':'♥','d':'♦','c':'♣','s':'♠'};
  const red=['♥','♦'];
  return str.split(/\s+/).slice(0,3).map(p=>({r:p[0]||'?',s:suits[p[1]]||p[1]||'?',red:red.includes(suits[p[1]]||p[1])}));
}
function deleteBoard(e, street, id) {
  e.stopPropagation();
  deleteBoardFromPicker(street, id);
}

// ══ EXPORT / IMPORT ══
function exportData(street) {
  const all = customHands[street]||{};
  const blob = new Blob([JSON.stringify({version:2,street,boards:all},null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `poker-${street}-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}
function importData(e, street) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      const boards = data.boards || data.customHands || {};
      if (!customHands[street]) customHands[street] = {};
      Object.assign(customHands[street], boards);
      persistCustomHands();
      renderEjemplos(street);
      const st = document.getElementById(street+'-status');
      if (st) { st.textContent = '✓ '+Object.keys(boards).length+' importados'; st.style.display='inline'; setTimeout(()=>st.style.display='none',3000); }
    } catch(err) { alert('Error: '+err.message); }
    e.target.value='';
  };
  reader.readAsText(file);
}