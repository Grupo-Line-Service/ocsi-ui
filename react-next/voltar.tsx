"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * VOLTAR = volta para a tela ANTERIOR, não para um destino fixo (regra do
 * dono, 07/08/2026: "estou auditando o cliente, cliquei na NFS-e e fui parar
 * no financeiro; quero clicar na seta e voltar para onde eu estava — se eu
 * quisesse ir pro financeiro, iria pelo menu").
 *
 * Como funciona: se existe passo anterior DENTRO do app (o App Router mantém
 * um índice no history state), a seta desfaz o passo — o usuário volta para a
 * tela de onde veio, seja ela qual for. Sem histórico (link aberto direto,
 * aba nova, e-mail), cai no `href` que a tela declara, que é o destino
 * natural daquela ficha. O texto é SEMPRE "Voltar" — um verbo só, um
 * comportamento só; dois "voltares" concorrentes na mesma tela (a seta e um
 * link "voltar ao resumo") foi exatamente o que confundiu o dono em 07/08.
 *
 * Visual: bola no ACCENT do tema com seta branca — o fio de volta da casa.
 */
export function Voltar({ href, rotulo }: { href: string; rotulo: string }) {
  // `rotulo` vira só o TÍTULO do link (acessibilidade e tooltip): o texto na
  // tela é sempre "Voltar" — um único verbo, um único comportamento.
  const router = useRouter();
  const [temHistorico, setTemHistorico] = useState(false);

  useEffect(() => {
    // Precisamos saber se houve navegação DENTRO do app nesta aba. Sem isso,
    // "voltar" jogaria o usuário para fora do sistema (cheguei pelo Google).
    //
    // ⚠️ LIÇÃO PAGA (11/08/2026): a v0.3.0 lia SÓ o contador `telas-visitadas`,
    // que é escrito pelo AppShell do PRODUTO. O pacote levou o LEITOR e deixou
    // o ESCRITOR para trás — no RG Ambiental o contador nunca existiu, então
    // `temHistorico` era sempre false e o Voltar caía no href fixo: editando um
    // cliente, a seta levava para a LISTA em vez de voltar para a ficha dele.
    // Peça de núcleo que depende do produto lembrar de fazer algo NÃO é peça de
    // núcleo — é armadilha. Agora a fonte primária é do próprio Next.
    //
    // 1. `history.state.idx` — o App Router numera as entradas que ELE criou
    //    nesta aba. Carreguei o app direto: idx = 0. Naveguei uma vez por
    //    dentro: idx >= 1. Não depende de nenhuma cooperação do produto.
    // 2. contador `telas-visitadas` do AppShell — mantido como reserva, para
    //    quem já o escreve e para versão de Next que mude o campo interno.
    // 3. Navigation API (Chrome/Edge) confirma que o passo existe de verdade.
    let idx = 0;
    let internas = 0;
    try {
      const estado = window.history.state as { idx?: number } | null;
      idx = typeof estado?.idx === "number" ? estado.idx : 0;
    } catch {
      idx = 0;
    }
    try {
      internas = Number(sessionStorage.getItem("telas-visitadas") ?? "0");
    } catch {
      internas = 0;
    }
    const nav = (window as { navigation?: { canGoBack?: boolean } }).navigation;
    const navegadorPermite = typeof nav?.canGoBack === "boolean" ? nav.canGoBack : true;
    setTemHistorico((idx >= 1 || internas >= 1) && navegadorPermite);
  }, []);

  const conteudo = (
    <>
      <span aria-hidden style={bola}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </span>
      Voltar
    </>
  );

  if (temHistorico) {
    return (
      <button type="button" onClick={() => router.back()} style={{ ...link, background: "none", border: "none", padding: 0, cursor: "pointer" }} title="Voltar para a tela anterior">
        {conteudo}
      </button>
    );
  }
  return (
    <Link href={href} style={link} title={`Voltar para ${rotulo}`}>
      {conteudo}
    </Link>
  );
}

const link: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 700,
  fontSize: 14,
  color: "var(--text)",
  textDecoration: "none",
};

const bola: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
  display: "inline-grid",
  placeItems: "center",
  color: "#ffffff",
  boxShadow: "0 6px 16px var(--accent-shadow)",
  flexShrink: 0,
};
