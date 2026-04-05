/* ═══════════════════════════════════════════
   Accordion, lightbox y helpers de UI
   Poker SRP BTN vs BB — ui.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  ACCORDION (flop/turn/river teoria accordions)
// ══════════════════════════════════════════════
function toggleAcc(btn) {
  btn.classList.toggle('open');
  btn.nextElementSibling.classList.toggle('open');
}
// Generic desplegable for custom teoria blocks
function toggleAcordeon(btn) {
  btn.classList.toggle('open');
  btn.nextElementSibling.classList.toggle('open');
}

// ══════════════════════════════════════════════
//  LIGHTBOX
// ══════════════════════════════════════════════
function openLightbox(img) { document.getElementById('lightbox-img').src = img.src; document.getElementById('lightbox').classList.add('open'); }
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }