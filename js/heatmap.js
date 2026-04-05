/* ═══════════════════════════════════════════
   Heatmap de rangos interactivo 13x13
   Poker SRP BTN vs BB — heatmap.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  HEATMAP — RANGO 13x13
// ══════════════════════════════════════════════

const HEATMAP_RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

// State: { boardId: { 'AA': 'value'|'bluff'|'check'|'fold'|null, ... } }
let heatmapData = JSON.parse(localStorage.getItem('poker-heatmap-v1') || '{}');

function persistHeatmap() {
  try { localStorage.setItem('poker-heatmap-v1', JSON.stringify(heatmapData)); } catch(e) {}
}

let heatmapCurrentBoard = null; // { street, id, label }
let heatmapBrushColor   = 'value'; // active brush
let heatmapPainting     = false;

function openHeatmap(street, boardId) {
  const all = getAllHands(street);
  const hand = all[boardId];
  if (!hand) return;
  heatmapCurrentBoard = { street, id: boardId, label: hand.label };
  if (!heatmapData[boardId]) heatmapData[boardId] = {};

  let overlay = document.getElementById('heatmap-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'heatmap-overlay';
    overlay.className = 'heatmap-overlay';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('open');
  renderHeatmapModal();
}

function closeHeatmap() {
  const overlay = document.getElementById('heatmap-overlay');
  if (overlay) overlay.classList.remove('open');
  heatmapPainting = false;
}

function renderHeatmapModal() {
  const overlay = document.getElementById('heatmap-overlay');
  if (!overlay) return;
  const { id, label } = heatmapCurrentBoard;
  const data = heatmapData[id] || {};

  // Count by action
  const counts = { value:0, bluff:0, check:0, fold:0 };
  let total = 0;
  Object.values(data).forEach(v => { if (v && counts[v] !== undefined) { counts[v]++; total++; } });

  // Build 13x13 grid
  let gridHtml = '<div class="hm-grid" id="hm-grid" onmouseleave="heatmapPainting=false">';
  // Header row
  gridHtml += '<div class="hm-row"><div class="hm-corner"></div>';
  HEATMAP_RANKS.forEach(r => { gridHtml += `<div class="hm-col-hdr">${r}</div>`; });
  gridHtml += '</div>';

  HEATMAP_RANKS.forEach((r1, i) => {
    gridHtml += `<div class="hm-row"><div class="hm-row-hdr">${r1}</div>`;
    HEATMAP_RANKS.forEach((r2, j) => {
      let combo;
      if (i === j) {
        // Pocket pair
        combo = r1 + r2;
      } else if (i < j) {
        // Suited (top-right triangle)
        combo = r1 + r2 + 's';
      } else {
        // Offsuit (bottom-left triangle)
        combo = r2 + r1 + 'o';
      }
      const action = data[combo] || '';
      const cls    = action ? `hm-cell hm-${action}` : 'hm-cell';
      const isPair = i === j;
      const isSuited = i < j;
      const typeTag = isPair ? '' : (isSuited ? 's' : 'o');
      // Short label: show rank pair + type
      const cellLabel = i === j ? r1+r2 : (i < j ? r1+r2+'s' : r1+r2+'o');
      gridHtml += `<div class="${cls}" data-combo="${combo}"
        onmousedown="startPaint(event,'${combo}')"
        onmouseenter="continuePaint('${combo}')"
        onmouseup="heatmapPainting=false"
        title="${combo}">
        <span class="hm-cell-label">${cellLabel}</span>
      </div>`;
    });
    gridHtml += '</div>';
  });
  gridHtml += '</div>';

  overlay.innerHTML = `
    <div class="heatmap-modal">
      <div class="hm-header">
        <div>
          <span class="hm-title">RANGO</span>
          <span class="hm-board-label">${label}</span>
        </div>
        <button class="anki-close" onclick="closeHeatmap()">✕</button>
      </div>

      <!-- BRUSH SELECTOR -->
      <div class="hm-toolbar">
        <span class="hm-toolbar-label">Pincel:</span>
        <button class="hm-brush hm-brush-value ${heatmapBrushColor==='value'?'active':''}"  onclick="setBrush('value')">✅ Value</button>
        <button class="hm-brush hm-brush-bluff ${heatmapBrushColor==='bluff'?'active':''}"  onclick="setBrush('bluff')">🎲 Bluff</button>
        <button class="hm-brush hm-brush-check ${heatmapBrushColor==='check'?'active':''}"  onclick="setBrush('check')">⏸️ Check</button>
        <button class="hm-brush hm-brush-fold ${heatmapBrushColor==='fold'?'active':''}"   onclick="setBrush('fold')">❌ Fold</button>
        <button class="hm-brush hm-brush-clear ${heatmapBrushColor==='clear'?'active':''}" onclick="setBrush('clear')">🗑 Borrar</button>
        <div class="hm-sep"></div>
        <button class="btn-sm" onclick="clearHeatmap()" style="margin-left:auto;">Limpiar todo</button>
        <button class="btn-sm" onclick="autoFillFromHand()" title="Rellenar desde manos guardadas del board">↺ Auto</button>
      </div>

      <!-- STATS BAR -->
      <div class="hm-stats-bar">
        ${['value','bluff','check','fold'].map(a => {
          const pct = total ? Math.round((counts[a]/total)*100) : 0;
          return `<div class="hm-stat hm-stat-${a}">
            <span class="hm-stat-n">${counts[a]}</span>
            <span class="hm-stat-label">${a}</span>
            <div class="hm-stat-bar"><div class="hm-stat-fill hm-${a}" style="width:${pct}%"></div></div>
          </div>`;
        }).join('')}
        <div class="hm-stat" style="margin-left:auto;">
          <span class="hm-stat-n" style="color:var(--muted);">${total}</span>
          <span class="hm-stat-label">combos</span>
        </div>
      </div>

      <!-- GRID -->
      <div class="hm-grid-wrap">
        ${gridHtml}
      </div>

      <div class="hm-footer">
        <span style="font-family:'Space Mono',monospace;font-size:0.6rem;color:var(--muted);">
          Clic o arrastra para pintar · Botón derecho para borrar una celda
        </span>
        <button class="btn-save" onclick="closeHeatmap()">Guardar y cerrar</button>
      </div>
    </div>`;

  // Prevent default right-click menu on grid
  const grid = document.getElementById('hm-grid');
  if (grid) grid.addEventListener('contextmenu', e => e.preventDefault());
}

function setBrush(color) {
  heatmapBrushColor = color;
  renderHeatmapModal();
}

function startPaint(e, combo) {
  e.preventDefault();
  heatmapPainting = true;
  const isRightClick = e.button === 2;
  paintCell(combo, isRightClick ? 'clear' : heatmapBrushColor);
}

function continuePaint(combo) {
  if (!heatmapPainting) return;
  paintCell(combo, heatmapBrushColor);
}

function paintCell(combo, action) {
  const id = heatmapCurrentBoard?.id;
  if (!id) return;
  if (!heatmapData[id]) heatmapData[id] = {};

  if (action === 'clear') {
    delete heatmapData[id][combo];
  } else {
    heatmapData[id][combo] = action;
  }
  persistHeatmap();

  // Update cell visually without full re-render
  const cell = document.querySelector(`[data-combo="${combo}"]`);
  if (cell) {
    cell.className = action && action !== 'clear' ? `hm-cell hm-${action}` : 'hm-cell';
  }
  // Update stats
  updateHeatmapStats(id);
}

function updateHeatmapStats(id) {
  const data   = heatmapData[id] || {};
  const counts = { value:0, bluff:0, check:0, fold:0 };
  let total = 0;
  Object.values(data).forEach(v => { if (v && counts[v] !== undefined) { counts[v]++; total++; } });
  ['value','bluff','check','fold'].forEach(a => {
    const pct  = total ? Math.round((counts[a]/total)*100) : 0;
    const nEl  = document.querySelector(`.hm-stat-${a} .hm-stat-n`);
    const fEl  = document.querySelector(`.hm-stat-${a} .hm-stat-fill`);
    if (nEl) nEl.textContent = counts[a];
    if (fEl) fEl.style.width = pct + '%';
  });
  const totEl = document.querySelector('.hm-stat:last-child .hm-stat-n');
  if (totEl) totEl.textContent = total;
}

function clearHeatmap() {
  const id = heatmapCurrentBoard?.id;
  if (!id || !confirm('¿Limpiar todo el rango?')) return;
  heatmapData[id] = {};
  persistHeatmap();
  renderHeatmapModal();
}

function autoFillFromHand() {
  // Pre-fill grid from hand.value / hand.bluffs / hand.checks saved on the board
  const { street, id } = heatmapCurrentBoard;
  const hand = getAllHands(street)[id];
  if (!hand) return;
  if (!heatmapData[id]) heatmapData[id] = {};

  const parseHands = (str, action) => {
    if (!str) return;
    str.split(',').map(s => s.trim()).forEach(h => {
      // Try to match to grid combo
      const cleaned = h.replace(/[♠♥♦♣]/g, '').replace(/\s/g,'');
      // Find matching combo in grid
      for (const r1 of HEATMAP_RANKS) {
        for (const r2 of HEATMAP_RANKS) {
          const i = HEATMAP_RANKS.indexOf(r1), j = HEATMAP_RANKS.indexOf(r2);
          let combo;
          if (i === j) combo = r1+r2;
          else if (i < j) combo = r1+r2+'s';
          else combo = r2+r1+'o';
          if (cleaned.toUpperCase() === combo.toUpperCase() ||
              cleaned.toUpperCase().startsWith(r1+r2)) {
            heatmapData[id][combo] = action;
          }
        }
      }
    });
  };

  parseHands(hand.value,  'value');
  parseHands(hand.bluffs, 'bluff');
  parseHands(hand.checks, 'check');
  persistHeatmap();
  renderHeatmapModal();
}

// Prevent mouse-up outside grid from keeping paint mode
document.addEventListener('mouseup', () => { heatmapPainting = false; });

function renderHeatmapBoardList() {
  const el = document.getElementById('heatmap-board-list');
  if (!el) return;
  let html = '';
  for (const street of ['flop','turn','river']) {
    const all = getAllHands(street);
    const roots = Object.entries(all).filter(([,h]) => !h.groupFlop);
    if (!roots.length) continue;
    const streetLabel = { flop:'🃏 Flop', turn:'↩️ Turn', river:'🌊 River' }[street];
    html += `<div class="card" style="margin-bottom:1.25rem;">
      <div class="card-title">${streetLabel}</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">`;
    roots.forEach(([id, hand]) => {
      const mkC = c => `<div class="sel-mini-card ${c.red?'red':'black'}">${c.r}<br>${c.s}</div>`;
      const cards = (hand.cards||[]).map(mkC).join('');
      const data  = heatmapData[id] || {};
      const filled = Object.keys(data).length;
      const hasTurn  = hand.turnCard  ? `<span style="font-size:0.5rem;color:var(--accent2);font-family:'Space Mono',monospace;">T</span>${mkC(hand.turnCard)}`  : '';
      const hasRiver = hand.riverCard ? `<span style="font-size:0.5rem;color:var(--accent3);font-family:'Space Mono',monospace;">R</span>${mkC(hand.riverCard)}` : '';
      html += `<div onclick="openHeatmap('${street}','${id}')"
        style="display:flex;align-items:center;gap:0.5rem;padding:0.65rem 0.9rem;
          background:var(--bg3);border:1px solid var(--border);border-radius:10px;
          cursor:pointer;transition:border-color 0.15s;"
        onmouseover="this.style.borderColor='var(--accent)'"
        onmouseout="this.style.borderColor='var(--border)'">
        <div style="display:flex;gap:2px;align-items:center;">${cards}${hasTurn}${hasRiver}</div>
        <div>
          <div style="font-size:0.82rem;font-weight:500;">${hand.label}</div>
          <div style="font-family:'Space Mono',monospace;font-size:0.58rem;color:var(--muted);">
            ${filled ? filled + ' combos' : 'Sin rango'}
          </div>
        </div>
        <div style="margin-left:auto;font-size:0.75rem;color:var(--accent);">→</div>
      </div>`;
    });
    html += `</div></div>`;
  }
  if (!html) {
    html = `<div class="card" style="text-align:center;padding:2rem;color:var(--muted);">
      <div style="font-size:2rem;margin-bottom:0.75rem;">🔥</div>
      Añade boards en Flop / Turn / River Ejemplos para crear rangos
    </div>`;
  }
  el.innerHTML = html;
}
