"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * BARRA DE CARREGAMENTO ENTRE TELAS.
 *
 * Pedido do dono (10/08/2026): *"às vezes demora uns segundos para trocar de
 * tela ou carregar um filtro"*. No App Router a navegação é resolvida no
 * servidor: entre o clique e a tela nova, **nada acontece na interface**. O
 * usuário não sabe se o sistema recebeu o clique — e clica de novo.
 *
 * Como funciona: escuta o clique em qualquer link interno (fase de captura, para
 * pegar antes do roteador) e acende a barra; quando a rota realmente muda, apaga.
 * Sem dependência externa e sem depender de API de roteador que muda de versão.
 *
 * Uso — uma vez só, dentro do shell autenticado:
 *
 *     import { IndicadorNavegacao } from "@ocsi/ui/react-next/indicador-navegacao";
 *     <IndicadorNavegacao />
 *
 * Precisa estar dentro de <Suspense> (usa useSearchParams). O shell do painel
 * já é client component, então o lugar natural é ali.
 */
export function IndicadorNavegacao({ atrasoMs = 140 }: { atrasoMs?: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visivel, setVisivel] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chegou na tela nova (rota ou filtro da URL mudou) → apaga.
  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setVisivel(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      // Ignora clique com modificador, botão do meio, nova aba — nesses casos a
      // tela ATUAL não muda, e acender a barra seria mentira.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const alvo = (e.target as HTMLElement | null)?.closest?.("a");
      if (!alvo) return;

      const href = alvo.getAttribute("href");
      if (!href || href.startsWith("#") || alvo.target === "_blank" || alvo.hasAttribute("download")) return;

      // Só navegação interna: link externo abre outra página, não esta.
      const destino = new URL(alvo.href, window.location.href);
      if (destino.origin !== window.location.origin) return;

      // Mesma URL = nada vai mudar; barra acesa sem fim confunde mais que ajuda.
      if (destino.pathname === window.location.pathname && destino.search === window.location.search) return;

      // Atraso curto: navegação instantânea (rota já em cache) não deve piscar
      // a barra na cara do usuário. Só aparece quando a espera é real.
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisivel(true), atrasoMs);
    }

    document.addEventListener("click", aoClicar, true);
    return () => {
      document.removeEventListener("click", aoClicar, true);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [atrasoMs]);

  if (!visivel) return null;
  return <div className="barra-carregando" role="status" aria-label="Carregando" />;
}
