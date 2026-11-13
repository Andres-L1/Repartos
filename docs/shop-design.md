# Tienda y moneda Chedex (diseño)

Petición del usuario: una tienda como la de la referencia, sin cofre gratis ni azar; la moneda virtual es **Chedex** (con el logo de Chedex) y se gana con la racha: **1 Chedex por cada 5 días de racha**. Se vende: piezas, tableros y protector de racha.

## Reglas decididas
- **Moneda:** Chedex. No se compra con dinero real, no hay azar (sin cofres), no caduca.
- **Cómo se gana:** al completar una lección que lleva la racha a un múltiplo de 5 (días 5, 10, 15...), +1 Chedex. Una vez por hito: si la racha se rompe y vuelve a llegar a 5, se vuelve a ganar. Lo ya ganado no se pierde nunca.
- **Libro de cuentas:** cada ingreso y gasto queda registrado (`cp_wallet_ledger`) y el saldo se calcula en el servidor. El precio de cada objeto lo fija solo el servidor.
- **Protector de racha:** si pasa exactamente un día sin estudiar, se consume un protector y la racha continúa. No cubre dos días seguidos. Se guarda un máximo de 2.
- **Gratis desde el inicio:** un juego de piezas y un tablero por defecto.

## Parámetros iniciales (míos, fáciles de cambiar: están en un único catálogo)
Con 1 Chedex cada 5 días, un objeto de 3 Chedex son 15 días de racha. Precios orientativos: protector 2; tableros 2; piezas 3 a 4.

## Piezas: solo licencias compatibles con un producto comercial y con GPL
Según el `COPYING.md` de Lichess. **Quedan excluidos** todos los juegos con licencia no comercial (CC BY-NC-SA: horsey, california, caliente, cardinal, etc.), los «freeware» (alpha, leipzig, companion...) y los sin licencia indicada.
- **Permitidos:** cburnett (GPLv2+, el actual y por defecto), merida (GPLv2+), mono (GPLv2+), chessnut (Apache-2.0), Staunton de James Clarke (MIT), fantasy / spatial / celtic de Maurizio Monge (MIT), rhosgfx (CC0), Firi (CC BY 4.0).
- **Obligación:** una página de créditos con autor y licencia de cada conjunto usado, y conservar sus avisos de copyright.
- **Tableros:** los hacemos nosotros con CSS (colores propios). Los de Lichess son AGPL y no los usamos.

## Piezas del sistema
- Migración nueva (solo `CREATE TABLE IF NOT EXISTS`): `cp_wallet_ledger`, `cp_inventory`, `cp_equipped`, y `cp_protectors` (o campo equivalente).
- Catálogo único en `src/shop/catalog.ts` (ids, tipo, precio, licencia y crédito).
- API: `GET /api/shop`, `POST /api/shop/buy {itemId}`, `POST /api/shop/equip {kind,itemId}`.
- Racha: el cálculo vive en `worker/progress.ts`; el ingreso de Chedex y el consumo del protector van en la misma transacción que completar la lección, de forma idempotente.
- Web: sección «Tienda» (saldo con el logo de Chedex, pestañas Tienda y Colección, Piezas, Tableros, Protector), «Colección» para equipar, y la página de créditos. En la barra: saldo y cuántos días faltan para el siguiente Chedex, sin presión.
- Logo de Chedex como moneda: se recupera del repositorio anterior (`pulse/public/chedex-icon.svg`).

## Fuera de alcance
Pagos reales, intercambio entre usuarios, regalos, objetos al azar.

## Actualización: material propio y reparto (decidido con el usuario)
- **Qué se vende:** piezas, tableros y protector de racha. Sin cofres ni azar.
- **Material propio:** los tableros son temas CSS nuestros (clásico, pizarra, bosque, papel, brasa) y las piezas «Geométricas» se dibujan para Chedex. El juego «Clásicas» (cburnett, GPLv2+) queda como juego por defecto, con su crédito, hasta que haya más conjuntos propios. Ya no se usan conjuntos de terceros con licencias distintas.
- **Moneda:** la ficha de Chedex (`web/public/brand/chedex-coin.svg`, el logo de Chedex del repositorio anterior).
- **Contrato:** tipos en `src/shared/api.ts` (sección «Tienda») y catálogo en `src/shop/catalog.ts`. Precio y reglas, en el servidor.
- **Reparto:** servidor (`worker/`, `migrations/`, `test/worker/`), piezas propias (`web/public/pieces/geo/`) y web (tienda, colección, créditos, temas de tablero).
- **Convención de piezas:** `web/public/pieces/<id>/<w|b><K|Q|R|B|N|P>.svg`, viewBox `0 0 45 45`.
