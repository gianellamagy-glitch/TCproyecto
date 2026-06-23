/**
 * app.js
 * Orquesta el login y la interacción del compilador: ejecuta el lexer,
 * construye los autómatas por tipo de token y renderiza el análisis
 * sintáctico en la interfaz.
 */

// ---------- LOGIN ----------
const btn    = document.getElementById('btn-login');
const errMsg = document.getElementById('error-msg');
const screen = document.getElementById('login-screen');
const appFrm = document.getElementById('app-frame');
const usrLbl = document.getElementById('user-label');
const usrDot = document.getElementById('user-dot');
const logout = document.getElementById('btn-logout');
const userIn = document.getElementById('username');
const passIn = document.getElementById('password');

function tryLogin() {
  if (userIn.value.trim() === 'admi' && passIn.value.trim() === '123') {
    errMsg.classList.remove('visible');
    usrLbl.textContent = 'admi';
    usrDot.textContent = 'A';
    screen.style.display = 'none';
    appFrm.classList.add('visible');
  } else {
    errMsg.classList.add('visible');
    passIn.value = '';
    passIn.focus();
  }
}

btn.addEventListener('click', tryLogin);
[userIn, passIn].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); }));
logout.addEventListener('click', () => {
  appFrm.classList.remove('visible');
  screen.style.display = 'flex';
  userIn.value = ''; passIn.value = ''; userIn.focus();
});

// ---------- COMPILADOR ----------
const TAG_CLASES = {
  PALABRA_CLAVE: "tag-clave",
  DOS_PUNTOS: "tag-signo",
  IDENTIFICADOR: "tag-id",
  NUMERO: "tag-num",
  UNIDAD: "tag-unidad",
  FRECUENCIA_TXT: "tag-frec",
  DESCONOCIDO: "tag-error"
};

const NOMBRES_TIPO = {
  PALABRA_CLAVE: "Palabra clave",
  DOS_PUNTOS: "Separador ':'",
  IDENTIFICADOR: "Identificador",
  NUMERO: "Número",
  UNIDAD: "Unidad de medida",
  FRECUENCIA_TXT: "Texto de frecuencia",
  DESCONOCIDO: "Desconocido / Error léxico"
};

document.getElementById('btn-analizar').addEventListener('click', analizarReceta);
document.getElementById('btn-limpiar').addEventListener('click', () => {
  document.getElementById('receta-input').value = '';
  document.getElementById('resultados').innerHTML = '';
});

function analizarReceta() {
  const texto = document.getElementById('receta-input').value;
  const tokens = tokenizarReceta(texto);
  const resultadosDiv = document.getElementById('resultados');
  resultadosDiv.innerHTML = '';

  if (tokens.length === 0) {
    resultadosDiv.innerHTML = '<p class="empty-hint">Escribe una receta médica y presiona "Analizar receta".</p>';
    return;
  }

  resultadosDiv.appendChild(renderTablaTokens(tokens));
  resultadosDiv.appendChild(renderSeccionAutomatas(tokens));
  resultadosDiv.appendChild(renderMapaSintactico(tokens));
}

/**
 * Tabla con todos los tokens reconocidos por el lexer.
 */
