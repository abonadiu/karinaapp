
# Fase 2: Sistema de Autenticação do Facilitador

## Resumo
Implementação completa do sistema de autenticação para facilitadores, incluindo páginas de login, cadastro, recuperação de senha, e perfil com upload de logo e cores da marca.

---

## O que será implementado

### 1. Páginas de Autenticação
- **Página de Login** (`/login`) - Formulário de email/senha com validação
- **Página de Cadastro** (`/cadastro`) - Registro de novos facilitadores
- **Página de Recuperação de Senha** (`/recuperar-senha`) - Envio de link por email
- **Página de Redefinição de Senha** (`/redefinir-senha`) - Nova senha após link

### 2. Página de Perfil do Facilitador
- **Completar Perfil** (`/perfil`) - Após primeiro login
  - Nome completo e bio profissional
  - Upload de foto de perfil
  - Upload de logo da marca
  - Seleção de cores da marca (cor primária e secundária)
  - Lista de certificações

### 3. Dashboard Inicial
- **Dashboard** (`/dashboard`) - Página protegida após login
  - Visão geral com cards de resumo
  - Atalhos para ações principais
  - Preparado para receber dados de empresas/participantes

### 4. Infraestrutura de Autenticação
- Contexto de autenticação (AuthContext)
- Rotas protegidas (ProtectedRoute)
- Hook useAuth para acesso ao usuário logado

---

## Estrutura do Banco de Dados

### Tabela: `profiles`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID único do perfil (PK) |
| user_id | uuid | Referência ao auth.users |
| full_name | text | Nome completo |
| bio | text | Biografia profissional |
| avatar_url | text | URL da foto de perfil |
| logo_url | text | URL do logo da marca |
| primary_color | text | Cor primária (hex) |
| secondary_color | text | Cor secundária (hex) |
| certifications | text[] | Lista de certificações |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

### Storage Bucket: `avatars`
- Bucket público para fotos de perfil e logos
- Políticas RLS para upload apenas pelo próprio usuário

---

## Fluxo de Usuário

```text
Landing Page
     │
     ├──► [Entrar] ──► Login ──► Dashboard
     │                  │
     │                  └──► Esqueci senha ──► Recuperar
     │
     └──► [Cadastrar] ──► Cadastro ──► Confirmar email ──► Completar Perfil ──► Dashboard
```

---

## Arquivos a serem criados

### Páginas
- `src/pages/Login.tsx`
- `src/pages/Cadastro.tsx`
- `src/pages/RecuperarSenha.tsx`
- `src/pages/RedefinirSenha.tsx`
- `src/pages/Perfil.tsx`
- `src/pages/Dashboard.tsx`

### Contexto e Hooks
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`

### Componentes
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/auth/AuthLayout.tsx` (layout compartilhado para páginas de auth)
- `src/components/profile/AvatarUpload.tsx`
- `src/components/profile/LogoUpload.tsx`
- `src/components/profile/ColorPicker.tsx`

---

## Configurações do Backend

### Autenticação
- Habilitar auto-confirmação de email (para facilitar testes iniciais)
- Configurar URL de redirecionamento para recuperação de senha

### Políticas de Segurança (RLS)
- `profiles`: SELECT/INSERT/UPDATE apenas para o próprio usuário
- `storage.objects` (bucket avatars): Upload/Delete apenas pelo próprio usuário

---

## Detalhes Técnicos

### Validação de Formulários
- Usar `react-hook-form` com `zod` para validação
- Email obrigatório e formato válido
- Senha mínimo 6 caracteres
- Nome completo obrigatório no perfil

### Upload de Imagens
- Usar Supabase Storage
- Compressão/redimensionamento opcional no cliente
- Tipos aceitos: PNG, JPG, WebP
- Tamanho máximo: 2MB

### Cores da Marca
- Input de cor nativo do HTML5
- Preview em tempo real das cores selecionadas
- Valores salvos em formato hexadecimal

---

## Ordem de Implementação

1. Criar tabela `profiles` no banco de dados
2. Criar bucket de storage `avatars`
3. Configurar RLS policies
4. Implementar `AuthContext` e `ProtectedRoute`
5. Criar página de Login
6. Criar página de Cadastro
7. Criar página de Recuperação de Senha
8. Criar página de Dashboard (versão inicial)
9. Criar página de Perfil com uploads
10. Atualizar rotas no App.tsx
11. Configurar auto-confirmação de email
