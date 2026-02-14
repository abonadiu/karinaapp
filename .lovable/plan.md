

## Autocadastro de participantes via link generico por empresa

### Como vai funcionar

O facilitador podera gerar e copiar um link unico por empresa (ex: `seusite.com/autocadastro/abc123`). Qualquer pessoa que acessar esse link vera um formulario publico onde preenchera nome, email, telefone, departamento e cargo. Ao enviar, o participante sera automaticamente registrado na empresa correspondente, sem que o facilitador precise cadastra-lo manualmente.

### Alteracoes

**1. Banco de dados - Nova coluna na tabela `companies`**

- Adicionar coluna `self_register_token` (text, unique, default `gen_random_uuid()`) na tabela `companies`
- Isso gera automaticamente um token unico para cada empresa existente e futura
- Criar indice unico na coluna para buscas rapidas

**2. Nova pagina publica: `src/pages/AutocadastroParticipante.tsx`**

- Rota: `/autocadastro/:token`
- Pagina publica (sem autenticacao) usando o `AuthLayout` existente
- Fluxo:
  1. Busca a empresa pelo `self_register_token` e exibe o nome da empresa
  2. Formulario com campos: Nome, Email, Telefone (opcional), Departamento (opcional), Cargo (opcional)
  3. Ao submeter, insere o participante na tabela `participants` vinculado a empresa e ao facilitador correto
  4. Exibe mensagem de sucesso

**3. RLS - Permitir insert anonimo via autocadastro**

- Nova politica INSERT na tabela `participants` para permitir insercao anonima quando os dados sao validos (o insert sera feito via uma funcao `SECURITY DEFINER` para garantir seguranca)
- Criar funcao `self_register_participant(p_token text, p_name text, p_email text, p_phone text, p_department text, p_position text)` que:
  - Valida o token
  - Busca a empresa e o facilitador
  - Insere o participante
  - Retorna o ID do participante criado

**4. Botao "Link de Autocadastro" na pagina `EmpresaDetalhes.tsx`**

- Adicionar um botao ao lado dos botoes existentes (Convidar Gestor, Editar, etc.)
- Ao clicar, abre um dialog/popover mostrando o link e um botao "Copiar"
- O link e montado com `window.location.origin + /autocadastro/ + company.self_register_token`

**5. Botao similar na pagina `Participantes.tsx`**

- Quando uma empresa estiver selecionada no filtro, mostrar botao "Link de Autocadastro" que copia o link da empresa selecionada

**6. Rota no `App.tsx`**

- Adicionar rota publica: `<Route path="/autocadastro/:token" element={<AutocadastroParticipante />} />`

### Detalhes tecnicos

**Funcao do banco (SECURITY DEFINER):**

```sql
CREATE OR REPLACE FUNCTION public.self_register_participant(
  p_token text,
  p_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_department text DEFAULT NULL,
  p_position text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_facilitator_id uuid;
  v_participant_id uuid;
BEGIN
  SELECT id, facilitator_id INTO v_company_id, v_facilitator_id
  FROM companies
  WHERE self_register_token = p_token;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Link invalido';
  END IF;

  -- Verificar se email ja existe nessa empresa
  IF EXISTS (SELECT 1 FROM participants WHERE email = p_email AND company_id = v_company_id) THEN
    RAISE EXCEPTION 'Este email ja esta cadastrado nesta empresa';
  END IF;

  INSERT INTO participants (name, email, phone, department, position, company_id, facilitator_id)
  VALUES (p_name, p_email, p_phone, p_department, p_position, v_company_id, v_facilitator_id)
  RETURNING id INTO v_participant_id;

  RETURN v_participant_id;
END;
$$;
```

**Componente de copiar link (reutilizavel):**

Sera um dialog simples com o link em um campo readonly e botao "Copiar" que usa `navigator.clipboard.writeText()`.

### Fluxo esperado

1. Facilitador acessa detalhes da empresa e clica em "Link de Autocadastro"
2. Dialog mostra o link unico da empresa com botao de copiar
3. Facilitador compartilha o link (WhatsApp, email, etc.)
4. Participante acessa o link, ve o nome da empresa e preenche o formulario
5. Participante e criado automaticamente com status "pending"
6. Facilitador ve o novo participante na lista e pode enviar convite normalmente

