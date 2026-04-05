/* ═══════════════════════════════════════════
   Sistema de preguntas y puntuación
   Poker SRP BTN vs BB — quiz.js
═══════════════════════════════════════════ */

// ══════════════════════════════════════════════
//  QUIZ
// ══════════════════════════════════════════════
const questions = [
  {
    q: "Si dudas de si hacer cbet o no en un flop BTN vs BB, ¿qué debes hacer?",
    opts: ["Checkear para ver el turn gratis", "Hacerlo — apostar", "Depende del texture del board", "Preguntar al rival sus tendencias"],
    correct: 1,
    exp: "La regla general es: si dudas de si cbetear o no, hacerlo. La ventaja de posición del BTN justifica la apuesta en la mayoría de situaciones."
  },
  {
    q: "Si dudas entre apostar grande o pequeño en el flop BTN vs BB SRP, ¿qué eliges?",
    opts: ["Grande — más EV de las manos fuertes del rival", "Pequeño — regla general de duda", "Depende del board texture exclusivamente", "Siempre mitad del bote"],
    correct: 1,
    exp: "Regla general: si dudas entre grande o pequeño, elige pequeño. Solo usas grande cuando hay razones claras (ventaja de nuts, value vulnerable, zona elástica)."
  },
  {
    q: "¿Qué significa 'ganar EV en lugar de ganar la mano'?",
    opts: ["Que debes intentar siempre llegar al showdown", "Que el objetivo es maximizar el valor esperado, no proteger la mano", "Que hay que bluffear más frecuentemente", "Que el equity de la mano es irrelevante"],
    correct: 1,
    exp: "El objetivo en poker es maximizar EV, no ganar cada mano individual. A veces es más EV chequear una mano fuerte o foldear equity si el EV de esa línea es mayor."
  },
  {
    q: "Entre 98♦ y 98♠ en un flop con dos picas, ¿cuál prefieres betear y por qué?",
    opts: ["98♠ — tiene el flush draw en el palo dominante", "98♦ — más EQ en este board específico, por eso más BET", "Son equivalentes, el palo es irrelevante", "98♠ porque bloqueas el flush draw del rival"],
    correct: 1,
    exp: "A más EQ, más quieres apostar para agrandar el bote. 98♦ en un board de picas tiene más equity (el rival tiene muchos flush draws de picas que están por detrás) — por eso es mejor para betear."
  },
  {
    q: "¿Por qué se chequea AA específicamente y no los demás overpairs como overpair check strategy?",
    opts: ["AA es demasiado fuerte y asusta al rival", "AA desbloquea los bluffs del rival al no bloquear nada en su rango", "AA tiene menos posibilidad de mejorar en turn", "AA se checkraisea mejor desde el BB"],
    correct: 1,
    exp: "AA es el overpair que más 'desbloquea' bluffs del rival. No bloquea muchas manos del rango bluff del rival, por lo que el rival puede seguir bluffeando en turn, generando más EV con check-call o check-raise."
  },
  {
    q: "¿Qué hace que Q6 sea mejor mano para betear que 55 en muchos flops?",
    opts: ["Q6 tiene más equity de showdown en cualquier runout", "Q6 tiene más outs, desbloquea bluffs y bloquea dobles y sets", "55 es demasiado transparent como value bet", "Q6 siempre tiene pair más kicker superior"],
    correct: 1,
    exp: "Q6: más outs para mejorar, desbloquea los bluffs del rival (no tiene 55 ni 66), y bloquea manos de sets y dobles pares. 55 si overpagan es mejor chequear porque no bluffcatchea contento y si pagan probablemente pierdas la mano."
  },
  {
    q: "Estás en BTN con K3♦ en un flop donde podrías ser check-raiseado. ¿Qué haces?",
    opts: ["Betear siempre — bloqueamos muchas manos del rival", "Checkear — K3♦ no quiere afrontar check-raises", "Betear grande para disuadir el check-raise", "Depende únicamente de las tendencias del rival"],
    correct: 1,
    exp: "K3♦ chequea porque no le gusta que le check-raiseen. Como bluff, sufre mucho al raise. En cambio, 87♦ sí prefiere betear porque tiene más EQ y no sufre tanto al raise."
  },
  {
    q: "El rival está overcalleando en el flop. ¿Cómo ajustas tu estrategia en turn?",
    opts: ["Ser más cauto, su rango es muy fuerte", "Ser muy agresivo en turn — su rango está debilitado", "Chequear más para controlar el bote", "No hay ajuste necesario, seguir con el plan original"],
    correct: 1,
    exp: "Cuando el rival overcalllea en flop, en turn hay que ser muy agresivo. Su rango está sobre-representado en manos medias que no pueden seguir pagando múltiples calles de apostar."
  },
  {
    q: "¿Qué tipo de board (rainbow vs FD) prefieres siendo BTN en SRP y por qué?",
    opts: ["FD — más manos de draw generan más fold equity", "Rainbow — más equity estático que se mantiene hasta river", "Son equivalentes para el BTN", "FD — el rival tiene más manos de draw que pagan más"],
    correct: 1,
    exp: "Rainbow es preferible: como BTN tienes más EQ y cuanto más estático sea el board, más veces esa equity se mantiene hasta el river. En FDs hay muchas cartas que pueden cambiar la dinámica desfavorablemente."
  },
  {
    q: "En boards doblados altos (ej. KK7), ¿qué estrategia usa el solver?",
    opts: ["40% polarizado con muchos checks", "25% range bet", "50% neutro casi siempre", "Mix de 33% y 66% polarizado"],
    correct: 1,
    exp: "Boards doblados altos → 25% range bet. No hay razón para polarizar fuerte porque la ventaja de nuts no es tan grande como en boards más coordinados."
  },
  {
    q: "En boards doblados medios (ej. K77 vs 668ss), ¿qué aplica el solver?",
    opts: ["25% range bet siempre", "40% polarizado, pero NO es lo mismo K77 que 668ss", "33% neutro en todos", "Mix de range y polarizado sin tamaño fijo"],
    correct: 1,
    exp: "Boards doblados medios → 40% polarizado. Pero importante: K77 y 668ss no son iguales — el texture específico del board cambia mucho la estrategia óptima aunque el size sea similar."
  },
  {
    q: "¿Cuándo tienen los bluffs más incentivo de hacerse a la delayed CBet (turn) en lugar del flop?",
    opts: ["Cuando el board es muy coordinado y hay muchos draws", "En boards donde no hay thin value y el rival sobrebet en turn con Ax", "Cuando el rival es muy agresivo y suele check-raisear flop", "Siempre que hayamos checkeado el flop"],
    correct: 1,
    exp: "En boards sin thin value, el rival en la delayed tiende a apostar demasiado con Ax cuando debería chequear mucho más thin value. Esto da a los bluffs con 0EQ más incentivo de delayear y presionar ese rango inflado."
  },
  {
    q: "Tras un check-check en el flop, ¿qué predices del rango del BB en turn/river?",
    opts: ["Habrá pobreateado exactamente según el solver", "No pobreateará tan bien — QJ, QT no lo harán; FDs van mixed", "Su rango será perfecto porque no tuvo info del flop", "Betea thin value normalmente con A6o, A7o"],
    correct: 1,
    exp: "Tras check-check, el BB va a pobretear de más porque en realidad no checkea puro QJ, QT etc. Los FDs van mixed, y no valuebeatea tanto thin value como A6o que sí mete el solver."
  },
  {
    q: "¿Cuál es la implicación de que el rival overfoldee en flop para las calles siguientes?",
    opts: ["Podemos valuebetear más thin en turn y river", "Cuidado con las demás calles — ajustar rango de continuación", "No hay implicación — el overfold solo afecta al flop", "Debemos aumentar nuestra frecuencia de bluff en todas las calles"],
    correct: 1,
    exp: "Si el rival overfoldea en flop, cuidado con las demás calles. Significa que las manos que continúan tienen un rango más polarizado y fuerte — hay que ajustar qué manos se pueden valuebet y qué se puede bluffear en turn y river."
  },
  {
    q: "En un board con FD, el EV entre 75% y 110% de bote es prácticamente el mismo. ¿Qué concluyes?",
    opts: ["Siempre apostar el 110% — más size = más EV", "El size no importa en estos boards — apostar cualquiera", "Jugar range a 75% es correcto pero jugar range a 75% y 110% NO son equivalentes estratégicamente", "Hay que siempre apostar el 75% para no sobreapostar"],
    correct: 2,
    exp: "El EV entre 75% y 110% es casi el mismo, PERO jugar range no. El hecho de que el EV sea similar no significa que puedas range-bet — necesitas ser más selectivo en qué manos apuestas a cada tamaño para no ser explotable."
  }
];

