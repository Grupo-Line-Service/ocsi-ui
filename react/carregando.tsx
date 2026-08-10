/**
 * Sinais de carregamento LOCAL — quando só um pedaço da tela está esperando
 * (filtro aplicando, tabela buscando, botão enviando).
 *
 * React puro: funciona em Next e em Vite. Para a barra de navegação entre
 * telas, veja `react-next/indicador-navegacao` (essa depende do roteador).
 */

/** Ícone giratório. Herda a cor do texto — serve sobre qualquer fundo. */
export function Spinner({ grande = false, rotulo = "Carregando" }: { grande?: boolean; rotulo?: string }) {
  return <span className={grande ? "spinner spinner-lg" : "spinner"} role="status" aria-label={rotulo} />;
}

/**
 * Bloco no lugar do conteúdo enquanto ele não chega (corpo de tabela, lista).
 *
 * Prefira isto a sumir com a tela: o usuário mantém a referência de onde está.
 */
export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div className="carregando-bloco">
      <Spinner />
      <span>{texto}</span>
    </div>
  );
}
