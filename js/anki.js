/* ═══════════════════════════════════════════
   Modo repaso rápido tipo Anki
   Poker SRP BTN vs BB — anki.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  ANKI — REPASO RÁPIDO
// ══════════════════════════════════════════════

const ankiStats = JSON.parse(localStorage.getItem('poker-anki-stats') || '{}');
// { boardId: { easy: N, hard: N, lastSeen: timestamp, nextReview: timestamp } }

function persistAnkiStats() {
  try { localStorage.setItem('poker-anki-stats', JSON.stringify(ankiStats)); } catch(e) {}
}

let ankiDeck    = [];  // array of {street, id, hand}
let ankiIndex   = 0;
let ankiSession = { easy: 0, hard: 0, total: 0 };
let ankiRevealed = false;

function buildAnkiDeck() {
  ankiDeck = [];
  for (const street of ['flop', 'turn', 'river']) {
    const all = getAllHands(street);
    for (const [id, hand] of Object.entries(all)) {
      // Skip branches (they have a parent) and boards without strategy info
      if (hand.groupFlop) continue;
      ankiDeck.push({ street, id, hand });
    }
  }
  // Sort by due date first (overdue first), then random
  const now = Date.now();
  ankiDeck.sort((a, b) => {
    const dueA = ankiStats[a.id]?.nextReview || 0;
    const dueB = ankiStats[b.id]?.nextReview || 0;
    if (dueA !== dueB) return dueA - dueB;
    return Math.random() - 0.5;
  });
}

function openAnkiMode() {
  buildAnkiDeck();
  ankiIndex    = 0;
  ankiSession  = { easy: 0, hard: 0, total: ankiDeck.length };
  ankiRevealed = false;
  renderAnkiOverlay();
}

function closeAnkiMode() {
  const overlay = document.getElementById('anki-overlay');
  if (overlay) overlay.classList.remove('open');
}

function renderAnkiOverlay() {
  let overlay = document.getElementById('anki-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'anki-overlay';
    overlay.className = 'anki-overlay';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('open');
  overlay.innerHTML = buildAnkiHTML();
}

function buildAnkiHTML() {
  if (!ankiDeck.length) {
    return `<div class="anki-modal">
      <div class="anki-header">
        <span class="anki-title">REPASO RÁPIDO</span>
        <button class="anki-close" onclick="closeAnkiMode()">✕</button>
      </div>
      <div class="anki-empty">
        <div style="font-size:2.5rem;margin-bottom:1rem;">🎉</div>
        <div style="font-size:1rem;font-weight:500;margin-bottom:0.5rem;">Sin boards que repasar</div>
        <div style="font-size:0.82rem;color:var(--muted);">Añade boards en Flop / Turn / River Ejemplos</div>
        <button class="anki-btn-close" onclick="closeAnkiMode()" style="margin-top:1.5rem;">Cerrar</button>
      </div>
    </div>`;
  }

  if (ankiIndex >= ankiDeck.length) {
    return buildAnkiSummary();
  }

  const { street, id, hand } = ankiDeck[ankiIndex];
  const mkCard = c => `<div class="anki-card ${c.red?'red':'black'}">${c.r}<br><span>${c.s}</span></div>`;
  const cards  = (hand.cards||[]).map(mkCard).join('');
  const turnC  = hand.turnCard  ? `<span class="anki-street-tag t">T</span>${mkCard(hand.turnCard)}`  : '';
  const riverC = hand.riverCard ? `<span class="anki-street-tag r">R</span>${mkCard(hand.riverCard)}` : '';

  const progress = Math.round((ankiIndex / ankiDeck.length) * 100);
  const stats    = ankiStats[id];
  const dueLabel = stats ? `${stats.easy||0}✓ ${stats.hard||0}✗` : 'Nuevo';

  const streetBadge = { flop:'🃏 FLOP', turn:'↩️ TURN', river:'🌊 RIVER' }[street] || street.toUpperCase();

  // Back (revealed) content
  let backHtml = '';
  if (ankiRevealed) {
    const sections = (hand.sections||[]).map(s => `
      <div class="anki-section">
        <div class="anki-section-title">${s.title}</div>
        <div class="anki-section-body">${s.content}</div>
      </div>`).join('');

    const chips = [
      hand.value  ? `<div class="anki-chips-row"><span class="anki-chip-label">✅ Value</span>${hand.value.split(',').map(h=>`<span class="hand-chip chip-value">${h.trim()}</span>`).join('')}</div>` : '',
      hand.bluffs ? `<div class="anki-chips-row"><span class="anki-chip-label">🎲 Bluffs</span>${hand.bluffs.split(',').map(h=>`<span class="hand-chip chip-bluff">${h.trim()}</span>`).join('')}</div>` : '',
      hand.checks ? `<div class="anki-chips-row"><span class="anki-chip-label">⏸️ Checks</span>${hand.checks.split(',').map(h=>`<span class="hand-chip chip-check">${h.trim()}</span>`).join('')}</div>` : '',
    ].filter(Boolean).join('');

    const notes = hand.notes ? `<div class="anki-notes">${hand.notes}</div>` : '';
    const fcs   = (hand.flashcards||[]).map((fc,i) => `
      <div class="anki-fc">
        <div class="anki-fc-q">P: ${fc.q}</div>
        <div class="anki-fc-a">R: ${fc.a}</div>
      </div>`).join('');

    backHtml = `
      <div class="anki-back">
        <div class="anki-strategy-badge">${hand.strategy || 'Sin estrategia'}</div>
        ${notes}
        ${chips ? `<div class="anki-chips">${chips}</div>` : ''}
        ${sections}
        ${fcs ? `<div class="anki-fcs">${fcs}</div>` : ''}
      </div>
      <div class="anki-rate-btns">
        <button class="anki-btn-hard" onclick="rateAnki('hard')">✗ Difícil</button>
        <button class="anki-btn-easy" onclick="rateAnki('easy')">✓ Fácil</button>
      </div>`;
  } else {
    backHtml = `
      <div class="anki-reveal-area">
        <div class="anki-reveal-hint">¿Cuál es la estrategia para este board?</div>
        <button class="anki-btn-reveal" onclick="revealAnki()">Mostrar respuesta</button>
      </div>`;
  }

  return `<div class="anki-modal">
    <div class="anki-header">
      <span class="anki-title">REPASO RÁPIDO</span>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-family:'Space Mono',monospace;font-size:0.62rem;color:var(--muted);">${ankiIndex+1}/${ankiDeck.length}</span>
        <button class="anki-close" onclick="closeAnkiMode()">✕</button>
      </div>
    </div>
    <div class="anki-progress-bar"><div class="anki-progress-fill" style="width:${progress}%"></div></div>
    <div class="anki-body">
      <div class="anki-session-stats">
        <span style="color:var(--accent4);">✓ ${ankiSession.easy}</span>
        <span style="color:var(--accent3);">✗ ${ankiSession.hard}</span>
        <span style="color:var(--muted);">${ankiDeck.length - ankiIndex} restantes</span>
      </div>
      <div class="anki-front">
        <div class="anki-street-label">${streetBadge}</div>
        <div class="anki-board-cards">${cards}${turnC}${riverC}</div>
        <div class="anki-board-label">${hand.label}</div>
        <div class="anki-seen-badge">${dueLabel}</div>
      </div>
      ${backHtml}
    </div>
  </div>`;
}

function revealAnki() {
  ankiRevealed = true;
  renderAnkiOverlay();
}

function rateAnki(rating) {
  const { id } = ankiDeck[ankiIndex];
  if (!ankiStats[id]) ankiStats[id] = { easy: 0, hard: 0 };
  ankiStats[id][rating]++;
  ankiStats[id].lastSeen = Date.now();
  // Spaced repetition: easy = review in 3 days, hard = review in 1 day
  const days = rating === 'easy' ? 3 : 1;
  ankiStats[id].nextReview = Date.now() + days * 86400000;
  persistAnkiStats();

  ankiSession[rating]++;
  ankiIndex++;
  ankiRevealed = false;
  renderAnkiOverlay();
}

function buildAnkiSummary() {
  const pct = ankiSession.total
    ? Math.round((ankiSession.easy / ankiSession.total) * 100) : 0;
  const msg = pct >= 80 ? '¡Excelente sesión! 🔥' : pct >= 50 ? 'Buen trabajo, sigue repasando 💪' : 'Hay que estudiar más, vuelve mañana 📚';
  return `<div class="anki-modal">
    <div class="anki-header">
      <span class="anki-title">SESIÓN COMPLETADA</span>
      <button class="anki-close" onclick="closeAnkiMode()">✕</button>
    </div>
    <div class="anki-body" style="text-align:center;padding:2rem 1.5rem;">
      <div style="font-family:'Bebas Neue',cursive;font-size:4.5rem;letter-spacing:4px;color:var(--accent);line-height:1;">${pct}%</div>
      <div style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:1.5rem;">CORRECTAS</div>
      <div style="display:flex;justify-content:center;gap:2rem;margin-bottom:1.5rem;">
        <div style="text-align:center;"><div style="font-size:1.8rem;font-weight:700;color:var(--accent4);">${ankiSession.easy}</div><div style="font-family:'Space Mono',monospace;font-size:0.6rem;color:var(--muted);text-transform:uppercase;">Fácil</div></div>
        <div style="text-align:center;"><div style="font-size:1.8rem;font-weight:700;color:var(--accent3);">${ankiSession.hard}</div><div style="font-family:'Space Mono',monospace;font-size:0.6rem;color:var(--muted);text-transform:uppercase;">Difícil</div></div>
      </div>
      <div style="font-size:0.95rem;color:var(--text);margin-bottom:2rem;">${msg}</div>
      <div style="display:flex;gap:0.75rem;justify-content:center;">
        <button class="btn-save" onclick="openAnkiMode()">↺ Repetir</button>
        <button class="btn-cancel" onclick="closeAnkiMode()">Cerrar</button>
      </div>
    </div>
  </div>`;
}

function updateAnkiCount() {
  const el = document.getElementById('anki-board-count');
  if (!el) return;
  let total = 0, due = 0;
  const now = Date.now();
  for (const street of ['flop','turn','river']) {
    const all = getAllHands(street);
    for (const [id, hand] of Object.entries(all)) {
      if (hand.groupFlop) continue;
      total++;
      const next = ankiStats[id]?.nextReview || 0;
      if (next <= now) due++;
    }
  }
  el.textContent = `${total} boards en total · ${due} pendientes de repaso`;
}
