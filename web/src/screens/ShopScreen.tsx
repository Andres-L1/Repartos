import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Shop, ShopItem } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { useSession } from '../session';
import { Link } from '../components/Link';
import { Icon, Loading, ErrorBox } from '../components/Icon';
import { Coin, MiniBoard, ProtectorArt } from '../components/ShopVisuals';
import {
  KIND_LABEL,
  buyState,
  chedexText,
  confirmText,
  dayText,
  itemsOf,
  ownedEquippable,
  priceText,
  progressText,
  shortfallText,
  streakMarks,
} from '../shop';

type Tab = 'tienda' | 'coleccion';
const TABS: { id: Tab; label: string }[] = [
  { id: 'tienda', label: 'Tienda' },
  { id: 'coleccion', label: 'Colección' },
];

export function ShopScreen() {
  const { shop, setShop } = useSession();
  const [tab, setTab] = useState<Tab>('tienda');
  const [loadError, setLoadError] = useState('');
  /** Compra pendiente de confirmar, compra en curso, y último aviso (compra o equipado). */
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ text: string; equip?: ShopItem } | null>(null);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ tienda: null, coleccion: null });

  useEffect(() => {
    api.shop().then(setShop).catch((e) => setLoadError(e instanceof ApiError ? e.message : 'No se pudo cargar la tienda.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!shop) {
    return loadError ? (
      <div className="card empty-state" role="alert">
        <span className="empty-icon" aria-hidden="true">
          <Icon name="alert" size={28} />
        </span>
        <h1>No se pudo abrir la tienda</h1>
        <p className="muted">{loadError} Tu saldo no ha cambiado. Inténtalo de nuevo en un momento.</p>
        <button className="btn" onClick={() => window.location.reload()}>
          Volver a intentarlo
        </button>
      </div>
    ) : (
      <Loading label="Abriendo la tienda…" />
    );
  }

  async function buy(item: ShopItem) {
    setBusy(item.id);
    setErrors((e) => ({ ...e, [item.id]: '' }));
    try {
      const next = await api.buy(item.id);
      setShop(next);
      setConfirming(null);
      const owned = next.items.find((i) => i.id === item.id);
      setNotice({
        text: `Comprado: ${item.name}. Te quedan ${chedexText(next.balance)}.`,
        ...(owned && owned.kind !== 'protector' ? { equip: owned } : {}),
      });
    } catch (e) {
      setErrors((x) => ({ ...x, [item.id]: e instanceof ApiError ? e.message : 'No se pudo completar la compra. No se ha gastado ningún Chedex.' }));
    } finally {
      setBusy(null);
    }
  }

  async function equip(item: ShopItem) {
    if (item.kind === 'protector') return;
    setBusy(item.id);
    setErrors((e) => ({ ...e, [item.id]: '' }));
    try {
      setShop(await api.equip(item.kind, item.id));
      setNotice({ text: `Equipado: ${item.name}.` });
    } catch (e) {
      setErrors((x) => ({ ...x, [item.id]: e instanceof ApiError ? e.message : 'No se pudo equipar. Inténtalo de nuevo.' }));
    } finally {
      setBusy(null);
    }
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    const i = TABS.findIndex((t) => t.id === tab);
    const to = e.key === 'ArrowRight' ? (i + 1) % TABS.length : e.key === 'ArrowLeft' ? (i + TABS.length - 1) % TABS.length : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    const next = TABS[to]!.id;
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  const shared = { shop, busy, confirming, errors, setConfirming, buy, equip };

  return (
    <div className="shop">
      <header className="shop-head">
        <h1>Tienda</h1>
        <div className="shop-wallet">
          <p className="wallet-balance">
            <Coin size={44} />
            <span className="wallet-num" aria-label={chedexText(shop.balance)}>
              {shop.balance}
            </span>
            <span className="wallet-unit" aria-hidden="true">
              Chedex
            </span>
          </p>
          <StreakProgress shop={shop} />
          <p className="wallet-protectors">
            <Icon name="shield" size={20} />
            <span>
              Protectores: <strong>{shop.protectors.count} de {shop.protectors.max}</strong>
            </span>
          </p>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Tienda y colección">
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
            onKeyDown={onTabKey}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="notice-slot" role="status" aria-live="polite">
        {notice && (
          <p className="notice">
            <Icon name="check" size={18} />
            <span>{notice.text}</span>
            {notice.equip && !notice.equip.equipped && (
              <button
                className="btn btn-small"
                onClick={() => {
                  const it = notice.equip!;
                  void equip(it);
                }}
              >
                Equipar
              </button>
            )}
          </p>
        )}
      </div>

      <section role="tabpanel" id="panel-tienda" aria-labelledby="tab-tienda" hidden={tab !== 'tienda'} tabIndex={0} className="shop-panel">
        {tab === 'tienda' && <StorePanel {...shared} />}
      </section>
      <section role="tabpanel" id="panel-coleccion" aria-labelledby="tab-coleccion" hidden={tab !== 'coleccion'} tabIndex={0} className="shop-panel">
        {tab === 'coleccion' && <CollectionPanel {...shared} goStore={() => setTab('tienda')} />}
      </section>

      <p className="muted shop-foot">
        Los Chedex se ganan con la racha y no se compran con dinero. <Link href="/creditos">Autoría y licencias</Link>
      </p>
    </div>
  );
}

/** Cinco marcas que se llenan con los días de racha hasta el siguiente Chedex. Es información, no adorno. */
function StreakProgress({ shop }: { shop: Shop }) {
  const { filled, total } = streakMarks(shop.streak);
  const left = shop.streak.daysToNextChedex;
  return (
    <div className="streak-progress">
      <div
        className="marks"
        role="progressbar"
        aria-label="Progreso hacia el siguiente Chedex"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
        aria-valuetext={progressText(shop.streak)}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < filled ? 'mark filled' : 'mark'} />
        ))}
        <Coin size={26} className="mark-goal" />
      </div>
      <p className="streak-line">
        {shop.streak.days > 0 ? `Racha de ${dayText(shop.streak.days)}. ` : 'Aún no tienes racha. '}
        {left === shop.streak.daysPerChedex && shop.streak.days === 0
          ? `Con ${dayText(left)} de estudio ganas 1 Chedex.`
          : `${left === 1 ? 'Falta' : 'Faltan'} ${dayText(left)} para el siguiente Chedex.`}
      </p>
    </div>
  );
}

