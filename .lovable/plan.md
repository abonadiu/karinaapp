

# Plano: Sidebar Colapsavel e Redimensionavel

## Resumo
Implementar melhorias na sidebar para permitir:
1. Colapso total (recolher completamente, nao apenas para icones)
2. Redimensionamento por arraste (drag to resize)

---

## Situacao Atual

A sidebar atual utiliza o componente Shadcn UI com as seguintes caracteristicas:
- Colapsa para modo "icon" (3rem/48px) mantendo icones visiveis
- Nao permite colapso total (0px)
- Nao suporta redimensionamento por arraste

---

## Solucao Proposta

### Opcao 1: Modificar Sidebar Shadcn (Recomendada)

Modificar o comportamento da sidebar existente para suportar:

1. **Colapso Total (offcanvas)**: Alterar `collapsible="icon"` para `collapsible="offcanvas"` permitindo colapso completo
2. **Adicionar SidebarRail**: Componente ja existe no arquivo, permite toggle via clique na borda

**Vantagens**: Menor impacto no codigo existente, utiliza componentes ja disponiveis

### Opcao 2: Usar Resizable Panels

Envolver a sidebar com `react-resizable-panels` para permitir redimensionamento livre.

**Vantagens**: Redimensionamento continuo, mais flexibilidade
**Desvantagens**: Mais complexo, pode conflitar com a logica atual

---

## Implementacao Escolhida: Opcao 1 (Modificada)

Combinar as duas abordagens:
- Usar `collapsible="offcanvas"` para colapso total
- Adicionar `SidebarRail` para toggle visual na borda
- Persistir estado no localStorage

---

## Arquivos a Modificar

### 1. src/components/layout/Sidebar.tsx

Alteracoes:
- Mudar `collapsible="icon"` para `collapsible="offcanvas"`
- Adicionar import e uso do `SidebarRail`
- Adicionar botao de toggle dentro do footer quando colapsado

### 2. src/components/layout/DashboardLayout.tsx

Alteracoes:
- Garantir que o `SidebarTrigger` esteja sempre visivel no header
- Nenhuma mudanca significativa necessaria (ja possui trigger)

---

## Detalhes Tecnicos

### Comportamento Esperado

| Estado | Largura Desktop | Conteudo Visivel |
|--------|-----------------|------------------|
| Expandido | 256px (16rem) | Menu completo com icones e labels |
| Colapsado | 0px | Nada (sidebar totalmente oculta) |

### Interacoes
- **Clique no SidebarTrigger (header)**: Toggle entre expandido/colapsado
- **Clique no SidebarRail (borda)**: Toggle entre expandido/colapsado
- **Atalho Ctrl/Cmd + B**: Toggle via teclado
- **Cookie**: Estado persistido automaticamente

### SidebarRail
Componente que adiciona uma area clicavel na borda direita da sidebar:
- Cursor muda para indicar acao possivel
- Linha vertical aparece no hover
- Clique alterna estado da sidebar

---

## Codigo Proposto

### Sidebar.tsx (modificado)

```typescript
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail, // Novo import
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  return (
    <Sidebar collapsible="offcanvas"> {/* Alterado de "icon" para "offcanvas" */}
      <SidebarHeader>
        {/* Header content */}
      </SidebarHeader>

      <SidebarContent>
        {/* Menu content */}
      </SidebarContent>

      <SidebarFooter>
        {/* Footer content */}
      </SidebarFooter>
      
      <SidebarRail /> {/* Novo: permite toggle clicando na borda */}
    </Sidebar>
  );
}
```

---

## Comportamento Mobile

No mobile, a sidebar ja usa Sheet (drawer) que desliza sobre o conteudo. Esse comportamento permanece inalterado.

---

## Consideracoes de UX

1. **Trigger sempre visivel**: O botao no header garante que o usuario sempre pode reabrir a sidebar
2. **Persistencia**: O estado e salvo em cookie, entao a preferencia do usuario e lembrada
3. **Atalho de teclado**: Ctrl/Cmd+B continua funcionando
4. **Animacao suave**: Transicoes CSS ja estao configuradas (200ms ease-linear)

---

## Passos de Implementacao

1. Modificar `Sidebar.tsx`:
   - Adicionar import do `SidebarRail`
   - Alterar `collapsible` para `"offcanvas"`
   - Adicionar `<SidebarRail />` antes do fechamento do `</Sidebar>`

2. Verificar `DashboardLayout.tsx`:
   - Confirmar que `SidebarTrigger` esta no header (ja esta)
   - Nenhuma alteracao necessaria

3. Testar comportamento:
   - Toggle via botao do header
   - Toggle via clique no rail
   - Toggle via atalho Ctrl+B
   - Persistencia apos refresh

---

## Estimativa
- 1 mensagem para implementar

