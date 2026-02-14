

## Botao "Copiar Link" na Lista de Participantes

Adicionar uma opcao "Copiar link do diagnostico" no menu de acoes (dropdown) de cada participante. Ao clicar, o link completo do diagnostico e copiado para a area de transferencia com feedback visual via toast.

### Mudanca

| Arquivo | Acao |
|---------|------|
| `src/components/participants/ParticipantList.tsx` | Adicionar import do icone `Link` do lucide-react. Adicionar um novo `DropdownMenuItem` "Copiar link" no menu de acoes, visivel para todos os participantes que possuam `access_token`. Ao clicar, copia `{window.location.origin}/diagnostico/{access_token}` para o clipboard e exibe toast de confirmacao usando `sonner`. |

### Detalhes

- O item aparece para **qualquer participante com access_token**, independente do status
- Usa `navigator.clipboard.writeText()` para copiar
- Exibe toast "Link copiado!" com `toast.success` do sonner (ja usado no projeto)
- Posicao no menu: entre os itens de convite/lembrete e o "Editar"

