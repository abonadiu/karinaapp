
# Plano: Menu Dropdown no Nome do Usuário

## Resumo

Transformar a seção "Conta" da sidebar em um dropdown que aparece ao clicar no nome do usuário no footer, mostrando as opções: Perfil, Administração, Portal da Empresa (se gestor) e Sair.

---

## Mudança Visual

### Antes (Atual)
```text
+---------------------------+
| Menu                      |
|   Dashboard               |
|   Empresas                |
|   Participantes           |
|   Relatórios              |
+---------------------------+
| Conta                     |
|   Portal da Empresa       |
|   Perfil                  |
|   Administração           |
+---------------------------+
| [Avatar] Nome do Usuário  |
|          Facilitador  [X] |
+---------------------------+
```

### Depois (Proposto)
```text
+---------------------------+
| Menu                      |
|   Dashboard               |
|   Empresas                |
|   Participantes           |
|   Relatórios              |
+---------------------------+
|                           |
|                           |
|                           |
+---------------------------+
| [Avatar] Nome do Usuário▼ |  <-- Clicável
|          Facilitador      |
+---------------------------+
         |
         v  (ao clicar)
+---------------------------+
| Portal da Empresa         |
| Perfil                    |
| Administração             |
|---------------------------|
| Sair                      |
+---------------------------+
```

---

## Componentes Envolvidos

### DropdownMenu (Radix UI)

Usar o componente DropdownMenu já existente em `src/components/ui/dropdown-menu.tsx`:

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
```

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/Sidebar.tsx` | Remover seção "Conta", adicionar dropdown no footer |

---

## Implementação

### 1. Remover Seção "Conta" do SidebarContent

Remover o `SidebarGroup` com label "Conta" (linhas 92-136).

### 2. Substituir Footer por DropdownMenu

```tsx
<SidebarFooter className="border-t border-sidebar-border">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="flex items-center gap-2 px-2 py-3 w-full hover:bg-sidebar-accent rounded-md transition-colors">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(profile?.full_name)}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isManager ? "Gestor" : "Facilitador"}
              </p>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </>
        )}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent 
      side="top" 
      align="start"
      className="w-56 bg-popover"
    >
      {isManager && managerCompanyId && (
        <DropdownMenuItem asChild>
          <Link to="/empresa/portal">
            <Building className="mr-2 h-4 w-4" />
            Portal da Empresa
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem asChild>
        <Link to="/perfil">
          <User className="mr-2 h-4 w-4" />
          Perfil
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/admin">
          <Shield className="mr-2 h-4 w-4" />
          Administração
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</SidebarFooter>
```

---

## Novos Imports Necessários

```tsx
import { ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
```

---

## Detalhes de UX

| Aspecto | Comportamento |
|---------|---------------|
| Trigger | Clique no nome/avatar do usuário |
| Direção | Abre para cima (`side="top"`) |
| Indicador | Ícone ChevronUp ao lado do nome |
| Separador | Linha antes do "Sair" para destacar ação destrutiva |
| Cor "Sair" | Vermelho (`text-destructive`) para indicar ação irreversível |
| Hover | Background muda ao passar mouse no footer |

---

## Seção Técnica

### Estrutura do DropdownMenuContent

```tsx
<DropdownMenuContent 
  side="top"           // Abre para cima
  align="start"        // Alinha à esquerda
  sideOffset={8}       // Espaçamento do trigger
  className="w-56 bg-popover"  // Largura fixa e fundo sólido
>
```

### Links com DropdownMenuItem

```tsx
<DropdownMenuItem asChild>
  <Link to="/perfil" className="flex items-center cursor-pointer">
    <User className="mr-2 h-4 w-4" />
    Perfil
  </Link>
</DropdownMenuItem>
```

### Ação de Logout

```tsx
<DropdownMenuItem 
  onClick={() => signOut()} 
  className="text-destructive focus:text-destructive cursor-pointer"
>
  <LogOut className="mr-2 h-4 w-4" />
  Sair
</DropdownMenuItem>
```

---

## Estimativa

| Etapa | Esforço |
|-------|---------|
| Modificar Sidebar.tsx | 1 mensagem |
| **Total** | 1 mensagem |
