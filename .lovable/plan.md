

# Implementacao de Envio de Emails com Resend

## Resumo
Criar uma edge function para enviar emails de convite reais usando Resend quando o facilitador clicar em "Enviar Convite". O email contera o link personalizado para o diagnostico do participante.

---

## Pre-requisitos

### Configuracao do Resend
1. O usuario precisa criar uma conta em https://resend.com
2. Validar um dominio de email em https://resend.com/domains
3. Criar uma API key em https://resend.com/api-keys
4. Fornecer a API key `RESEND_API_KEY` que sera armazenada como secret

---

## O que sera implementado

### 1. Edge Function: `send-invite`
- Recebe: participantId, participantName, participantEmail, diagnosticUrl
- Envia email profissional com o link do diagnostico
- Retorna sucesso/erro

### 2. Atualizacao do Frontend
- Modificar `handleInviteParticipant` em `EmpresaDetalhes.tsx`
- Adicionar loading state durante envio
- Buscar access_token do participante
- Chamar edge function antes de atualizar status
- Feedback visual de sucesso/erro

---

## Fluxo de Envio

```text
Facilitador clica "Enviar Convite"
           |
           v
Buscar access_token do participante
           |
           v
Montar URL: {baseUrl}/diagnostico/{access_token}
           |
           v
Chamar edge function send-invite
           |
           +---> Resend API
           |           |
           |           v
           |     Email enviado para participante
           |
           v
Atualizar status para "invited" + invited_at
           |
           v
Toast de sucesso
```

---

## Estrutura do Email

```text
+--------------------------------------------------+
|  Assunto: Voce foi convidado para o Diagnostico  |
|           IQ+IS                                   |
+--------------------------------------------------+

Ola {nome}!

Voce foi convidado(a) para realizar o Diagnostico
de Inteligencia Integral (IQ+IS).

Este diagnostico avaliara 5 dimensoes do seu
desenvolvimento:
- Consciencia Interior
- Coerencia Emocional
- Conexao e Proposito
- Relacoes e Compaixao
- Transformacao

O diagnostico leva aproximadamente 15-20 minutos.

      [Iniciar Diagnostico]
        (link do botao)

Este link e pessoal e intransferivel.

---
Enviado via Diagnostico IQ+IS
```

---

## Arquivos a serem criados/modificados

### Novo Arquivo
`supabase/functions/send-invite/index.ts`
- Handler da edge function
- Integracao com Resend
- Template do email em HTML
- Validacao de campos obrigatorios
- CORS headers

### Modificacoes

1. `supabase/config.toml`
   - Adicionar configuracao da funcao send-invite
   - Desabilitar verify_jwt (validacao manual)

2. `src/pages/EmpresaDetalhes.tsx`
   - Modificar `handleInviteParticipant`:
     - Buscar access_token do participante
     - Chamar edge function
     - Tratar erros
     - Adicionar loading state

3. `src/pages/Participantes.tsx`
   - Mesma logica de envio de convite

---

## Detalhes Tecnicos

### Edge Function
```typescript
// supabase/functions/send-invite/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, ...",
};

interface InviteRequest {
  participantName: string;
  participantEmail: string;
  diagnosticUrl: string;
  facilitatorName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { participantName, participantEmail, diagnosticUrl, facilitatorName } = await req.json();

  // Validar campos
  if (!participantName || !participantEmail || !diagnosticUrl) {
    return new Response(
      JSON.stringify({ error: "Campos obrigatorios ausentes" }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Enviar email via Resend
  const emailResponse = await resend.emails.send({
    from: "Diagnostico IQ+IS <noreply@SEU-DOMINIO.com>",
    to: [participantEmail],
    subject: "Voce foi convidado para o Diagnostico IQ+IS",
    html: `... template HTML ...`
  });

  return new Response(JSON.stringify(emailResponse), {
    status: 200,
    headers: corsHeaders
  });
});
```

### Chamada do Frontend
```typescript
// EmpresaDetalhes.tsx
const handleInviteParticipant = async (participant: Participant) => {
  setIsSendingInvite(participant.id);
  
  try {
    // 1. Buscar access_token
    const { data: participantData } = await supabase
      .from("participants")
      .select("access_token")
      .eq("id", participant.id)
      .single();
    
    // 2. Montar URL
    const diagnosticUrl = `${window.location.origin}/diagnostico/${participantData.access_token}`;
    
    // 3. Chamar edge function
    const response = await supabase.functions.invoke("send-invite", {
      body: {
        participantName: participant.name,
        participantEmail: participant.email,
        diagnosticUrl,
      }
    });
    
    if (response.error) throw response.error;
    
    // 4. Atualizar status
    await supabase
      .from("participants")
      .update({ status: "invited", invited_at: new Date().toISOString() })
      .eq("id", participant.id);
    
    toast.success(`Convite enviado para ${participant.name}!`);
    fetchParticipants();
    
  } catch (error) {
    toast.error("Erro ao enviar convite");
    console.error(error);
  } finally {
    setIsSendingInvite(null);
  }
};
```

---

## Template HTML do Email

O email tera um design limpo e profissional com:
- Cabecalho com titulo
- Saudacao personalizada
- Explicacao das 5 dimensoes
- Botao CTA destacado
- Rodape com informacoes

Cores usadas:
- Primaria: #8b5cf6 (roxo)
- Texto: #1f2937 (cinza escuro)
- Fundo: #f9fafb (cinza claro)

---

## Configuracao de Secret

Sera necessario adicionar a secret `RESEND_API_KEY` via ferramenta de secrets do Lovable. O usuario precisara:
1. Criar conta no Resend
2. Validar dominio
3. Gerar API key
4. Inserir a key quando solicitado

---

## Interface Atualizada

### ParticipantList com Loading
```text
+--------------------------------------------------+
| Nome          | Depto    | Cargo   | Status | ... |
+--------------------------------------------------+
| Maria Silva   | RH       | Analista| Pendente| [v]|
|               |          |         |         |    |
| [Enviando...] | <- Spinner durante envio         |
+--------------------------------------------------+
```

### Opcao de Reenvio
Adicionar opcao de reenviar convite para participantes com status "invited" que ainda nao iniciaram.

---

## Ordem de Implementacao

1. Solicitar RESEND_API_KEY do usuario
2. Criar edge function `send-invite/index.ts`
3. Atualizar `supabase/config.toml`
4. Modificar `handleInviteParticipant` em `EmpresaDetalhes.tsx`
5. Adicionar estados de loading
6. Modificar `handleInviteParticipant` em `Participantes.tsx`
7. Testar fluxo completo

---

## Tratamento de Erros

1. **API key nao configurada**: Mensagem clara pedindo configuracao
2. **Dominio nao verificado**: Erro do Resend sera exibido
3. **Email invalido**: Validacao antes de enviar
4. **Falha de rede**: Retry automatico ou manual
5. **Rate limiting**: Feedback ao usuario

