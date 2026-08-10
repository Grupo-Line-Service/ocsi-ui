# @ocsi/ui — núcleo compartilhado dos produtos OCSI

**Mudou aqui, mudou em todos.** Este pacote existe para acabar com um trabalho
que era feito duas vezes: toda melhoria no SaaS Gestão precisava ser refeita à
mão no RG Ambiental, e alguém tinha que lembrar de avisar.

> *"cansa ficar aqui e quando vou lá fazer exatamente o que fiz aqui"*
> — dono, 10/08/2026

## A ideia em uma frase

O pacote carrega a **estrutura** (medidas, nomes, comportamento); cada produto
carrega a **sua cor**. O botão do SaaS e o do RG são o mesmo botão — um sai
laranja, o outro verde.

```
@ocsi/ui/css/base.css   →  .btn { min-height: 42px; background: var(--accent) }
                                                                    ▲
temas/saas.css          →  --accent: #c2691c   (laranja OCSI) ──────┤
temas/rg.css            →  --accent: #16a34a   (verde RG)     ──────┘
```

## Como usar

```bash
npm install "https://github.com/Grupo-Line-Service/ocsi-ui/archive/refs/heads/main.tar.gz"
```

⚠️ **Instale pelo TARBALL, não pelo atalho `github:`.** O npm normaliza
`github:owner/repo` para `git+ssh://git@github.com/...` no lockfile — e a
Vercel não tem chave SSH do GitHub, então o build quebra no deploy mesmo com o
repositório sendo público. O tarball baixa por HTTPS puro, sem git e sem
credencial, e ainda grava um hash de integridade no lock.

**Para atualizar** um produto depois de mudar o pacote:

```bash
npm update @ocsi/ui
```

O hash no lockfile fixa a versão de propósito: a mudança chega quando o produto
pede, não no meio de um deploy que era sobre outra coisa.

No `app/globals.css` do produto, **nesta ordem** (o tema precisa vir depois do
contrato para poder sobrescrevê-lo):

```css
@import "@ocsi/ui/css/tokens.css";   /* nomes + fallback neutro  */
@import "@ocsi/ui/temas/saas.css";   /* ou temas/rg.css          */
@import "@ocsi/ui/css/base.css";     /* botão, card, input…      */
@import "@ocsi/ui/css/shell.css";    /* header, sidebar, main    */
```

No código:

```ts
import { lerContatos, valoresDeContato } from "@ocsi/ui/lib/contatos-cliente";
import { formatarValor, hojeSP } from "@ocsi/ui/lib/formato";
import { Voltar } from "@ocsi/ui/react/voltar";
```

## O que tem aqui

Ver **[docs/catalogo.md](docs/catalogo.md)** — a lista do que já está pronto.
Consulte antes de escrever qualquer componente de tela: a chance de já existir
é alta, e reimplementar é justamente o problema que este pacote resolve.

| Pasta | O que é |
|---|---|
| `css/tokens.css` | O contrato: os NOMES das variáveis + fallback neutro |
| `css/base.css` | Botão, card, input, barra de filtros, KPI, truncagem |
| `css/shell.css` | Header, sidebar, área de conteúdo, cabeçalho de página |
| `temas/` | Os VALORES de cada marca (`saas.css`, `rg.css`) |
| `lib/` | Utilitários puros: contatos, CNPJ/CEP, moeda e datas |
| `react/` | Componentes sem acoplamento a dados (`Voltar`, tabela) |

## Regras

1. **Nada de cor literal** em `css/base.css` ou `css/shell.css` — só
   `var(--token)`. Cor cravada congela a marca e quebra o propósito do pacote.
2. **Nada de negócio, banco ou credencial.** O repositório é público. Entra o
   que é forma e utilidade genérica; não entra regra de negócio, tipo de tabela
   nem chamada a Supabase.
3. **Sem API exclusiva do React 19** (`useActionState`, `use()`). O RG ainda
   está no React 18 e precisa consumir o mesmo pacote — por isso
   `peerDependencies` aceita `react >= 18`.
4. **Componente que busca dado não entra.** Só entra o que é apresentação pura.
   `app-shell`, `account-menu` e `central-avisos` ficaram de fora porque cada um
   importa o Supabase e as actions do seu produto.
5. **Mudou aqui? Vale para os dois.** Antes de alterar uma medida, lembre que
   ela vai aparecer no SaaS e no RG no próximo deploy.

## Produto novo? Comece pelo starter

Não instale este pacote na mão num projeto em branco: use
**[ocsi-starter](https://github.com/Grupo-Line-Service/ocsi-starter)**
("Use this template"). Ele já vem com o núcleo instalado, white-label,
autenticação, isolamento no banco e CI.

## Quem usa

| Produto | Tema | Situação |
|---|---|---|
| [saas-gestao](https://github.com/Grupo-Line-Service/saas-gestao) | `temas/saas.css` | adotando (Fase 2) |
| [rg-ambiental](https://github.com/Grupo-Line-Service/rg-ambiental) | `temas/rg.css` | previsto (Fases 3-4) |

Omnivis, App OCSI e os sites entram depois que estes dois estabilizarem.
