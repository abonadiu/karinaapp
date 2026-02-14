

## Clicar no Participante para Ver Resultado do Teste

### O Que Muda

Na pagina `/participantes`, clicar em uma linha da tabela abre um **Dialog (modal)** com o resultado do diagnostico daquele participante. Para participantes com status "Concluido", mostra o radar chart, pontos fortes/fracos e opcao de baixar PDF. Para outros status, mostra uma mensagem informando que o diagnostico ainda nao foi concluido.

### Por Que um Dialog e Nao uma Nova Pagina

- O resultado ja existe como componente (`ParticipantResultCard`) - reutilizamos
- O usuario pode ver o resultado e voltar rapidamente para a lista
- Evita criar uma nova rota/pagina

### Implementacao

#### 1. Tornar Linhas da Tabela Clicaveis

**Arquivo**: `src/components/participants/ParticipantList.tsx`

- Adicionar prop `onRowClick?: (participant: Participant) => void`
- Adicionar `cursor-pointer` e `hover:bg-muted/50` nas `TableRow`
- Ao clicar na linha (exceto na coluna de acoes), chamar `onRowClick`

#### 2. Dialog de Resultado do Participante

**Arquivo**: `src/pages/Participantes.tsx`

- Adicionar estado `selectedParticipant` para controlar qual participante foi clicado
- Ao selecionar um participante com status `completed`, buscar dados de `diagnostic_results` na base
- Exibir um `Dialog` com o `ParticipantResultCard` dentro (reutilizando componente existente)
- Para participantes sem resultado, mostrar mensagem informativa com o status atual

#### 3. Busca de Dados

Quando um participante e clicado:
```
SELECT * FROM diagnostic_results WHERE participant_id = '<id>'
```

Se encontrar resultado, renderiza o `ParticipantResultCard`. Se nao, mostra mensagem.

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/participants/ParticipantList.tsx` | Adicionar `onRowClick`, estilos hover/pointer nas linhas |
| `src/pages/Participantes.tsx` | Adicionar estado + Dialog + busca de resultado ao clicar |

### Resultado Esperado

1. Linhas da tabela de participantes mostram cursor pointer e destaque ao hover
2. Clicar em um participante "Concluido" abre modal com radar chart, pontos fortes/fracos e botao de PDF
3. Clicar em participante com outro status abre modal informando que o diagnostico nao foi concluido
4. Botao de acoes (tres pontos) continua funcionando normalmente sem abrir o modal

