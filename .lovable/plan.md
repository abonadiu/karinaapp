

## Remover Snap Automatico ao Colapsar

### Problema Atual

Quando o usuario arrasta a borda do menu para a esquerda e a largura cai abaixo de 120px, o menu "pula" automaticamente para o modo colapsado (48px com icones). O usuario quer poder reduzir a largura gradualmente sem que o menu feche sozinho.

### Solucao

Remover o comportamento de snap automatico durante o arraste. O menu so colapsara ao **clicar** no handle (sem arrastar), nunca durante o drag.

### Mudanca

**Arquivo**: `src/components/layout/Sidebar.tsx`

- Remover a constante `COLLAPSE_THRESHOLD`
- Alterar `MIN_WIDTH` de 48 para algo como 60-64px (largura minima util para exibir icones)
- Simplificar o `handleMouseMove`: apenas atualizar a largura sem verificar threshold de colapso
- Manter o clique (sem drag) como toggle entre expandido/colapsado

**Logica simplificada do drag**:
```
handleMouseMove:
  newWidth = clamp(startWidth + delta, MIN_WIDTH, MAX_WIDTH)
  setSidebarWidth(newWidth)
  setOpen(true)  // sempre aberto durante drag
```

O usuario podera arrastar ate a largura minima (~60px) onde so os icones ficam visiveis, sem nunca ter o menu "fechando" abruptamente.

### Arquivo a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/layout/Sidebar.tsx` | Remover snap/collapse durante drag; ajustar MIN_WIDTH; manter click-toggle |

