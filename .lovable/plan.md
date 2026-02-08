
## Revisão profunda (por que “nada funciona”)

### Sintoma principal
- Tela em branco + erro em runtime: **`Uncaught Error: supabaseUrl is required`**
- Isso acontece **antes** do React renderizar qualquer tela, porque o app importa `supabase` em muitos lugares (AuthContext, páginas, componentes). Ao importar, o arquivo `src/integrations/supabase/client.ts` executa `createClient(SUPABASE_URL, ...)`.
- No seu caso, **`import.meta.env.VITE_SUPABASE_URL` está vindo como `undefined`** no build/preview, então o SDK lança erro e trava tudo.

### Causa provável
- As variáveis `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` não estão disponíveis no runtime do preview (injeção de env falhando/instável), mesmo o projeto tendo backend configurado.
- Como `client.ts` é auto-gerado e cria o cliente imediatamente, qualquer falha de env derruba o app inteiro.

## Objetivos do conserto
1. **Eliminar a tela branca** mesmo que as envs falhem.
2. **Garantir que o cliente do backend sempre tenha URL e chave válidas**, usando fallback seguro (valores públicos) quando necessário.
3. Corrigir problemas secundários do fluxo `/empresa/dashboard` (redirecionamento e proteção) para evitar “carregando infinito”/comportamentos confusos.

---

## Implementação (passo a passo)

### 1) Criar um “cliente seguro” do backend (sem depender 100% de env)
**Ação**
- Criar um novo módulo (ex.: `src/integrations/backend/client.ts` ou `src/lib/backendClient.ts`) que:
  - Leia `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`.
  - Se estiverem ausentes, use **fallback hardcoded** com a **URL pública do backend** e a **chave pública (anon/publishable)**.
  - Exporte `supabase` a partir desse módulo.

**Por que isso resolve**
- Evita `createClient(undefined, ...)` e remove o ponto único de falha.
- Mantém segredo seguro: URL + anon key são públicos por design (não são a service role key).

**Observação importante**
- Não mexer no `src/integrations/supabase/client.ts` (auto-gerado). Em vez disso, vamos parar de importá-lo no app.

---

### 2) Trocar todos os imports para usar o cliente seguro
**Ação**
- Substituir em todo o `src/`:
  - De: `import { supabase } from "@/integrations/supabase/client";`
  - Para: `import { supabase } from "@/integrations/backend/client";` (ou o caminho decidido)

**Arquivos afetados (exemplos)**
- `src/contexts/AuthContext.tsx`
- `src/pages/Relatorios.tsx`
- `src/pages/empresa/LoginEmpresa.tsx`
- `src/pages/empresa/PortalEmpresa.tsx`
- `src/components/...` (há ~26 arquivos usando o client atual)

**Resultado esperado**
- O app para de quebrar logo ao iniciar, porque nenhum import executa mais o `client.ts` auto-gerado.

---

### 3) Adicionar “diagnóstico de inicialização” (para nunca mais ficar tela branca)
**Ação**
- No `src/main.tsx` (ou um componente `AppBootstrap`), adicionar um check simples:
  - Se o supabase client foi criado via fallback porque env faltou, registrar um `console.warn` claro (sem expor credenciais).
  - Opcional: exibir um banner discreto em dev/preview dizendo “Configuração do backend ausente; usando fallback”.

**Resultado esperado**
- Mesmo se o ambiente quebrar de novo, você vê rapidamente o motivo e o app continua renderizando.

---

## Correções específicas do fluxo /empresa (já que você está em /empresa/dashboard)

### 4) Proteger `/empresa/dashboard` corretamente (evitar loops e UX confusa)
Hoje em `App.tsx`, `/empresa/dashboard` não usa `ProtectedRoute`. Isso gera dois problemas:
- Se o usuário não estiver logado, o `PortalEmpresa` pode ficar “carregando” ou falhar em silêncio.
- O redirect correto para gestor deveria ser `/empresa/login` (não `/login`).

**Ação**
- Criar `CompanyManagerRoute` (similar ao `ProtectedRoute`) que:
  - Se `loading`: mostra spinner.
  - Se `!user`: redireciona para `/empresa/login`.
  - Se `user` mas **não for gestor**: redireciona para `/empresa/login` com mensagem (ou para `/dashboard`).
  - Usar o que já existe no `AuthContext`: `isManager` e `managerCompanyId`.

**Atualização em `App.tsx`**
- Envolver `/empresa/dashboard` com `CompanyManagerRoute`.

---

### 5) Simplificar `PortalEmpresa` usando dados do AuthContext
Hoje `PortalEmpresa` faz `rpc('get_manager_company_id')` de novo.
**Ação**
- Usar `managerCompanyId` do `useAuth()` como fonte primária do `companyId`.
- Se `!authLoading && !user` → redirect imediato para `/empresa/login`.
- Se `user` e `!managerCompanyId` → mostrar mensagem e redirect (ou botão para voltar).

**Benefícios**
- Menos chamadas ao backend.
- Menos pontos de falha.
- Remove estados “travados” (ex.: isLoading nunca finaliza quando `!user`).

---

## Validação / Testes (checklist objetivo)
1. Recarregar o preview na rota `/` e confirmar: **não há mais tela branca**.
2. Abrir `/login` e fazer login de facilitador → `/dashboard` abre.
3. Abrir `/empresa/login` e fazer login de gestor:
   - Se for gestor: entra em `/empresa/dashboard`.
   - Se não for gestor: mensagem e retorno/redirect adequado.
4. Em `/empresa/dashboard`, validar que carrega:
   - Nome da empresa
   - Cards de status
   - Radar/benchmark (quando houver dados)
5. Ir em `/relatorios` e validar que os gráficos/tabela e export PDF continuam funcionando.
6. Conferir console: não deve existir mais `supabaseUrl is required`.

---

## Riscos e como mitigamos
- **Risco:** hardcode de URL/anon key “amarra” o app a um backend.
  - **Mitigação:** o fallback só é usado quando as envs faltarem; quando estiverem corretas, ele usa env normalmente.
- **Risco:** algum import antigo para `@/integrations/supabase/client` permanecer e quebrar.
  - **Mitigação:** busca global + substituição em todos os arquivos; teste de build/preview após troca.

---

## Entregáveis (o que vai mudar)
- Novo arquivo de cliente seguro do backend.
- Refactor de imports em múltiplos arquivos (AuthContext, páginas e componentes).
- Novo route guard para gestor + ajustes no `/empresa/dashboard`.

Quando você aprovar este plano, eu implemento em sequência (primeiro eliminando a tela branca, depois ajustando o portal da empresa) para você conseguir testar rapidamente.