let currentQ=0, score=0, wrong=0, answered=false, shuffled=[];
function initQuiz(){shuffled=[...questions].sort(()=>Math.random()-0.5);currentQ=0;score=0;wrong=0;answered=false;document.getElementById('quiz-result').classList.remove('show');renderQuestion();}
function renderQuestion(){
  if(currentQ>=shuffled.length){showResult();return;}
  answered=false;updateProgress();
  const q=shuffled[currentQ];
  document.getElementById('quiz-container').innerHTML=`
    <div class="quiz-card">
      <div class="quiz-q-num">Pregunta ${currentQ+1} / ${shuffled.length}</div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">${q.opts.map((o,i)=>`<button class="quiz-opt" onclick="selectAnswer(${i})" id="opt-${i}">${o}</button>`).join('')}</div>
      <div class="quiz-explanation" id="quiz-exp">${q.exp}</div>
      <button class="quiz-next-btn" id="quiz-next" onclick="nextQuestion()">${currentQ<shuffled.length-1?'Siguiente →':'Ver resultados →'}</button>
    </div>`;
}
function selectAnswer(idx){
  if(answered)return;answered=true;
  const q=shuffled[currentQ];
  document.querySelectorAll('.quiz-opt').forEach(o=>o.disabled=true);
  if(idx===q.correct){document.getElementById('opt-'+idx).classList.add('correct');score++;}
  else{document.getElementById('opt-'+idx).classList.add('wrong');document.getElementById('opt-'+q.correct).classList.add('revealed');wrong++;}
  document.getElementById('quiz-exp').classList.add('show');
  document.getElementById('quiz-next').classList.add('show');
  updateProgress();
}
function nextQuestion(){currentQ++;renderQuestion();}
function updateProgress(){
  const total=shuffled.length,done=currentQ+(answered?1:0);
  document.getElementById('quiz-prog-text').textContent=`Pregunta ${Math.min(currentQ+1,total)} / ${total}`;
  document.getElementById('quiz-prog-bar').style.width=`${(done/total)*100}%`;
  document.getElementById('quiz-score-badge').textContent=`✓ ${score} / ✗ ${wrong}`;
}
function showResult(){
  document.getElementById('quiz-container').innerHTML='';
  const pct=Math.round((score/shuffled.length)*100);
  const msgs=[[0,40,'Hay que repasar los apuntes. ¡Vuelve a la teoría!'],[40,70,'Vas por buen camino. Repasa los conceptos que fallaste.'],[70,90,'¡Muy bien! Ya estás asimilando la estrategia BTN vs BB.'],[90,101,'¡Excelente! Dominas la estrategia SRP IP. 🃏']];
  const msg=msgs.find(([lo,hi])=>pct>=lo&&pct<hi);
  document.getElementById('result-pct').textContent=pct+'%';
  document.getElementById('result-msg').textContent=msg[2];
  document.getElementById('quiz-result').classList.add('show');
  document.getElementById('quiz-prog-bar').style.width='100%';
}
function restartQuiz(){initQuiz();}

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
});