import type { CSSProperties } from "react";

/**
 * PADRÃO EXTRATO para toda tabela do sistema (regra do dono, 03/08/2026 —
 * memória "padrao-extrato-tabelas"): cabeçalho na COR DO TENANT (accent) com
 * TH maiúsculo, zebra accent 4% nas linhas pares, chips para status. Fonte
 * visual de referência: Financeiro → Extrato de Movimentações.
 */

export const cabecalhoPadrao: CSSProperties = { textAlign: "left", background: "var(--accent)" };

export const thPadrao: CSSProperties = {
  padding: "11px 14px",
  fontSize: 12,
  color: "var(--accent-contrast, #fff)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

/** Estilo da linha i (zebra na cor do tenant a 4%). */
export const linhaZebra = (i: number): CSSProperties => ({
  borderTop: "1px solid var(--border)",
  background: i % 2 ? "color-mix(in srgb, var(--accent) 4%, transparent)" : undefined,
});
