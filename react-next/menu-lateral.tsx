"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/**
 * MENU LATERAL DO NÚCLEO — a mesma medida em todos os produtos do grupo.
 *
 * As classes (`.painel-sidebar`, `.sb-item`, `.sb-ativo`) vêm de
 * `@ocsi/ui/css/shell.css`; o item ativo sai no gradiente da marca do inquilino,
 * sem nenhuma cor escrita aqui.
 *
 * 🔴 Os itens chegam por PROP, já filtrados pelo servidor do produto. O núcleo
 * não sabe o que é permissão, módulo, cargo ou organização — esconder item no
 * navegador não protege nada, e regra de negócio não mora em pacote público.
 *
 * DOIS MODOS, porque os produtos têm menus de tamanhos diferentes:
 *
 * - `"acordeao"` (padrão): o submenu abre no lugar, empurrando o resto. Serve a
 *   menu curto (OmniVis, RG).
 * - `"trilho"`: o menu principal encolhe para uma faixa de ícones e o submenu
 *   abre ao lado. É o desenho do SaaS Gestão, onde uma seção tem 16 filhos —
 *   em acordeão isso vira uma lista rolante gigante. A largura TOTAL não muda
 *   quando o trilho encolhe, e é por isso que a área de conteúdo não pula.
 *
 * Absorvido do SaaS em 16/09/2026 (v0.9.0), medido linha a linha antes: o drill,
 * a sincronia com a rota, o acender do filho mais específico, a prioridade do
 * link direto, o rodapé colado no pé e a dica do trilho recolhido.
 */

export type GrupoMenu = { titulo?: string; itens: ItemMenu[] };

export type ItemMenu = {
  rotulo: string;
  /** Sem `href`, o item abre o submenu (ou executa `aoClicar`). */
  href?: string;
  icone?: ReactNode;
  /** Prefixo que marca o item como ativo, quando não é o próprio `href`. */
  prefixo?: string;
  /** Submenu simples. Use `grupos` quando ele precisar de seções com título. */
  itens?: ItemMenu[];
  grupos?: GrupoMenu[];
  /** Item que AGE em vez de navegar (ex.: abrir uma janela de reporte). */
  aoClicar?: () => void;
  /** Empurrado para o pé do menu, atrás de um traço. */
  noRodape?: boolean;
  /** Dica do mouse e nome acessível — obrigatória em item sem rótulo visível. */
  dica?: string;
  /** Chave estável quando o rótulo pode repetir ou mudar. */
  id?: string;
};

const TRILHO = 64;
const ALTURA_RODAPE = 40;

const chevron = (giro: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: giro }}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const chave = (it: ItemMenu) => it.id ?? it.rotulo;
const filhos = (it: ItemMenu): ItemMenu[] => [...(it.itens ?? []), ...(it.grupos ?? []).flatMap((g) => g.itens)];
const temSubmenu = (it: ItemMenu) => filhos(it).length > 0;

/** A rota está DENTRO deste item (nele ou em algum filho)? */
export function estaDentro(pathname: string, item: ItemMenu): boolean {
  const alvo = item.prefixo ?? item.href;
  if (alvo) {
    if (alvo === "/painel" && !item.prefixo) return pathname === "/painel";
    if (pathname === alvo || pathname.startsWith(alvo + "/")) return true;
  }
  return filhos(item).some((f) => estaDentro(pathname, f));
}

/**
 * O `href` MAIS LONGO que casa com a rota, entre os filhos. Sem isso, `/painel/
 * atendimento/<id>` acenderia ao mesmo tempo "Atendimento" e "Atendimentos" —
 * defeito pago no SaaS em 28/08/2026.
 */
export function maisEspecifico(pathname: string, itens: ItemMenu[]): string | null {
  let achado: string | null = null;
  for (const f of itens) {
    const h = f.href;
    if (!h) continue;
    if ((pathname === h || pathname.startsWith(h + "/")) && (!achado || h.length > achado.length)) achado = h;
  }
  return achado;
}

/**
 * Qual seção a ROTA manda abrir. Link direto do menu principal VENCE: sem essa
 * prioridade, `/painel/clientes` abriria a seção que também tem um "Clientes"
 * dentro, e o usuário veria o menu se mexer sozinho.
 */
