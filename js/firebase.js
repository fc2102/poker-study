/* ═══════════════════════════════════════════
   Firebase Sync — Sincronización en la nube
   Poker SRP BTN vs BB — firebase.js
   (sin ES modules — compatible con todos los navegadores)
═══════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:            "AIzaSyBtDEL-fvS9tK0rpgJLP8GvItk0kdTCcNg",
  authDomain:        "poker-study-26f3b.firebaseapp.com",
  projectId:         "poker-study-26f3b",
  storageBucket:     "poker-study-26f3b.firebasestorage.app",
  messagingSenderId: "100451012271",
  appId:             "1:100451012271:web:8debb2733cd89b2bb94e5a",
  measurementId:     "G-1W5B4GW24Q"
};

// ID fijo — todos tus dispositivos comparten los mismos datos
const USER_ID = "moro";

let _db = null, _fbReady = false, _pushTimer = null;

// Cargar Firebase SDK compat (sin ES modules) desde CDN
function loadFirebaseScripts(cb) {
  let loaded = 0;
  const srcs = [
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
  ];
  srcs.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    s.onload  = () => { if (++loaded === srcs.length) cb(); };
    s.onerror = () => renderSyncBadge('error');
    document.head.appendChild(s);
  });
}

function initFirebase() {
  renderSyncBadge('connecting');
  loadFirebaseScripts(() => {
    try {
      firebase.initializeApp(firebaseConfig);
      _db = firebase.firestore();
      _fbReady = true;
      _db.collection('users').doc(USER_ID).onSnapshot(snap => {
        if (snap.exists) {
          const d = snap.data();
          if (d && d.customHands) {
            try {
              const remote = JSON.parse(d.customHands);
              for (const st of ['flop','turn','river']) {
                if (remote[st]) {
                  if (!customHands[st]) customHands[st] = {};
                  Object.assign(customHands[st], remote[st]);
                }
              }
              try { localStorage.setItem('poker-custom-hands-v2', JSON.stringify(customHands)); } catch(e){}
              for (const st of ['flop','turn','river']) {
                const root = document.getElementById(st+'-ej-root');
                if (root && root.childElementCount > 0) {
                  updateSelectorPreview(st);
                  if (currentBoard[st]) renderHandContent(st, currentBoard[st]);
                }
              }
            } catch(e) { console.error('[FB] parse error', e); }
          }
          renderSyncBadge('synced');
        } else {
          _pushNow();
          renderSyncBadge('synced');
        }
      }, err => { console.error('[FB]', err); renderSyncBadge('error'); });
    } catch(e) { console.error('[FB] init', e); renderSyncBadge('error'); }
  });
}

function _pushNow() {
  if (!_fbReady || !_db) return;
  _db.collection('users').doc(USER_ID).set({
    customHands: JSON.stringify(customHands || {}),
    ankiStats:   JSON.stringify(typeof ankiStats   !== 'undefined' ? ankiStats   : {}),
    heatmapData: JSON.stringify(typeof heatmapData !== 'undefined' ? heatmapData : {}),
    updatedAt:   new Date().toISOString()
  }, { merge: true })
  .then(() => renderSyncBadge('synced'))
  .catch(e => { console.error('[FB] push', e); renderSyncBadge('error'); });
}

// Sobrescribir persistCustomHands para que también suba a Firebase
function persistCustomHands() {
  try { localStorage.setItem('poker-custom-hands-v2', JSON.stringify(customHands)); } catch(e){}
  clearTimeout(_pushTimer);
  _pushTimer = setTimeout(_pushNow, 1500);
}

function renderSyncBadge(status) {
  let b = document.getElementById('sync-badge');
  if (!b) {
    b = document.createElement('div');
    b.id = 'sync-badge';
    b.style.cssText = 'position:fixed;bottom:1rem;right:1rem;font-family:Space Mono,monospace;font-size:0.62rem;letter-spacing:1px;text-transform:uppercase;padding:0.35rem 0.8rem;border-radius:20px;border:1px solid;z-index:900;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:0.4rem;';
    b.onclick = showSyncPanel;
    document.body.appendChild(b);
  }
  const m = {
    connecting:{ icon:'🔄',label:'Conectando',  color:'#e8c547',bg:'rgba(232,197,71,0.12)', border:'rgba(232,197,71,0.35)' },
    synced:    { icon:'☁️',label:'Sincronizado', color:'#50fa7b',bg:'rgba(80,250,123,0.1)',  border:'rgba(80,250,123,0.35)' },
    error:     { icon:'⚠️',label:'Sin conexión', color:'#ff6b6b',bg:'rgba(255,107,107,0.1)', border:'rgba(255,107,107,0.35)'},
  };
  const s = m[status] || m.error;
  b.style.color = s.color; b.style.background = s.bg; b.style.borderColor = s.border;
  b.innerHTML = `<span>${s.icon}</span><span>${s.label}</span>`;
}

function showSyncPanel() {
  const ex = document.getElementById('sync-panel');
  if (ex) { ex.remove(); return; }
  const p = document.createElement('div');
  p.id = 'sync-panel';
  p.style.cssText = 'position:fixed;bottom:3.5rem;right:1rem;background:#12151c;border:1px solid #252b3b;border-radius:12px;padding:1.25rem;z-index:900;width:240px;box-shadow:0 8px 24px rgba(0,0,0,0.5);font-family:DM Sans,sans-serif;';
  p.innerHTML = `
    <div style="font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:2px;color:#e8c547;text-transform:uppercase;margin-bottom:0.6rem;">☁️ Firebase Sync</div>
    <div style="font-size:0.78rem;color:#7a8299;margin-bottom:0.4rem;">ID: <strong style="color:#e2e8f0;">${USER_ID}</strong></div>
    <div style="font-size:0.72rem;color:#7a8299;margin-bottom:1rem;line-height:1.5;">Mismo ID en todos tus dispositivos = datos compartidos.</div>
    <button onclick="_pushNow();this.textContent='✓ Subido';setTimeout(()=>this.textContent='⬆ Subir ahora',2000)"
      style="width:100%;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.4);color:#4a9eff;font-family:'Space Mono',monospace;font-size:0.65rem;letter-spacing:1px;text-transform:uppercase;padding:0.45rem;border-radius:6px;cursor:pointer;margin-bottom:0.5rem;">
      ⬆ Subir ahora
    </button>
    <button onclick="document.getElementById('sync-panel').remove()"
      style="width:100%;background:none;border:none;color:#7a8299;font-size:0.75rem;cursor:pointer;padding:0.2rem;">Cerrar</button>`;
  document.body.appendChild(p);
  setTimeout(() => {
    document.addEventListener('click', function h(e) {
      if (!p.contains(e.target) && e.target.id !== 'sync-badge') { p.remove(); document.removeEventListener('click',h); }
    });
  }, 100);
}

document.addEventListener('DOMContentLoaded', initFirebase);
