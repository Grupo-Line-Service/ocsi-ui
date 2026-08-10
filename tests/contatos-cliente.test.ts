import { describe, expect, it } from "vitest";
import { formatarContato, lerContatos, normalizarContatos, valoresDeContato } from "../lib/contatos-cliente";

/**
 * O que estes testes protegem: os cadastros JÁ GRAVADOS guardam array de
 * string. Se a leitura passar a exigir objeto, todo cliente antigo aparece sem
 * e-mail e sem telefone na ficha — e o `cobranca_email` (que faz `[0]`) vira
 * um objeto onde o envio espera texto, quebrando a cobrança em silêncio.
 */
describe("contatos do cliente", () => {
  it("lê o formato ANTIGO (array de string)", () => {
    expect(lerContatos(["financeiro@x.com", "vendas@x.com"])).toEqual([
      { valor: "financeiro@x.com", apelido: "" },
      { valor: "vendas@x.com", apelido: "" },
    ]);
  });

  it("lê o formato NOVO (com apelido)", () => {
    expect(lerContatos([{ valor: "financeiro@x.com", apelido: "Financeiro" }])).toEqual([
      { valor: "financeiro@x.com", apelido: "Financeiro" },
    ]);
  });

  it("lê listas MISTAS — cadastro antigo editado só em parte", () => {
    expect(lerContatos(["antigo@x.com", { valor: "novo@x.com", apelido: "João" }])).toEqual([
      { valor: "antigo@x.com", apelido: "" },
      { valor: "novo@x.com", apelido: "João" },
    ]);
  });

  it("descarta lixo sem derrubar o resto", () => {
    expect(lerContatos(["ok@x.com", null, 42, {}, { apelido: "sem valor" }])).toEqual([
      { valor: "ok@x.com", apelido: "" },
    ]);
    expect(lerContatos(null)).toEqual([]);
    expect(lerContatos("nem é lista")).toEqual([]);
  });

  it("valoresDeContato devolve STRING nos dois formatos (guarda do cobranca_email)", () => {
    expect(valoresDeContato(["a@x.com"])[0]).toBe("a@x.com");
    expect(valoresDeContato([{ valor: "b@x.com", apelido: "Financeiro" }])[0]).toBe("b@x.com");
    expect(typeof valoresDeContato([{ valor: "b@x.com", apelido: "Financeiro" }])[0]).toBe("string");
  });

  it("normaliza aparando espaços e removendo linha vazia", () => {
    expect(normalizarContatos([
      { valor: "  a@x.com  ", apelido: "  Financeiro  " },
      { valor: "   ", apelido: "linha em branco" },
    ])).toEqual([{ valor: "a@x.com", apelido: "Financeiro" }]);
  });

  it("formata com e sem apelido", () => {
    expect(formatarContato({ valor: "a@x.com", apelido: "Financeiro" })).toBe("a@x.com (Financeiro)");
    expect(formatarContato({ valor: "a@x.com", apelido: "" })).toBe("a@x.com");
  });
});
