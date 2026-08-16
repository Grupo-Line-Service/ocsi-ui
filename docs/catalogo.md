# Catálogo do núcleo — o que JÁ existe pronto

**Leia antes de escrever qualquer tela.** Este documento existe para responder
*"o que é que tem no SaaS?"* sem ninguém precisar perguntar — e para acabar com
o retrabalho de reimplementar algo que já está feito e testado.

> *"não quero ficar perdendo tempo falando pra ele: olha, no SaaS tem o botão
> buscar CNPJ, tem buscar CPF"* — dono, 10/08/2026

Se o que você precisa está aqui, **importe**. Não copie e não reescreva com
outro nome — foi assim que o RG acabou com `.card2`, `.in`, `.muted2` e
`.fc-campo-edit` fazendo o mesmo que `.card`, `.input`, `.muted` e
`.campo-editavel`.

---

## Cadastro de cliente / fornecedor

| Preciso de… | Use | Onde |
|---|---|---|
| **Buscar dados por CNPJ** (razão social, fantasia, endereço, CNAE, sócios, porte) | `buscarCnpj(cnpj)` | `lib/cnpj-lookup` |
| **Buscar endereço por CEP** | `buscarCep(cep)` | `lib/cnpj-lookup` |
| **E-mail/telefone com dono identificado** ("Financeiro", "Portaria") | `lerContatos`, `normalizarContatos`, `formatarContato` | `lib/contatos-cliente` |
| **Só os endereços/números, sem apelido** (envio, exportação, cobrança) | `valoresDeContato(jsonb)` | `lib/contatos-cliente` |

Os dois provedores de CNPJ têm **fallback automático** (BrasilAPI → CNPJá) e os
de CEP também (BrasilAPI → ViaCEP). Nenhum exige chave.

⚠️ **Nunca faça `emails[0]` direto na coluna jsonb.** Desde que o contato ganhou
apelido, isso devolve um OBJETO onde o código espera texto — e o envio quebra em
silêncio, sem erro na tela. Use `valoresDeContato()`; ela existe exatamente para
isso.

## Dinheiro e datas

| Preciso de… | Use | Onde |
|---|---|---|
| **Formatar em reais** (R$ 1.234,56) | `formatarValor(n)` | `lib/formato` |
| **Ler valor digitado** ("1.234,56", "1234.56", "R$ 12") | `parseValor(txt)` | `lib/formato` |
| **Data ISO → DD/MM/AAAA** | `formatarData(iso)` | `lib/formato` |
| **Hoje (Brasília)** | `hojeSP()` | `lib/formato` |
| **Data de um instante (Brasília)** | `dataSP(x)` | `lib/formato` |
| **Somar meses a "AAAA-MM"** | `somarMeses(mes, n)` | `lib/formato` |
| **"2026-08" → "Agosto de 2026"** | `rotuloMesAno(mes)` | `lib/formato` |
| **Telefone BR formatado** | `formatarTelefone(v)` | `lib/formato` |
| **Link de WhatsApp** | `linkWhatsApp(v)` | `lib/formato` |

⚠️ **Nunca use `toISOString()` para "hoje".** A Vercel roda em UTC: depois das
21h de Brasília o "hoje" do servidor já é amanhã. Foi assim que MTRs do RG
"sumiram" da tela à noite. Use `hojeSP()`.

## Telas

| Preciso de… | Use | Onde |
|---|---|---|
| **Voltar para a tela anterior** (não para um destino fixo) | `<Voltar href rotulo />` | `react/voltar` |
| **Cabeçalho de tabela no padrão extrato** | `cabecalhoPadrao`, `thPadrao` | `react/tabela-padrao` |
| **Zebra na cor da marca** | `linhaZebra(i)` | `react/tabela-padrao` |

## Classes CSS

| Preciso de… | Classe |
|---|---|
| Botão de ação (42px) | `.btn` |
| Botão principal (gradiente da marca) | `.btn btn-primary` |
| Ação secundária dentro de um bloco (34px) | `.btn btn-chip` |
| Botão só ícone (círculo) | `.btn btn-icone` |
| Barra do Salvar (linha + respiro) | `.barra-acao` |
| Cartão | `.card` (`<a class="card">`/`<button class="card">` levantam no hover) |
| Clicável | `.clicavel` — QUALQUER elemento clicável (tile, linha, chip solto) ganha hover/foco na cor da marca; `.clicavel-plano` só muda o fundo (linhas de tabela/menu). Regra: se clica, avisa. |
| Campo de formulário | `.input` |
| Texto secundário | `.muted` |
| Abas + busca na mesma linha | `.barra-filtros`, `-chips`, `-busca` |
| Clicar no valor para editar | `.campo-editavel` |
| Clicar no título para editar | `.titulo-editavel` |
| Cortar texto longo em tabela | `.texto-truncado` |
| KPI clicável | `.tile-kpi` |
| Moldura de topo da página | `.cabecalho-pagina` |
| Moldura do sistema | `.painel-root`, `-header`, `-body`, `-main` |
| Item de menu lateral | `.sb-item`, `.sb-ativo` |

---

## Ainda NÃO está aqui

Existe no SaaS, mas depende de dados e por isso não entrou no pacote. Para usar
no RG hoje, copie do `saas-gestao` **e avise** — quando for desacoplado em
apresentação × dados, vira item deste catálogo:

- `BuscaViva` — busca que filtra enquanto digita
- `FiltroMes` — navegação por período (‹ Agosto de 2026 ›)
- `SeletorBusca` — escolher cliente/produto com busca
- `CabecalhoPagina` — título + descrição + ações (o CSS já está aqui)
- `AppShell`, `AccountMenu`, `CentralAvisos` — importam Supabase e actions