function renderTablaTokens(tokens) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="section-title">1 · Tokens reconocidos</div>`;

  const tableWrap = document.createElement('div');
  tableWrap.className = 'token-table-wrap';
  const table = document.createElement('table');
  table.className = 'data-table';
  table.innerHTML = `
    <thead><tr><th>Línea</th><th>Lexema</th><th>Tipo de token</th></tr></thead>
    <tbody>
      ${tokens.map(t => `
        <tr>
          <td>${t.linea}</td>
          <td>${escaparHtml(t.lexema)}</td>
          <td><span class="tag ${TAG_CLASES[t.tipo] || 'tag-error'}">${NOMBRES_TIPO[t.tipo] || t.tipo}</span></td>
        </tr>
      `).join('')}
    </tbody>`;
  tableWrap.appendChild(table);
  wrap.appendChild(tableWrap);
  return wrap;
}

/**
 * Para cada tipo de token presente, construye y muestra su AFND, AFD
 * y tabla de transición dentro de una tarjeta colapsable.
 */
function renderSeccionAutomatas(tokens) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="section-title">2 · Autómatas por tipo de token (AFND → AFD)</div>`;

  // Tipos únicos presentes, con un lexema de ejemplo de cada uno
  const tiposUnicos = {};
  tokens.forEach(t => {
    if (!tiposUnicos[t.tipo]) tiposUnicos[t.tipo] = t.lexema;
  });

  Object.keys(tiposUnicos).forEach(tipo => {
    if (tipo === TipoToken.DESCONOCIDO) return; // sin autómata válido
    const lexemaEjemplo = tiposUnicos[tipo];
    const { afnd, afd, simboloUsado } = obtenerAutomataPorTipo(tipo, lexemaEjemplo);

    const card = document.createElement('div');
    card.className = 'automata-card';
    card.innerHTML = `
      <div class="automata-head">
        <h4>${NOMBRES_TIPO[tipo]} &nbsp;<span class="tag ${TAG_CLASES[tipo]}">ejemplo: ${escaparHtml(lexemaEjemplo)}</span></h4>
        <span class="chev">▶</span>
      </div>
      <div class="automata-body">

        <div class="subtitle-mini">Quíntupla del AFND</div>
        <div class="quintuple">${renderQuintupla(afnd, true)}</div>

        <div class="subtitle-mini">Quíntupla del AFD (vía construcción de subconjuntos)</div>
        <div class="quintuple">${renderQuintupla(afd, false)}</div>

        <div class="subtitle-mini">Tabla de transición — AFND</div>
        ${renderTablaAutomata(afnd, true)}

        <div class="subtitle-mini">Tabla de transición — AFD</div>
        ${renderTablaAutomata(afd, false)}
      </div>
    `;
    card.querySelector('.automata-head').addEventListener('click', () => card.classList.toggle('open'));
    wrap.appendChild(card);
  });

  return wrap;
}

function renderQuintupla(automata, esAFND) {
  return `
    <div><span class="lbl">Q&nbsp;=</span> <b>{ ${automata.Q.join(", ")} }</b></div>
    <div><span class="lbl">Σ&nbsp;=</span> <b>{ ${automata.Sigma.join(", ")} }</b></div>
    <div><span class="lbl">δ&nbsp;=</span> <b>ver tabla de transición ${esAFND ? "AFND" : "AFD"}</b></div>
    <div><span class="lbl">q0&nbsp;=</span> <b>${automata.q0}</b></div>
    <div><span class="lbl">F&nbsp;=</span> <b>{ ${automata.F.join(", ")} }</b></div>
  `;
}

function renderTablaAutomata(automata, esAFND) {
  const filas = generarTablaTransicion(automata, esAFND);
  const cols = automata.Sigma;
  const tableWrap = document.createElement('div');
  tableWrap.className = 'token-table-wrap';
  const table = document.createElement('table');
  table.className = 'data-table';
  table.innerHTML = `
    <thead><tr><th>Estado</th>${cols.map(c => `<th>${c}</th>`).join('')}<th>Tipo</th></tr></thead>
    <tbody>
      ${filas.map(f => `
        <tr>
          <td>${f.estado}</td>
          ${cols.map(c => `<td>${f.columnas[c]}</td>`).join('')}
          <td>${f.esInicial ? '→ inicial ' : ''}${f.esAceptacion ? '✓ aceptación' : ''}</td>
        </tr>
      `).join('')}
    </tbody>`;
  tableWrap.appendChild(table);
  return tableWrap.outerHTML;
}

/**
 * Muestra el mapa de análisis sintáctico: estado origen -> token -> estado
 * destino -> regla gramatical aplicada, para cada token de la receta.
 */
function renderMapaSintactico(tokens) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="section-title">3 · Mapa de análisis sintáctico</div>`;

  const pasos = analizarSintaxis(tokens);

  const card = document.createElement('div');
  card.className = 'token-table-wrap';
  card.style.padding = '14px 18px';

  pasos.forEach(p => {
    const fila = document.createElement('div');
    fila.className = 'syntax-step';
    fila.innerHTML = `
      <span class="state-pill">${p.estadoOrigen}</span>
      <span class="arrow">──[</span>
      <span class="tag ${TAG_CLASES[p.tipo] || 'tag-error'}">${escaparHtml(p.lexema)}</span>
      <span class="arrow">]──▶</span>
      <span class="state-pill" style="${p.estadoDestino === 'ERROR' ? 'color:#f85149;border-color:#f85149' : ''}">${p.estadoDestino}</span>
      <span class="rule-text">${escaparHtml(p.regla)}</span>
    `;
    card.appendChild(fila);
  });

  wrap.appendChild(card);
  return wrap;
}

function escaparHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
