/**
 * automata.js
 * Construye, para cada TIPO de token, su Autómata Finito No Determinista (AFND),
 * lo determiniza mediante construcción de subconjuntos para obtener el
 * Autómata Finito Determinista (AFD) equivalente, y genera la tabla de transición.
 *
 * Dos familias de autómatas:
 *  1) Autómata de "cadena literal" (para PALABRA_CLAVE, UNIDAD, FRECUENCIA_TXT, DOS_PUNTOS):
 *     reconoce el lexema carácter por carácter. Se introduce no determinismo
 *     artificial en el primer carácter (dos estados destino) para luego
 *     determinizarlo por subconjuntos, evidenciando el proceso AFND → AFD.
 *  2) Autómata de "clase repetida" (para IDENTIFICADOR y NUMERO):
 *     reconoce una clase de símbolo (letra | dígito) repetida una o más veces,
 *     con no determinismo clásico q0 -> {q1,q2}; q1,q2 -> q1 (bucle).
 */

/**
 * Construye el AFND y AFD de un token reconocido como cadena literal,
 * por ejemplo la palabra clave "Paciente" o el símbolo ":".
 */
function construirAutomataLiteral(cadena, simbolos) {
  const n = cadena.length;

  // ---------- AFND ----------
  // Estados: q0, q1, q1b (rama no determinista del primer símbolo), q2..qn
  const estadosAFND = ["q0"];
  for (let i = 1; i <= n; i++) {
    if (i === 1) {
      estadosAFND.push("q1", "q1b");
    } else {
      estadosAFND.push("q" + i);
    }
  }

  const transicionesAFND = [];
  // q0 --simbolo[0]--> {q1, q1b}   (no determinismo introducido aquí)
  transicionesAFND.push({ origen: "q0", simbolo: simbolos[0], destinos: ["q1", "q1b"] });
  // q1 y q1b convergen con el mismo símbolo hacia q2 (o aceptación si n==1)
  if (n >= 2) {
    transicionesAFND.push({ origen: "q1", simbolo: simbolos[1], destinos: ["q2"] });
    transicionesAFND.push({ origen: "q1b", simbolo: simbolos[1], destinos: ["q2"] });
    for (let i = 2; i < n; i++) {
      transicionesAFND.push({ origen: "q" + i, simbolo: simbolos[i], destinos: ["q" + (i + 1)] });
    }
  }

  const aceptacionAFND = n === 1 ? ["q1", "q1b"] : ["q" + n];

  const afnd = {
    Q: estadosAFND,
    Sigma: [...new Set(simbolos)],
    delta: transicionesAFND,
    q0: "q0",
    F: aceptacionAFND
  };

  // ---------- Determinización (construcción de subconjuntos) ----------
  // A0=[q0] ; A1=[q1,q1b] ; A2=[q2] ; ... ; An=[qn]
  const estadosAFD = ["A0"];
  const transicionesAFD = [];
  const mapaConjunto = { A0: ["q0"] };

  if (n === 1) {
    mapaConjunto["A1"] = ["q1", "q1b"];
    estadosAFD.push("A1");
    transicionesAFD.push({ origen: "A0", simbolo: simbolos[0], destino: "A1" });
  } else {
    mapaConjunto["A1"] = ["q1", "q1b"];
    estadosAFD.push("A1");
    transicionesAFD.push({ origen: "A0", simbolo: simbolos[0], destino: "A1" });
    for (let i = 2; i <= n; i++) {
      mapaConjunto["A" + i] = ["q" + i];
      estadosAFD.push("A" + i);
      transicionesAFD.push({ origen: "A" + (i - 1), simbolo: simbolos[i - 1], destino: "A" + i });
    }
  }

  const ultimoEstadoAFD = estadosAFD[estadosAFD.length - 1];
  const afd = {
    Q: estadosAFD,
    Sigma: [...new Set(simbolos)],
    delta: transicionesAFD,
    q0: "A0",
    F: [ultimoEstadoAFD],
    mapaConjunto
  };

  return { afnd, afd, simboloUsado: simbolos.join(" → ") };
}

/**
 * Construye el AFND y AFD de un token reconocido como "clase repetida"
 * (una o más ocurrencias del mismo tipo de símbolo): letra+ para IDENTIFICADOR,
 * dígito+ para NUMERO.
 */
function construirAutomataClaseRepetida(nombreSimbolo) {
  // ---------- AFND ----------
  // q0 --s--> {q1,q2} ; q1--s-->q1 ; q2--s-->q1 ; F={q1}
  const afnd = {
    Q: ["q0", "q1", "q2"],
    Sigma: [nombreSimbolo],
    delta: [
      { origen: "q0", simbolo: nombreSimbolo, destinos: ["q1", "q2"] },
      { origen: "q1", simbolo: nombreSimbolo, destinos: ["q1"] },
      { origen: "q2", simbolo: nombreSimbolo, destinos: ["q1"] }
    ],
    q0: "q0",
    F: ["q1"]
  };

  // ---------- Determinización ----------
  // A=[q0] ; B=[q1,q2] ; C=[q1]
  // A --s--> B ; B --s--> C ; C --s--> C ; F = {B, C} (ambos contienen q1)
  const afd = {
    Q: ["A", "B", "C"],
    Sigma: [nombreSimbolo],
    delta: [
      { origen: "A", simbolo: nombreSimbolo, destino: "B" },
      { origen: "B", simbolo: nombreSimbolo, destino: "C" },
      { origen: "C", simbolo: nombreSimbolo, destino: "C" }
    ],
    q0: "A",
    F: ["B", "C"],
    mapaConjunto: { A: ["q0"], B: ["q1", "q2"], C: ["q1"] }
  };

  return { afnd, afd, simboloUsado: nombreSimbolo };
}

/**
 * Punto de entrada: dado un tipo de token y su lexema de ejemplo,
 * devuelve el autómata (AFND + AFD) correspondiente a esa categoría.
 */
function obtenerAutomataPorTipo(tipo, lexemaEjemplo) {
  switch (tipo) {
    case TipoToken.IDENTIFICADOR:
      return construirAutomataClaseRepetida("letra");
    case TipoToken.NUMERO:
      return construirAutomataClaseRepetida("digito");
    case TipoToken.PALABRA_CLAVE:
    case TipoToken.UNIDAD:
    case TipoToken.FRECUENCIA_TXT:
    case TipoToken.DOS_PUNTOS:
    default:
      return construirAutomataLiteral(lexemaEjemplo, lexemaEjemplo.split(""));
  }
}

/**
 * Genera la tabla de transición (matriz Estado x Símbolo) de un autómata,
 * sirve tanto para representar el AFND (con conjuntos de destino) como el AFD.
 */
function generarTablaTransicion(automata, esAFND) {
  const filas = [];
  automata.Q.forEach(estado => {
    const fila = { estado: estado, esInicial: estado === automata.q0, esAceptacion: automata.F.includes(estado), columnas: {} };
    automata.Sigma.forEach(simbolo => {
      if (esAFND) {
        const trans = automata.delta.filter(t => t.origen === estado && t.simbolo === simbolo);
        const destinos = trans.flatMap(t => t.destinos);
        fila.columnas[simbolo] = destinos.length ? "{" + destinos.join(",") + "}" : "∅";
      } else {
        const trans = automata.delta.find(t => t.origen === estado && t.simbolo === simbolo);
        fila.columnas[simbolo] = trans ? trans.destino : "∅";
      }
    });
    filas.push(fila);
  });
  return filas;
}