interface PanelProps {
  shop: Shop;
  busy: string | null;
  confirming: string | null;
  errors: Record<string, string>;
  setConfirming(id: string | null): void;
  buy(item: ShopItem): Promise<void>;
  equip(item: ShopItem): Promise<void>;
}

function StorePanel(p: PanelProps) {
  const { shop } = p;
  const pieces = itemsOf(shop, 'pieces');
  const boards = itemsOf(shop, 'board');
  const protector = itemsOf(shop, 'protector');
  return (
    <>
      <section className="shop-section" aria-labelledby="sec-pieces">
        <h2 id="sec-pieces">{KIND_LABEL.pieces}</h2>
        <ul className="pieces-list">
          {pieces.map((it) => (
            <li key={it.id}>
              <PiecesItem item={it} {...p} />
            </li>
          ))}
        </ul>
      </section>
      <section className="shop-section" aria-labelledby="sec-boards">
        <h2 id="sec-boards">{KIND_LABEL.board}</h2>
        <ul className="boards-grid">
          {boards.map((it) => (
            <li key={it.id}>
              <BoardItem item={it} {...p} />
            </li>
          ))}
        </ul>
      </section>
      <section className="shop-section" aria-labelledby="sec-protector">
        <h2 id="sec-protector">{KIND_LABEL.protector}</h2>
        {protector.map((it) => (
          <ProtectorItem key={it.id} item={it} {...p} />
        ))}
      </section>
    </>
  );
}

/** Acción de compra de un objeto: precio, confirmación ligera en un paso, carga y error. */
function BuyAction({ item, shop, busy, confirming, errors, setConfirming, buy }: PanelProps & { item: ShopItem }) {
  const buyBtn = useRef<HTMLButtonElement>(null);
  const state = buyState(item, shop);
  const isBusy = busy === item.id;
  const open = confirming === item.id;
  const err = errors[item.id];

  if (state === 'owned') {
    return (
      <p className="own-state">
        <Icon name="check" size={18} /> {item.equipped ? 'Equipado' : 'En tu colección'}
      </p>
    );
  }
  const note =
    state === 'short'
      ? shortfallText(item.price, shop.balance, shop.streak)
      : state === 'full'
        ? `Ya tienes ${shop.protectors.count} de ${shop.protectors.max}: es el máximo que se puede guardar.`
        : '';
  const noteId = `note-${item.id}`;
  return (
    <div className="buy">
      {open ? (
        <div
          className="confirm-step"
          role="group"
          aria-label={`Confirmar la compra de ${item.name}`}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !isBusy) {
              setConfirming(null);
              buyBtn.current?.focus();
            }
          }}
        >
          <p>{confirmText(item.name, item.price, shop.balance)}</p>
          <div className="buy-row">
            <button className="btn btn-primary btn-small" disabled={isBusy} autoFocus onClick={() => void buy(item)}>
              {isBusy ? 'Comprando…' : `Comprar por ${chedexText(item.price)}`}
            </button>
            <button
              className="btn btn-ghost btn-small"
              disabled={isBusy}
              onClick={() => {
                setConfirming(null);
                window.setTimeout(() => buyBtn.current?.focus(), 0);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="buy-row">
          <span className="price-tag">
            <Coin size={20} />
            <span>{item.price}</span>
            <span className="sr-only"> Chedex</span>
          </span>
          <button
            ref={buyBtn}
            className="btn btn-small"
            disabled={state !== 'buyable'}
            aria-describedby={note ? noteId : undefined}
            onClick={() => setConfirming(item.id)}
          >
            Comprar
          </button>
        </div>
      )}
      {note && (
        <p className="muted buy-note" id={noteId}>
          {note}
        </p>
      )}
      {err && <ErrorBox>{err}</ErrorBox>}
    </div>
  );
}

