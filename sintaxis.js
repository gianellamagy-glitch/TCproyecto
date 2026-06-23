/**
 * sintaxis.js
 * Analizador sintáctico del Mini Compilador de Recetas Médicas.
 *
 * Gramática soportada (BNF simplificada):
 *
 *   <receta>      ::= <linea>+
 *   <linea>       ::= PALABRA_CLAVE DOS_PUNTOS <valor>
 *   <valor>       ::= IDENTIFICADOR
 *                   | NUMERO UNIDAD
 *                   | FRECUENCIA_TXT NUMERO FRECUENCIA_TXT
 *                   | IDENTIFICADOR NUMERO FRECUENCIA_TXT
 *
 * El analizador se implementa como un autómata de control con estados
 * {ESPERA_CLAVE, ESPERA_DOSPUNTOS, ESPERA_VALOR, EN_VALOR} y produce,
 * para cada token consumido, la fila del "mapa de análisis sintáctico":
 * estado origen -> token (tipo) -> estado destino -> regla aplicada.
 */

const EstadoSintactico = {
  ESPERA_CLAVE: "ESPERA_CLAVE",
  ESPERA_DOSPUNTOS: "ESPERA_DOSPUNTOS",
  ESPERA_VALOR: "ESPERA_VALOR",
  EN_VALOR: "EN_VALOR",
  ERROR: "ERROR"
};

/**
 * Analiza la lista completa de tokens (de toda la receta) y devuelve
 * el mapa paso a paso del análisis sintáctico, agrupado por línea.
 */
function analizarSintaxis(tokens) {
  const pasos = [];
  let estado = EstadoSintactico.ESPERA_CLAVE;
  let lineaActual = tokens.length ? tokens[0].linea : 1;

  tokens.forEach((token, idx) => {
    if (token.linea !== lineaActual) {
      // Nueva línea: si quedó pendiente de valor, es error; si no, se reinicia.
      if (estado !== EstadoSintactico.ESPERA_CLAVE && estado !== EstadoSintactico.EN_VALOR) {
        estado = EstadoSintactico.ERROR;
      } else {
        estado = EstadoSintactico.ESPERA_CLAVE;
      }
      lineaActual = token.linea;
    }

    const estadoOrigen = estado;
    let estadoDestino;
    let regla;

    switch (estado) {
      case EstadoSintactico.ESPERA_CLAVE:
        if (token.tipo === TipoToken.PALABRA_CLAVE) {
          estadoDestino = EstadoSintactico.ESPERA_DOSPUNTOS;
          regla = "<linea> ::= PALABRA_CLAVE ':' <valor>   (inicia línea)";
        } else {
          estadoDestino = EstadoSintactico.ERROR;
          regla = "Error: se esperaba PALABRA_CLAVE al inicio de línea";
        }
        break;

      case EstadoSintactico.ESPERA_DOSPUNTOS:
        if (token.tipo === TipoToken.DOS_PUNTOS) {
          estadoDestino = EstadoSintactico.ESPERA_VALOR;
          regla = "<linea> ::= PALABRA_CLAVE ':' <valor>   (separador)";
        } else {
          estadoDestino = EstadoSintactico.ERROR;
          regla = "Error: se esperaba ':' después de la palabra clave";
        }
        break;

      case EstadoSintactico.ESPERA_VALOR:
        if ([TipoToken.IDENTIFICADOR, TipoToken.NUMERO, TipoToken.FRECUENCIA_TXT].includes(token.tipo)) {
          estadoDestino = EstadoSintactico.EN_VALOR;
          regla = "<valor> ::= IDENTIFICADOR | NUMERO UNIDAD | FRECUENCIA_TXT ...";
        } else {
          estadoDestino = EstadoSintactico.ERROR;
          regla = "Error: valor inválido después de ':'";
        }
        break;

      case EstadoSintactico.EN_VALOR:
        if ([TipoToken.IDENTIFICADOR, TipoToken.NUMERO, TipoToken.UNIDAD, TipoToken.FRECUENCIA_TXT].includes(token.tipo)) {
          estadoDestino = EstadoSintactico.EN_VALOR;
          regla = "<valor> ::= <valor> (NUMERO | UNIDAD | FRECUENCIA_TXT)*   (continúa valor)";
        } else {
          estadoDestino = EstadoSintactico.ERROR;
          regla = "Error: token inesperado dentro de <valor>";
        }
        break;

      default:
        estadoDestino = EstadoSintactico.ERROR;
        regla = "Error de sincronización sintáctica";
    }

    pasos.push({
      linea: token.linea,
      lexema: token.lexema,
      tipo: token.tipo,
      estadoOrigen,
      estadoDestino,
      regla
    });

    estado = estadoDestino;
  });

  return pasos;
}
