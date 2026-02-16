
## Permitir convidar participante para criar conta no sistema

### Resumo
Adicionar um botao no menu de acoes de cada participante para copiar um link de cadastro. O participante usa esse link para criar senha e acessar o portal. A pagina de cadastro e a rota ja existem -- falta apenas a funcao no banco e o botao na interface.

### Mudancas

**1. Criar funcao `activate_participant_account` no banco de dados (migracao SQL)**

Funcao chamada pela pagina de cadastro (`CadastroParticipante.tsx`) que ainda nao existe no banco:
- Recebe `p_token` (access_token) e `p_user_id` (ID do novo usuario)
- Vincula o `user_id` ao participante correspondente
- Adiciona a role `participant` na tabela `user_roles`
- Retorna `true` se sucesso, `false` se token invalido

```sql
CREATE OR REPLACE FUNCTION public.activate_participant_account(p_token text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_participant_id uuid;
BEGIN
  SELECT id INTO v_participant_id
  FROM participants
  WHERE access_token = p_token AND user_id IS NULL;

  IF v_participant_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE participants SET user_id = p_user_id WHERE id = v_participant_id;

  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, 'participant')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;
```

**2. Adicionar botao "Link para criar conta" no `ParticipantList.tsx`**

No popover de acoes, adicionar um botao que:
- So aparece se o participante **nao** tem `user_id` (verificado via campo `user_id` que sera adicionado a interface)
- Copia o link `/participante/cadastro/{access_token}` para a area de transferencia
- Mostra toast de confirmacao

Mudancas especificas:
- Adicionar `user_id?: string | null` a interface `Participant` em `ParticipantList.tsx` e `useParticipantActions.ts`
- Importar `UserPlus` e `Link2` do lucide-react
- Adicionar o botao no popover, antes do separador de editar/excluir

**3. Garantir que `user_id` e carregado nas queries**

- Em `EmpresaDetalhes.tsx`: ja usa `select("*")` -- OK
- Em `Participantes.tsx`: ja usa `select("*, companies(name)")` -- OK

### Fluxo do usuario

1. Facilitador abre a lista de participantes
2. Clica no participante, ve opcao "Link para criar conta" (so se ainda nao tem conta)
3. Clica e o link e copiado
4. Envia o link ao participante (WhatsApp, email, etc.)
5. Participante acessa o link, cria senha
6. Participante confirma email e acessa o portal
