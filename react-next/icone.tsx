import type { ReactNode } from "react";

/**
 * ÍCONE DO NÚCLEO — o traço que todos os produtos usam.
 *
 * Contrato: SVG de 20px em `currentColor`, traço 1.8, cantos redondos. Herdar a
 * cor é o ponto: o mesmo ícone serve no item comum e no item ativo (que sai no
 * gradiente da marca do inquilino), sem nenhuma cor escrita aqui.
 *
 * ⚠️ **Não use emoji em menu.** Emoji tem cor própria, desenho diferente em cada
 * sistema operacional e não obedece à linha do texto — dois produtos do grupo
 * lado a lado parecem produtos de empresas diferentes. Foi o que aconteceu no
 * OmniVis em 16/09/2026, e o dono viu na hora.
 *
 * Ícone de DOMÍNIO (câmera, veículo, totem, nota fiscal) mora no produto; aqui
 * ficam só os que qualquer produto tem.
 */
export function Icone({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const IC_INICIO = (
  <Icone>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.8V20h14V9.8" />
  </Icone>
);

export const IC_RELATORIOS = (
  <Icone>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Icone>
);

export const IC_PESSOAS = (
  <Icone>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19.5a5.5 5.5 0 0 0-2.2-4.4" />
  </Icone>
);

export const IC_CONFIGURACOES = (
  <Icone>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
  </Icone>
);

export const IC_AVISOS = (
  <Icone>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" />
    <path d="M13.7 19a2 2 0 0 1-3.4 0" />
  </Icone>
);
