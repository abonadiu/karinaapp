

# Fase 3: Gestão de Empresas e Participantes

## Resumo
Implementação completa do sistema de gestão de empresas clientes e participantes, permitindo ao facilitador cadastrar empresas, gerenciar licenças, adicionar participantes e acompanhar o status de cada um.

---

## O que sera implementado

### 1. Gestao de Empresas
- **Listagem de Empresas** - Tabela com todas as empresas cadastradas
- **Cadastro de Empresa** - Modal/formulario para adicionar nova empresa
- **Edicao de Empresa** - Atualizar dados da empresa
- **Visualizacao de Detalhes** - Pagina com informacoes completas e participantes
- **Controle de Licencas** - Numero de vagas disponiveis vs utilizadas

### 2. Gestao de Participantes
- **Listagem por Empresa** - Ver todos os participantes de uma empresa
- **Adicionar Participante** - Formulario individual
- **Importacao via CSV** - Upload de planilha com multiplos participantes
- **Status do Participante** - Convidado, Em andamento, Concluido
- **Envio de Convite** - Gerar link unico e preparar para envio por email

### 3. Layout do Dashboard
- **Sidebar de Navegacao** - Menu lateral com acesso rapido as secoes
- **Contadores Dinamicos** - Stats reais de empresas, participantes e avaliacoes

---

## Estrutura do Banco de Dados

### Tabela: `companies`
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | ID unico da empresa (PK) |
| facilitator_id | uuid | Referencia ao profiles.id |
| name | text | Nome da empresa |
| contact_name | text | Nome do contato principal |
| contact_email | text | Email do contato |
| contact_phone | text | Telefone do contato |
| total_licenses | integer | Total de licencas contratadas |
| used_licenses | integer | Licencas ja utilizadas |
| notes | text | Observacoes |
| created_at | timestamp | Data de criacao |
| updated_at | timestamp | Data de atualizacao |

### Tabela: `participants`
| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | ID unico do participante (PK) |
| company_id | uuid | Referencia a companies.id |
| facilitator_id | uuid | Referencia ao profiles.id |
| name | text | Nome completo |
| email | text | Email do participante |
| phone | text | Telefone (opcional) |
| department | text | Departamento/area |
| position | text | Cargo |
| access_token | text | Token unico para acesso ao diagnostico |
| status | text | 'pending', 'invited', 'in_progress', 'completed' |
| invited_at | timestamp | Data do envio do convite |
| started_at | timestamp | Data de inicio do diagnostico |
| completed_at | timestamp | Data de conclusao |
| created_at | timestamp | Data de criacao |
| updated_at | timestamp | Data de atualizacao |

---

## Fluxo de Usuario

```text
Dashboard
    |
    +---> [Empresas] ---> Lista de Empresas
    |                         |
    |                         +---> [+ Nova] ---> Formulario
    |                         |
    |                         +---> [Ver] ---> Detalhes da Empresa
    |                                              |
    |                                              +---> Lista de Participantes
    |                                              |
    |                                              +---> [+ Adicionar]
    |                                              |
    |                                              +---> [Importar CSV]
    |
    +---> [Participantes] ---> Lista Geral (todos)
```

---

## Arquivos a serem criados

### Paginas
- `src/pages/Empresas.tsx` - Listagem de empresas
- `src/pages/EmpresaDetalhes.tsx` - Detalhes + participantes
- `src/pages/Participantes.tsx` - Lista geral de participantes

### Componentes de Empresa
- `src/components/companies/CompanyList.tsx` - Tabela de empresas
- `src/components/companies/CompanyForm.tsx` - Formulario de cadastro/edicao
- `src/components/companies/CompanyCard.tsx` - Card resumido

### Componentes de Participante
- `src/components/participants/ParticipantList.tsx` - Tabela de participantes
- `src/components/participants/ParticipantForm.tsx` - Formulario individual
- `src/components/participants/CsvImport.tsx` - Upload e parse de CSV
- `src/components/participants/StatusBadge.tsx` - Badge de status visual

### Layout
- `src/components/layout/DashboardLayout.tsx` - Layout com sidebar
- `src/components/layout/Sidebar.tsx` - Menu lateral de navegacao

---

## Politicas de Seguranca (RLS)

### Tabela `companies`
- SELECT: Apenas empresas do proprio facilitador
- INSERT: Facilitador pode criar empresas vinculadas a si
- UPDATE: Apenas suas proprias empresas
- DELETE: Apenas suas proprias empresas

### Tabela `participants`
- SELECT: Apenas participantes de empresas do facilitador
- INSERT: Facilitador pode adicionar a suas empresas
- UPDATE: Apenas participantes de suas empresas
- DELETE: Apenas participantes de suas empresas

---

## Detalhes Tecnicos

### Validacao de Formularios
- Nome da empresa obrigatorio
- Email valido para contato e participantes
- Numero de licencas >= 0
- Token de acesso gerado automaticamente (UUID)

### Importacao CSV
- Colunas aceitas: nome, email, departamento, cargo, telefone
- Validacao de emails duplicados
- Preview antes de confirmar importacao
- Feedback de linhas com erro

### Status do Participante
- `pending` - Cadastrado, aguardando convite
- `invited` - Convite enviado
- `in_progress` - Iniciou o diagnostico
- `completed` - Finalizou todas as etapas

---

## Ordem de Implementacao

1. Criar tabelas `companies` e `participants` no banco
2. Configurar RLS policies para ambas tabelas
3. Criar DashboardLayout com Sidebar
4. Refatorar Dashboard para usar novo layout
5. Criar pagina de listagem de Empresas
6. Criar formulario de cadastro de Empresa
7. Criar pagina de detalhes da Empresa
8. Criar listagem de Participantes por empresa
9. Criar formulario de adicionar Participante
10. Implementar importacao via CSV
11. Atualizar contadores do Dashboard com dados reais
12. Adicionar rotas no App.tsx

