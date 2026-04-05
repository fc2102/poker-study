/* ═══════════════════════════════════════════
   Deduplicación y orden canónico de cartas
   Poker SRP BTN vs BB — dedup.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  DEDUPLICATION HELPERS
// ══════════════════════════════════════════════
const _RANK_ORD = {'A':0,'K':1,'Q':2,'J':3,'T':4,'9':5,'8':6,'7':7,'6':8,'5':9,'4':10,'3':11,'2':12};

function cardKey(c) {
  // Canonical string for a single card, e.g. "As" "Kh"
  return (c.r||'') + (c.s||'');
}

function boardKey(cards) {
  // Sort cards by rank (high first) then suit, produce stable key
  if (!cards || !cards.length) return '';
  return [...cards]
    .sort((a,b) => (_RANK_ORD[a.r]??99) - (_RANK_ORD[b.r]??99) || (a.s||'').localeCompare(b.s||''))
    .map(cardKey).join('-');
}

function handSignature(cards, turnCard, riverCard) {
  // Unique signature for a full board: sorted flop + T + R
  return boardKey(cards) + (turnCard ? '|T:'+cardKey(turnCard) : '') + (riverCard ? '|R:'+cardKey(riverCard) : '');
}

function isDuplicateBoard(street, cards, turnCard, riverCard, excludeId) {
  const sig = handSignature(cards, turnCard, riverCard);
  const all = getAllHands(street);
  return Object.entries(all).some(([id, h]) => {
    if (id === excludeId) return false;
    return handSignature(h.cards||[], h.turnCard||null, h.riverCard||null) === sig;
  });
}

function sortCards(cards) {
  // Sort flop cards: A→K→Q→...→2, then by suit
  return [...(cards||[])].sort((a,b) =>
    (_RANK_ORD[a.r]??99) - (_RANK_ORD[b.r]??99) || (a.s||'').localeCompare(b.s||'')
  );
}

function saveNewBoard(street) {
  // Get label from picker state or hidden input
  const pickedLabel = getPickerLabel(street);
  let name = pickedLabel || document.getElementById(street+'-nb-name').value.trim();
  if (!name) { alert('Añade al menos una carta al board'); return; }
  const strat  = document.getElementById(street+'-nb-strat').value.trim();
  const notes  = document.getElementById(street+'-nb-notes').value.trim();
  const value  = document.getElementById(street+'-nb-value').value.trim();
  const bluffs = document.getElementById(street+'-nb-bluffs').value.trim();
  const checks = document.getElementById(street+'-nb-checks').value.trim();
  const fcs    = getFCRows(street+'-fc-rows');
  const desps  = getDespRows(street+'-desp-rows');
  const imgData  = document.getElementById(street+'-nb-img')?.value || '';
  const imgCap   = document.getElementById(street+'-nb-img-cap-text')?.value.trim() || '';
  let pickedCards   = pickerState[street] ? pickerState[street].filter(Boolean) : parseBoard(name);
  const turnCard    = (extraPickerState[street+'-turn']  ||[]).filter(Boolean)[0] || null;
  const riverCard   = (extraPickerState[street+'-river'] ||[]).filter(Boolean)[0] || null;
  const groupFlop   = document.getElementById(street+'-nb-group')?.value || '';
  // Sort flop cards canonically
  pickedCards = sortCards(pickedCards);
  // Regenerate label from sorted cards
  if (pickedCards.length) name = pickedCards.map(c => c.r+c.s).join(' ');
  // Check for duplicate
  if (pickedCards.length && isDuplicateBoard(street, pickedCards, turnCard, riverCard, null)) {
    alert('⚠️ Ya existe un board con estas mismas cartas (el orden no importa).');
    return;
  }
  const id = 'custom-' + Date.now();
  if (!customHands[street]) customHands[street] = {};
  customHands[street][id] = { label:name, cards:pickedCards, turnCard, riverCard, groupFlop, strategy:strat||'Sin estrategia', stratBadge:'neutral', notes, value, bluffs, checks, flashcards:fcs, sections:desps, customImg:imgData, customImgCaption:imgCap };
  persistCustomHands();
  currentBoard[street] = id;
  closeAddBoard(street);
  updateSelectorPreview(street);
  renderHandContent(street, id);
}