/* ═══════════════════════════════════════════
   Board picker modal (ventana flotante)
   Poker SRP BTN vs BB — picker.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  BOARD PICKER MODAL
// ══════════════════════════════════════════════
const RANK_ORDER = {'A':0,'K':1,'Q':2,'J':3,'T':4,'9':5,'8':6,'7':7,'6':8,'5':9,'4':10,'3':11,'2':12};
const RANK_NAMES = {'A':'As','K':'Rey','Q':'Reina','J':'Jota','T':'Diez',
  '9':'Nueve','8':'Ocho','7':'Siete','6':'Seis','5':'Cinco','4':'Cuatro','3':'Tres','2':'Dos'};

function getRankScore(hand) {
  const cards = hand.cards || [];
  if (!cards.length) return 99;
  return Math.min(...cards.map(c => RANK_ORDER[c.r] ?? 99));
}

let _pickerStreet = null;

// Build and open the picker modal
function openBoardPicker(street) {
  _pickerStreet = street;
  // Create or reuse modal
  let overlay = document.getElementById('board-picker-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'board-picker-overlay';
    overlay.className = 'board-picker-overlay';
    overlay.innerHTML = `
      <div class="board-picker-modal">
        <div class="picker-modal-header">
          <span class="picker-modal-title">ELEGIR BOARD</span>
          <button class="picker-modal-close" onclick="closeBoardPicker()">✕</button>
        </div>
        <div class="picker-modal-search">
          <input id="picker-search" placeholder="🔍 Buscar board..." oninput="filterBoardPicker(this.value)">
        </div>
        <div class="picker-modal-body" id="picker-modal-body"></div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeBoardPicker(); });
    document.body.appendChild(overlay);
  }
  overlay.classList.add('open');
  const searchInput = document.getElementById('picker-search');
  if (searchInput) searchInput.value = '';
  renderPickerBody(street, '');
}

function closeBoardPicker() {
  const overlay = document.getElementById('board-picker-overlay');
  if (overlay) overlay.classList.remove('open');
}

function filterBoardPicker(query) {
  if (_pickerStreet) renderPickerBody(_pickerStreet, query.toLowerCase());
}

function renderPickerBody(street, query) {
  const body = document.getElementById('picker-modal-body');
  if (!body) return;
  const all = getAllHands(street);
  const entries = Object.entries(all);

  // Sort by rank
  entries.sort(([,a],[,b]) => {
    const da = getRankScore(a), db = getRankScore(b);
    return da !== db ? da - db : (a.label||'').localeCompare(b.label||'');
  });

  // Filter
  const filtered = query
    ? entries.filter(([,h]) => (h.label||'').toLowerCase().includes(query))
    : entries;

  if (!filtered.length) {
    body.innerHTML = `<div class="picker-empty">${query ? 'Sin resultados para "'+query+'"' : 'Sin boards<br>Usa ＋ Añadir para crear uno'}</div>`;
    return;
  }

  // Only show root boards (no branches) in the picker
  // Branches are accessed by clicking into their parent board
  const roots = filtered.filter(([,h]) => !h.groupFlop);

  // Build groups map from roots only
  const groups = {};
  roots.forEach(([id,h]) => {
    const cards = h.cards || [];
    const topRank = cards.length
      ? cards.reduce((best,c) => (RANK_ORDER[c.r]??99) < (RANK_ORDER[best]??99) ? c.r : best, cards[0].r)
      : '?';
    if (!groups[topRank]) groups[topRank] = [];
    groups[topRank].push([id, h, false]);
  });

  const mkCard = c => `<div class="sel-mini-card ${c.red?'red':'black'}">${c.r}<br>${c.s}</div>`;
  let html = '';
  for (const rank of [...RANKS, '?']) {
    if (!groups[rank]) continue;
    const rankLabel = rank === '?' ? 'Otros' : `${rank} · ${RANK_NAMES[rank]||rank}`;
    html += `<div class="picker-rank-header">${rankLabel}</div>`;

    groups[rank].forEach(([id, h, isBranch]) => {
      const isActive = currentBoard[street] === id;
      const isCustom = !!customHands[street]?.[id];
      // Cards display
      const flopCards = (h.cards||[]).map(mkCard).join('');
      const turnPart  = h.turnCard  ? `<span class="picker-street-tag" style="color:var(--accent2)">T</span>` + mkCard(h.turnCard)  : '';
      const riverPart = h.riverCard ? `<span class="picker-street-tag" style="color:var(--accent3)">R</span>` + mkCard(h.riverCard) : '';
      const allCards  = `<div class="picker-item-cards">${flopCards}${turnPart}${riverPart}</div>`;

      html += `<div class="picker-board-item${isActive?' active':''}"
        onclick="selectBoardFromPicker('${street}','${id}')">
        ${allCards}
        <div class="picker-item-info">
          <div class="picker-item-label">${h.label}</div>
          ${h.strategy ? `<div class="picker-item-strat">${h.strategy}</div>` : ''}
        </div>
        ${isActive ? '<span style="color:var(--accent);font-size:0.75rem;">✓</span>' : ''}
        ${isCustom ? `<button class="picker-item-del" onclick="event.stopPropagation();deleteBoardFromPicker('${street}','${id}')">🗑</button>` : ''}
      </div>`;
    });
  }
  body.innerHTML = html;
}

function selectBoardFromPicker(street, id) {
  currentBoard[street] = id;
  closeBoardPicker();
  updateSelectorPreview(street);
  renderHandContent(street, id);
}

function deleteBoardFromPicker(street, id) {
  if (!confirm('¿Borrar este board y sus ramas?')) return;
  // Also delete children
  Object.keys(customHands[street]||{}).forEach(cid => {
    if (customHands[street][cid]?.groupFlop === id) delete customHands[street][cid];
  });
  delete customHands[street][id];
  persistCustomHands();
  const ids = Object.keys(getAllHands(street));
  currentBoard[street] = ids[0] || null;
  renderPickerBody(street, document.getElementById('picker-search')?.value?.toLowerCase() || '');
  updateSelectorPreview(street);
  if (currentBoard[street]) renderHandContent(street, currentBoard[street]);
  else {
    const hc = document.getElementById(street + '-hand-content');
    if (hc) hc.innerHTML = '<div class="card" style="text-align:center;color:var(--muted);padding:2rem;">Añade tu primer board con el botón ＋</div>';
  }
}

function updateSelectorPreview(street) {
  const preview = document.getElementById(street + '-sel-preview');
  if (!preview) return;
  const all = getAllHands(street);
  const id  = currentBoard[street];
  const hand = id ? all[id] : null;
  if (!hand) {
    preview.innerHTML = '<span class="sel-no-board">Elegir board</span>';
    return;
  }
  const mkC = c => `<div class="sel-mini-card ${c.red?'red':'black'}">${c.r}<br>${c.s}</div>`;
  const tT = hand.turnCard  ? `<span class="picker-street-tag" style="color:var(--accent2)">T</span>${mkC(hand.turnCard)}`  : '';
  const rT = hand.riverCard ? `<span class="picker-street-tag" style="color:var(--accent3)">R</span>${mkC(hand.riverCard)}` : '';
  preview.innerHTML = `<div style="display:flex;align-items:center;gap:3px;">${(hand.cards||[]).map(mkC).join('')}${tT}${rT}</div><span class="sel-label" style="font-size:0.82rem;color:var(--text);margin-left:0.4rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px;">${hand.label}</span>`;
}

function renderHandTabs(street) { renderBoardSelector(street); }
function renderBoardSelector(street) { updateSelectorPreview(street); }

// selectBoard (used by branch back-links etc.)

function selectBoard(street, id) {
  currentBoard[street] = id;
  updateSelectorPreview(street);
  renderHandContent(street, id);
}

function renderHandContent(street, id) {
  const el = document.getElementById(street + '-hand-content');
  if (!el) return;
  const all = getAllHands(street);
  const hand = all[id];
  if (!hand) return;

  const cardsHtml = (hand.cards||[]).map(c =>
    `<div class="board-card ${c.red?'red':'black'}">${c.r}<br>${c.s}</div>`
  ).join('');
  const badgeClass = {neutral:'badge-neutral',range:'badge-range',polar:'badge-polar'}[hand.stratBadge||'neutral'];
  const isCustom = !!customHands[street]?.[id];

  // Solver image + annotations
  let solverHtml = '';
  if (hand.solverImg) {
    const _ss = hand.solverImgSize || {};
    const _sw = _ss.w ? _ss.w+'px' : '100%';
    const _sh = _ss.h ? `style="height:${_ss.h}px"` : '';
    solverHtml += `<div class="solver-img-wrap resizable"><div class="solver-img-label">🖥️ ${hand.solverCaption||'Solver'}</div><div class="resizable-img-wrap" id="riw-solver-${id}" style="width:${_sw};"><img src="${hand.solverImg}" onclick="openLightbox(this)" alt="solver" draggable="false" ${_sh}><div class="img-resize-handle" style="right:26px;" onmousedown="startResize(event,'riw-solver-${id}','w')" title="Ancho">↔</div><div class="img-resize-handle" onmousedown="startResize(event,'riw-solver-${id}','h')" title="Alto">↕</div></div></div>`;
    (hand.solverAnnotations||[]).forEach(a => {
      solverHtml += `<div class="annotation-box"><span class="anno-label">${a.icon} ${a.label}</span>${a.text}</div>`;
    });
    if (hand.pctBars) {
      solverHtml += '<div class="card" style="margin:1rem 0;"><div class="card-title">Frecuencias del solver</div>';
      hand.pctBars.forEach(b => {
        solverHtml += `<div class="pct-bar-wrap"><div class="pct-label"><span>${b.label}</span><span>${b.pct}%</span></div><div class="pct-bar"><div class="pct-fill ${b.cls}" style="width:${b.pct}%"></div></div></div>`;
      });
      solverHtml += '</div>';
    }
  }
  if (hand.customImg) {
    const _cs = hand.customImgSize || {};
    const _cw = _cs.w ? _cs.w+'px' : '100%';
    const _ch = _cs.h ? `style="height:${_cs.h}px"` : '';
    solverHtml += `<div class="solver-img-wrap resizable"><div class="solver-img-label">📸 ${hand.customImgCaption||'Imagen'}</div><div class="resizable-img-wrap" id="riw-custom-${id}" style="width:${_cw};"><img src="${hand.customImg}" onclick="openLightbox(this)" alt="custom" draggable="false" ${_ch}><div class="img-resize-handle" style="right:26px;" onmousedown="startResize(event,'riw-custom-${id}','w')" title="Ancho">↔</div><div class="img-resize-handle" onmousedown="startResize(event,'riw-custom-${id}','h')" title="Alto">↕</div></div></div>`;
  }

  // Sections (accordions)
  let sectionsHtml = (hand.sections||[]).map(s => `
    <div class="accordion" style="margin-bottom:0.75rem;">
      <button class="accordion-btn" data-acc="1">${s.title}<span class="chevron">▼</span></button>
      <div class="accordion-content"><div style="font-size:0.9rem;line-height:1.65;">${s.content}</div></div>
    </div>`).join('');

  // Custom notes + chips
  let customHtml = '';
  if (hand.notes) customHtml += `<div class="card"><div class="card-title">Notas</div><p style="font-size:0.9rem;line-height:1.65;">${hand.notes}</p></div>`;
  const chipsSection = [
    hand.value  ? `<div style="margin-bottom:0.75rem;"><div class="card-title">✅ Value</div><div class="zone-row">${hand.value.split(',').map(h=>`<span class="hand-chip chip-value">${h.trim()}</span>`).join('')}</div></div>` : '',
    hand.bluffs ? `<div style="margin-bottom:0.75rem;"><div class="card-title">🎲 Bluffs</div><div class="zone-row">${hand.bluffs.split(',').map(h=>`<span class="hand-chip chip-bluff">${h.trim()}</span>`).join('')}</div></div>` : '',
    hand.checks ? `<div><div class="card-title">⏸️ Checks</div><div class="zone-row">${hand.checks.split(',').map(h=>`<span class="hand-chip chip-check">${h.trim()}</span>`).join('')}</div></div>` : '',
  ].join('');
  if (chipsSection) customHtml += `<div class="card">${chipsSection}</div>`;

  // Flashcards
  const fcs = hand.flashcards||[];
  let fcHtml = '';
  if (fcs.length) {
    fcHtml = `<div class="card"><div class="card-title">🃏 Flashcards · ${hand.label}</div>`;
    fcs.forEach((fc,i) => {
      fcHtml += `<div class="fc-card-display" onclick="flipFC(this)">
        <div class="fc-q-area"><div class="fc-q-label">Pregunta ${i+1}</div><p style="font-size:0.9rem;margin-top:0.2rem;">${fc.q}</p></div>
        <div class="fc-a-area"><div class="fc-a-label">Respuesta</div><p style="font-size:0.9rem;margin-top:0.2rem;color:var(--accent4);">${fc.a}</p></div>
      </div>`;
    });
    fcHtml += '</div>';
  }

  // Build board tree (flop + optional turn + river)
  let treeHtml = '';
  const hasTree = hand.cards?.length || hand.turnCard || hand.riverCard;
  if (hasTree) {
    const mkCard = c => `<div class="branch-card ${c.red?'red':'black'}">${c.r}<br>${c.s}</div>`;
    treeHtml = '<div class="board-tree">';
    if (hand.cards?.length) {
      treeHtml += `<div class="branch-section"><div class="branch-label flop-lbl">Flop</div><div class="branch-cards">${hand.cards.map(mkCard).join('')}</div></div>`;
    }
    if (hand.turnCard) {
      treeHtml += `<div class="branch-section"><div class="branch-label turn-lbl">Turn</div><div class="branch-cards">${mkCard(hand.turnCard)}</div></div>`;
    }
    if (hand.riverCard) {
      treeHtml += `<div class="branch-section"><div class="branch-label river-lbl">River</div><div class="branch-cards">${mkCard(hand.riverCard)}</div></div>`;
    }
    treeHtml += '</div>';
  }

  // All hands for this street
  const allH = getAllHands(street);

  // Back-link if this board is a child (has a parent)
  let parentHtml = '';
  if (hand.groupFlop) {
    const par = allH[hand.groupFlop];
    if (par) {
      const mkParCard = c => `<div class="branch-card ${c.red?'red':'black'}" style="width:28px;height:38px;font-size:0.75rem;">${c.r}<br>${c.s}</div>`;
      parentHtml = `<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;cursor:pointer;padding:0.5rem 0.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:8px;" onclick="selectBoard('${street}','${hand.groupFlop}')">
        <span style="font-family:'Space Mono';font-size:0.6rem;color:var(--muted);text-transform:uppercase;">← Volver al board padre</span>
        <div style="display:flex;gap:0.25rem;">${(par.cards||[]).map(mkParCard).join('')}</div>
        ${par.turnCard ? `<span style="font-family:'Space Mono';font-size:0.58rem;color:var(--accent2);">T:</span><div style="display:flex;gap:0.2rem;">${mkParCard(par.turnCard)}</div>` : ''}
        ${par.riverCard ? `<span style="font-family:'Space Mono';font-size:0.58rem;color:var(--accent3);">R:</span><div style="display:flex;gap:0.2rem;">${mkParCard(par.riverCard)}</div>` : ''}
        <span style="font-size:0.82rem;color:var(--text);margin-left:0.25rem;">${par.label}</span>
      </div>`;
    }
  }

  // Children: boards that have this board as parent
  const children = Object.entries(allH).filter(([cid, ch]) => ch.groupFlop === id && cid !== id);
  let childrenHtml = '';
  if ((children.length || isCustom) && street !== 'flop') {
    childrenHtml = `<div class="card" style="margin-top:1rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
        <div class="card-title" style="margin-bottom:0;">🌿 Ramas</div>
        <button class="btn-sm gold" onclick="openBranchForm('${street}','${id}')">＋ Añadir rama</button>
      </div>`;
    if (children.length) {
      children.forEach(([cid, ch]) => {
        const mkC = c => `<div class="branch-card ${c.red?'red':'black'}" style="width:32px;height:44px;font-size:0.82rem;">${c.r}<br>${c.s}</div>`;
        childrenHtml += `<div style="display:flex;align-items:center;gap:0.6rem;padding:0.65rem 0.75rem;border:1px solid var(--border);border-radius:8px;margin-bottom:0.5rem;cursor:pointer;transition:border-color 0.15s;" onmouseover="this.style.borderColor='var(--accent2)'" onmouseout="this.style.borderColor='var(--border)'" onclick="selectBoard('${street}','${cid}')">`;
        // Show flop cards (from parent = current board)
        childrenHtml += `<div style="display:flex;gap:0.2rem;">${(hand.cards||[]).map(mkC).join('')}</div>`;
        // Turn card
        if (ch.turnCard) childrenHtml += `<span style="font-family:'Space Mono';font-size:0.55rem;color:var(--accent2);text-transform:uppercase;">T</span><div style="display:flex;gap:0.2rem;">${mkC(ch.turnCard)}</div>`;
        // River card
        if (ch.riverCard) childrenHtml += `<span style="font-family:'Space Mono';font-size:0.55rem;color:var(--accent3);text-transform:uppercase;">R</span><div style="display:flex;gap:0.2rem;">${mkC(ch.riverCard)}</div>`;
        childrenHtml += `<div style="margin-left:0.5rem;flex:1;"><div style="font-size:0.85rem;font-weight:500;">${ch.label}</div>${ch.notes?`<div style="font-size:0.75rem;color:var(--muted);margin-top:0.15rem;">${ch.notes.slice(0,60)}${ch.notes.length>60?'…':''}</div>`:''}</div>`;
        childrenHtml += `<span style="font-size:0.75rem;color:var(--accent2);">→</span></div>`;
      });
    } else {
      childrenHtml += `<div style="text-align:center;padding:1rem;color:var(--muted);font-family:'Space Mono',monospace;font-size:0.68rem;letter-spacing:1px;text-transform:uppercase;">Sin ramas — usa ＋ Añadir rama</div>`;
    }
    childrenHtml += `</div>`;
  }

  el.innerHTML = `
    <div class="board-header">
      <div class="board-header-left">
        ${treeHtml || `<div class="board-display">${cardsHtml}</div>`}
        <span class="badge ${badgeClass}" style="font-size:0.72rem;margin-top:0.3rem;">${hand.strategy}</span>
      </div>
      <div class="board-actions">
        <button class="btn-sm" onclick="openEditBoard('${street}','${id}')">✏️ Editar</button>
        ${isCustom ? `<button class="btn-sm" style="color:var(--accent3);border-color:rgba(255,107,107,0.4);" onclick="deleteBoard(event,'${street}','${id}')">🗑 Borrar</button>` : ''}
      </div>
    </div>
    ${parentHtml}
    <div id="branch-form-${street}-${id}" style="display:none;"></div>
    ${solverHtml}${sectionsHtml}${customHtml}${fcHtml}${childrenHtml}
  `;
}

function flipFC(card) {
  const ans = card.querySelector('.fc-a-area');
  if (ans) ans.classList.toggle('show');
}

// ══ ADD BOARD ══
let fcRowCount = 0;
let despRowCount = 0;
function addDespRow(containerId) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const id = 'dr-' + (despRowCount++);
  const d = document.createElement('div');
  d.className = 'desp-row';
  d.id = id;
  d.innerHTML = `
    <input placeholder="Título del desplegable" class="desp-title">
    <textarea placeholder="Contenido (HTML permitido: <strong>, <mark>...)" class="desp-content" rows="3"></textarea>
    <button class="btn-del-fc" onclick="document.getElementById('${id}').remove()">✕</button>`;
  c.appendChild(d);
}
function getDespRows(containerId) {
  const c = document.getElementById(containerId);
  if (!c) return [];
  return Array.from(c.querySelectorAll('.desp-row'))
    .map(r => ({ title: r.querySelector('.desp-title')?.value.trim()||'', content: r.querySelector('.desp-content')?.value.trim()||'' }))
    .filter(d => d.title || d.content);
}

function addFCRow(containerId) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const id = 'fcr-' + (fcRowCount++);
  const d = document.createElement('div');
  d.className = 'fc-row';
  d.id = id;
  d.innerHTML = `<input placeholder="Pregunta" class="fc-q"><input placeholder="Respuesta" class="ans fc-a"><button class="btn-del-fc" onclick="document.getElementById('${id}').remove()">✕</button>`;
  c.appendChild(d);
}
function getFCRows(containerId) {
  return Array.from((document.getElementById(containerId)||{querySelectorAll:()=>[]}).querySelectorAll('.fc-row'))
    .map(r => ({ q: r.querySelector('.fc-q')?.value.trim()||'', a: r.querySelector('.fc-a')?.value.trim()||'' }))
    .filter(f => f.q && f.a);
}
// openAddBoard merged into EXTRA_JS below
// closeAddBoard merged into EXTRA_JS below