export function secaoDaRota(pathname: string, itens: ItemMenu[]): string | null {
  for (const it of itens) {
    if (temSubmenu(it)) continue;
    if (estaDentro(pathname, it)) return null;
  }
  for (const it of itens) {
    if (temSubmenu(it) && estaDentro(pathname, it)) return chave(it);
  }
  return null;
}

const estiloItem = (recuo: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: recuo ? "8px 12px 8px 14px" : "10px 12px",
  borderRadius: 8,
  fontSize: recuo ? 13 : 14,
  width: "100%",
  border: "none",
  // ⚠️ SEM `background` inline: quem pinta o fundo é o `.sb-item`/`.sb-ativo` do
  // shell.css (transparente no normal, gradiente da marca no ativo). Um
  // `background: none` inline VENCE o CSS e apagava o gradiente do item ativo —
  // o texto (branco, do `.sb-ativo`) ficava invisível. Achado do dono, 17/09.
  // O `<button>` já é resetado pelo `.sb-item { background: transparent }`.
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
});

function Miolo({ item, recolhido, seta }: { item: ItemMenu; recolhido: boolean; seta: ReactNode }) {
  return (
    <>
      {item.icone !== undefined && (
        <span aria-hidden style={{ display: "grid", placeItems: "center", width: 24, flexShrink: 0 }}>{item.icone}</span>
      )}
      <span
        style={{
          flex: recolhido ? "0 0 0" : 1,
          width: recolhido ? 0 : "auto",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          opacity: recolhido ? 0 : 1,
          transition: "opacity .12s ease",
        }}
      >
        {item.rotulo}
      </span>
      {!recolhido && seta}
    </>
  );
}

