
# Plataforma IQ+IS - Diagnóstico de Inteligência Emocional e Espiritual

## Visão Geral
Uma plataforma web que permite facilitadores (coaches e consultores) aplicarem diagnósticos de inteligência emocional e espiritual em colaboradores de empresas, gerando relatórios personalizados com identificação de pontos cegos e planos de desenvolvimento.

---

## 🎨 Estilo Visual
- **Design caloroso e acolhedor** com cores quentes (tons terrosos, alaranjados suaves)
- Tipografia humanizada e legível
- Espaçamentos generosos para criar sensação de calma
- Elementos visuais orgânicos e sutis
- Micro-interações suaves nas transições

---

## 👥 Perfis de Usuário

### 1. Facilitador (Admin)
O coach ou consultor que gerencia tudo: empresas, participantes, diagnósticos e relatórios.

### 2. Empresa (RH/Gestor) 
Acesso limitado para acompanhar o progresso da equipe e visualizar relatórios agregados.

### 3. Facilitado (Participante)
Colaborador que responde ao diagnóstico e recebe seu relatório pessoal.

---

## 🗂️ Funcionalidades do MVP

### Área do Facilitador

**1. Autenticação e Perfil**
- Cadastro com email/senha
- Completar perfil (nome, foto, bio, certificações)
- Upload de logo e definição das cores da marca
- Dashboard com visão geral das atividades

**2. Gestão de Empresas**
- Cadastrar novas empresas clientes
- Definir número de licenças disponíveis
- Acompanhar status das licenças utilizadas
- Visualizar métricas agregadas por empresa

**3. Gestão de Participantes**
- Adicionar participantes individualmente
- Importar participantes via CSV
- Enviar convites por email com link único
- Acompanhar status: convidado → em andamento → concluído

**4. Visualização de Resultados**
- Ver relatório individual de cada participante
- Gráfico radar das 5 dimensões
- Pontos cegos identificados
- Download de relatório em PDF
- Compartilhar relatório por email

---

### Jornada do Participante (Facilitado)

**1. Acesso via Link Único**
- Receber email de convite personalizado
- Acessar pelo link único (sem necessidade de criar conta)
- Tela de boas-vindas explicando o processo
- Aceitar termos de consentimento

**2. Parte 1: Questionário (40 perguntas)**
- 8 perguntas por dimensão
- Escala de 1-4 (Raramente → Quase sempre)
- Barra de progresso visual
- Salvamento automático a cada resposta
- Possibilidade de pausar e retomar

**3. Parte 2: Exercícios Vivenciais**
- **Exercício A (Coerência)**: Timer para respiração + perguntas reflexivas
- **Exercício B (Padrões)**: Identificar situação emocional + mapa corporal interativo
- **Exercício C (Propósito)**: Completar 6 frases reflexivas

**4. Parte 3: Reflexões Profundas**
- 6 perguntas abertas para escrita reflexiva
- Uma pergunta por tela
- Campo de texto expansível

**5. Relatório Pessoal**
- Score geral em porcentagem
- Gráfico radar das 5 dimensões
- Nível de cada dimensão (Emergente → Integrado)
- Top 3-5 pontos cegos prioritários
- Insights personalizados
- Plano de desenvolvimento com práticas recomendadas
- Download em PDF

---

### Área da Empresa (Fase posterior, mas preparada na estrutura)

- Acesso simplificado para RH/Gestores
- Dashboard com status dos colaboradores
- Relatório agregado da equipe
- Visualização sem acesso individual

---

## 📊 As 5 Dimensões Avaliadas

1. **Consciência Interior** - Meta-cognição e auto-observação
2. **Coerência Emocional** - Regulação e resiliência emocional
3. **Conexão e Propósito** - Valores e significado
4. **Relações e Compaixão** - Empatia e liderança servidora
5. **Transformação e Crescimento** - Mentalidade de crescimento

---

## 🔧 Estrutura Técnica

### Backend (Lovable Cloud com Supabase)
- **Autenticação**: Email/senha para facilitadores, token único para participantes
- **Banco de dados**: Tabelas para facilitadores, empresas, participantes, diagnósticos, respostas e relatórios
- **Segurança**: Row Level Security para garantir que cada facilitador veja apenas seus dados

### Emails Transacionais
- Integração com Resend para envio de convites
- Templates de email personalizados com a marca do facilitador

### Geração de PDF
- Relatório formatado para download/impressão
- Logo do facilitador na capa
- Gráficos e visualizações integrados

---

## 🚀 Ordem de Implementação

1. **Estrutura base e design system** - Cores, tipografia, componentes base
2. **Autenticação do facilitador** - Login, cadastro, perfil
3. **Dashboard e gestão** - Empresas e participantes
4. **Jornada do diagnóstico** - Questionário completo com 40 perguntas
5. **Exercícios vivenciais** - Os 3 exercícios interativos
6. **Perguntas reflexivas** - As 6 perguntas abertas
7. **Cálculo de scores** - Algoritmo de pontuação e identificação de pontos cegos
8. **Relatório visual** - Exibição dos resultados na tela
9. **Envio de emails** - Integração para convites
10. **Geração de PDF** - Relatório para download

---

## 📈 Preparação para Escala

A estrutura será desenvolvida pensando em:
- Suporte a múltiplos facilitadores (SaaS)
- Customização de marca por facilitador
- Sistema de planos/assinaturas (Fase 2)
- Portal da empresa (Fase 2)
