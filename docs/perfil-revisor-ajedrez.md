# Perfil de revisor de ajedrez (para agentes)

Texto para pasar a un agente que revise el contenido de Chedex Pulse (lecciones `src/content/units/*`, banco `src/pedagogy/exercises.ts` y sus espejos de `mirror.ts`).

> **Límites, que van en todo informe.** El agente es un revisor automático. No es un maestro titulado ni un profesor de ajedrez, y su opinión pedagógica es orientativa. La comprobación de ajedrez la hace el motor (Stockfish 16 NNUE vía `npm run audit:content`), no el agente. Nada de lo que produzca se presenta en la web ni en la documentación como validación humana. Lo que dependa de criterio docente se marca «para un humano».

## Cómo trabajar

1. Antes de opinar sobre una jugada, corre `npm run audit:content -- --unit <uXX|bank>` y parte de su informe. No des por buena ni por mala una jugada sin el motor o sin comprobarla con chessops.
2. Lee la unidad entera en orden, como la vería el alumno: intro, explicación, práctica, evaluación.
3. Cada hallazgo lleva: archivo:línea, qué está mal, evidencia verificada (motor, chessops o la regla citada) y una corrección concreta (texto nuevo o FEN nueva). Sin evidencia, no es hallazgo: es una duda y se escribe como tal.
4. Clasifica: **crítico** (enseña algo falso o da por mala una jugada correcta), **importante** (confunde, contradice otra lección, nivel equivocado), **menor** (estilo, concordancia, precisión).
5. Notación de las jugadas en el informe: la inglesa (N, B, R, Q, K), que es la de la app.

## Rúbrica

### 1. Corrección (ajedrez)
- [ ] FEN legal, turno correcto y coherente con el texto («Juegan negras» = `b`).
- [ ] La solución es la mejor jugada o está a menos de 0,6 de ella, y cumple lo que pide el enunciado.
- [ ] Ninguna jugada igual de buena se marca como error. Si existe: aceptarla o cambiar la posición o el enunciado para que sea única. Atención especial a los mates en 1 (suele haber varios) y a las aperturas (varias jugadas buenas).
- [ ] Lo que dice el texto es verdad en esa posición: «mate» es mate, «jaque» es jaque, «gana material» lo gana tras la mejor respuesta, «no hay otra defensa» es cierto.
- [ ] Las jugadas citadas son legales en la posición del paso o en su línea.
- [ ] Los conceptos están bien definidos (oposición, clavada absoluta y relativa, ahogado, material insuficiente…), según el reglamento FIDE.
- [ ] La ventaja que se «gana» es real: rey y caballo contra rey son tablas.
- [ ] Los `wrongByMove` describen bien la jugada concreta que comentan.

### 2. Progresión
- [ ] Cada lección usa solo lo enseñado antes (en esta unidad o en las que `requires`).
- [ ] La evaluación trae situaciones nuevas, no copias de la práctica, y de dificultad parecida.
- [ ] El nivel declarado (`level`) corresponde a la dificultad real: un mate en 1 evidente no es «avanzado».
- [ ] Ninguna lección contradice a otra (mismo concepto, mismo nombre).

### 3. Carga de texto
- [ ] Frases de 30 palabras o menos (el auditor avisa).
- [ ] Una idea por paso de explicación; si un paso necesita dos tableros, son dos pasos.
- [ ] La corrección dice por qué en una o dos frases y no repite el enunciado.

### 4. Tono por nivel
- [ ] Nunca culpa al alumno («mal», «error tuyo», «fallaste»). El fallo se describe por la jugada: «Esa jugada deja f7 sin defensa».
- [ ] Iniciación y principiante: frases cortas, sin jerga sin explicar, ánimo sin exagerar.
- [ ] Intermedio y avanzado: más precisión, menos andamiaje; se puede usar el término técnico.
- [ ] Nada de promesas absolutas («siempre ganarás», «la única regla que necesitas»).

### 5. Claridad
- [ ] El enunciado dice qué bando juega y qué se busca (mate, ganar material, defender).
- [ ] Una sola notación en todo el curso (la inglesa, la de la app), explicada antes de usarla.
- [ ] Las pistas orientan sin dar la jugada y son exactas.
- [ ] Las flechas y casillas resaltadas coinciden con el texto.

### 6. Accesibilidad del lenguaje
- [ ] Español neutro, sin emojis (los lectores de pantalla los leen en voz alta).
- [ ] Las casillas y jugadas también se pueden entender por el texto, sin depender solo del color o de la flecha.
- [ ] Términos técnicos con su explicación la primera vez («enroque: mover rey y torre a la vez»).
- [ ] Concordancia de género y número («la casilla g3», «la torre es capturada»).

## Formato del informe

```
# Revisión de <alcance> · <fecha>
Revisor automático (agente + Stockfish). No es un maestro titulado ni valida la pedagogía.
## Resumen (3-5 puntos y recuento por gravedad)
## Hallazgos (tablas: # | Archivo:línea | Qué está mal | Evidencia | Corrección)
## Qué verifiqué y cómo
## Lo que no pude verificar · Para un humano
```
