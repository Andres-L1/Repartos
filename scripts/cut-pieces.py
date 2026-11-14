"""
Recorta las láminas de piezas (PNG con fondo transparente, 2 filas x 6: blancas arriba, negras abajo,
en orden rey, dama, torre, alfil, caballo, peón) en 12 sprites WebP por juego: web/public/pieces/<id>/wK.webp ...

Uso (Pillow, NumPy y SciPy en un venv FUERA del repo; no van al bundle de la web):
  python -m venv <fuera-del-repo>/venv
  <venv>/python -m pip install pillow numpy scipy
  <venv>/python -I scripts/cut-pieces.py "<carpeta de las láminas>" [hoja-de-contacto.png]

Cada lámina se elige por su sufijo «-N.png» (1..10). Cómo se limpia:
- Cada pieza es un componente conectado del canal alfa >= ALPHA_CORE; la basura semitransparente
  de las láminas (motas, manchas, flecos) está casi toda por debajo de alfa 32, así que no se une a ninguna.
- De cada pieza se conserva su componente y el borde suavizado a <= EDGE px de él (alfa original);
  todo lo demás queda transparente.
- Todas las piezas de un juego usan la misma escala y la misma base: se alinean en el tablero.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as nd

SETS = {1: 'catedral', 2: 'neon', 3: 'olimpo', 4: 'plano', 5: 'pixel', 6: 'samurai', 7: 'egipto', 8: 'vikingo', 9: 'sombras', 10: 'cosmos'}
ROLES = 'KQRBNP'
SIZE = 192          # lado del sprite
TOP, BOTTOM = 6, 8  # margen superior y base (px del sprite)
ALPHA_CORE = 128
EDGE = 2
OUT = Path(__file__).resolve().parent.parent / 'web' / 'public' / 'pieces'


def pieces_of(path: Path):
    rgba = np.array(Image.open(path).convert('RGBA'))
    alpha = rgba[..., 3]
    lab, n = nd.label(alpha >= ALPHA_CORE)
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    keep = np.argsort(sizes)[::-1][:12]
    assert sizes[keep[-1]] > 5000, f'{path.name}: menos de 12 piezas claras'
    # Lo que quede fuera de las 12 debe ser polvo, no un trozo de pieza
    rest = np.sort(sizes)[::-1][12:13]
    assert not len(rest) or rest[0] < 500, f'{path.name}: un componente de {rest[0]} px no encaja en ninguna pieza'
    out = []
    for k in keep:
        core = lab == k
        mask = nd.binary_dilation(core, iterations=EDGE)
        ys, xs = np.nonzero(mask)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        crop = rgba[y0:y1, x0:x1].copy()
        crop[..., 3] = np.where(mask[y0:y1, x0:x1], crop[..., 3], 0)
        crop[crop[..., 3] == 0] = 0
        out.append(((y0 + y1) / 2, (x0 + x1) / 2, crop))
    out.sort(key=lambda p: p[0])
    rows = [sorted(out[:6], key=lambda p: p[1]), sorted(out[6:], key=lambda p: p[1])]
    assert max(p[0] for p in rows[0]) < min(p[0] for p in rows[1]), f'{path.name}: las filas se mezclan'
    return {f'{c}{ROLES[i]}': p[2] for c, row in zip('wb', rows) for i, p in enumerate(row)}


def render(crops):
    """Misma escala para las 12: la pieza más alta (o ancha) llena el lienzo; base común abajo."""
    box = SIZE - TOP - BOTTOM
    scale = min(box / max(c.shape[0] for c in crops.values()), SIZE / max(c.shape[1] for c in crops.values()))
    sprites = {}
    for name, c in crops.items():
        w, h = max(1, round(c.shape[1] * scale)), max(1, round(c.shape[0] * scale))
        im = Image.fromarray(c, 'RGBA').convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
        canvas = Image.new('RGBA', (SIZE, SIZE))
        canvas.paste(im, ((SIZE - w) // 2, SIZE - BOTTOM - h))
        sprites[name] = canvas
    return sprites


def main():
    src = Path(sys.argv[1])
    contact = sys.argv[2] if len(sys.argv) > 2 else None
    sheets = {int(p.stem.rsplit('-', 1)[1]): p for p in src.glob('*.png') if p.stem.rsplit('-', 1)[-1].isdigit()}
    rows = []
    for num, sid in SETS.items():
        sprites = render(pieces_of(sheets[num]))
        d = OUT / sid
        d.mkdir(parents=True, exist_ok=True)
        total = 0
        for name, im in sprites.items():
            f = d / f'{name}.webp'
            im.save(f, 'WEBP', quality=88, method=6, alpha_quality=100)
            total += f.stat().st_size
        print(f'{sid:9s} {total / 1024:6.1f} KB')
        rows.append(sprites)
    if contact:
        # Hoja de contacto: cada juego sobre casilla clara y oscura, con una línea en la base común
        cell = SIZE
        sheet = Image.new('RGBA', (cell * 12, cell * len(rows)), (0, 0, 0, 255))
        for r, sprites in enumerate(rows):
            for i, name in enumerate(f'{c}{x}' for c in 'wb' for x in ROLES):
                bg = Image.new('RGBA', (cell, cell), (238, 220, 180, 255) if (i + r) % 2 == 0 else (90, 110, 140, 255))
                bg.alpha_composite(sprites[name])
                for x in range(0, cell, 4):
                    bg.putpixel((x, SIZE - BOTTOM), (255, 0, 0, 255))
                sheet.paste(bg, (i * cell, r * cell))
        sheet.save(contact)


if __name__ == '__main__':
    main()
