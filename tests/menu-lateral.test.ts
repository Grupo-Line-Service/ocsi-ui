import { describe, expect, it } from "vitest";
import { estaDentro, maisEspecifico, secaoDaRota, type ItemMenu } from "../react-next/menu-lateral";

/**
 * AS REGRAS QUE O SAAS PAGOU PARA DESCOBRIR (absorvidas no núcleo em 16/09/2026).
 * Elas são puras de propósito: dá para provar sem montar React, e é aqui que a
 * próxima cópia de menu vai bater se tentar reinventar.
 */

const MENU: ItemMenu[] = [
  { rotulo: "Início", href: "/painel" },
  { rotulo: "Clientes", href: "/painel/clientes" },
  {
    rotulo: "Serviços",
    prefixo: "/painel/servicos",
    grupos: [
      { titulo: "Cadastros", itens: [{ rotulo: "Clientes", href: "/painel/servicos/clientes" }] },
      { titulo: "Atendimento", itens: [
        { rotulo: "Atendimento", href: "/painel/atendimento" },
        { rotulo: "Atendimentos", href: "/painel/atendimento/lista" },
      ] },
    ],
  },
  { rotulo: "Financeiro", itens: [{ rotulo: "A pagar", href: "/painel/financeiro/pagar" }] },
  { rotulo: "Reportar", noRodape: true },
];

describe("menu lateral — as regras de acender e abrir", () => {
  it("🔴 link direto do menu principal VENCE a seção que tem um item parecido dentro", () => {
    // /painel/clientes é item do topo E existe 'Clientes' dentro de Serviços.
    // Sem a prioridade, o menu abriria Serviços sozinho e o usuário se perderia.
    expect(secaoDaRota("/painel/clientes", MENU)).toBe(null);
    expect(secaoDaRota("/painel/servicos/clientes", MENU)).toBe("Serviços");
  });

  it("🔴 acende o filho de href MAIS LONGO (o defeito de 28/08 no SaaS)", () => {
    const servicos = MENU[2];
    const dentro = [...(servicos.grupos ?? []).flatMap((g) => g.itens)];
    expect(maisEspecifico("/painel/atendimento/lista", dentro)).toBe("/painel/atendimento/lista");
    expect(maisEspecifico("/painel/atendimento/123", dentro)).toBe("/painel/atendimento");
    expect(maisEspecifico("/painel/outra", dentro)).toBe(null);
  });

  it("a seção segue a ROTA, e uma rota de outra seção fecha a anterior", () => {
    expect(secaoDaRota("/painel/financeiro/pagar", MENU)).toBe("Financeiro");
    // Ir para o Início fecha tudo — é o que faltava na v0.8.0, que calculava o
    // estado só na montagem e deixava a seção anterior aberta.
    expect(secaoDaRota("/painel", MENU)).toBe(null);
  });

  it("'Início' só acende na raiz — nunca em /painel/qualquer-coisa", () => {
    expect(estaDentro("/painel", MENU[0])).toBe(true);
    expect(estaDentro("/painel/clientes", MENU[0])).toBe(false);
  });

  it("item de rodapé não é seção: ele age, não navega", () => {
    expect(secaoDaRota("/painel", [MENU[4]])).toBe(null);
    expect(estaDentro("/painel", MENU[4])).toBe(false);
  });
});
