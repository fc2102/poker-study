/* ═══════════════════════════════════════════
   Picker visual de cartas (flop)
   Poker SRP BTN vs BB — card_picker.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  CARD PICKER
// ══════════════════════════════════════════════
const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
const SUITS = [{s:'♥',cls:'sel-h',red:true},{s:'♦',cls:'sel-d',red:true},{s:'♠',cls:'sel-s',red:false},{s:'♣',cls:'sel-c',red:false}];
const pickerState  = {}; // street -> [{r,s,red}, null, null] (3 slots)
const pickerActive = {}; // street -> active slot index
const pickerSel    = {}; // street -> {rank, suit}

function initPicker(street) {
  if (pickerState[street]) return;
  pickerState[street] = [null, null, null];
  pickerActive[street] = 0;
  pickerSel[street] = { rank: null, suit: null };
  renderRankRow(street);
  renderSuitRow(street);
}

function renderRankRow(street) {
  const el = document.getElementById(street+'-ranks');
  if (!el) return;
  const sel = pickerSel[street]?.rank;
  el.innerHTML = RANKS.map(r =>
    `<button class="pk-rank${sel===r?' sel':''}" onclick="selectRank('${street}','${r}')">${r}</button>`
  ).join('');
}

function renderSuitRow(street) {
  const el = document.getElementById(street+'-suits');
  if (!el) return;
  const sel = pickerSel[street]?.suit;
  el.innerHTML = SUITS.map(s =>
    `<button class="pk-suit${sel===s.s?' sel '+s.cls:''}" onclick="selectSuit('${street}','${s.s}')">${s.s}</button>`
  ).join('');
}

function activateSlot(street, idx) {
  pickerActive[street] = idx;
  // Update slot highlights
  const slots = document.querySelectorAll(`#${street}-slots .pick-slot`);
  slots.forEach((el,i) => el.classList.toggle('active-slot', i === idx));
  // Open panel
  const panel = document.getElementById(street+'-panel');
  if (panel) panel.classList.add('open');
  initPicker(street);
}

function selectRank(street, r) {
  if (!pickerSel[street]) pickerSel[street] = {};
  pickerSel[street].rank = r;
  renderRankRow(street);
  tryAutoConfirm(street);
}
function selectSuit(street, s) {
  if (!pickerSel[street]) pickerSel[street] = {};
  pickerSel[street].suit = s;
  renderSuitRow(street);
  tryAutoConfirm(street);
}

function tryAutoConfirm(street) {
  const sel = pickerSel[street];
  if (sel && sel.rank && sel.suit) confirmCard(street);
}



function clearSlot(street) {
  const idx = pickerActive[street] ?? 0;
  if (pickerState[street]) pickerState[street][idx] = null;
  pickerSel[street] = { rank: null, suit: null };
  renderRankRow(street);
  renderSuitRow(street);
  renderPickerSlots(street);
  updatePickerHiddenInput(street);
}

function renderPickerSlots(street) {
  const slots = document.querySelectorAll(`#${street}-slots .pick-slot`);
  const state = pickerState[street] || [];
  slots.forEach((el, i) => {
    const card = state[i];
    if (card) {
      el.className = 'pick-slot filled' + (card.red ? ' red' : ' black');
      el.innerHTML = `${card.r}<br><span style="font-size:1rem;">${card.s}</span><button class="remove-card" onclick="event.stopPropagation();removeCard('${street}',${i})">✕</button>`;
      el.setAttribute('data-idx', i);
      el.setAttribute('onclick', `activateSlot('${street}',${i})`);
    } else {
      el.className = 'pick-slot' + (pickerActive[street]===i ? ' active-slot' : '');
      el.innerHTML = `<span class="slot-hint">${i===0?'1ª':i===1?'2ª':'3ª'}</span>`;
      el.setAttribute('data-idx', i);
      el.setAttribute('onclick', `activateSlot('${street}',${i})`);
    }
  });
}

function removeCard(street, idx) {
  if (pickerState[street]) pickerState[street][idx] = null;
  renderPickerSlots(street);
  updatePickerHiddenInput(street);
}

function updatePickerHiddenInput(street) {
  const cards = sortCards((pickerState[street]||[]).filter(Boolean));
  const label = cards.map(c => c.r + c.s).join(' ');
  const inp = document.getElementById(street+'-nb-name');
  if (inp) inp.value = label;
  // Re-sort the visual slots to match canonical order
  if (pickerState[street]) {
    const sorted = sortCards((pickerState[street]||[]).filter(Boolean));
    // Refill slots in sorted order (pad with nulls)
    pickerState[street] = [sorted[0]||null, sorted[1]||null, sorted[2]||null];
    renderPickerSlots(street);
  }
}

function getPickerLabel(street) {
  const cards = sortCards((pickerState[street]||[]).filter(Boolean));
  if (!cards.length) return '';
  return cards.map(c => c.r + c.s).join(' ');
}

function resetPicker(street) {
  pickerState[street] = [null, null, null];
  pickerActive[street] = 0;
  pickerSel[street] = { rank: null, suit: null };
  renderPickerSlots(street);
  renderRankRow(street);
  renderSuitRow(street);
  const inp = document.getElementById(street+'-nb-name');
  if (inp) inp.value = '';
}