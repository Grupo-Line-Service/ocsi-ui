"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { IndicadorNavegacao } from "./indicador-navegacao";
import { MenuLateral, type ItemMenu } from "./menu-lateral";

/**
 * MOLDURA DO PAINEL — cabeçalho full-width + menu lateral + área de conteúdo.
 * É o mesmo esqueleto nos três produtos do grupo; quem muda é o conteúdo.
 *
 * Comportamento (padrão do grupo, 05/08/2026): no desktop a JANELA não rola —
 * cabeçalho e menu ficam sempre à mão, e só o `.painel-main` tem scroll. No
 * mobile o menu vira gaveta. As classes vêm de `@ocsi/ui/css/shell.css`.
 *
 * 🔴 É APRESENTAÇÃO, e só. Quem descobre usuário, organização, módulo e
 * permissão é o layout SERVIDOR do produto — a decisão de acesso não pode
 * depender do navegador, e regra de negócio não mora em pacote público.
 *
 * Os dois `slot` existem porque cada produto tem os seus: o SaaS põe a central
 * de avisos em `acoes` e o menu da conta em `conta`; o OmniVis, por enquanto, só
 * a conta. O núcleo não decide o que entra ali.
 */
export function MolduraPainel({
  organizacaoNome,
  produtoNome,
  logoUrl,
  menu,
  modoSubmenu,
  larguraMenu,
  rodapeSubmenu,
  acoes,
  conta,
  children,
}: {
  organizacaoNome: string;
  /** O nome do produto, embaixo do nome da empresa ("SaaS Gestão", "OmniVis"). */
  produtoNome?: string;
  logoUrl?: string | null;
  menu: ItemMenu[];
  /** "trilho" = menu grande (SaaS); "acordeao" = menu curto (padrão). */
  modoSubmenu?: "acordeao" | "trilho";
  larguraMenu?: number;
  /** Pé do submenu aberto — slot do produto (assinatura, versão). */
  rodapeSubmenu?: ReactNode;
  acoes?: ReactNode;
  conta?: ReactNode;
  children: ReactNode;
}) {
  const [gaveta, setGaveta] = useState(false);
  const pathname = usePathname();
  const main = useRef<HTMLElement>(null);

  // Trocou de tela: fecha a gaveta e volta o scroll ao topo. Sem isto, a tela
  // nova abre no meio — o scroller é o <main>, não a janela.
  useEffect(() => {
    setGaveta(false);
    // Os DOIS eixos: a planilha rolada para a direita deixava a tela nova
    // começando no meio quando só o topo era reposto.
    main.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  // Contador de telas visitadas nesta aba: é o que permite ao botão Voltar
  // saber se existe passo anterior DENTRO do app (ver `react-next/voltar`).
  useEffect(() => {
    try {
      const n = Number(sessionStorage.getItem("telas-visitadas") ?? "0");
      sessionStorage.setItem("telas-visitadas", String(n + 1));
    } catch {
      /* navegador sem sessionStorage: o Voltar cai no href fixo */
    }
  }, [pathname]);

  const inicial = (organizacaoNome || produtoNome || "O").trim().charAt(0).toUpperCase() || "O";

  return (
    <div className="painel-root">
      {/* Sinal de que o clique foi recebido enquanto a próxima tela é montada
          no servidor. Suspense porque o indicador lê os parâmetros da URL. */}
      <Suspense fallback={null}>
        <IndicadorNavegacao />
      </Suspense>

      <header className="painel-header">
        <div className="painel-header-left">
          <button className="painel-hamburger" onClick={() => setGaveta(true)} aria-label="Abrir menu">
            ☰
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={organizacaoNome}
                style={{ height: 34, width: "auto", maxWidth: 150, objectFit: "contain", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "var(--accent-contrast)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}
              >
                {inicial}
              </div>
            )}
            <div className="painel-marca" style={{ lineHeight: 1.15 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{organizacaoNome}</div>
              {produtoNome && <div className="muted" style={{ fontSize: 11 }}>{produtoNome}</div>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {acoes}
          {conta}
        </div>
      </header>

      <div className="painel-body">
        <MenuLateral
          itens={menu}
          aberta={gaveta}
          modoSubmenu={modoSubmenu}
          largura={larguraMenu}
          rodapeSubmenu={rodapeSubmenu}
          aoNavegar={() => setGaveta(false)}
        />
        {gaveta && <div className="painel-overlay" onClick={() => setGaveta(false)} />}
        <main className="painel-main" ref={main}>
          {children}
        </main>
      </div>
    </div>
  );
}

export type { ItemMenu };
