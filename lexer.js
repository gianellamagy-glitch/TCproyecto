/**
 * lexer.js
 * Analizador léxico del Mini Compilador de Recetas Médicas.
 * Recorre el texto de entrada, separa lexemas y clasifica cada uno
 * en un tipo de token según expresiones regulares / listas de vocabulario.
 */

const PALABRAS_CLAVE = ["Paciente", "Diagnostico", "Medicamento", "Dosis", "Frecuencia", "Via", "Duracion"];
const UNIDADES = ["mg", "ml", "mcg", "g", "tabletas", "capsulas", "gotas"];
const FRECUENCIAS = ["cada", "horas", "dias", "veces", "diario"];

/**
 * Tipos de token reconocidos por el compilador.
 */
const TipoToken = {
  PALABRA_CLAVE: "PALABRA_CLAVE",
  DOS_PUNTOS: "DOS_PUNTOS",
  IDENTIFICADOR: "IDENTIFICADOR",
  NUMERO: "NUMERO",
  UNIDAD: "UNIDAD",
  FRECUENCIA_TXT: "FRECUENCIA_TXT",
  DESCONOCIDO: "DESCONOCIDO"
};

/**
 * Clasifica un lexema individual (ya separado) en su tipo de token.
 */
function clasificarLexema(lexema) {
  if (lexema === ":") return TipoToken.DOS_PUNTOS;
  if (PALABRAS_CLAVE.includes(lexema)) return TipoToken.PALABRA_CLAVE;
  if (/^[0-9]+$/.test(lexema)) return TipoToken.NUMERO;
  if (UNIDADES.includes(lexema.toLowerCase())) return TipoToken.UNIDAD;
  if (FRECUENCIAS.includes(lexema.toLowerCase())) return TipoToken.FRECUENCIA_TXT;
  if (/^[A-Za-zÁÉÍÓÚáéíóúñÑ]+$/.test(lexema)) return TipoToken.IDENTIFICADOR;
  return TipoToken.DESCONOCIDO;
}

/**
 * Recorre el texto completo línea por línea y devuelve la lista de tokens
 * con su lexema, tipo, número de línea y columna.
 */
function tokenizarReceta(texto) {
  const lineas = texto.split("\n");
  const tokens = [];

  lineas.forEach((linea, idxLinea) => {
    if (linea.trim() === "") return;

    // Separa por espacios, conservando ':' como lexema propio
    const lineaConEspacios = linea.replace(/:/g, " : ");
    const piezas = lineaConEspacios.split(/\s+/).filter(p => p.length > 0);

    let columna = 0;
    piezas.forEach(pieza => {
      const tipo = clasificarLexema(pieza);
      tokens.push({
        lexema: pieza,
        tipo: tipo,
        linea: idxLinea + 1,
        columna: columna
      });
      columna += pieza.length + 1;
    });
  });

  return tokens;
}
