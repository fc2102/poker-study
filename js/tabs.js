/* ═══════════════════════════════════════════
   Manejo de pestañas principales
   Poker SRP BTN vs BB — tabs.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════
function showTab(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'quiz') initQuiz();
  // Init ejemplos panels lazily
  if (id === 'flop-ej')   renderEjemplos('flop');
  if (id === 'turn-ej')   renderEjemplos('turn');
  if (id === 'river-ej')  renderEjemplos('river');
  if (id === 'anki')      typeof updateAnkiCount    === 'function' && updateAnkiCount();
  if (id === 'heatmap')   typeof renderHeatmapBoardList === 'function' && renderHeatmapBoardList();
}
// Extended: anki + heatmap tabs (added by anki.js / heatmap.js)
// showTab already handles these via the if-chain above;
// anki/heatmap register their init via the tab ids below.
// If those modules are loaded, they patch showTab automatically.
