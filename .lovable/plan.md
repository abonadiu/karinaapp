
## Solucao: Sidebar com Arrastar para Redimensionar

### Problema

O `SidebarRail` do shadcn/ui so faz toggle (clique) entre expandido/colapsado. Nao suporta arrastar para redimensionar. O usuario espera poder arrastar a borda do menu para reduzi-lo progressivamente.

### Abordagem

Substituir o `SidebarRail` por um componente customizado de resize handle que:

1. **Ao arrastar**: redimensiona a largura do sidebar em tempo real usando CSS variable `--sidebar-width`
2. **Snap automatico**: se a largura ficar abaixo de um threshold (ex: 120px), colapsa automaticamente para o modo icone (3rem)
3. **Ao clicar** (sem arrastar): faz toggle entre expandido e colapsado (comportamento atual mantido)

### Detalhes Tecnicos

#### 1. Novo componente `SidebarResizeHandle` em `src/components/layout/Sidebar.tsx`

Criar um componente que:
- Escuta `mousedown` / `mousemove` / `mouseup` para drag
- Atualiza a CSS variable `--sidebar-width` no container do `SidebarProvider`
- Usa `useSidebar()` para acessar `setOpen` e colapsar quando a largura cair abaixo de 120px
- Diferencia clique de drag (se o mouse moveu menos de 5px, e clique; senao, e drag)

```text
+------------------+---+------------------------+
|                  | | |                        |
|    Sidebar       |R| |     Main Content       |
|    (resizable)   |e| |                        |
|                  |s| |                        |
|                  |i| |                        |
|                  |z| |                        |
|                  |e| |                        |
+------------------+---+------------------------+
```

#### 2. Modificar `SidebarProvider` para aceitar largura dinamica

Atualizar o `SidebarProvider` no `src/components/ui/sidebar.tsx` para:
- Adicionar `sidebarWidth` e `setSidebarWidth` ao contexto
- Usar a largura dinamica no style `--sidebar-width`
- Ao expandir (setOpen true), restaurar a ultima largura usada

#### 3. Remover `SidebarRail` e usar `SidebarResizeHandle`

No `Sidebar.tsx`, substituir `<SidebarRail />` pelo novo componente de resize.

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/ui/sidebar.tsx` | Adicionar `sidebarWidth` / `setSidebarWidth` ao contexto do SidebarProvider; atualizar CSS variable dinamicamente |
| `src/components/layout/Sidebar.tsx` | Substituir `SidebarRail` por um `SidebarResizeHandle` customizado com logica de drag + snap |

### Comportamento Esperado

1. **Arrastar a borda direita do menu**: redimensiona fluidamente de 256px ate 120px
2. **Soltar abaixo de 120px**: colapsa automaticamente para modo icone (48px) com animacao suave
3. **Clicar no handle sem arrastar**: toggle entre expandido/colapsado
4. **Modo colapsado**: exibe apenas icones (comportamento `collapsible="icon"` mantido)
5. **Expandir do modo colapsado**: restaura a ultima largura usada
