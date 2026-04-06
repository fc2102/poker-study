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
  // Mark event as handled to prevent delegation double-fire
  if (event) event._accHandled = true;
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
  // Skip if modal is open (avoid interference)
  const modal = document.getElementById('modal-overlay');
  if (modal && modal.classList.contains('open') && !modal.contains(e.target)) return;

  // Accordion buttons — only fire if toggleAcc wasn't already called
  const accBtn = e.target.closest('.accordion-btn');
  if (accBtn && !e._accHandled) {
    e._accHandled = true;
    accBtn.classList.toggle('open');
    const content = accBtn.nextElementSibling;
    if (content) content.classList.toggle('open');
    return;
  }
  // Flashcard flip
  const fc = e.target.closest('.fc-card-display');
  if (fc && !e._fcHandled) {
    e._fcHandled = true;
    const ans = fc.querySelector('.fc-a-area');
    if (ans) ans.classList.toggle('show');
    return;
  }
}, true); // useCapture=true to fire before onclick
