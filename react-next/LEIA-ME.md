# `react-next/` — componentes que EXIGEM Next.js

Tudo aqui importa `next/link` ou `next/navigation`. **Só funciona em produto
Next** (`saas-gestao`, `rg-ambiental`).

Produto em Vite (`omnivis/web`) usa `css/`, `temas/`, `lib/` e `react/`
normalmente — só não importa desta pasta. Por isso `next` é
`peerDependenciesMeta.optional`: instalar o pacote num projeto Vite não puxa o
Next nem reclama que ele falta.

## Por que a separação existe

O pacote nasceu com dois consumidores em mente, ambos Next, e o `Voltar` entrou
com `next/link` direto na pasta `react/` — que o nome prometia ser agnóstica. O
terceiro produto (Vite) mostrou o furo.

**Regra:** `react/` é React puro e roda em qualquer bundler. Precisou de
roteador, `Link`, `useRouter` ou qualquer coisa de framework? Vai para
`react-next/`.
