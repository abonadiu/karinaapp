
# Plano: Agendamento de Sessões de Feedback

## Resumo

Implementar funcionalidade de agendamento de sessões de feedback pós-diagnóstico, integrando com Calendly (ou permitindo URL customizada), para que participantes possam agendar uma sessão com o facilitador diretamente da tela de resultados.

---

## Como Funcionará

1. **Facilitador configura** sua URL do Calendly no perfil
2. **Participante completa** o diagnóstico e vê os resultados
3. **Botão "Agendar Sessão"** aparece na tela de resultados
4. **Popup do Calendly** abre para agendamento
5. **Opcional**: Registro do agendamento no banco de dados

---

## Componentes a Implementar

### 1. Campo de URL do Calendly no Perfil do Facilitador

Adicionar novo campo no perfil para o facilitador configurar sua URL de agendamento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `calendly_url` | string | URL do Calendly ou similar |

### 2. Componente de Agendamento

Novo componente que exibe o botão e abre o widget do Calendly.

```text
+------------------------------------------+
|  Agende sua Sessão de Feedback           |
+------------------------------------------+
|                                          |
|  Quer aprofundar seus resultados?        |
|  Agende uma sessão individual com seu    |
|  facilitador.                            |
|                                          |
|     [ Agendar Sessão de Feedback ]       |
|                                          |
+------------------------------------------+
```

### 3. Integração com Calendly

Usar a biblioteca `react-calendly` para popup modal:

```tsx
import { PopupButton } from "react-calendly";

<PopupButton
  url={facilitatorProfile.calendly_url}
  rootElement={document.getElementById("root")}
  text="Agendar Sessão de Feedback"
/>
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Perfil.tsx` | Adicionar campo para URL do Calendly |
| `src/components/diagnostic/DiagnosticResults.tsx` | Adicionar seção de agendamento |

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/diagnostic/ScheduleFeedbackCard.tsx` | Card com botão de agendamento |

---

## Alterações no Banco de Dados

### Nova coluna na tabela `profiles`

```sql
ALTER TABLE public.profiles 
ADD COLUMN calendly_url text NULL;
```

### (Opcional) Tabela para registrar agendamentos

```sql
CREATE TABLE public.feedback_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  facilitator_id uuid NOT NULL,
  scheduled_at timestamptz,
  calendly_event_uri text,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);
```

---

## Interface do Facilitador (Perfil)

Nova seção no perfil:

```text
+------------------------------------------+
|  Agendamento de Sessões                  |
+------------------------------------------+
|                                          |
|  URL do Calendly                         |
|  [https://calendly.com/seu-link       ]  |
|                                          |
|  Esta URL será exibida para seus         |
|  participantes após completarem o        |
|  diagnóstico.                            |
|                                          |
+------------------------------------------+
```

---

## Fluxo do Participante

```text
1. Completa diagnóstico
         |
         v
2. Vê tela de resultados
         |
         v
3. Card "Agende sua Sessão" aparece
   (se facilitador tiver URL configurada)
         |
         v
4. Clica "Agendar Sessão de Feedback"
         |
         v
5. Popup do Calendly abre
         |
         v
6. Participante escolhe horário
         |
         v
7. Confirmação enviada por email
```

---

## Design do Componente ScheduleFeedbackCard

```tsx
// Só exibe se facilitador tiver calendly_url configurada
{facilitatorProfile?.calendly_url && (
  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
    <CardHeader className="text-center">
      <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
      <CardTitle>Agende sua Sessão de Feedback</CardTitle>
      <CardDescription>
        Aprofunde seus resultados com uma sessão individual
      </CardDescription>
    </CardHeader>
    <CardContent className="text-center">
      <PopupButton
        url={facilitatorProfile.calendly_url}
        rootElement={document.getElementById("root")!}
        text="Agendar Sessão"
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      />
    </CardContent>
  </Card>
)}
```

---

## Dependência a Instalar

```bash
npm install react-calendly
```

---

## Atualização do Hook useDiagnostic

Adicionar `calendly_url` na interface `FacilitatorProfile`:

```typescript
export interface FacilitatorProfile {
  full_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  calendly_url: string | null;  // novo campo
}
```

---

## Seção Tecnica

### Instalacao da Biblioteca

```bash
npm install react-calendly
```

### Tipos TypeScript

```typescript
// Interface atualizada
interface FacilitatorProfile {
  full_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  calendly_url: string | null;
}

// Props do componente
interface ScheduleFeedbackCardProps {
  calendlyUrl: string;
  participantName: string;
}
```

### Query Atualizada no useDiagnostic

```typescript
const { data: profileData } = await supabase
  .from("profiles")
  .select("full_name, logo_url, primary_color, secondary_color, calendly_url")
  .eq("user_id", participantData.facilitator_id)
  .single();
```

### Validacao de URL

```typescript
function isValidCalendlyUrl(url: string): boolean {
  return url.startsWith("https://calendly.com/") || 
         url.startsWith("https://cal.com/");
}
```

---

## Estimativa de Implementacao

| Etapa | Esforco |
|-------|---------|
| Migracao do banco (nova coluna) | 1 mensagem |
| Componentes + integracao | 1 mensagem |
| **Total** | 2 mensagens |
