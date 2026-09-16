"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

/**
 * MENU LATERAL DO NÚCLEO — a mesma medida em todos os produtos do grupo.
 *
 * As classes (`.painel-sidebar`, `.sb-item`, `.sb-ativo`) vêm de
 * `@ocsi/ui/css/shell.css`; o item ativo sai no gradiente da marca do inquilino,
 * sem nenhuma cor escrita aqui.
 *
 * 🔴 Os itens chegam por PROP, já filtrados pelo servidor do produto. O núcleo
 * não sabe o que é permissão nem o que é módulo — esconder item no navegador não
 * protege nada, e regra de negócio não mora em pacote público.
 *
 * Um item pode ter `itens` (submenu). O submenu abre no clique e fica aberto
 * quando a tela atual está dentro dele — ninguém perde de vista onde está.
 */
export type ItemMenu = {
  rotulo: string;
  /** Sem `href`, o item só abre o submenu. */
  href?: string;
  icone?: ReactNode;
  /** Prefixo que marca o item como ativo, quando não é o próprio `href`. */
  prefixo?: string;
  itens?: ItemMenu[];
};

const CHEVRON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const estiloItem = (nivel: number) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: nivel ? "8px 12px 8px 46px" : "10px 12px",
  borderRadius: 8,
  fontSize: nivel ? 13 : 14,
  width: "100%",
  border: "none",
  background: "none",
  font: "inherit",
  textAlign: "left" as const,
  cursor: "pointer",
});

function estaDentro(pathname: string, item: ItemMenu): boolean {
  const alvo = item.prefixo ?? item.href;
  if (alvo) {
    if (alvo === "/painel" && !item.prefixo) return pathname === "/painel";
    if (pathname === alvo || pathname.startsWith(alvo + "/")) return true;
  }
  return (item.itens ?? []).some((f) => estaDentro(pathname, f));
}

function Linha({ item, nivel, pathname }: { item: ItemMenu; nivel: number; pathname: string }) {
  const dentro = estaDentro(pathname, item);
  const [aberto, setAberto] = useState(dentro);

  const miolo = (
    <>
      <span aria-hidden style={{ display: "grid", placeItems: "center", width: nivel ? 0 : 24, flexShrink: 0 }}>
        {nivel ? null : item.icone}
      </span>
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.rotulo}</span>
      {item.itens && (
        <span style={{ opacity: 0.6, display: "grid", placeItems: "center", transform: aberto ? "rotate(90deg)" : "none", transition: "transform .15s ease" }}>
          {CHEVRON}
        </span>
      )}
    </>
  );

  const classe = `sb-item${dentro && (item.href || !item.itens) ? " sb-ativo" : ""}`;

  return (
    <>
      {item.href ? (
        <Link
          href={item.href}
          className={classe}
          style={estiloItem(nivel)}
          onClick={() => item.itens && setAberto(true)}
        >
          {miolo}
        </Link>
      ) : (
        <button
          type="button"
          className={classe}
          style={estiloItem(nivel)}
          aria-expanded={item.itens ? aberto : undefined}
          onClick={() => setAberto((v) => !v)}
        >
          {miolo}
        </button>
      )}
      {item.itens && aberto && item.itens.map((f) => <Linha key={f.rotulo} item={f} nivel={nivel + 1} pathname={pathname} />)}
    </>
  );
}

export function MenuLateral({ itens, aberta, largura = 248 }: { itens: ItemMenu[]; aberta: boolean; largura?: number }) {
  const pathname = usePathname();
  return (
    <aside
      className={`painel-sidebar${aberta ? " aberta" : ""}`}
      style={{
        width: largura,
        minWidth: largura,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
      }}
    >
      {itens.map((it) => (
        <Linha key={it.rotulo} item={it} nivel={0} pathname={pathname} />
      ))}
    </aside>
  );
}
