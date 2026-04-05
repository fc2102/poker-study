/* ═══════════════════════════════════════════
   Motor de ejemplos: render, selector, boards
   Poker SRP BTN vs BB — ejemplos.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  EJEMPLOS ENGINE — independent per street
// ══════════════════════════════════════════════
const builtinHands = {
  '862hh2d': {
    label: '8♥ 6♥ 2♦',
    cards: [{r:'8',s:'♥',red:true},{r:'6',s:'♥',red:true},{r:'2',s:'♦',red:true}],
    strategy: 'Tamaño Neutro / Grande con ventaja de nuts',
    stratBadge: 'neutral',
    solverImg: 'images/solver_862.png',
    solverCaption: 'BTN vs BB · 8♥6♥2♦ · Solver GTO+',
    solverAnnotations: [
      { icon: '📊', label: 'Distribución de acciones (solver)', text: 'El solver usa principalmente <strong>Bet 67%</strong> (52.3%) y <strong>Check</strong> (40.8%), con una pequeña cantidad de Bet 25% (6.9%). El All-in está cercano a 0% en el flop.' },
      { icon: '🎨', label: 'Cómo leer el range chart', text: 'Verde oscuro = Bet grande (67%). Verde claro = Bet pequeño (25%). Rojo = Check. Rosa/magenta = All-in. Las manos en la parte superior izquierda son las más fuertes (AA, KK...) y bajan hacia las más débiles.' },
      { icon: '🔑', label: 'Insight clave del board', text: 'Board con dos corazones y conectores bajos. El BTN tiene ventaja de nuts en los sets y overpairs pero el board conecta mucho con el BB. Por eso el solver NO puede range-bet agresivo — mezcla tamaños.' }
    ],
    pctBars: [
      { label: 'All-in 177%', pct: 0, cls: 'fill-allin' },
      { label: 'Bet 67%', pct: 52.3, cls: 'fill-bet67' },
      { label: 'Bet 25%', pct: 6.9, cls: 'fill-bet25' },
      { label: 'Check', pct: 40.8, cls: 'fill-check' }
    ],
    theory: {
      title: 'Estrategia en 8♥ 6♥ 2♦',
      body: `Este board es de <strong>tamaño neutro</strong> por defecto, pero hay spots donde aplica lógica de tamaño grande.`
    },
    flashcards: [
      { q: '98♦ vs Q5♦ en 8♥6♥2♦ — ¿cuál beteas y por qué?', a: '98♦ — más equity en este board (palo de FD del rival es corazones). A más EQ más BET para agrandar bote.' },
      { q: 'AA en 8♥6♥2♦ — ¿bet o check? ¿Por qué solo AA y no KK?', a: 'Check AA porque desbloqueas los bluffs del rival (Ax del BB). KK bloquea menos bluffs así que siempre beta.' },
      { q: 'K3♦ vs 87♦ en 8♥6♥2♦ — ¿cuál prefiere betear y por qué?', a: '87♦ betea — tiene más EQ (OESD) y no sufre al check-raise. K3♦ chequea porque sufre mucho al raise sin equity para continuar.' },
      { q: 'Q6 vs 55 en 8♥6♥2♦ — ¿cuál es mejor como bet y por qué?', a: 'Q6 — más outs, desbloquea bluffs del rival, bloquea dobles y sets. 55 si overpagan mejor checkear; no bluffcatchea bien.' },
      { q: 'AK♥ (flush draw) en 8♥6♥2♦ — ¿bet o check?', a: 'Check — bloqueas Axo♥ (inelástico), bloqueas set-up favorable. No sabes si eres value o bluff: controla el bote.' },
      { q: '¿Qué implica que el rival overfoldee en el flop para turn y river?', a: 'Cuidado con las demás calles — las manos que continúan tienen rango más polarizado. Ajustar qué valuebetear y qué bluffear.' },
      { q: 'A5o sin corazón en 8♥6♥2♦ — ¿bet o check?', a: 'Check — tierra de nadie. No es value claro, no es buen bluff (demasiado SDV). Llegar a showdown barato.' },
      { q: '¿Cuándo usamos tamaño grande en 8♥6♥2♦?', a: 'Con ventaja de nuts (overpairs, sets), value vulnerable, o cuando hay zona elástica que paga pequeño pero no grande (KT, JT, Axo).' }
    ],
    sections: [
      {
        title: '📐 ¿Por qué tamaño neutro aquí?',
        content: `El board conecta significativamente con el rango del BB (8x, 6x, 2x, gutshots, OESD, flush draws de corazones). No podemos presionar con tamaño grande a toda la gama porque el BB tiene demasiadas manos que conectan. La estrategia óptima es <strong>mezclar tamaños</strong> — bet grande cuando tengamos ventaja de nuts clara, pequeño/check con el resto.`
      },
      {
        title: '💪 Lógica del Tamaño Grande — Cuándo y Por Qué',
        content: `<strong>Cuatro razones para ir grande en este board:</strong><br><br>
        <strong>1. Ventaja de nuts</strong> — Overpairs (AA, KK, QQ, JJ, TT, 99) y sets (88, 66, 22) están casi exclusivamente en el rango BTN. El BB no tiene overpairs, así que cuando los tenemos debemos extraer máximo.<br><br>
        <strong>2. Value vulnerable</strong> — Manos como TT, 99 son value en el flop pero pueden quedarse en second best fácilmente en turn/river. Apostar grande y cobrar ahora > ir pequeño y arriesgar la mano.<br><br>
        <strong>3. Pocas manos medias valubeteable</strong> — En 8♥6♥2♦ no hay mucha mano media que podamos valuebetear cómodamente con tamaño grande. Salvo algún 67, 55 con buenos blockers. El rango de value grande está concentrado en nuts.<br><br>
        <strong>4. Zona elástica</strong> — Hay manos del BB que pagan bet pequeño/medio pero NO pagan grande: KT, KJ, JT, 55, 44, 33, Axo con corazón. Con medio bote o pequeño no castigas suficiente a estas manos que no merecen pagar a tus nuts.`
      },
      {
        title: '🃏 Zona de Value — Manos que Betean',
        content: `
        <div class="zone-row">
          <span class="hand-chip chip-value">AA</span><span class="hand-chip chip-value">KK</span><span class="hand-chip chip-value">QQ</span><span class="hand-chip chip-value">JJ</span><span class="hand-chip chip-value">TT</span><span class="hand-chip chip-value">99</span>
          <span class="hand-chip chip-value">Set 88</span><span class="hand-chip chip-value">Set 66</span><span class="hand-chip chip-value">Set 22</span>
          <span class="hand-chip chip-value">87s ♥</span><span class="hand-chip chip-value">86s</span><span class="hand-chip chip-value">67s</span>
        </div>
        <p style="font-size:0.85rem;color:var(--muted);margin-top:0.75rem;line-height:1.55;">Pocket pairs con el palo de corazones para tener outs limpias al set. Manos de dos pares y sets betean siempre grande.</p>`
      },
      {
        title: '⚖️ Q6 vs 55 — ¿Cuál beteas?',
        content: `<strong>Q6 es mejor mano para betear que 55</strong> en este board por tres razones:<br><br>
        • <strong>Más outs</strong>: Q6 puede mejorar a dos pares con Q o con 6, tiene más equity de mejora<br>
        • <strong>Desbloquea bluffs</strong>: Q6 no bloquea 55, 66, 22 del rival — deja activo su rango de bluff<br>
        • <strong>Bloquea dobles y sets</strong>: Tienes el 6, bloqueas parte del rango de 2 pares del BB<br><br>
        <strong>55</strong> si overpagan es mejor checkear. No bluffcatchea cómodo, y cuando pagan casi siempre estás por detrás de un 8x, 6x, 2x o draw que tiene mucha equity.`
      },
      {
        title: '📈 98♦ vs 98♠ — El principio de EQ y tamaño',
        content: `En un board con flush draw de corazones, <strong>98♦ tiene más equity que 98♠</strong> porque los corazones son el palo de draw del rival — no es tu palo de draw, así que tienes más equity relativa.<br><br>
        <div class="annotation-box" style="margin-top:0.5rem;">
          <span class="anno-label">Principio fundamental</span>
          <strong>A más EQ → más BET</strong> (agrandar el bote cuando ganas más veces)<br>
          <strong>A menos EQ → menos BET</strong> (controlar el bote cuando eres más flip)
        </div>`
      },
      {
        title: '🔴 Overpairs — Solo Chequear AA',
        content: `De todos los overpairs, <strong>solo AA chequea</strong> en determinadas frecuencias.<br><br>
        ¿Por qué? Porque AA <strong>desbloquea los bluffs del rival</strong>. El BB puede tener manos como A8, A6, A2 como bluffs o semi-bluffs. Si tienes AA, el rival tiene más permiso para bluffear (no tienes ningún A que bloquee sus bluffs de Ax).<br><br>
        KK, QQ, JJ betean siempre — no tienen esa propiedad de desbloquear bluffs tan extrema.`
      },
      {
        title: '♥ Zona FDs — ¿Bet o Check?',
        content: `Los FDs que <strong>más checkeamos</strong> son los que no sabemos si son value o bluff:<br>
        <div class="zone-row" style="margin-bottom:0.75rem;">
          <span class="hand-chip chip-check">AK♥</span><span class="hand-chip chip-check">KQ♥</span><span class="hand-chip chip-check">FDs "tierra de nadie"</span>
        </div>
        <strong>¿Por qué checkear AK, KQ con FD?</strong><br>
        • Bloqueas manos como Axo con corazón que te van a pagar inelástico (ya no hay tantas en el rango del rival)<br>
        • Bloqueas el set-up favorable para el rival (K bloquea KK del board)<br>
        • No sabes bien si eres value o bluff — mejor controlar el bote<br><br>
        FDs que <strong>sí betean</strong>: los que tienen más equity y no sufren al raise.<br>
        <div class="zone-row">
          <span class="hand-chip chip-bluff">87♥ (OESD+FD)</span><span class="hand-chip chip-value">T9♥ (OESD+FD)</span><span class="hand-chip chip-bluff">J9♥</span>
        </div>`
      },
      {
        title: '🎲 Zona Bluffs Intuitivos',
        content: `<div class="zone-row">
          <span class="hand-chip chip-bluff">J9o</span><span class="hand-chip chip-bluff">Q9o</span><span class="hand-chip chip-bluff">QTo</span><span class="hand-chip chip-bluff">JTo</span>
          <span class="hand-chip chip-bluff">A4o♥</span><span class="hand-chip chip-bluff">A5o♥</span><span class="hand-chip chip-bluff">A6o♥</span><span class="hand-chip chip-bluff">A7o♥</span>
        </div>
        <p style="font-size:0.85rem;color:var(--muted);margin-top:0.6rem;line-height:1.55;"><strong>Axo bajos (A4o-A7o)</strong>: no sobrevalorarlos como mano hecha pero meterlos bastante como bluffs. Intentar siempre meter los que tienen el palo (corazón aquí). A partir de ahí depende del rival.</p>
        <div class="insight" style="margin-top:0.75rem;">
          <span class="insight-icon">⚡</span>
          <p><mark>Cuanto más fácil sea de pobretear de bluff en turn, más preferiremos apostarlos en flop para evitar ese bluffing spot.</mark> Si podemos robar fácil en turn, mejor checkear y robar entonces.</p>
        </div>`
      },
      {
        title: '🔑 K3s — Análisis detallado y factor rival',
        content: `K3s es muy parecido al caso general de bluffs débiles:<br><br>
        • <strong>Rival agresivo</strong>: más incentivo de betear (no te dejará robar fácil en turn, mejor cobrar ahora la fold equity)<br>
        • <strong>Rival pasivo</strong>: más fácil robar en turn cuando ponga face-up su mano — mejor checkear<br><br>
        <strong>K3♦ chequea</strong> en 8♥6♥2♦ porque no le gusta que le check-raiseen. El board tiene muchos draws y el BB puede check-raisear con mucha frecuencia.<br><br>
        <strong>87♦ sí betea</strong> porque: (1) no sufre tanto al raise — tiene equity real, (2) más EQ en general como OESD.<br><br>
        <strong>Regla</strong>: Cuando hablamos de bluffs, evitar betear manos que sufren mucho al raise.`
      },
      {
        title: '🚫 Manos en "Tierra de Nadie"',
        content: `<div class="zone-row">
          <span class="hand-chip chip-mixed">A9o (sin ♥)</span><span class="hand-chip chip-mixed">KJ (sin ♥)</span><span class="hand-chip chip-mixed">KQ (sin ♥)</span>
        </div>
        <p style="font-size:0.85rem;margin-top:0.6rem;line-height:1.55;">Si beteas estas manos estás en tierra de nadie — no eres claro value (hay muchas manos que ganan), no eres buen bluff (tienes demasiado showdown value para tirarlo al ser raised). La línea correcta es <strong>check</strong> para llegar al showdown barato.</p>`
      }
    ]
  }
};

let customHands = { flop: {}, turn: {}, river: {} };
try {
  const saved = JSON.parse(localStorage.getItem('poker-custom-hands-v2') || '{}');
  if (saved.flop)  customHands.flop  = saved.flop;
  if (saved.turn)  customHands.turn  = saved.turn;
  if (saved.river) customHands.river = saved.river;
} catch(e) {}

function persistCustomHands() {
  try { localStorage.setItem('poker-custom-hands-v2', JSON.stringify(customHands)); } catch(e) {}
}

function getAllHands(street) {
  // builtinHands only on flop for now; turn/river start empty unless added
  const base = street === 'flop' ? builtinHands : {};
  return { ...base, ...(customHands[street] || {}) };
}

// Current selected board per street
const currentBoard = { flop: '862hh2d', turn: null, river: null };

function renderEjemplos(street) {
  const root = document.getElementById(street + '-ej-root');
  if (!root) return;

  const all = getAllHands(street);
  const ids = Object.keys(all);
  if (!currentBoard[street] && ids.length > 0) currentBoard[street] = ids[0];

  root.innerHTML = `
    <!-- TOOLBAR -->
    <div class="ejemplos-toolbar" style="align-items:center;">
      <button class="board-selector-btn" id="${street}-selector-btn" onclick="openBoardPicker('${street}')">
        <div id="${street}-sel-preview" style="display:flex;align-items:center;gap:0.5rem;flex:1;min-width:0;">
          <span class="sel-no-board">Elegir board</span>
        </div>
        <span class="sel-chevron">▼</span>
      </button>
      <div id="${street}-hand-tabs" style="display:none;"></div>
      <div class="sep"></div>
      <button class="btn-sm gold" onclick="openAddBoard('${street}')">＋ Añadir</button>
      <div class="sep"></div>
      <button class="btn-sm accent" onclick="exportData('${street}')">⬇ Export</button>
      <label class="btn-sm" style="cursor:pointer;">⬆ Import<input type="file" accept=".json" onchange="importData(event,'${street}')" style="display:none;"></label>
      <span class="status-msg" id="${street}-status"></span>
    </div>
    <!-- ADD BOARD FORM -->
    <div class="add-board-form" id="${street}-add-form">
      <div class="card-title" style="margin-bottom:1rem;">Añadir board — ${street.toUpperCase()}</div>
      <!-- CARD PICKER -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div>
          <div class="picker-label">Board — haz clic para añadir cartas</div>
          <div class="card-picker" id="${street}-picker">
            <div class="picker-slots" id="${street}-slots">
              <div class="pick-slot active-slot" data-idx="0" onclick="activateSlot('${street}',0)"><span class="slot-hint">1ª</span></div>
              <div class="pick-slot" data-idx="1" onclick="activateSlot('${street}',1)"><span class="slot-hint">2ª</span></div>
              <div class="pick-slot" data-idx="2" onclick="activateSlot('${street}',2)"><span class="slot-hint">3ª</span></div>
            </div>
            <div class="picker-panel open" id="${street}-panel">
              <div class="rank-row" id="${street}-ranks"></div>
              <div class="suit-row" id="${street}-suits"></div>
              <div>
                <button class="pk-confirm" onclick="confirmCard('${street}')">Añadir carta</button>
                <button class="pk-clear" onclick="clearSlot('${street}')">Quitar</button>
              </div>
            </div>
          </div>
          <input type="hidden" id="${street}-nb-name">
        </div>
        <div>
          <div class="fld"><label>Estrategia</label><input id="${street}-nb-strat" placeholder="25% range bet"></div>
          <!-- Turn card (optional) -->
          <div class="extra-card-picker">
            <div class="picker-label">Turn — carta del turn (opcional)</div>
            <div class="extra-slots" id="${street}-turn-slots">
              <div class="extra-slot" data-idx="0" onclick="activateExtraSlot('${street}','turn',0)"><span class="slot-hint" style="font-size:0.55rem;color:var(--muted);">Turn</span></div>
            </div>
          </div>
          <!-- River card (optional) -->
          <div class="extra-card-picker">
            <div class="picker-label">River — carta del river (opcional)</div>
            <div class="extra-slots" id="${street}-river-slots">
              <div class="extra-slot" data-idx="0" onclick="activateExtraSlot('${street}','river',0)"><span class="slot-hint" style="font-size:0.55rem;color:var(--muted);">River</span></div>
            </div>
          </div>
        </div>
      </div>
      <div id="${street}-group-field" style="display:none;margin-bottom:1rem;">
        <div class="fld"><label>🔗 Vincular al flop (agrupación)</label>
          <select id="${street}-nb-group" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:0.6rem 0.8rem;color:var(--text);font-size:0.88rem;outline:none;width:100%;">
            <option value="">— Sin vincular —</option>
          </select>
        </div>
      </div>
      <div class="fld" style="margin-bottom:1rem;"><label>Notas</label><textarea id="${street}-nb-notes" rows="3" placeholder="Conceptos clave de este board..."></textarea></div>
      <!-- IMAGE UPLOAD -->
      <div class="fld" style="margin-bottom:1rem;">
        <label>📸 Imagen (solver, wizard...) — opcional</label>
        <label class="img-upload-wrap" id="${street}-img-wrap" onclick="triggerImgPick('${street}')">
          <div class="img-upload-hint" id="${street}-img-hint">Haz clic para subir imagen</div>
          <img id="${street}-img-preview" class="img-preview" style="display:none;">
          <input type="file" id="${street}-img-file" accept="image/*" style="display:none;" onchange="handleImgUpload('${street}',this)">
        </label>
        <input type="hidden" id="${street}-nb-img">
        <input type="hidden" id="${street}-nb-img-caption" value="">
        <input id="${street}-nb-img-cap-text" placeholder="Pie de foto (ej: Wizard 8♥6♥2♦)" style="margin-top:0.4rem;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:0.5rem 0.7rem;color:var(--text);font-size:0.82rem;outline:none;width:100%;display:none;" id="${street}-nb-cap">
      </div>
      <div class="form-grid-3">
        <div class="fld"><label>✅ Value</label><input id="${street}-nb-value" placeholder="AA, 87s..."></div>
        <div class="fld"><label>🎲 Bluffs</label><input id="${street}-nb-bluffs" placeholder="J9o, A4o..."></div>
        <div class="fld"><label>⏸️ Checks</label><input id="${street}-nb-checks" placeholder="AA, AK♥..."></div>
      </div>
      <!-- DESPLEGABLES -->
      <div style="border-top:1px solid var(--border);padding-top:1rem;margin-top:0.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
          <span class="fc-sub-title">📂 Desplegables</span>
          <button class="btn-sm" onclick="addDespRow('${street}-desp-rows')">+ Añadir</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:0.5rem;margin-bottom:0.4rem;">
          <span style="font-family:'Space Mono';font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Título</span>
          <span style="font-family:'Space Mono';font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Contenido</span>
          <span></span>
        </div>
        <div id="${street}-desp-rows"></div>
      </div>
      <!-- FLASHCARDS -->
      <div style="border-top:1px solid var(--border);padding-top:1rem;margin-top:0.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
          <span class="fc-sub-title">🃏 Flashcards</span>
          <button class="btn-sm" onclick="addFCRow('${street}-fc-rows')">+ Añadir</button>
        </div>
        <div id="${street}-fc-rows"></div>
        <p style="font-family:'Space Mono';font-size:0.6rem;color:var(--muted);margin-top:0.4rem;">Ej: "98♦ vs Q5 ¿beteas?" → "Sí, más EQ agrandas bote"</p>
      </div>
      <div class="form-btns">
        <button class="btn-save" onclick="saveNewBoard('${street}')">Guardar Board</button>
        <button class="btn-cancel" onclick="closeAddBoard('${street}')">Cancelar</button>
      </div>
    </div>
    <!-- HAND CONTENT -->
    <div id="${street}-hand-content"></div>
  `;

  updateSelectorPreview(street);
  if (currentBoard[street]) renderHandContent(street, currentBoard[street]);
  else {
    const hc = document.getElementById(street + '-hand-content');
    if (hc) hc.innerHTML = '<div class="card" style="text-align:center;color:var(--muted);padding:2rem;">Añade tu primer board con el botón ＋</div>';
  }
}