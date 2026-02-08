
## Participantes com Contas no Sistema

### Resumo

Evoluir o modelo de participantes para que tenham contas no sistema e possam acessar seus resultados posteriormente, mantendo retrocompatibilidade com o fluxo atual de token.

---

## Beneficios da Mudanca

| Aspecto | Atual | Proposto |
|---------|-------|----------|
| Acesso aos resultados | Apenas via link unico | Login permanente |
| Historico | Nao disponivel | Multiplos diagnosticos |
| Seguranca | Token pode ser compartilhado | Autenticacao real |
| Experiencia | Link perdido = sem acesso | Recuperacao de senha |
| Engajamento | Unico contato | Relacionamento continuo |

---

## Arquitetura Proposta

### Fluxo do Participante

```text
1. Facilitador cadastra participante
        |
        v
2. Participante recebe email com link de cadastro
        |
        v
3. Participante cria conta (senha) e faz diagnostico
        |
        v
4. Apos completar, pode fazer login a qualquer momento
        |
        v
5. Portal do Participante mostra resultados, historico, etc.
```

---

## Mudancas Necessarias

### 1. Banco de Dados

**Adicionar coluna `user_id` na tabela `participants`:**

```sql
ALTER TABLE participants 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
```

**Adicionar role `participant` ao enum:**

```sql
ALTER TYPE app_role ADD VALUE 'participant';
```

**Funcao para vincular participante a usuario:**

```sql
CREATE FUNCTION activate_participant_account(p_token text, p_user_id uuid)
RETURNS boolean
```

**Atualizar RLS:**
- Participantes podem ver seus proprios dados
- Participantes podem ver seus proprios resultados

---

### 2. Novas Paginas Frontend

| Pagina | Rota | Descricao |
|--------|------|-----------|
| Login Participante | `/participante/login` | Login especifico para participantes |
| Cadastro Participante | `/participante/cadastro/:token` | Criar conta via link do convite |
| Portal Participante | `/participante/portal` | Dashboard com resultados |

---

### 3. Portal do Participante

O portal tera:

- **Resultado Atual**: Radar chart, dimensoes, pontuacoes
- **Historico**: Lista de diagnosticos anteriores (para futuro)
- **Recomendacoes**: Praticas personalizadas
- **Agendar Feedback**: Se facilitador tiver Calendly configurado
- **Download PDF**: Baixar relatorio

---

### 4. Fluxo de Convite Atualizado

**Opcao A - Convite com criacao de conta:**
1. Facilitador envia convite
2. Email inclui link `/participante/cadastro/{token}`
3. Participante cria senha
4. Sistema vincula `user_id` ao participante
5. Redireciona para diagnostico

**Opcao B - Manter compatibilidade (recomendado):**
1. Link original `/diagnostico/{token}` continua funcionando
2. Apos completar, oferece opcao de criar conta
3. Se criar, pode acessar portal depois

---

### 5. Componente CompanyManagerRoute Atualizado

Criar `ParticipantRoute` similar para proteger rotas do participante.

---

## Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/migrations/...` | Criar | Adicionar user_id, role, funcoes |
| `src/pages/participante/LoginParticipante.tsx` | Criar | Pagina de login |
| `src/pages/participante/CadastroParticipante.tsx` | Criar | Cadastro via token |
| `src/pages/participante/PortalParticipante.tsx` | Criar | Dashboard de resultados |
| `src/components/auth/ParticipantRoute.tsx` | Criar | Protecao de rotas |
| `src/contexts/AuthContext.tsx` | Modificar | Adicionar isParticipant |
| `src/App.tsx` | Modificar | Adicionar novas rotas |
| `src/components/diagnostic/DiagnosticResults.tsx` | Modificar | Adicionar CTA para criar conta |

---

## Seguranca

1. **RLS para participantes**: Ver apenas seus proprios dados
2. **Role separada**: `participant` isolada de outras roles
3. **Vinculacao segura**: Somente via token valido
4. **Sem acesso a dados de outros**: Politicas restritivas

---

## Consideracoes de Migracao

- Participantes existentes sem conta continuam funcionando via token
- Ao acessar resultado existente, podem criar conta opcionalmente
- Dados historicos preservados
- Sem breaking changes no fluxo atual
