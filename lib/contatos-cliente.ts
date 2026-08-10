/**
 * CONTATOS DO CLIENTE — e-mail/telefone com DONO identificado.
 *
 * Pedido do dono (10/08/2026): "campo para poder escrever de quem é aquele
 * e-mail ou telefone". Uma lista de `financeiro@`, `contato@` e três celulares
 * sem nome não diz para quem ligar quando o boleto vence.
 *
 * ⚠️ COMPATIBILIDADE: os cadastros antigos guardam ARRAY DE STRING
 * (`["a@b.com"]`), o novo guarda objeto (`[{valor, apelido}]`). A leitura
 * aceita os dois e nunca perde o que já estava lá — nenhuma migração de dados
 * é necessária, e um cadastro antigo continua funcionando até alguém editá-lo.
 */

export type ContatoItem = { valor: string; apelido: string };

/** Lê a coluna jsonb tolerando o formato legado (string pura) e o novo (objeto). */
export function lerContatos(valor: unknown): ContatoItem[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item): ContatoItem => {
      if (typeof item === "string") return { valor: item.trim(), apelido: "" };
      if (item && typeof item === "object") {
        const o = item as { valor?: unknown; apelido?: unknown };
        return {
          valor: typeof o.valor === "string" ? o.valor.trim() : "",
          apelido: typeof o.apelido === "string" ? o.apelido.trim() : "",
        };
      }
      return { valor: "", apelido: "" };
    })
    .filter((c) => c.valor.length > 0);
}

/**
 * Só os valores — para quem precisa do endereço/número cru (o `cobranca_email`
 * do cliente, envio de e-mail, exportação). Existe para que ninguém volte a
 * fazer `emails[0]` direto no jsonb: depois do apelido, isso devolveria um
 * OBJETO onde o código espera uma string.
 */
export function valoresDeContato(valor: unknown): string[] {
  return lerContatos(valor).map((c) => c.valor);
}

/** Descarta linhas vazias antes de gravar; sem apelido, grava só o valor. */
export function normalizarContatos(itens: ContatoItem[]): ContatoItem[] {
  return itens
    .map((c) => ({ valor: c.valor.trim(), apelido: c.apelido.trim() }))
    .filter((c) => c.valor.length > 0);
}

/** "financeiro@x.com (Financeiro)" — ou só o valor, quando não tem apelido. */
export function formatarContato(c: ContatoItem): string {
  return c.apelido ? `${c.valor} (${c.apelido})` : c.valor;
}
