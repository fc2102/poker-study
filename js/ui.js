/* ═══════════════════════════════════════════
   Accordion, lightbox y helpers de UI
   Poker SRP BTN vs BB — ui.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  ACCORDION (flop/turn/river teoria accordions)
// ══════════════════════════════════════════════
function toggleAcc(btn) {
  if (!btn || !btn.classList) return;
  btn.classList.toggle('open');
  const content = btn.nextElementSibling;
  if (content) content.classList.toggle('open');
}
// Generic desplegable for custom teoria blocks
function toggleAcordeon(btn) {
  if (!btn || !btn.classList) return;
  btn.classList.toggle('open');
  const content = btn.nextElementSibling;
  if (content) content.classList.toggle('open');
}

// ══════════════════════════════════════════════
//  LIGHTBOX
// ══════════════════════════════════════════════
function openLightbox(img) { document.getElementById('lightbox-img').src = img.src; document.getElementById('lightbox').classList.add('open'); }
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
// ══════════════════════════════════════════════
//  EVENT DELEGATION — accordions & flashcards
//  Backup: handles clicks even in dynamic DOM
// ══════════════════════════════════════════════
document.addEventListener('click', function(e) {
  // Accordion buttons
  const accBtn = e.target.closest('.accordion-btn');
  if (accBtn) {
    accBtn.classList.toggle('open');
    const content = accBtn.nextElementSibling;
    if (content) content.classList.toggle('open');
    return;
  }
  // Flashcard flip
  const fc = e.target.closest('.fc-card-display');
  if (fc) {
    const ans = fc.querySelector('.fc-a-area');
    if (ans) ans.classList.toggle('show');
    return;
  }
});
