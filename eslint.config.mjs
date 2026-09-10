import { FlatCompat } from "@eslint/eslintrc";

/**
 * Lint do nucleo — e por que ele so nasceu em 10/09/2026.
 *
 * Este pacote nunca teve lint. Tinha `typecheck` e `test`, e nenhum dos dois era
 * chamado por ninguem: o repositorio tambem nao tinha CI. Ele e PUBLICO e
 * alimenta cinco produtos, entao um defeito daqui nasce cinco vezes
 * ([[regra-dez-copias-identicas-fazem-a-decima-primeira]]).
 *
 * ⚠️ A VERSAO do eslint-config-next e escolha medida, nao copia:
 *
 *   - o `next` das devDependencies aqui e o **14**, e o
 *     `eslint-config-next@14` NAO suporta ESLint 9 -- ele pede
 *     `eslint@^7.23.0 || ^8.0.0`, e o npm recusa a instalacao. Forcar com
 *     `--legacy-peer-deps` daria a arvore que o proprio npm chama de
 *     "incorrect and potentially broken": e assim que se fabrica portao verde
 *     e cego;
 *   - o **15** instala limpo sob ESLint 9 e e a versao que os produtos
 *     consumidores usam. Como o `peerDependencies` daqui e `next >=14`, lintar
 *     com as regras do 15 aproxima o codigo de quem de fato o executa.
 *
 * O FlatCompat e obrigatorio no 15 (o flat nativo so aparece no 16) e funciona.
 */
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**"],
  },
  {
    rules: {
      // Aqui nao existe `pages/` nem `app/`: isto e uma BIBLIOTECA, nao um
      // aplicativo. Com a regra ligada, todo `npx eslint .` imprime
      // "Pages directory cannot be found" -- um recado que ninguem pode
      // atender, em toda execucao. Aviso que nao tem acao ensina a ignorar a
      // saida do portao.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
