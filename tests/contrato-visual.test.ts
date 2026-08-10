import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * GABARITO AUTOMATIZADO do pacote.
 *
 * A regra que sustenta tudo: `base.css` e `shell.css` carregam a ESTRUTURA, os
 * temas carregam a COR. Uma cor literal escapando para dentro do base congela a
 * marca — o RG passaria a ter um pedaço de laranja OCSI que ninguém consegue
 * trocar, e o pacote perderia o motivo de existir.
 *
 * Isso não se garante com boa vontade em revisão de código: um `#fff` entra
 * fácil no meio de 200 linhas. Aqui quebra o teste.
 */

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (p: string) => readFileSync(join(raiz, p), "utf8");

/** Remove comentários /* … *​/ para não acusar cor citada em explicação. */
function semComentarios(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Cores neutras liberadas: preto e branco puros em SOMBRA e overlay não são
 * marca — são profundidade. O gabarito do SaaS já os usa assim
 * (`box-shadow: 0 8px 20px rgba(0,0,0,.07)`).
 */
const NEUTRAS_OK = /^(rgba?\(\s*(0\s*,\s*0\s*,\s*0|255\s*,\s*255\s*,\s*255)\s*[,)]|#fff(f{3})?$|#000(0{3})?$)/i;

describe("contrato visual", () => {
  for (const arquivo of ["css/base.css", "css/shell.css"]) {
    it(`${arquivo} não crava cor de marca (só var(--token))`, () => {
      const css = semComentarios(ler(arquivo));

      const hex = css.match(/#[0-9a-f]{3,8}\b/gi) ?? [];
      const funcoes = css.match(/\b(?:rgba?|hsla?)\([^)]*\)/gi) ?? [];

      const proibidas = [...hex, ...funcoes].filter((c) => !NEUTRAS_OK.test(c));

      expect(proibidas, `cor literal em ${arquivo}: ${proibidas.join(", ")} — use var(--token)`).toEqual([]);
    });
  }

  it("todo token usado no base/shell existe no contrato (tokens.css)", () => {
    const tokens = new Set(
      [...ler("css/tokens.css").matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]),
    );

    const usados = new Set(
      ["css/base.css", "css/shell.css"]
        .flatMap((f) => [...semComentarios(ler(f)).matchAll(/var\(\s*(--[a-z0-9-]+)/gi)])
        .map((m) => m[1]),
    );

    const orfaos = [...usados].filter((t) => !tokens.has(t));

    expect(orfaos, `token sem definição no contrato: ${orfaos.join(", ")}`).toEqual([]);
  });

  it("todo tema cobre o contrato inteiro (nenhum produto fica com buraco)", () => {
    const doContrato = [...ler("css/tokens.css").matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]);

    for (const tema of ["temas/saas.css", "temas/rg.css"]) {
      const definidos = new Set(
        [...ler(tema).matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]),
      );
      const faltando = doContrato.filter((t) => !definidos.has(t));

      expect(faltando, `${tema} não define: ${faltando.join(", ")}`).toEqual([]);
    }
  });
});
