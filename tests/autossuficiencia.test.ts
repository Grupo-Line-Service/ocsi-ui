import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AUTOSSUFICIÊNCIA — peça de núcleo não pode depender de o produto lembrar de
 * fazer alguma coisa.
 *
 * ⚠️ LIÇÃO PAGA EM 11/08/2026, e é a razão deste arquivo existir.
 *
 * O `Voltar` decidia se havia tela anterior lendo `sessionStorage` na chave
 * `telas-visitadas`. Quem ESCREVE essa chave é o AppShell — que ficou no
 * produto. O pacote levou o leitor e deixou o escritor para trás.
 *
 * Resultado: no SaaS funcionava (o AppShell de lá escreve), e no RG Ambiental,
 * que instalou o mesmo pacote, o contador nunca existiu — a seta caía sempre no
 * destino fixo. Editando um cliente, "Voltar" levava para a LISTA em vez de
 * voltar para a ficha. O dono relatou como "fizemos a migração para não ter
 * retrabalho, mas não adiantou, continua diferente lá".
 *
 * O pacote parecia certo: compilava, tinha teste de contrato visual, e a classe
 * estava lá. A dependência invisível não aparece em nenhuma dessas provas.
 *
 * REGRA: se o pacote LÊ uma chave de armazenamento, o pacote ESCREVE essa
 * chave — ou ela está declarada aqui embaixo como reserva opcional, com
 * justificativa. Um leitor órfão volta a produzir um bug que só aparece no
 * produto que ninguém abriu.
 */

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Chaves que o pacote lê SEM escrever, de propósito. Cada uma precisa continuar
 * sendo apenas RESERVA: se ela sumir, o componente ainda decide certo sozinho.
 */
const RESERVAS_PERMITIDAS: Record<string, string> = {
  // (vazio de propósito — ver abaixo)
};

/*
 * 16/09/2026 — O ESCRITOR VOLTOU PARA CASA.
 *
 * `telas-visitadas` era a reserva citada acima: o pacote LIA (no `Voltar`) e
 * quem ESCREVIA era o AppShell, que morava em cada produto. Com a
 * `MolduraPainel` publicada no núcleo (v0.8.0), o pacote escreve e lê a mesma
 * chave — a dependência invisível acabou, e por isso a lista de reservas ficou
 * VAZIA. Ela continua aqui para a próxima reserva ter onde ser justificada.
 */

/** Todos os .ts/.tsx publicados como código do pacote. */
function fontes(dir: string, achados: string[] = []): string[] {
  for (const nome of readdirSync(join(raiz, dir))) {
    const rel = join(dir, nome);
    if (statSync(join(raiz, rel)).isDirectory()) fontes(rel, achados);
    else if (/\.tsx?$/.test(nome)) achados.push(rel);
  }
  return achados;
}

const ARQUIVOS = ["lib", "react", "react-next"].flatMap((d) => fontes(d));

/** Remove comentários para não acusar chave citada em explicação. */
function semComentarios(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

const CODIGO = ARQUIVOS.map((a) => ({ arquivo: a, src: semComentarios(readFileSync(join(raiz, a), "utf8")) }));

/** `sessionStorage.getItem("x")` / `localStorage.getItem('x')` → ["x"] */
function chaves(src: string, metodo: "getItem" | "setItem"): string[] {
  const re = new RegExp(`(?:session|local)Storage\\.${metodo}\\(\\s*["'\`]([^"'\`]+)["'\`]`, "g");
  return [...src.matchAll(re)].map((m) => m[1]);
}

describe("autossuficiência do núcleo", () => {
  it("achou os arquivos do pacote (a varredura não pode passar vazia)", () => {
    expect(ARQUIVOS.length).toBeGreaterThan(3);
  });

  it("não lê chave de armazenamento que o próprio pacote não escreve", () => {
    const escritas = new Set(CODIGO.flatMap((c) => chaves(c.src, "setItem")));
    const orfas: string[] = [];

    for (const { arquivo, src } of CODIGO) {
      for (const chave of chaves(src, "getItem")) {
        if (escritas.has(chave)) continue;
        if (chave in RESERVAS_PERMITIDAS) continue;
        orfas.push(`${relative(".", arquivo)} lê "${chave}", que ninguém no pacote escreve`);
      }
    }

    expect(
      orfas,
      "Leitor órfão: o produto teria de escrever essa chave para o componente " +
        "funcionar — e o produto que esquecer ganha um bug silencioso. " +
        "Escreva a chave aqui dentro, ou declare-a em RESERVAS_PERMITIDAS " +
        "explicando qual é a fonte primária que funciona sem ela.",
    ).toEqual([]);
  });

  it("o Voltar decide por conta própria, sem depender do AppShell do produto", () => {
    const src = readFileSync(join(raiz, "react-next/voltar.tsx"), "utf8");
    // A prova concreta da lição: a fonte primária é do App Router.
    expect(src).toContain("history.state");
  });

  it("toda pasta de código publicada está declarada em files[]", () => {
    const pkg = JSON.parse(readFileSync(join(raiz, "package.json"), "utf8")) as { files: string[] };
    // react-next ficou de fora de files[] na v0.3.0 — o import só não quebrou
    // porque a instalação é por tarball do repositório inteiro.
    for (const pasta of ["lib", "react", "react-next", "css", "temas"]) {
      expect(pkg.files, `"${pasta}" precisa estar em files[] do package.json`).toContain(pasta);
    }
  });
});

/*
 * A MOLDURA É DO NÚCLEO (v0.8.0) — guardas do contrato que ela trouxe.
 */
describe("moldura do painel", () => {
  const moldura = readFileSync(join(raiz, "react-next/moldura-painel.tsx"), "utf8");
  const menu = readFileSync(join(raiz, "react-next/menu-lateral.tsx"), "utf8");

  it("a moldura ESCREVE a chave que o Voltar lê — nenhum produto precisa lembrar", () => {
    expect(chaves(semComentarios(moldura), "setItem")).toContain("telas-visitadas");
  });

  it("todo arquivo de react-next é importável (está em exports)", () => {
    const pkg = JSON.parse(readFileSync(join(raiz, "package.json"), "utf8")) as { exports: Record<string, string> };
    const publicados = new Set(Object.values(pkg.exports));
    for (const arquivo of fontes("react-next")) {
      const caminho = "./" + arquivo.split("\\").join("/");
      expect(publicados.has(caminho), `${caminho} não está em exports — ninguém consegue importar`).toBe(true);
    }
  });

  it("o menu não decide permissão: os itens chegam por prop", () => {
    // Regra pública × privada: pacote público não sabe o que é módulo, cargo
    // nem organização. Se um dia souber, vazou regra de negócio para cá.
    for (const proibido of ["organizacao", "modulo", "cargo", "permissao", "admin"]) {
      expect(semComentarios(menu).toLowerCase()).not.toContain(proibido);
    }
  });
});
