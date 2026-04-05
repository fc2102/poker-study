/* ═══════════════════════════════════════════
   Firebase Sync — Sincronización en la nube
   Poker SRP BTN vs BB — firebase.js

   INSTRUCCIONES DE CONFIGURACIÓN:
   1. Ve a https://console.firebase.google.com
   2. Crea un proyecto nuevo (ej: "poker-study")
   3. Añade una app web (icono </>)
   4. Copia tu firebaseConfig y pégala abajo
   5. En Firestore Database → crear base de datos → modo producción
   6. En Rules, cambia a: allow read, write: if true;  (para uso personal)
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  ⚙️  PEGA TU CONFIG AQUÍ
// ══════════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "AIzaSyBtDEL-fvS9tK0rpgJLP8GvItk0kdTCcNg",
  authDomain:        "poker-study-26f3b.firebaseapp.com",
  projectId:         "poker-study-26f3b",
  storageBucket:     "poker-study-26f3b.firebasestorage.app",
  messagingSenderId: "100451012271",
  appId:             "1:100451012271:web:8debb2733cd89b2bb94e5a",
  measurementId:     "G-1W5B4GW24Q"
};
// ══════════════════════════════════════════════

// ── ID de usuario (se crea automáticamente en este dispositivo) ──────
// Si quieres que TODOS tus dispositivos compartan los mismos datos,
// pon aquí un ID fijo, ej: const USER_ID = "moro";
// ⚠️  IMPORTANTE: este ID identifica tus datos en la nube.
// Para que todos tus portátiles compartan los mismos boards,
// todos deben tener el MISMO ID aquí abajo.
// Puedes cambiarlo por cualquier nombre fijo, ej: "moro"
const USER_ID = "moro";

// ── Estado de la conexión ─────────────────────────────────────────────
let db = null;
let fbReady = false;
let syncStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'synced' | 'error'
let unsubscribeFn = null;

// ── Inicializar Firebase ──────────────────────────────────────────────
async function initFirebase() {
  try {
    // Import Firebase SDK desde CDN
    const { initializeApp }       = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, setDoc, onSnapshot, collection } =
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    fbReady = true;
    syncStatus = 'connecting';
    renderSyncBadge('connecting');

    // ── Escuchar cambios en la nube → aplicar a local ─────────────────
    const userDoc = doc(db, 'users', USER_ID);
    unsubscribeFn = onSnapshot(userDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Merge cloud data into local customHands
        if (data.customHands) {
          try {
            const remote = JSON.parse(data.customHands);
            // Merge: remote wins (cloud is source of truth)
            for (const street of ['flop','turn','river']) {
              if (remote[street]) {
                customHands[street] = { ...customHands[street], ...remote[street] };
              }
            }
            // Persist locally too
            persistCustomHands();
            // Refresh UI if ejemplos tab is visible
            for (const street of ['flop','turn','river']) {
              const root = document.getElementById(street + '-ej-root');
              if (root && root.innerHTML) renderEjemplos(street);
            }
          } catch(e) { console.error('[Firebase] Parse error:', e); }
        }
        syncStatus = 'synced';
        renderSyncBadge('synced');
      } else {
        // First time: push local data to cloud
        pushToCloud();
        syncStatus = 'synced';
        renderSyncBadge('synced');
      }
    }, (err) => {
      console.error('[Firebase] Listener error:', err);
      syncStatus = 'error';
      renderSyncBadge('error');
    });

    console.log('[Firebase] Connected. User:', USER_ID);
  } catch(e) {
    console.error('[Firebase] Init error:', e);
    syncStatus = 'error';
    renderSyncBadge('error');
  }
}

// ── Subir datos locales a la nube ─────────────────────────────────────
async function pushToCloud() {
  if (!fbReady || !db) return;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const userDoc = doc(db, 'users', USER_ID);
    await setDoc(userDoc, {
      customHands: JSON.stringify(customHands),
      ankiStats:   JSON.stringify(ankiStats || {}),
      heatmapData: JSON.stringify(heatmapData || {}),
      updatedAt:   new Date().toISOString()
    }, { merge: true });
    syncStatus = 'synced';
    renderSyncBadge('synced');
  } catch(e) {
    console.error('[Firebase] Push error:', e);
    syncStatus = 'error';
    renderSyncBadge('error');
  }
}

// ── Patch persistCustomHands para que también suba a la nube ─────────
// Esta función sobreescribe la de dedup.js añadiendo el push a Firebase
const _origPersistCustomHands = window.persistCustomHands;
function persistCustomHands() {
  // Guardar en localStorage (comportamiento original)
  try { localStorage.setItem('poker-custom-hands-v2', JSON.stringify(customHands)); } catch(e) {}
  // Subir a Firebase (debounced para no spamear)
  _debouncedPush();
}

// Debounce: espera 1.5s después del último cambio para subir
let _pushTimer = null;
function _debouncedPush() {
  clearTimeout(_pushTimer);
  _pushTimer = setTimeout(pushToCloud, 1500);
}

// ── Badge de sincronización en la UI ─────────────────────────────────
function renderSyncBadge(status) {
  let badge = document.getElementById('sync-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'sync-badge';
    badge.style.cssText = `
      position: fixed; bottom: 1rem; right: 1rem;
      font-family: 'Space Mono', monospace; font-size: 0.62rem;
      letter-spacing: 1px; text-transform: uppercase;
      padding: 0.35rem 0.75rem; border-radius: 20px;
      border: 1px solid; z-index: 900;
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; gap: 0.4rem;
    `;
    badge.onclick = () => showSyncPanel();
    document.body.appendChild(badge);
  }

  const states = {
    local:       { icon: '💾', label: 'Local',       color: 'var(--muted)',   bg: 'rgba(122,130,153,0.12)', border: 'rgba(122,130,153,0.3)' },
    connecting:  { icon: '🔄', label: 'Conectando',  color: 'var(--accent)',  bg: 'rgba(232,197,71,0.1)',   border: 'rgba(232,197,71,0.3)'  },
    synced:      { icon: '☁️', label: 'Sincronizado', color: 'var(--accent4)', bg: 'rgba(80,250,123,0.1)',  border: 'rgba(80,250,123,0.3)'  },
    error:       { icon: '⚠️', label: 'Error sync',  color: 'var(--accent3)', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)' },
  };
  const s = states[status] || states.local;
  badge.style.color       = s.color;
  badge.style.background  = s.bg;
  badge.style.borderColor = s.border;
  badge.innerHTML = `<span>${s.icon}</span><span>${s.label}</span>`;
}

// ── Panel de gestión de sync ──────────────────────────────────────────
function showSyncPanel() {
  let panel = document.getElementById('sync-panel');
  if (panel) { panel.remove(); return; }

  panel = document.createElement('div');
  panel.id = 'sync-panel';
  panel.style.cssText = `
    position: fixed; bottom: 3.5rem; right: 1rem;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 12px; padding: 1.25rem; z-index: 900;
    width: 280px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    font-family: 'DM Sans', sans-serif;
    animation: fadeIn 0.15s ease;
  `;
  panel.innerHTML = `
    <div style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:2px;color:var(--accent);text-transform:uppercase;margin-bottom:0.75rem;">☁️ Firebase Sync</div>
    <div style="font-size:0.82rem;color:var(--muted);margin-bottom:0.5rem;">Estado: <strong style="color:var(--text);">${syncStatus}</strong></div>
    <div style="font-size:0.78rem;color:var(--muted);margin-bottom:1rem;word-break:break-all;">ID: ${USER_ID}</div>
    <div style="font-size:0.75rem;color:var(--muted);margin-bottom:0.75rem;">
      Para compartir datos entre dispositivos, usa el mismo USER_ID.<br>
      Cámbialo en <code style="color:var(--accent2);">firebase.js → USER_ID</code>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      <button onclick="pushToCloud();document.getElementById('sync-panel').remove();"
        style="background:var(--bg3);border:1px solid var(--accent2);color:var(--accent2);font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:1px;text-transform:uppercase;padding:0.45rem 0.75rem;border-radius:6px;cursor:pointer;">
        ⬆ Subir datos ahora
      </button>
      <button onclick="navigator.clipboard.writeText('${USER_ID}');this.textContent='✓ Copiado'"
        style="background:var(--bg3);border:1px solid var(--border);color:var(--muted);font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:1px;text-transform:uppercase;padding:0.45rem 0.75rem;border-radius:6px;cursor:pointer;">
        📋 Copiar ID
      </button>
      <button onclick="document.getElementById('sync-panel').remove()"
        style="background:none;border:none;color:var(--muted);font-size:0.75rem;cursor:pointer;text-align:center;padding:0.25rem;">
        Cerrar
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!panel.contains(e.target) && e.target.id !== 'sync-badge') {
        panel.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 100);
}

// ── Auto-init when DOM is ready ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSyncBadge('local');
  initFirebase();
});
