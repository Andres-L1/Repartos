import type { Concept } from '../types.js';

/**
 * Biblioteca de conceptos (Capa 3). Las plantillas son texto con {placeholders}
 * que explain.ts rellena SOLO con datos del diagnóstico verificado:
 *   {hecho}      frase factual del diagnóstico (d.fact)
 *   {jugada}     SAN de la jugada del alumno
 *   {pieza}      "el caballo", "la dama"... (primera pieza de evidence.pieces, con artículo)
 *   {Pieza}      igual, con mayúscula inicial
 *   {piezas}     lista de piezas implicadas ("caballo y dama")
 *   {casilla}    primera casilla de evidence.squares
 *   {casillas}   lista de casillas implicadas ("f3 y e5")
 *   {refutacion} SAN de la jugada que castiga el error (evidence.refutationUci)
 *   {perdida}    material perdido ("3 peones")
 * Cada línea (separada por \n) que contenga un placeholder sin dato se omite.
 */
export const CONCEPTS: Concept[] = [
  {
    id: 'tactics.hanging_piece',
    category: 'Táctica',
    name: 'Pieza colgada',
    definition:
      'Una pieza está colgada cuando es atacada y no tiene ninguna defensa suficiente, de modo que el rival puede capturarla sin pagar nada a cambio.',
    recommendedLevel: 'beginner',
    learningObjectives: [
      'Comprobar antes de cada jugada si alguna de tus piezas queda sin protección.',
      'Detectar las piezas rivales que nadie defiende.',
      'Distinguir entre pieza atacada y pieza realmente en peligro (con o sin defensores).',
    ],
    detection:
      'Tras la jugada del alumno, una pieza suya queda atacada por el rival y, o bien no tiene defensores, o bien el rival gana material neto al capturarla; el motor confirma la pérdida de material.',
    explanations: {
      beginner:
        '{hecho}\nUna pieza «colgada» es una pieza que nadie protege: el rival se la puede comer gratis.\n{Pieza} en {casilla} se quedó sin protección.\nAntes de mover, pregúntate: ¿alguna de mis piezas queda sin protección?',
      initiation:
        '{hecho}\nUna pieza está colgada si está atacada y ninguna pieza propia la defiende.\n{Pieza} en {casilla} no tenía defensa suficiente.\nHábito: antes de cada jugada repasa tus piezas y comprueba cuáles están protegidas.',
      basic:
        '{hecho}\nUna pieza colgada es una pieza atacada sin defensa suficiente.\nEn este caso {pieza} en {casilla} estaba desprotegida.\nSe pierde material equivalente a {perdida}.\nRutina de seguridad: tras elegir una jugada, mira qué piezas atacadas quedan y si cada una tiene defensor.',
      intermediate:
        '{hecho}\nLa pieza de {casilla} ({piezas}) estaba atacada sin defensa suficiente, lo que permite una captura que gana material: {refutacion}.\nSe pierde el equivalente a {perdida}.\nCuenta atacantes y defensores de cada pieza afectada, incluso las que parecen seguras: mover un defensor puede dejarlas colgadas.',
      advanced:
        '{hecho}\nLa jugada {jugada} deja {pieza} en {casilla} sin cobertura suficiente; la captura {refutacion} se cumple sin compensación.\nCosto en material: {perdida}.\nAl evaluar un candidato, revisa qué funciones de defensa abandona (piezas que dejan de protegerse o líneas que se abren).',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. {Pieza} en {casilla} carece de cobertura suficiente y la captura no tiene compensación.\nMaterial perdido: {perdida}.\nAl calcular, incluye siempre la comprobación de defensores tras cada movimiento propio: es el filtro mínimo antes de profundizar en tu línea.',
    },
    exerciseIds: [
      'ex.hanging.01',
      'ex.hanging.02',
      'ex.hanging.03',
      'ex.hanging.04',
      'ex.hanging.05',
    ],
    evaluationCriteria: [
      'Identifica la pieza sin defensa antes de capturar.',
      'Comprueba que su captura no pierde material por una recaptura.',
      'Elige la captura que gana material neto.',
    ],
  },
  {
    id: 'tactics.bad_exchange',
    category: 'Táctica',
    name: 'Intercambio desfavorable',
    definition:
      'Un intercambio es desfavorable cuando, tras todas las capturas y recapturas, pierdes más material del que ganas (por ejemplo, una torre por un alfil protegido).',
    recommendedLevel: 'initiation',
    learningObjectives: [
      'Conocer el valor relativo de las piezas (peón 1, caballo y alfil 3, torre 5, dama 9).',
      'Contar atacantes y defensores antes de capturar.',
      'Elegir cuándo cambiar y cuándo evitar el cambio.',
    ],
    detection:
      'La jugada del alumno inicia o permite una serie de capturas tras la cual el alumno queda con menos material; el motor confirma la pérdida.',
    explanations: {
      beginner:
        '{hecho}\nCambiar piezas está bien solo si lo que das vale lo mismo o menos que lo que recibes.\nUna torre vale más que un alfil o un caballo. Si das mucho y recibes poco, pierdes.\nAntes de capturar, cuenta cuánto ganas y cuánto pierdes.',
      initiation:
        '{hecho}\nValores: peón 1, caballo y alfil 3, torre 5, dama 9. Un cambio es malo si das más de lo que recibes.\nPiezas implicadas: {piezas}.\nSe pierde el equivalente a {perdida}.\nAntes de capturar, repasa qué pieza recaptura.',
      basic:
        '{hecho}\nTras todas las capturas y recapturas, el balance es negativo para ti: {perdida}.\nPiezas implicadas: {piezas}; casillas: {casillas}.\nMétodo: cuenta atacantes y defensores de la casilla, ordena las capturas de menor a mayor valor y suma el balance.',
      intermediate:
        '{hecho}\nEl balance de la secuencia de capturas en {casillas} es desfavorable: {perdida}.\nLa jugada que lo castiga es {refutacion}.\nRecuerda que el orden importa: capturar con la pieza de menor valor primero mejora tu balance, y una pieza protegida por un peón rara vez se captura con una pieza mayor.',
      advanced:
        '{hecho}\nLa jugada {jugada} permite la secuencia con {refutacion}, que deja un balance de {perdida} en contra.\nAdemás del material, valora lo que cede el cambio: pares de alfiles, estructura de peones, casillas débiles, para saber cuándo un cambio equivalente en material es o no aceptable.',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. Balance material en contra: {perdida}.\nAntes de iniciar un cambio calcula toda la cadena de capturas, incluidas las recapturas intermedias y la posición resultante, y no solo el primer intercambio.',
    },
    exerciseIds: ['ex.exchange.01', 'ex.exchange.02', 'ex.exchange.03', 'ex.exchange.04'],
    evaluationCriteria: [
      'Calcula el balance material de la cadena de capturas.',
      'Prefiere capturar con la pieza de menor valor.',
      'Evita iniciar cambios que le cuestan material neto.',
    ],
  },
  {
    id: 'tactics.fork',
    category: 'Táctica',
    name: 'Horquilla (ataque doble)',
    definition:
      'Una horquilla es un ataque en el que una sola pieza amenaza a dos o más piezas rivales a la vez, de modo que el rival solo puede salvar una de ellas.',
    recommendedLevel: 'initiation',
    learningObjectives: [
      'Reconocer las casillas desde las que una pieza ataca a dos objetivos.',
      'Aprovechar el jaque como ataque doble (rey y otra pieza).',
      'Evitar dejar dos piezas propias en el alcance de una misma pieza rival.',
    ],
    detection:
      'Una pieza rival puede moverse a una casilla desde la que ataca a la vez al menos dos piezas del alumno (o rey y pieza) sin poder ser capturada con ventaja; el motor confirma la pérdida de material.',
    explanations: {
      beginner:
        '{hecho}\nUna horquilla es cuando una sola pieza ataca a dos piezas tuyas a la vez.\nSolo puedes salvar una, y el rival se come la otra.\nAntes de mover, mira si dos de tus piezas quedan al alcance de una misma pieza rival (el caballo es muy bueno para esto).',
      initiation:
        '{hecho}\nUna horquilla ataca a dos piezas con una sola jugada, y solo puedes salvar una.\nCasillas implicadas: {casillas}.\nSi una de las piezas atacadas es el rey, estás obligado a responder al jaque y pierdes la otra.\nAntes de mover, busca casillas desde donde una pieza rival atacaría dos de tus piezas.',
      basic:
        '{hecho}\nEl ataque doble funciona porque no puedes defender a las dos piezas con una sola jugada.\nCasillas implicadas: {casillas}; piezas: {piezas}.\nSe pierde material equivalente a {perdida}.\nPrevención: no dejes dos piezas sin defensa en casillas a las que un mismo caballo rival pueda saltar a la vez, y vigila los jaques que atacan además otra pieza.',
      intermediate:
        '{hecho}\nLa horquilla con la jugada {refutacion} afecta a {piezas} (casillas {casillas}).\nPérdida: {perdida}.\nPara prevenirla, antes de cada jugada revisa los jaques y capturas del rival y las casillas de salto de caballo que alcanzan dos de tus piezas.',
      advanced:
        '{hecho}\nEl ataque doble se ejecuta con {refutacion} tras {jugada}.\nPiezas afectadas: {piezas}; casillas: {casillas}. Material perdido: {perdida}.\nUna horquilla suele nacer de una jugada anterior con tempo (jaque o amenaza). Al calcular, incluye las jugadas forzadas del rival con jaque.',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. Objetivos simultáneos en {casillas}: {piezas}. Material en juego: {perdida}.\nLa horquilla es un recurso de la secuencia táctica: calcula las jugadas intermedias forzadas que desvían o sobrecargan a tu defensor antes de que ocurra.',
    },
    exerciseIds: ['ex.fork.01', 'ex.fork.02', 'ex.fork.03', 'ex.fork.04'],
    evaluationCriteria: [
      'Identifica la casilla del ataque doble.',
      'Comprueba que la pieza que hace la horquilla no puede ser capturada.',
      'Prefiere la horquilla con jaque porque limita la respuesta del rival.',
    ],
  },
  {
    id: 'tactics.pin',
    category: 'Táctica',
    name: 'Clavada',
    definition:
      'Una clavada ocurre cuando una pieza no puede (o no debe) moverse porque dejaría expuesta a otra de mayor valor situada detrás en la misma línea; si detrás está el rey, la clavada es absoluta y el movimiento es ilegal.',
    recommendedLevel: 'basic',
    learningObjectives: [
      'Reconocer las líneas (columnas, filas y diagonales) donde una pieza queda alineada con otra de valor mayor.',
      'Distinguir clavada absoluta (contra el rey) de relativa (contra otra pieza).',
      'Aprovechar una clavada atacando de nuevo la pieza clavada.',
    ],
    detection:
      'Una pieza del alumno queda alineada, con una pieza rival de largo alcance y una pieza de mayor valor o el rey detrás, y el rival obtiene ventaja material con esa alineación; el motor confirma la pérdida.',
    explanations: {
      beginner:
        '{hecho}\nUna clavada es cuando una pieza no puede moverse porque dejaría a otra más importante (a veces el rey) expuesta a un ataque.\nAntes de mover, mira las líneas rectas y diagonales: ¿hay una pieza tuya delante de otra más valiosa?',
      initiation:
        '{hecho}\nUna pieza clavada no se puede mover si detrás de ella hay un rey; y si detrás hay otra pieza valiosa, moverla suele perder material.\nCasillas implicadas: {casillas}.\nAprende a mirar quién ataca por columnas y diagonales antes de mover.',
      basic:
        '{hecho}\nLa clavada se aprovecha porque la pieza afectada no puede huir: se la ataca más veces.\nCasillas implicadas: {casillas}; piezas: {piezas}.\nSe pierde material equivalente a {perdida}.\nPrevención: antes de colocar tu pieza, mira si queda alineada con tu rey o una pieza valiosa y con una pieza rival de largo alcance.',
      intermediate:
        '{hecho}\nLa pieza clavada en la línea de {casillas} ({piezas}) pierde movilidad y se vuelve un blanco fijo.\nLa jugada que lo aprovecha es {refutacion}. Pérdida: {perdida}.\nUna clavada absoluta es contra el rey (el movimiento es ilegal); una relativa es contra otra pieza (moverla es legal pero cuesta material).',
      advanced:
        '{hecho}\nTras {jugada}, la clavada en {casillas} permite {refutacion}. Material perdido: {perdida}.\nDeshacer una clavada: interponer una pieza, atacar a la pieza clavadora, alejar al rey de la línea o jugar contra la pieza detrás. Considera estas opciones antes de aceptar la clavada.',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. La línea {casillas} concentra la presión sobre {piezas}. Material en juego: {perdida}.\nLa clavada limita las defensas disponibles y suele ser el primer paso de una combinación: calcula si la pieza clavada sigue cumpliendo sus funciones defensivas.',
    },
    exerciseIds: ['ex.pin.01', 'ex.pin.02', 'ex.pin.03', 'ex.pin.04'],
    evaluationCriteria: [
      'Identifica la línea de la clavada y la pieza clavada.',
      'Distingue clavada absoluta de relativa.',
      'Propone cómo aprovecharla o cómo romperla.',
    ],
  },
  {
    id: 'tactics.mate_threat',
    category: 'Táctica',
    name: 'Mate y amenazas de mate',
    definition:
      'Incluye dos ideas: dar jaque mate cuando lo tienes (el mate propio que no se debe desaprovechar) y ver la amenaza de mate del rival, una jugada que, si no se responde, daría jaque mate en el siguiente movimiento.',
    recommendedLevel: 'beginner',
    learningObjectives: [
      'Revisar los jaques y las amenazas de mate del rival antes de cada jugada.',
      'Reconocer los mates básicos (pasillo, mate del pastor, mate de la coz).',
      'Encontrar los mates en una jugada propios.',
    ],
    detection:
      'El motor muestra un mate (propio desaprovechado o del rival permitido) tras la jugada del alumno, o la posición resultante deja un mate forzado que antes no existía.',
    explanations: {
      beginner:
        '{hecho}\nEl jaque mate gana la partida: el rey está atacado y no puede escapar.\nAntes de cada jugada pregúntate: ¿qué jaques puede dar mi rival? ¿puedo dar jaque mate yo?',
      initiation:
        '{hecho}\nUn mate se prepara con una amenaza: si no la ves, el rival gana la partida.\nPor eso, antes de mover, busca los jaques del rival y comprueba que tu rey tendrá casillas libres.\nTambién busca siempre si tienes un mate en una jugada.',
      basic:
        '{hecho}\nRevisión de seguridad del rey: mira todos los jaques y capturas del rival, y las casillas de escape de tu rey.\nCasillas implicadas: {casillas}.\nLa jugada clave es {refutacion}.\nTambién busca primero los jaques propios: a veces el mate está a una jugada.',
      intermediate:
        '{hecho}\nLa jugada {jugada} cambia la seguridad del rey o desaprovecha un mate. La continuación clave es {refutacion}.\nCasillas implicadas: {casillas}; piezas: {piezas}.\nUna amenaza de mate es forzada: obliga a defender, a menudo con pérdida de material.',
      advanced:
        '{hecho}\nTras {jugada}, la continuación {refutacion} es decisiva. Casillas clave: {casillas}.\nEn posiciones con rey expuesto, calcula todos los jaques (propios y rivales) hasta el final: las jugadas forzadas reducen el árbol de cálculo.',
      competitive:
        '{hecho}\nSecuencia decisiva: {jugada} {refutacion}. Casillas clave: {casillas}.\nEn ataque al rey, calcula primero las líneas forzadas (jaques y amenazas de mate), valora los recursos defensivos (interposiciones, capturas del atacante, huidas) y no entres en una línea sin comprobar la respuesta más fuerte del rival.',
    },
    exerciseIds: [
      'ex.mate.01',
      'ex.mate.02',
      'ex.mate.03',
      'ex.mate.04',
      'ex.mate.05',
    ],
    evaluationCriteria: [
      'Encuentra el mate en una jugada cuando existe.',
      'Revisa los jaques del rival antes de mover.',
      'Comprueba que el rey propio conserva casillas de escape.',
    ],
  },
  {
    id: 'tactics.discovered_attack',
    category: 'Táctica',
    name: 'Jaque a la descubierta',
    definition:
      'Un ataque a la descubierta ocurre cuando una pieza se aparta de la línea de otra pieza de largo alcance (alfil, torre o dama) y esta pasa a atacar al rey (jaque a la descubierta) o a una pieza valiosa, mientras la pieza que se movió crea además su propia amenaza.',
    recommendedLevel: 'basic',
    learningObjectives: [
      'Reconocer cuándo una pieza rival tapa la línea de una pieza suya de largo alcance dirigida a tu rey o a una pieza valiosa.',
      'Comprobar, antes de cada jugada, qué ocurre si la pieza rival que tapa la línea se mueve (sobre todo con jaque o capturando).',
      'Aprovechar un ataque a la descubierta propio: mover la pieza que tapa con la mejor amenaza posible.',
    ],
    detection:
      'Tras la jugada del alumno, una pieza del rival puede moverse dejando libre la línea de una pieza suya de largo alcance que ataca al rey del alumno o a una pieza valiosa; reproduciendo la línea del motor, el rival gana material con ello.',
    explanations: {
      beginner:
        '{hecho}\nUn jaque a la descubierta es cuando una pieza se quita del camino y deja que otra pieza dé jaque o ataque. La pieza que se mueve puede amenazar algo a la vez.\nAntes de mover, mira si el rival tiene una pieza propia tapando una línea que apunta a tu rey o a tu dama.',
      initiation:
        '{hecho}\nEl rival mueve una pieza y, al apartarla, otra pieza suya (alfil, torre o dama) ataca a tu rey o a una pieza valiosa. Como debes responder al jaque, no puedes salvar lo que la pieza movida también amenaza.\nCasillas implicadas: {casillas}.\nHábito: antes de mover, mira las líneas de las piezas rivales y qué pieza las tapa.',
      basic:
        '{hecho}\nEn un ataque a la descubierta hay dos amenazas a la vez: la de la pieza que se descubre y la de la pieza que se mueve. Si una es jaque, la otra no se puede atender.\nCasillas implicadas: {casillas}; piezas: {piezas}.\nSe pierde material equivalente a {perdida}.\nPrevención: no dejes tu rey o tu dama en la misma línea que una pieza rival de largo alcance con otra pieza rival en medio.',
      intermediate:
        '{hecho}\nLa jugada {jugada} permitió {refutacion}: al moverse la pieza que tapaba, la línea de {casillas} ({piezas}) quedó abierta y se ganó material. Pérdida: {perdida}.\nAntes de cada jugada revisa las líneas rivales con una pieza de por medio: ¿qué pasa si esa pieza se mueve con jaque o captura?',
      advanced:
        '{hecho}\nTras {jugada}, la continuación {refutacion} combina el ataque descubierto con una segunda amenaza de la pieza que se mueve. Casillas: {casillas}. Material perdido: {perdida}.\nEvita colocar rey o dama sobre una línea batida por una pieza rival de largo alcance con una pieza intermedia móvil; si es inevitable, asegura que la pieza móvil no tenga una jugada con jaque o captura fuerte.',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. Casillas: {casillas}; piezas: {piezas}. Material en juego: {perdida}.\nEn el cálculo, incluye entre las jugadas del rival las de las piezas que tapan líneas propias: el jaque a la descubierta limita tus respuestas y suele combinarse con una captura o un ataque a la dama.',
    },
    exerciseIds: ['ex.disc.01', 'ex.disc.02', 'ex.disc.03', 'ex.disc.04'],
    evaluationCriteria: [
      'Identifica la pieza que tapa la línea y la pieza de largo alcance que se descubre.',
      'Encuentra la jugada de la pieza que tapa que, además, crea una amenaza propia (captura o ataque).',
      'Comprueba que el rival no puede responder a las dos amenazas a la vez.',
    ],
  },
  // ───── Fase 4 (intermedio en adelante). Pendiente de validación de profesores. ─────
  {
    id: 'tactics.skewer',
    category: 'Táctica',
    name: 'Enfilada',
    definition:
      'Una enfilada es un ataque a una pieza valiosa (a menudo el rey) que tiene detrás, en la misma línea, otra pieza propia: al apartarse la de delante, la de detrás queda expuesta y se pierde.',
    recommendedLevel: 'intermediate',
    learningObjectives: [
      'Reconocer dos piezas en la misma fila, columna o diagonal con la más valiosa delante.',
      'Atacar la pieza de delante, mejor con jaque, para ganar la de detrás.',
      'Evitar dejar el rey o la dama en línea con otra pieza propia ante un alfil, torre o dama rival.',
    ],
    detection:
      'Tras la jugada del alumno, una pieza rival de largo alcance puede atacar a su rey o dama de modo que, al apartarse, quede expuesta otra pieza situada detrás en la misma línea; el motor confirma la pérdida de material.',
    explanations: {
      beginner:
        '{hecho}\nUna enfilada es un ataque a una pieza importante que tiene otra detrás, en la misma línea. Cuando la de delante se aparta, se pierde la de detrás.\nAntes de mover, mira si tu rey o tu dama quedan en línea con otra pieza tuya.',
      initiation:
        '{hecho}\nEn la enfilada la pieza atacada vale más que la de detrás, así que tiene que apartarse y deja la otra sin protección.\nCasillas implicadas: {casillas}.\nAntes de mover, mira las filas, columnas y diagonales donde tu rey o tu dama tengan otra pieza detrás.',
      basic:
        '{hecho}\nLa enfilada es una clavada al revés: delante está la pieza más valiosa, que debe moverse.\nCasillas implicadas: {casillas}; piezas: {piezas}.\nSe pierde material equivalente a {perdida}.\nPrevención: no dejes rey y torre, o dama y torre, en la misma línea frente a un alfil, torre o dama rival.',
      intermediate:
        '{hecho}\nLa jugada {refutacion} ataca la pieza de delante en la línea de {casillas} ({piezas}); al apartarse, la de detrás queda expuesta. Pérdida: {perdida}.\nRevisa las líneas abiertas hacia tu rey y tu dama, sobre todo en finales, donde el rey se acerca al centro.',
      advanced:
        '{hecho}\nTras {jugada}, la enfilada {refutacion} gana la pieza situada detrás en {casillas}. Material perdido: {perdida}.\nLa defensa típica es no alinear piezas o mantener protegida la de detrás; si la de delante es el rey, el jaque elimina cualquier otra respuesta.',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. Alineación explotada en {casillas}: {piezas}. Material en juego: {perdida}.\nIncluye en el cálculo los jaques en líneas largas: en finales con torres y alfiles la enfilada decide muchas posiciones aparentemente igualadas.',
    },
    exerciseIds: ['ex.skewer.01', 'ex.skewer.02', 'ex.skewer.03', 'ex.skewer.04'],
    evaluationCriteria: [
      'Identifica las dos piezas alineadas y cuál vale más.',
      'Encuentra la casilla desde la que se ataca la pieza de delante, preferiblemente con jaque.',
      'Comprueba que la pieza de detrás queda sin protección tras apartarse la de delante.',
    ],
  },
  {
    id: 'tactics.deflection',
    category: 'Táctica',
    name: 'Desviación',
    definition:
      'La desviación obliga a una pieza defensora a abandonar la casilla, la línea o la pieza que protege, normalmente con una captura que debe recapturar o con un jaque; una pieza que defiende dos cosas a la vez está sobrecargada.',
    recommendedLevel: 'intermediate',
    learningObjectives: [
      'Averiguar qué defiende cada pieza rival y detectar las que defienden dos cosas a la vez.',
      'Forzar al defensor a moverse con una captura o un jaque.',
      'Comprobar qué queda sin defensa cuando el defensor se mueve.',
    ],
    detection:
      'El rival obliga con una captura o un jaque a una pieza del alumno a abandonar su función defensiva (una casilla de mate, una fila o una pieza) y después gana material o da mate; el motor confirma la pérdida.',
    explanations: {
      beginner:
        '{hecho}\nUna pieza que defiende algo no puede moverse sin dejarlo sin defensa. El rival la obligó a moverse.\nAntes de capturar o mover una pieza que defiende, piensa qué deja de proteger.',
      initiation:
        '{hecho}\nTu pieza defendía dos cosas a la vez y el rival la obligó a elegir.\nCasillas implicadas: {casillas}.\nCuando una pieza tuya tiene dos tareas, busca otra pieza que ayude con una de ellas.',
      basic:
        '{hecho}\nDesviación: una captura o un jaque obligan a tu defensor a irse, y lo que defendía queda expuesto.\nPiezas implicadas: {piezas}; casillas: {casillas}.\nSe pierde material equivalente a {perdida}.\nRevisa qué defiende cada una de tus piezas antes de mover.',
      intermediate:
        '{hecho}\nLa jugada {refutacion} desvía a tu defensor ({piezas}) de su tarea en {casillas}. Pérdida: {perdida}.\nUna pieza sobrecargada es un blanco: reparte las defensas entre varias piezas, sobre todo la de la última fila.',
      advanced:
        '{hecho}\nTras {jugada}, {refutacion} explota a un defensor sobrecargado; la casilla o pieza que protegía queda sin cobertura. Material perdido: {perdida}.\nAl evaluar una posición, haz la lista de funciones de cada pieza defensiva: una pieza con dos funciones críticas es un punto de ruptura.',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. Defensor desviado en {casillas}: {piezas}. Material en juego: {perdida}.\nLas desviaciones suelen preceder al golpe final: calcula qué defensas desaparecen tras cada captura forzada del rival.',
    },
    exerciseIds: ['ex.deflection.01', 'ex.deflection.02', 'ex.deflection.03', 'ex.deflection.04'],
    evaluationCriteria: [
      'Identifica la pieza rival que defiende dos cosas a la vez.',
      'Encuentra la captura o el jaque que la obliga a moverse.',
      'Comprueba qué gana (material o mate) cuando el defensor se aparta.',
    ],
  },
  {
    id: 'tactics.remove_defender',
    category: 'Táctica',
    name: 'Eliminar al defensor',
    definition:
      'Eliminar al defensor consiste en capturar (o cambiar) la pieza que protege a otra pieza o a una casilla clave, de modo que lo que protegía queda sin defensa.',
    recommendedLevel: 'intermediate',
    learningObjectives: [
      'Contar los defensores de cada pieza atacada y localizar las que solo tienen uno.',
      'Capturar al único defensor para ganar la pieza que protegía o la casilla del mate.',
      'Comprobar que el rival no puede recapturar y salvar la pieza a la vez.',
    ],
    detection:
      'El rival captura la única pieza del alumno que defendía otra pieza atacada o una casilla de mate, y después gana esa pieza o da mate; el motor confirma la pérdida.',
    explanations: {
      beginner:
        '{hecho}\nEl rival capturó la pieza que protegía a otra tuya; la otra se quedó sin protección.\nSi una pieza tuya solo tiene un defensor, piensa qué pasa si el rival lo captura.',
      initiation:
        '{hecho}\nLa pieza que defendía a {pieza} desapareció y {pieza} quedó sin defensa.\nCasillas implicadas: {casillas}.\nCuenta cuántas piezas defienden a cada una de las tuyas: con un solo defensor, es fácil quitárselo.',
      basic:
        '{hecho}\nEliminar al defensor: el rival captura a tu defensor y luego la pieza que este protegía.\nPiezas implicadas: {piezas}; casillas: {casillas}.\nSe pierde material equivalente a {perdida}.\nAñade un segundo defensor a las piezas atacadas o apártalas antes de que capturen al primero.',
      intermediate:
        '{hecho}\nCon {refutacion} el rival elimina al defensor de {casillas} ({piezas}). Pérdida: {perdida}.\nNo basta con tener una defensa: comprueba si el defensor puede ser capturado o cambiado con ganancia de tiempo.',
      advanced:
        '{hecho}\nTras {jugada}, {refutacion} captura al defensor y deja sin cobertura {casillas}. Material perdido: {perdida}.\nLas defensas de una sola pieza son frágiles: busca defensas redundantes en las casillas críticas (rey, piezas atacadas).',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. Defensor eliminado en {casillas}: {piezas}. Material en juego: {perdida}.\nEn el cálculo, trata los cambios del rival sobre tus defensores como jugadas forzantes: suelen ser el primer paso de una combinación.',
    },
    exerciseIds: ['ex.removedef.01', 'ex.removedef.02', 'ex.removedef.03', 'ex.removedef.04'],
    evaluationCriteria: [
      'Identifica la pieza que solo tiene un defensor.',
      'Captura al defensor con la pieza adecuada.',
      'Comprueba que el rival no puede recuperar el material y salvar la pieza a la vez.',
    ],
  },
  {
    id: 'tactics.attraction',
    category: 'Táctica',
    name: 'Atracción',
    definition:
      'La atracción es un sacrificio que obliga a una pieza rival, a menudo el rey, a ocupar una casilla concreta donde después sufre una horquilla, una clavada o un mate.',
    recommendedLevel: 'advanced',
    learningObjectives: [
      'Ver la casilla a la que conviene llevar al rey o a una pieza rival (horquilla, mate, clavada).',
      'Encontrar el sacrificio forzado, normalmente con jaque, que la obliga a ir allí.',
      'Calcular la línea completa y comprobar que se recupera más material del entregado.',
    ],
    detection:
      'El rival sacrifica material que el alumno está obligado a capturar y, con la pieza capturadora en esa casilla, gana más material o da mate; el motor confirma la pérdida.',
    explanations: {
      beginner:
        '{hecho}\nEl rival te ofreció una pieza para llevar a tu rey o a otra pieza a una casilla mala.\nAntes de capturar algo gratis, mira dónde quedará tu pieza después.',
      initiation:
        '{hecho}\nAl capturar, tu pieza fue a una casilla donde el rival tenía preparado un golpe.\nCasillas implicadas: {casillas}.\nCuando el rival entrega material con jaque, busca qué amenaza después.',
      basic:
        '{hecho}\nAtracción: un sacrificio que obliga a capturar y deja tu pieza en una casilla de horquilla o de mate.\nCasillas implicadas: {casillas}; piezas: {piezas}.\nSe pierde material equivalente a {perdida}.\nAntes de aceptar un sacrificio, mira los saltos de caballo y los jaques que quedarían.',
      intermediate:
        '{hecho}\nLa jugada {refutacion} atrae a tu pieza a {casillas}, donde el rival recupera con creces lo sacrificado. Pérdida: {perdida}.\nUn sacrificio con jaque te deja sin elección: calcula a qué casilla te obliga y qué viene después.',
      advanced:
        '{hecho}\nTras {jugada}, el sacrificio {refutacion} atrae a la pieza capturadora a {casillas}. Material perdido: {perdida}.\nEn la defensa, valora los sacrificios forzados del rival como líneas de cálculo obligatorio, no como regalos.',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. Atracción a {casillas} ({piezas}). Material en juego: {perdida}.\nLas combinaciones de atracción se ven al revés: primero la casilla final del golpe, después el sacrificio que lleva allí a la pieza.',
    },
    exerciseIds: ['ex.attraction.01', 'ex.attraction.02', 'ex.attraction.03', 'ex.attraction.04'],
    evaluationCriteria: [
      'Identifica la casilla donde la pieza rival sufriría el golpe.',
      'Encuentra el sacrificio forzado que la lleva allí.',
      'Calcula la línea hasta recuperar más material del entregado o dar mate.',
    ],
  },
  {
    id: 'tactics.intermezzo',
    category: 'Táctica',
    name: 'Jugada intermedia',
    definition:
      'Una jugada intermedia es un jaque, una captura o una amenaza que se intercala antes de la jugada esperada (casi siempre una recaptura), obligando al rival a responder y ganando algo por el camino.',
    recommendedLevel: 'advanced',
    learningObjectives: [
      'Antes de recapturar de forma automática, buscar jaques y capturas forzantes.',
      'Comprobar que la recaptura seguirá disponible después de la jugada intermedia.',
      'Tener en cuenta las jugadas intermedias del rival al calcular un cambio.',
    ],
    detection:
      'En una secuencia de capturas, el rival intercala un jaque o una captura forzante en lugar de recapturar y termina con más material; el motor confirma la pérdida.',
    explanations: {
      beginner:
        '{hecho}\nEl rival no recapturó enseguida: primero dio un jaque o capturó otra pieza, y luego recapturó.\nCuando cambies piezas, mira si el rival tiene un jaque antes de recapturar.',
      initiation:
        '{hecho}\nEl rival intercaló una jugada que tenías que atender y después recuperó el material.\nCasillas implicadas: {casillas}.\nAntes de iniciar un cambio, revisa los jaques del rival.',
      basic:
        '{hecho}\nJugada intermedia: en medio de un cambio, el rival juega algo forzante (jaque o captura) y gana material extra.\nCasillas implicadas: {casillas}; piezas: {piezas}.\nSe pierde material equivalente a {perdida}.\nCalcula los cambios contando también los jaques del rival en cada paso.',
      intermediate:
        '{hecho}\nEn lugar de la recaptura esperada, {refutacion} obliga a responder y el cambio termina a favor del rival. Pérdida: {perdida}.\nAl calcular un cambio, la pregunta no es solo «qué recaptura», sino «qué jugada forzante tiene antes».',
      advanced:
        '{hecho}\nTras {jugada}, la jugada intermedia {refutacion} altera el resultado del cambio. Material perdido: {perdida}.\nComprueba en cada paso de una secuencia de capturas si alguna pieza tuya queda expuesta a una captura con jaque.',
      competitive:
        '{hecho}\nSecuencia: {jugada} {refutacion}. Jugada intermedia en {casillas}. Material en juego: {perdida}.\nLas líneas de cambio deben calcularse con todas las jugadas forzantes intercaladas; la recaptura «obvia» rara vez es la única opción.',
    },
    exerciseIds: ['ex.intermezzo.01', 'ex.intermezzo.02', 'ex.intermezzo.03', 'ex.intermezzo.04'],
    evaluationCriteria: [
      'Antes de recapturar, busca jaques y capturas forzantes.',
      'Comprueba que la recaptura sigue disponible tras la jugada intermedia.',
      'Calcula el balance final del cambio.',
    ],
  },
];
