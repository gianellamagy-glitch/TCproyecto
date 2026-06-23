# Mini Compilador para Recetas Médicas

Proyecto de **Teoría de Computación**. Aplicación web estática (HTML + CSS + JS puro,
sin backend) que analiza recetas médicas en texto plano y, por cada **tipo de token**
detectado, construye:

- La **quíntupla del AFND** (Autómata Finito No Determinista).
- La **quíntupla del AFD** (Autómata Finito Determinista), obtenida por
  **construcción de subconjuntos** a partir del AFND.
- La **tabla de transición** de ambos autómatas.
- El **mapa de análisis sintáctico**: estado origen → token → estado destino → regla
  gramatical aplicada.

## 🔐 Acceso

```
Usuario:     admi
Contraseña:  123
```

## 🧩 Tipos de token soportados

| Tipo            | Ejemplo            | Reconocimiento                          |
|-----------------|---------------------|------------------------------------------|
| `PALABRA_CLAVE` | `Paciente`, `Dosis` | Cadena literal (lista fija de 7 claves) |
| `DOS_PUNTOS`    | `:`                  | Símbolo literal                         |
| `IDENTIFICADOR` | `MariaLopez`        | letra⁺ (una o más letras)               |
| `NUMERO`        | `500`, `8`          | dígito⁺ (uno o más dígitos)             |
| `UNIDAD`        | `mg`, `ml`, `tabletas` | Cadena literal (vocabulario fijo)     |
| `FRECUENCIA_TXT`| `cada`, `horas`, `dias` | Cadena literal (vocabulario fijo)   |

## ⚙️ Construcción de los autómatas

### 1) Tokens de "cadena literal" (palabra clave, unidad, frecuencia, `:`)

Se modela el reconocimiento carácter por carácter. Para evidenciar el paso
AFND → AFD se introduce no determinismo artificial en el primer símbolo:

```
AFND:  q0 --c0--> {q1, q1b}        (dos caminos posibles)
       q1 --c1--> q2
       q1b --c1--> q2               (ambos convergen)
       q2 --c2--> q3  ...  q(n-1) --c(n-1)--> qn      F = {qn}
```

Construcción de subconjuntos → AFD:

```
A0=[q0] --c0--> A1=[q1,q1b] --c1--> A2=[q2] --c2--> ... --> An=[qn]   F = {An}
```

### 2) Tokens de "clase repetida" (identificador, número)

```
AFND:  q0 --s--> {q1,q2}
       q1 --s--> q1
       q2 --s--> q1                 F = {q1}
```

Construcción de subconjuntos → AFD:

```
A=[q0] --s--> B=[q1,q2] --s--> C=[q1] --s--> C     F = {B, C}
```

Donde `s` es la clase de símbolo (`letra` o `digito`).

## 📐 Gramática del análisis sintáctico

```
<receta>  ::= <linea>+
<linea>   ::= PALABRA_CLAVE ':' <valor>
<valor>   ::= IDENTIFICADOR
            | NUMERO UNIDAD
            | FRECUENCIA_TXT NUMERO FRECUENCIA_TXT
            | <valor> (NUMERO | UNIDAD | FRECUENCIA_TXT)*
```

Implementada como un autómata de control con estados:
`ESPERA_CLAVE → ESPERA_DOSPUNTOS → ESPERA_VALOR → EN_VALOR` (y `ERROR` ante
cualquier transición no contemplada).

## 📁 Estructura del proyecto

```
compilador-recetas/
├── index.html       # Login + interfaz del compilador
├── lexer.js         # Analizador léxico (tokenización y clasificación)
├── automata.js       # Construcción de AFND, AFD y tablas de transición
├── sintaxis.js       # Analizador sintáctico (máquina de estados + gramática)
├── app.js            # Orquestación: login, render de resultados
├── .gitignore
├── LICENSE
└── README.md
```

## ▶️ Ejecución

No requiere backend ni instalación. Basta con:

1. Clonar el repositorio.
2. Abrir `index.html` en el navegador (o publicarlo con GitHub Pages).
3. Iniciar sesión con `admi` / `123`.
4. Escribir/editar la receta médica de ejemplo y presionar **"Analizar receta"**.
5. Expandir cada tarjeta de autómata para ver su quíntupla AFND/AFD y tabla
   de transición; revisar el mapa de análisis sintáctico generado debajo.

## 🌐 Publicar en GitHub Pages

```
Settings → Pages → Branch: main → /(root) → Save
```

La URL pública quedará como `https://<usuario>.github.io/compilador-recetas/`.

## 👥 Equipo de desarrollo

- Hilario Arias, Asiri Illari
- Rejanovinshi Benavente, Cielo de los Ángeles
- Valenzuela Miguel, Gianella Magaly
- Vargas Villacrez, Yosef Keith
- Retuerto Olivera, Luis Matias

## 📄 Licencia

MIT License