function PiecesItem(p: PanelProps & { item: ShopItem }) {
  const { item, shop } = p;
  return (
    <article className="item item-pieces" aria-labelledby={`n-${item.id}`}>
      <MiniBoard board={shop.equipped.board} pieces={item.id} focus="pieces" label={`Vista previa de las piezas ${item.name}`} />
      <div className="item-body">
        <h3 id={`n-${item.id}`}>{item.name}</h3>
        <p className="muted">{item.description}</p>
        <BuyAction {...p} />
      </div>
    </article>
  );
}

function BoardItem(p: PanelProps & { item: ShopItem }) {
  const { item, shop } = p;
  return (
    <article className="item item-board" aria-labelledby={`n-${item.id}`}>
      <MiniBoard board={item.id} pieces={shop.equipped.pieces} focus="board" label={`Vista previa del tablero ${item.name}`} />
      <h3 id={`n-${item.id}`}>{item.name}</h3>
      <p className="muted">{item.description}</p>
      <BuyAction {...p} />
    </article>
  );
}

function ProtectorItem(p: PanelProps & { item: ShopItem }) {
  const { item, shop } = p;
  return (
    <article className="item item-protector" aria-labelledby={`n-${item.id}`}>
      <ProtectorArt size={72} />
      <div className="item-body">
        <h3 id={`n-${item.id}`}>{item.name}</h3>
        <p className="muted">{item.description}</p>
        <p className="muted protector-count">
          Guardados: {shop.protectors.count} de {shop.protectors.max}
        </p>
        <BuyAction {...p} />
      </div>
    </article>
  );
}

function CollectionPanel({ shop, busy, errors, equip, goStore }: PanelProps & { goStore(): void }) {
  const groups: { kind: 'pieces' | 'board'; title: string }[] = [
    { kind: 'pieces', title: KIND_LABEL.pieces },
    { kind: 'board', title: KIND_LABEL.board },
  ];
  const onlyDefaults = ownedEquippable(shop, 'pieces').length === 1 && ownedEquippable(shop, 'board').length === 1;
  return (
    <>
      <div className="collection-preview">
        <MiniBoard board={shop.equipped.board} pieces={shop.equipped.pieces} focus="pieces" label="Vista previa con lo que llevas equipado" />
        <p className="muted">Así se verán tus tableros en las lecciones.</p>
      </div>
      {onlyDefaults && (
        <p className="empty-inline">
          <Icon name="sparkle" size={18} />
          <span>
            Aquí aparecerá lo que compres. Por ahora tienes el juego y el tablero del inicio.{' '}
            <button className="link-btn" onClick={goStore}>
              Ver la tienda
            </button>
          </span>
        </p>
      )}
      {groups.map((g) => (
        <section className="shop-section" key={g.kind} aria-labelledby={`col-${g.kind}`}>
          <h2 id={`col-${g.kind}`}>{g.title}</h2>
          <ul className={g.kind === 'board' ? 'boards-grid' : 'pieces-list'}>
            {ownedEquippable(shop, g.kind).map((it) => (
              <li key={it.id}>
                <article className={`item ${g.kind === 'board' ? 'item-board' : 'item-pieces'}`} aria-labelledby={`c-${it.id}`}>
                  <MiniBoard
                    board={g.kind === 'board' ? it.id : shop.equipped.board}
                    pieces={g.kind === 'pieces' ? it.id : shop.equipped.pieces}
                    focus={g.kind === 'pieces' ? 'pieces' : 'board'}
                    label={`Vista previa de ${it.name}`}
                  />
                  <div className="item-body">
                    <h3 id={`c-${it.id}`}>{it.name}</h3>
                    {it.equipped ? (
                      <p className="own-state">
                        <Icon name="check" size={18} /> Equipado
                      </p>
                    ) : (
                      <button className="btn btn-small" disabled={busy === it.id} onClick={() => void equip(it)}>
                        {busy === it.id ? 'Equipando…' : 'Equipar'}
                      </button>
                    )}
                    {errors[it.id] && <ErrorBox>{errors[it.id]}</ErrorBox>}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="muted">El protector de racha se guarda aparte: su contador está en la tienda.</p>
    </>
  );
}
