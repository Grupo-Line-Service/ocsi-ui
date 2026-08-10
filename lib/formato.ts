// Helpers de formatação compartilhados (moeda BRL e datas).

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarValor(v: number): string {
  return brl.format(v);
}

/**
 * Interpreta um valor monetário digitado em pt-BR (ex.: "1.234,56", "1234,56",
 * "1234.56", "1234"). Retorna número >= 0 ou null se inválido.
 */
export function parseValor(entrada: string): number | null {
  const limpo = entrada.trim().replace(/[R$\s]/g, "");
  if (!limpo) return null;

  let normalizado = limpo;
  if (limpo.includes(",")) {
    // vírgula é o separador decimal; pontos são milhares.
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  }
  const n = Number(normalizado);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

/** Formata uma data ISO (YYYY-MM-DD) como DD/MM/AAAA, sem sofrer com fuso. */
export function formatarData(iso: string | null): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

// ─── Fuso horário do negócio ─────────────────────────────────────────────────
// A Vercel roda em UTC: depois das 21h de Brasília o "hoje" do servidor já é
// amanhã. TODA data "de hoje" e exibição de data/hora usa America/Sao_Paulo.
const FUSO = "America/Sao_Paulo";

/** Data de um instante no fuso de Brasília, como YYYY-MM-DD. */
export function dataSP(instante: string | number | Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date(instante));
}

/** HOJE no fuso de Brasília (YYYY-MM-DD). Nunca usar toISOString p/ isso. */
export function hojeSP(): string {
  return dataSP(new Date());
}

/** Hoje + N dias, no fuso de Brasília (YYYY-MM-DD). */
export function somarDiasSP(dias: number): string {
  return dataSP(Date.now() + dias * 86400000);
}

/** "AAAA-MM" ± n meses (aritmética pura, sem fuso). */
export function somarMeses(mes: string, n: number): string {
  const [ano, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(ano, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

const MES_NOME_LONGO = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

/** "AAAA-MM" → "Julho de 2026" (padrão da navegação por período). */
export function rotuloMesAno(mes: string): string {
  const [ano, m] = mes.split("-");
  return `${MES_NOME_LONGO[Number(m) - 1] ?? m} de ${ano}`;
}

/** Telefone BR para exibição: (11) 99999-9999 / (11) 3333-4444. Cai no valor
 *  cru se não reconhecer o formato (não some com número estrangeiro/ramal). */
export function formatarTelefone(v: string | null | undefined): string {
  const d = String(v ?? "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return String(v ?? "").trim();
}

/** Link do WhatsApp a partir de um telefone BR (assume DDI 55). Null se não der
 *  para montar (curto demais). Serve o "menos digitação": clicar e já falar. */
export function linkWhatsApp(v: string | null | undefined): string | null {
  const d = String(v ?? "").replace(/\D/g, "");
  if (d.length < 10) return null;
  const comDDI = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${comDDI}`;
}

/** Data e hora no fuso de Brasília (dd/mm/aaaa hh:mm). */
export function formatarDataHoraSP(iso: string | number | Date): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
