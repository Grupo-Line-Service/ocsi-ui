# AGENTS.md — ocsi-ui

Instruções para agentes de IA neste repositório. O bloco abaixo é
gerado pelo `ocsi-framework` — não edite aqui; a próxima
sincronização sobrescreve.

<!-- OCSI:GOVERNANCA:INICIO -->
## Governança OCSI (bloco gerado — não edite aqui)

> Este trecho é sincronizado a partir de
> [`ocsi-framework/docs/governance/BLOCO_AGENTS.md`](https://github.com/Grupo-Line-Service/ocsi-framework/blob/main/docs/governance/BLOCO_AGENTS.md)
> e é **idêntico em todos os produtos**. Para mudar, edite **lá** e rode
> `node scripts/sincronizar-governanca.mjs` — a alteração chega sozinha a todos
> os repositórios. Alterar este bloco no produto será sobrescrito.

### 1. Leia a fonte da verdade ANTES, documente nela DEPOIS

> Regra do dono, 11/08/2026: *"sempre verificar a fonte da verdade antes de
> atualizar, olhar; fez, documenta — porque tem várias equipes usando, e tem que
> ser regra."*

**ANTES** de escrever código que aplica uma regra de negócio, abra a fonte e
**leia**: o Notion (negócio) e o `docs/` do repositório (técnico). Não vale
confiar na memória, e **não vale confiar no resumo da issue** — issue resumindo
documento velho já mandou construir o motor errado.

**DEPOIS** de fazer, a decisão volta para a fonte: **datada, com a frase de quem
decidiu, e dizendo o que ela REVOGA**. Registro completo = Notion + `docs/` do
repositório + Linear + o `CLAUDE.md` do produto afetado.

**Documento que contradiz a decisão nova não fica de pé.** Reescreva a seção e
marque a revogação — duas versões convivendo é pior do que não ter documento.

Custou duas vezes no mesmo dia (11/08/2026): o KPI "Faturado no mês" nasceu
somando `faturas` quando o documento oficial já dizia desde 06/08 que quem manda
no "faturei" é a **nota fiscal**; e a política comercial desatualizada fez tratar
como **defeito** uma cobrança que era **legítima** (SAAS-224).

**Várias equipes consomem os mesmos documentos. Documento desatualizado não erra
sozinho — ele multiplica o erro pelo número de times.**

Versão integral e o histórico do porquê:
[`ocsi-framework/docs/governance/AGENT_OPERATING_MODEL.md`](https://github.com/Grupo-Line-Service/ocsi-framework/blob/main/docs/governance/AGENT_OPERATING_MODEL.md).

### 1.1 Alterou um campo ou conceito? VARRA tudo que ele toca — antes do "pronto"

> Regra do dono, 12/08/2026: *"sempre que for alterar ou corrigir algo, precisa
> analisar tudo que aquele campo faz no sistema todo — alterou apenas o que eu
> pedi e não olhou pra frente o que vai acontecer ali."*

Consertar **só o ponto reportado** não é entrega — é a primeira rodada de um
pingue-pongue. Custou no mesmo dia (12/08/2026), em dois produtos: no SaaS, o
`vencimento_dia` entrou nos 3 motores de faturamento mas ninguém varreu as
telas — Revisão do wizard, ficha do contrato e projeção de vencimentos
continuaram exibindo datas da regra velha, e foram **3 reportes** do dono até a
última tela mentirosa cair; no RG Ambiental, **5 telas** repetiam o mesmo
defeito e só 1 foi corrigida.

A varredura, sem etapa opcional:

1. **`grep` pelo campo E pelos conceitos que ele governa** (ex.:
   `vencimento_dia` → também "vencimento", a âncora de parcelas, o dia padrão
   da organização) no repositório inteiro: motores, actions, telas, e-mails,
   PDFs, exports, projeções, testes.
2. **Listar cada superfície que LÊ ou EXIBE o conceito** e conferir uma a uma
   depois da mudança. Tela que mostra dado derivado da regra velha é **bug**,
   mesmo com o motor certo — para quem usa, a tela É o sistema.
3. **O que não couber no commit, listar explicitamente** ("estas superfícies
   também tocam nisso; não mexi porque…"). Omissão silenciosa é o erro; a
   lista é aceitável.
4. Vale nos dois sentidos: mudou motor → varre telas; mudou tela → confere o
   motor. E vale para **conceito de negócio** que atravessa etapas (unidade,
   quantidade, preço, frete): mexeu numa etapa da esteira, varre as demais.

### 2. Regra COPIADA não é regra DISTRIBUÍDA

O que precisa valer em todo lugar mora em **um** lugar e é **referenciado ou
gerado** — nunca duplicado à mão. Cópia congela e diverge em silêncio:

- o visual dos produtos era cópia → virou o pacote **`@ocsi/ui`**;
- a governança era cópia → virou **este bloco**, sincronizado por script;
- e em 11/08/2026 o `Voltar` do RG ainda estava quebrado porque o pacote levou
  metade do mecanismo: **peça de núcleo que depende de o produto lembrar de
  fazer algo não é peça de núcleo, é armadilha.**

Antes de criar componente, classe ou utilitário, consulte o
[catálogo do núcleo](https://github.com/Grupo-Line-Service/ocsi-ui/blob/main/docs/catalogo.md).
**Se está lá, IMPORTE; nunca recrie com outro nome.**

**O limite da distribuição** (regra do dono, 11/08/2026): a base é MODULAR —
**o núcleo vale para todos; módulo é eletivo, por cliente.** Distribuir não é
empurrar tudo para todo mundo:

| Camada | Exemplo | Chega a quem |
|---|---|---|
| Núcleo | governança, `@ocsi/ui`, esqueleto do starter | **todos**, automaticamente |
| Módulo eletivo | fiscal, frota, resíduos, VMS | **só quem ativou** (`organizacao_modulos`) |
| Sob medida | módulo construído para UM cliente | **só aquele cliente** |
| Específico do produto | telas e regras do domínio | só o próprio repositório |

Copiar peça de módulo para o núcleo "porque dois produtos usam" quebra a
cobrança (módulo é o que se vende) e obriga todo mundo a carregar o que não
comprou. Se dois produtos precisam do mesmo módulo, o caminho é o HUB — ativa-se
o módulo para o cliente, não se duplica o código.

O **sob medida** tem duas regras a mais: (1) nasce e morre atrás do gate do
cliente — generalizar para o catálogo é decisão COMERCIAL do dono, nunca
"aproveitamento" técnico; (2) por carregar negócio do cliente, **jamais**
encosta nos repositórios públicos (`ocsi-ui`, `ocsi-starter`) — nem como
exemplo, nem em teste, nem em comentário.

### 2.1 Copiar tela do gabarito — a RECEITA (obrigatória, passo a passo)

"Copiar" não é "fazer parecido". O retrabalho de 10-11/08/2026 veio de telas
*reescritas de memória ou a partir do resumo da issue* — ficavam "quase iguais"
e perdiam campo. A receita é esta, sem etapa opcional:

1. **Abrir o ARQUIVO REAL do gabarito e ler.** O gabarito é o código do
   `saas-gestao` (clone local em `C:\dev\saas-gestao`, ou o repositório no
   GitHub). Issue, memória e print **não são fonte** — são apontadores para o
   arquivo.
2. **Copiar o arquivo INTEIRO** (`cp`, não digitação). Estrutura, nomes,
   textos, estilos: tudo vem junto.
3. **Mudar SOMENTE**: caminhos de import e a camada de dados (actions/queries
   apontando para o banco do produto). Nada de "melhorar" no caminho.
4. **Rodar `diff` contra o gabarito e justificar cada linha diferente.** Linha
   que você não sabe explicar é erro. A prova de cópia bem feita é um diff que
   se lê em um minuto.
5. **Validar RODANDO** — abrir a tela logado. Build verde não prova que a tela
   abre (`useActionState` compilou e derrubou produção em 10/08).

### 3. Um agente por vez no repositório

Antes de escrever, confira branch e commits recentes — **e o que ainda NÃO foi
commitado, que é onde o outro agente está agora**:

- `git status --porcelain` — árvore suja é alguém no meio de um trabalho, mesmo
  que o último commit seja de semanas atrás;
- arquivo do repo **modificado nos últimos minutos** = agente ativo neste
  instante;
- **número sequencial** (issue, versão, migração) se lê na FONTE no instante de
  escrever — o próximo número não é seu de reservar.

Se outro agente está ali, **não escreva de fora** — entregue o texto pronto por
issue no Linear, ou abra PR. Decisão aprovada vira teste, não vira só comentário.

🔴 **Medido em 09/09/2026, com esta regra já no ar** (dono: *"tive muito stress
com vários agentes alterando o mesmo arquivo, quase virou um loop"*): um
repositório com o último commit de **18 dias atrás** tinha **3 arquivos sujos**,
outro tinha **21**, e um terceiro tinha arquivos **tocados nos últimos 30
minutos**. "Commits recentes" não enxergava nenhum dos três — e no mesmo dia
**dois números de issue colidiram**, escritos em quatro arquivos antes de a
issue existir. Conferir só o que já foi commitado é conferir o passado.

### 4. Onde cada coisa é registrada

| O quê | Onde |
|---|---|
| Decisão de negócio | Notion (Centro de Comando → página do produto) |
| Regra técnica do produto | `docs/` do repositório + `CLAUDE.md` |
| Governança que vale para todos | `ocsi-framework/docs/governance/` |
| Execução / tarefa | Linear (Iniciativa → Projeto → Issue) |
| Código | GitHub, commit explicando **por quê** |

### 5. Onde cada SEGREDO mora — decide QUEM CONSOME, não que tipo é

Antes de guardar uma credencial, não pergunte "que tipo de segredo é este". Pergunte
**quem vai consumir**. Cada consumidor tem um destino diferente, e usar o errado ou
quebra, ou vaza.

| Quem consome | Onde mora | Exemplo no grupo |
|---|---|---|
| **Aplicação com banco** | coluna cifrada na própria tabela | `bots_telegram.token_cifrado`; cofre de certificados A1 (envelope com KEK) |
| **Programa que lê configuração no boot** | `.env` do compose, modo `600`, no `.gitignore` | `SECRETS_KEY` do OMNIVIS; token do bot do NOC |
| **Gente digitando** (Winbox, painel, celular em campo) | **cofre do grupo** — `cofre.grupolineservice.com.br` | senha de MikroTik, OLT, Proxmox, portal de fornecedor |
| **Agente/serviço chamando API de terceiro** | **Gateway de Conexões** do SaaS (`/plataforma/conexoes`) | GitHub, Linear, Notion, Vercel, Supabase, Hostinger |

⚠️ **O Gateway é *use-only* por projeto:** ele sabe **usar** a credencial e **nunca a
devolve** (o valor vive no Supabase Vault, a tabela guarda só um UUID, a leitura é
`service_role`). É acerto de segurança — e é exatamente por isso que ele **não serve** para
o que uma pessoa precisa **ler de volta** às duas da manhã. Para isso existe o cofre.

**Regras que não se negociam:**

1. **Segredo nunca passa por chat, commit, ticket ou print.** Quem é responsável copia
   **direto da origem para o destino** — ninguém intermedia o valor. Precisa passar por um
   arquivo? Arquivo temporário, e **sobrescrever antes de apagar**.
2. **Existe padrão no ambiente? Aponte o padrão — não desenhe outro.** Antes de propor
   destino novo, leia onde os segredos parecidos já moram.
3. **Chave de CIFRA tem cópia fora do sistema que a usa.** Token de acesso se revoga e se
   gera outro; **chave de cifra, não** — perdê-la mata o dado cifrado junto. Cópia no mesmo
   servidor é o mesmo domínio de falha: **não é cópia**.
4. **Chave que não se exporta muda a pergunta.** Se o provedor não devolve o valor (ex.:
   variável do tipo *Secret* na Vercel), **não tente arrancá-la** — escrever código para
   vazar o próprio segredo troca proteção real por uma cópia a mais. Guarde a
   **matéria-prima que reconstrói** o que ela protegia.
5. **Guardado ≠ recuperável.** Cópia que nunca foi restaurada não conta como cópia. Backup
   se prova restaurando, não conferindo que o arquivo existe.

Referência completa: `ocsi-framework/docs/security/chaves-e-ambiente.md` — inventário por
produto, com quais chaves são revogáveis e quais são de perda irreversível.
### 6. Entregue a MUDANÇA primeiro; a documentação vem DEPOIS

> Regra do dono, 02/09/2026: *"você está demorando demais para fazer as coisas,
> 30 minutos e nada"* → *"faz a mudança primeiro e documenta depois"*.

A ordem de uma frente é: **validada e no ar → aviso curto do que mudou → só
então** `CLAUDE.md`, Linear e Notion.

Ele testa na TELA, e fica parado enquanto o agente escreve issue e diário.
Naquele dia duas frentes ficaram prontas cedo e ele só soube no fim, junto de
três blocos de texto que não mudavam nada para ele naquele minuto — o trabalho
existia, mas para quem esperava o sistema estava parado.

**O que NÃO mudou:**

1. **"Documenta tudo" continua sendo os TRÊS canais** — GitHub (`CLAUDE.md` do
   produto), Linear e Notion (seção 4). Mudou o **quando**, não o **se**.
2. **A medição ANTES de mexer continua obrigatória** (seções 1 e 1.1). O que sai
   da frente é a documentação — nunca a conferência que evita inventar causa,
   nem a varredura das superfícies.
3. **Validação local segue sendo a barreira**: typecheck, testes e build antes do
   push, conferindo o EXIT CODE.

Duas frentes seguidas: **entregue as duas e documente as duas juntas**, em vez de
intercalar documentação entre elas.

<!-- OCSI:GOVERNANCA:FIM -->