export function MenuLateral({
  itens,
  aberta,
  modoSubmenu = "acordeao",
  largura = 248,
  rodapeSubmenu,
  aoNavegar,
  rotuloNav = "Menu principal",
}: {
  itens: ItemMenu[];
  aberta: boolean;
  modoSubmenu?: "acordeao" | "trilho";
  largura?: number;
  /** Pé do submenu aberto (assinatura, versão). Slot: o núcleo não escolhe o conteúdo. */
  rodapeSubmenu?: ReactNode;
  /** Chamado em TODO clique de item — é o que fecha a gaveta no celular, mesmo
   *  quando o item aponta para a tela em que já se está. */
  aoNavegar?: () => void;
  rotuloNav?: string;
}) {
  const pathname = usePathname();
  const [secao, setSecao] = useState<string | null>(() => secaoDaRota(pathname, itens));

  /*
   * A SEÇÃO ABERTA SEGUE A ROTA. Sem este efeito, o estado é calculado uma única
   * vez na montagem e o menu para de acompanhar a navegação — como a barra não
   * remonta, sair de Financeiro para RH deixava Financeiro aberto. (Defeito da
   * v0.8.0, achado na revisão antes de existir em produto.)
   */
  useEffect(() => {
    setSecao(secaoDaRota(pathname, itens));
    // `itens` é recriado a cada render do produto; seguir só a ROTA é de propósito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const doRodape = itens.filter((i) => i.noRodape);
  const doTopo = itens.filter((i) => !i.noRodape);
  const abertoItem = modoSubmenu === "trilho" ? doTopo.find((i) => chave(i) === secao && temSubmenu(i)) ?? null : null;
  const recolhido = Boolean(abertoItem);
  const larguraTrilho = recolhido ? TRILHO : largura;

  function clicou(item: ItemMenu, abreSubmenu: boolean) {
    aoNavegar?.();
    item.aoClicar?.();
    if (abreSubmenu) setSecao((s) => (item.href ? chave(item) : s === chave(item) ? null : chave(item)));
  }

  function Linha({ item, recuo }: { item: ItemMenu; recuo: boolean }) {
    const dentro = estaDentro(pathname, item);
    const com = temSubmenu(item);
    // Recolhido, acende a SEÇÃO aberta; aberto, acende a PÁGINA atual.
    const aceso = recolhido && !recuo ? chave(item) === secao : dentro && (!com || Boolean(item.href));
    const seta = com ? chevron(secao === chave(item) && modoSubmenu === "acordeao" ? "rotate(90deg)" : "none") : null;
    const classe = `sb-item${aceso ? " sb-ativo" : ""}`;
    const dica = item.dica ?? (recolhido ? item.rotulo : undefined);

    if (item.href) {
      return (
        <Link href={item.href} className={classe} style={estiloItem(recuo)} title={dica} aria-label={dica} onClick={() => clicou(item, com)}>
          <Miolo item={item} recolhido={recolhido && !recuo} seta={seta} />
        </Link>
      );
    }
    return (
      <button
        type="button"
        className={classe}
        style={estiloItem(recuo)}
        title={dica}
        aria-label={dica}
        aria-expanded={com ? (modoSubmenu === "trilho" ? chave(item) === secao : secao === chave(item)) : undefined}
        onClick={() => clicou(item, com)}
      >
        <Miolo item={item} recolhido={recolhido && !recuo} seta={seta} />
      </button>
    );
  }

  const acesoNoSubmenu = abertoItem ? maisEspecifico(pathname, filhos(abertoItem)) : null;

  return (
    <aside
      className={`painel-sidebar${aberta ? " aberta" : ""}`}
      style={{ width: largura, minWidth: largura, borderRight: "1px solid var(--border)", background: "var(--surface)", display: "flex", overflowX: "hidden", overflowY: "auto" }}
    >
      <nav
        aria-label={rotuloNav}
        style={{
          width: larguraTrilho,
          minWidth: larguraTrilho,
          transition: "width .22s ease, min-width .22s ease",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: "16px 8px",
          overflow: "hidden",
        }}
      >
        {doTopo.map((it) => (
          <div key={chave(it)}>
            <Linha item={it} recuo={false} />
            {modoSubmenu === "acordeao" && temSubmenu(it) && secao === chave(it) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginLeft: 22 }}>
                {(it.grupos ?? [{ itens: it.itens ?? [] }]).map((g, i) => (
                  <div key={g.titulo ?? i} role="group" aria-label={g.titulo}>
                    {g.titulo && <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 12px 4px" }}>{g.titulo}</div>}
                    {g.itens.map((f) => <Linha key={chave(f)} item={f} recuo />)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {doRodape.length > 0 && (
          <>
            <div style={{ flex: 1 }} />
            <div style={{ borderTop: "1px solid var(--border)", margin: "8px 4px 0" }} />
            <div style={{ minHeight: ALTURA_RODAPE, display: "flex", alignItems: "center" }}>
              {doRodape.map((it) => <Linha key={chave(it)} item={it} recuo={false} />)}
            </div>
          </>
        )}
      </nav>

      {modoSubmenu === "trilho" && (
        <div
          aria-hidden={!abertoItem}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            borderLeft: abertoItem ? "1px solid var(--border)" : "none",
            padding: abertoItem ? "16px 8px" : "16px 0",
            opacity: abertoItem ? 1 : 0,
            transform: abertoItem ? "none" : "translateX(-10px)",
            transition: "opacity .2s ease .05s, transform .2s ease .05s",
            pointerEvents: abertoItem ? "auto" : "none",
          }}
        >
          {abertoItem && (
            <>
              <button type="button" className="sb-item" style={{ ...estiloItem(false), gap: 6 }} onClick={() => setSecao(null)}>
                <span aria-hidden style={{ display: "grid", placeItems: "center", width: 24 }}>{chevron("rotate(180deg)")}</span>
                <span style={{ fontWeight: 600 }}>{abertoItem.rotulo}</span>
              </button>
              {(abertoItem.grupos ?? [{ itens: abertoItem.itens ?? [] }]).map((g, i) => (
                <div key={g.titulo ?? i} role="group" aria-label={g.titulo}>
                  {g.titulo && <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", padding: "10px 12px 4px", marginTop: i ? 10 : 0 }}>{g.titulo}</div>}
                  {g.itens.map((f) => (
                    <Link
                      key={chave(f)}
                      href={f.href ?? "#"}
                      className={`sb-item${f.href && f.href === acesoNoSubmenu ? " sb-ativo" : ""}`}
                      style={estiloItem(true)}
                      onClick={() => clicou(f, false)}
                    >
                      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.rotulo}</span>
                    </Link>
                  ))}
                </div>
              ))}
              {rodapeSubmenu && (
                <>
                  <div style={{ flex: 1 }} />
                  <div style={{ borderTop: "1px solid var(--border)", margin: "8px 4px 0" }} />
                  <div style={{ minHeight: ALTURA_RODAPE, display: "flex", alignItems: "center" }}>{rodapeSubmenu}</div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  );
}
