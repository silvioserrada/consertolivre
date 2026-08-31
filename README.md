# consertolivre — protótipo funcional do MVP

Web app em React + Vite + TypeScript + Tailwind v4, implementando o núcleo
do MVP definido no projeto: busca de técnicos por categoria + proximidade,
perfil público com portfólio de vídeos/fotos e avaliações, e módulo de
classificados. **Já está conectado ao seu projeto Supabase real**
(`dxkpcziyexlpvwbscclf`, região São Paulo) — schema, RLS, buckets de
Storage e o arquivo `.env` já estão prontos.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Como o banco está vazio de técnicos e
anúncios reais, a tela inicial vai mostrar "nenhum técnico encontrado" até
alguém se cadastrar em `/cadastro`.

## Fluxo de cadastro/login

- `/cadastro` cria a conta (Supabase Auth) e o perfil técnico numa
  tacada só. **Se a confirmação de e-mail estiver ativa no projeto**
  (padrão do Supabase), os dados do formulário ficam guardados no
  `localStorage` até o primeiro login — só então o perfil é de fato
  gravado no banco, porque as políticas de RLS exigem `auth.uid()`.
- `/login` autentica e, se houver um cadastro pendente, termina de gravá-lo.
- Dentro do próprio perfil (`/tecnico/:id`), se você estiver logado como o
  dono, aparece um formulário para publicar vídeo/foto — o upload vai
  direto para o bucket `posts` do Supabase Storage.
- `/classificados/novo` funciona do mesmo jeito para anúncios, usando o
  bucket `classifieds`.

Se quiser testar mais rápido sem lidar com confirmação de e-mail, desative
"Confirm email" em Authentication → Providers → Email no painel do
Supabase (só para ambiente de desenvolvimento).

## Estrutura

```
src/
  components/   Header (com auth), TechnicianCard, RatingStars, ReportButton
  pages/        Search, TechnicianProfile, Classifieds, NewClassified,
                 CreateProfile, Login
  lib/
    api.ts        todas as consultas reais ao Supabase (técnicos, posts,
                   classificados, comentários, denúncias)
    upload.ts      upload de arquivo para o Supabase Storage
    useAuth.ts      hook de sessão + signUp/signIn/signOut
    supabase.ts     cliente Supabase
    geo.ts          distância (Haversine) + geolocalização do navegador
    mockData.ts     mantido só como fonte das categorias/rótulos em alguns
                     componentes (os IDs batem com os já seedados no banco)
  types.ts        tipos do domínio
supabase/
  schema.sql      schema completo (tabelas, índices, RLS) — já aplicado no
                  seu projeto
```

## Status da integração com Supabase

Já aplicado diretamente no seu projeto (via conector MCP, sem precisar
copiar/colar no painel):

- ✅ Schema completo (8 tabelas, índices, RLS)
- ✅ 10 categorias seedadas (ferramentas elétricas + eletrodomésticos)
- ✅ Buckets de Storage `posts` e `classifieds` (públicos para leitura,
  upload restrito a usuário autenticado, exclusão restrita ao dono)
- ✅ `.env` já preenchido com a URL e a chave anon do projeto

## O que falta para fechar o MVP

- [ ] Página/fluxo de assinatura premium (upgrade de plano `free` → `premium`)
- [ ] Integração Mercado Pago para cobrança da assinatura
- [ ] Publicidade por nicho (2º pilar de monetização do MVP)
- [ ] Edição de perfil já criado (hoje só existe criação)
- [ ] Validar o comportamento de "Confirm email" nas configurações de Auth
      do projeto e ajustar a mensagem da tela `/cadastro` de acordo

## Sobre o design

Paleta e tipografia (`src/index.css`) seguem um vocabulário de bancada/oficina
elétrica — charcoal, papel off-white, cobre como acento — deliberadamente
fugindo do visual "SaaS genérico" (cards arredondados, gradiente lilás). O
detalhe de cantos em L nos cards de técnico "destaque" é o único elemento de
assinatura visual, usado com moderação.

## Levar isso para o Lovable / Bolt.new

Este projeto já é um React+Vite+Tailwind padrão — pode ser importado
diretamente no Lovable ou Bolt.new como ponto de partida (em vez de começar
do zero com um prompt), ou usado como referência de estrutura/schema ao
gerar o prompt inicial nessas ferramentas.
