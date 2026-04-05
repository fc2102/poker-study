/* ═══════════════════════════════════════════
   Pickers de turn/river (carta extra)
   Poker SRP BTN vs BB — extra_picker.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  EXTRA CARD PICKER (turn / river single cards)
// ══════════════════════════════════════════════
const extraPickerState = {}; // key = street+'-turn' or street+'-river' -> [card|null]
const extraPickerActive = {}; // key -> active (always 0)

function activateExtraSlot(street, which, idx) {
  const key = street + '-' + which;
  if (!extraPickerState[key]) extraPickerState[key] = [null];
  extraPickerActive[key] = idx;
  // Reuse the main picker panel but point it to this extra slot
  // Temporarily override confirmCard behavior
  currentExtraPicker = { street, which, key };
  // Highlight slot
  const slots = document.querySelectorAll(`#${street}-${which}-slots .extra-slot`);
  slots.forEach((el,i) => el.classList.toggle('active-slot', i === idx));
  // Open main panel and redirect to extra
  const panel = document.getElementById(street+'-panel');
  if (panel) { panel.classList.add('open'); }
  pickerSel[street] = { rank: null, suit: null };
  renderRankRow(street);
  renderSuitRow(street);
}

let currentExtraPicker = null; // {street, which, key}

// Patch confirmCard to handle extra pickers
function confirmCard(street) {
  // If an extra picker is active for this street, route there
  if (currentExtraPicker && currentExtraPicker.street === street) {
    const sel = pickerSel[street];
    if (!sel || !sel.rank || !sel.suit) return;
    const suitObj = SUITS.find(s => s.s === sel.suit);
    const key = currentExtraPicker.key;
    extraPickerState[key] = [{ r: sel.rank, s: sel.suit, red: suitObj?.red || false }];
    pickerSel[street] = { rank: null, suit: null };
    renderRankRow(street);
    renderSuitRow(street);
    renderExtraSlot(street, currentExtraPicker.which);
    currentExtraPicker = null;
    return;
  }
  // Otherwise normal flow
  const sel = pickerSel[street];
  if (!sel || !sel.rank || !sel.suit) return;
  const suitObj = SUITS.find(s => s.s === sel.suit);
  const idx = pickerActive[street] ?? 0;
  if (!pickerState[street]) pickerState[street] = [null,null,null];
  pickerState[street][idx] = { r: sel.rank, s: sel.suit, red: suitObj?.red || false };
  pickerSel[street] = { rank: null, suit: null };
  renderRankRow(street);
  renderSuitRow(street);
  renderPickerSlots(street);
  updatePickerHiddenInput(street);
  const next = pickerState[street].findIndex((c,i) => i > idx && !c);
  if (next !== -1) activateSlot(street, next);
  else currentExtraPicker = null;
}

function renderExtraSlot(street, which) {
  const key = street + '-' + which;
  const card = (extraPickerState[key]||[])[0];
  const slots = document.querySelectorAll(`#${street}-${which}-slots .extra-slot`);
  if (!slots.length) return;
  const el = slots[0];
  if (card) {
    el.className = 'extra-slot filled' + (card.red ? ' red' : ' black');
    el.innerHTML = `${card.r}<br><span style="font-size:0.95rem;">${card.s}</span><button class="remove-card" onclick="event.stopPropagation();clearExtraSlot('${street}','${which}')">✕</button>`;
  } else {
    el.className = 'extra-slot';
    el.innerHTML = `<span class="slot-hint" style="font-size:0.55rem;color:var(--muted);">${which.charAt(0).toUpperCase()+which.slice(1)}</span>`;
  }
}

function clearExtraSlot(street, which) {
  const key = street + '-' + which;
  extraPickerState[key] = [null];
  renderExtraSlot(street, which);
}

// Reset extra pickers when closing form
function closeAddBoard(street) {
  document.getElementById(street + '-add-form').classList.remove('open');
  document.getElementById(street + '-fc-rows').innerHTML = '';
  const dr = document.getElementById(street + '-desp-rows');
  if (dr) dr.innerHTML = '';
  resetPicker(street);
  resetImgUpload(street);
  extraPickerState[street+'-turn']  = [null];
  extraPickerState[street+'-river'] = [null];
  renderExtraSlot(street, 'turn');
  renderExtraSlot(street, 'river');
  currentExtraPicker = null;
}

// Populate group selector when form opens
function openAddBoard(street) {
  document.getElementById(street + '-add-form').classList.add('open');
  setTimeout(() => initPicker(street), 0);
  // Show group field for turn/river streets, populate with flop boards
  const gf = document.getElementById(street+'-group-field');
  if (gf) {
    // show always so user can group flop->turn->river
    gf.style.display = 'block';
    const sel = document.getElementById(street+'-nb-group');
    if (sel) {
      // Get all boards from same street as options
      const all = getAllHands(street);
      const opts = Object.entries(all)
        .filter(([bid]) => bid !== 'custom-'+Date.now()) // exclude self
        .map(([bid,bh]) => `<option value="${bid}">${bh.label}</option>`)
        .join('');
      sel.innerHTML = '<option value="">— Sin vincular —</option>' + opts;
    }
  }
}