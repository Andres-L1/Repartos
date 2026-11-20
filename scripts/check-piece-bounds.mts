/**
 * Mide el cuadro delimitador (alfa > 8) de cada pieza como fracción de la casilla, rasterizando en un Chrome headless.
 * Uso: npx tsx scripts/check-piece-bounds.mts [juego ...] [--json]   (por defecto «contorno» + referencias)
 * Falla (exit 1) si alguna pieza de «contorno» se sale del margen permitido, queda descentrada o no comparte línea de base.
 * Chrome: variable CHROME o ruta habitual de Windows/Linux/macOS.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const NAMES = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];
// Margen mínimo al borde de la casilla (el mínimo medido en cburnett es 7,1 %); línea de base y centrado comunes.
const LIMITS = { minMargin: 0.07, maxBottomDelta: 0.03, maxCenterDelta: 0.04 };

type Sprite = { mime: string; b64: string };
function cburnett(): Record<string, Sprite> {
  const css = readFileSync(join(ROOT, 'node_modules/chessground/assets/chessground.cburnett.css'), 'utf8');
  const out: Record<string, Sprite> = {};
  const map: Record<string, string> = { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K' };
  for (const m of css.matchAll(/piece\.(\w+)\.(white|black)\s*\{\s*background-image: url\('data:image\/svg\+xml;base64,([^']+)'\)/g))
    out[(m[2] === 'white' ? 'w' : 'b') + map[m[1]!]!] = { mime: 'image/svg+xml', b64: m[3]! };
  return out;
}
function folder(set: string): Record<string, Sprite> {
  const dir = join(ROOT, 'web/public/pieces', set);
  const out: Record<string, Sprite> = {};
  for (const f of readdirSync(dir)) {
    const m = /^([wb][KQRBNP])\.(svg|webp|png)$/.exec(f);
    if (m) out[m[1]!] = { mime: m[2] === 'svg' ? 'image/svg+xml' : `image/${m[2]}`, b64: readFileSync(join(dir, f)).toString('base64') };
  }
  return out;
}
function chrome(): string {
  const c = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  const f = c.find((p) => p && existsSync(p));
  if (!f) throw new Error('Chrome no encontrado (define CHROME)');
  return f;
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const sets = args.filter((a) => !a.startsWith('--'));
if (!sets.length) sets.push('contorno', 'cburnett', 'geo');
const data: Record<string, Record<string, Sprite>> = {};
for (const s of sets) data[s] = s === 'cburnett' ? cburnett() : folder(s);

type Box = { l: number; r: number; t: number; b: number; w: number; h: number };
// Medición en la página (Runtime.evaluate con awaitPromise): rasteriza cada sprite a 450 px y busca el cuadro con alfa > 8.
const MEASURE = `(async()=>{const DATA=${JSON.stringify(data)};const N=450;const res={};for(const [set,sp] of Object.entries(DATA)){res[set]={};for(const [n,s] of Object.entries(sp)){
const img=new Image();img.src='data:'+s.mime+';base64,'+s.b64;await img.decode();
const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');x.drawImage(img,0,0,N,N);
const d=x.getImageData(0,0,N,N).data;let l=N,r=-1,t=N,b=-1;
for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(d[(j*N+i)*4+3]>8){if(i<l)l=i;if(i>r)r=i;if(j<t)t=j;if(j>b)b=j;}
res[set][n]={l:l/N,r:1-(r+1)/N,t:t/N,b:1-(b+1)/N,w:(r+1-l)/N,h:(b+1-t)/N};}}return JSON.stringify(res)})()`;
async function measure(): Promise<Record<string, Record<string, Box>>> {
  const tmp = mkdtempSync(join(tmpdir(), 'pb-'));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(chrome(), ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmp, 'u')}`, 'about:blank'], { stdio: 'ignore' });
  try {
    let target: { webSocketDebuggerUrl: string } | undefined;
    for (let i = 0; i < 100 && !target; i++) {
      await new Promise((r) => setTimeout(r, 200));
      try { target = ((await (await fetch(`http://127.0.0.1:${port}/json`)).json()) as { type: string; webSocketDebuggerUrl: string }[]).find((t) => t.type === 'page'); } catch { /* aún arrancando */ }
    }
    if (!target) throw new Error('Chrome no arrancó');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    const out = await new Promise<string>((resolveMsg, reject) => {
      ws.onmessage = (e) => {
        const m = JSON.parse(String(e.data));
        if (m.id !== 1) return;
        if (m.error || m.result.exceptionDetails) reject(new Error(JSON.stringify(m.error ?? m.result.exceptionDetails.exception)));
        else resolveMsg(m.result.result.value);
      };
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: MEASURE, awaitPromise: true, returnByValue: true } }));
    });
    ws.close();
    return JSON.parse(out);
  } finally {
    proc.kill();
    await new Promise((r) => setTimeout(r, 500));
    rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
}
const res = await measure();
if (asJson) console.log(JSON.stringify(res));
else {
  const p = (x: number) => (x * 100).toFixed(1).padStart(5);
  for (const set of sets) {
    console.log(`\n== ${set}  (% de la casilla)   izq   der   sup   inf  alto`);
    for (const n of NAMES) {
      const v = res[set]?.[n];
      if (v) console.log(`${n}                     ${p(v.l)} ${p(v.r)} ${p(v.t)} ${p(v.b)} ${p(v.h)}`);
    }
  }
}
const errs: string[] = [];
const c = res['contorno'];
if (c) {
  const bottoms = NAMES.map((n) => c[n]?.b ?? NaN);
  const bMax = Math.max(...bottoms), bMin = Math.min(...bottoms);
  if (!(bMax - bMin <= LIMITS.maxBottomDelta)) errs.push(`línea de base desigual: ${(bMin * 100).toFixed(1)}%..${(bMax * 100).toFixed(1)}%`);
  for (const n of NAMES) {
    const v = c[n];
    if (!v) { errs.push(`${n}: falta`); continue; }
    for (const k of ['l', 'r', 't', 'b'] as const) if (v[k] < LIMITS.minMargin) errs.push(`${n}: margen ${k} ${(v[k] * 100).toFixed(1)}% < ${LIMITS.minMargin * 100}%`);
    if (Math.abs(v.l - v.r) > LIMITS.maxCenterDelta) errs.push(`${n}: descentrada (izq ${(v.l * 100).toFixed(1)}% der ${(v.r * 100).toFixed(1)}%)`);
  }
}
if (errs.length) { console.error('\nFALLO:\n' + errs.join('\n')); process.exit(1); }
else if (c) console.log('\nOK: contorno dentro de límites');
