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
        '{hecho}\nEl ataque doble funciona porque no puedes defender a las dos piezas con una sola jugada.\nCasillas implicadas: {casillas}; piezas: {piezas}.\nSe pierde material equivalente a {perdida}.\nPrevención: no dejes piezas a un salto de caballo de distancia entre sí, y vigila los jaques que atacan además otra pieza.',
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
        '{hecho}\nUna clavada es cuando una pieza no puede moverse porque dejaría a otra más importante (a veces el rey) sin protección.\nAntes de mover, mira las líneas rectas y diagonales: ¿hay una pieza tuya delante de otra más valiosa?',
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
    name: 'Amenaza de mate',
    definition:
      'Una amenaza de mate es una jugada que, de no ser respondida, daría jaque mate en el siguiente movimiento; también se incluye el mate propio que se desaprovecha.',
    recommendedLevel: 'beginner',
    learningObjectives: [
      'Revisar los jaques y las amenazas de mate del rival antes de cada jugada.',
      'Reconocer los mates básicos (pasillo, mate del pastor, mate ahogado).',
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
];
