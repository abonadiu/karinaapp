

## Simplificar navegacao da pagina de detalhes da empresa

### Problema

A barra de acoes do cabecalho tem 6 botoes em linha (Link de Autocadastro, Convidar Gestor, Editar, Enviar Convites, Importar CSV, Adicionar Participante), o que causa poluicao visual e overflow em telas menores.

### Solucao: Agrupar acoes em um menu "Mais acoes"

Manter apenas 2 botoes visiveis no cabecalho e agrupar o restante em um DropdownMenu:

```text
[+ Adicionar Participante]   [Mais acoes v]
```

**Botao principal visivel**: "Adicionar Participante" (acao mais frequente, botao primario)

**DropdownMenu "Mais acoes"** (botao outline com icone MoreHorizontal):
  - Link de Autocadastro (icone Link)
  - Importar CSV (icone Upload)
  - Enviar Convites (icone Send)
  - Convidar Gestor (icone UserPlus)
  - separador
  - Editar Empresa (icone Pencil)

### Alteracoes

**`src/pages/EmpresaDetalhes.tsx`** (linhas 320-348)

Substituir o bloco de 6 botoes por:

1. Um `Button` primario "Adicionar Participante"
2. Um `DropdownMenu` com `DropdownMenuTrigger` (botao outline com icone `MoreHorizontal` e texto "Acoes") contendo `DropdownMenuItem` para cada acao secundaria

Isso reduz a barra de 6 botoes para apenas 2, mantendo todas as funcionalidades acessiveis com um clique a mais nas acoes menos frequentes.

### Beneficios

- Visual limpo e organizado
- Funciona bem em qualquer tamanho de tela
- Acao principal (adicionar participante) continua em destaque
- Todas as funcionalidades continuam acessiveis

