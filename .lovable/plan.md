

## Mover seletor de idioma para o rodape e corrigir erro de build

### Problema 1: Erro de build (TypeScript)
O tipo `t` esta definido como `typeof translations["pt"]`, que cria um tipo literal exato com os valores em portugues. As traducoes em ingles e espanhol nao batem com esses literais (ex: `"Home"` nao e compativel com `"Inicio"`).

**Correcao**: Mudar o tipo para usar uma interface generica em vez de tipo literal.

### Problema 2: Seletor de idioma no lugar errado
O seletor de idioma (PT / EN / ES) esta no header. O usuario quer que fique apenas no rodape.

### Mudancas

**1. `src/i18n/LanguageContext.tsx`** - Corrigir o tipo de `t`:
- Trocar `typeof translations["pt"]` por `(typeof translations)[Language]` ou usar um tipo mais flexivel como `Record<string, any>` com a estrutura correta.
- A deteccao de idioma do sistema operacional ja esta implementada na funcao `detectLanguage()`.

**2. `src/components/site/SiteHeader.tsx`** - Remover o seletor de idioma:
- Remover os botoes PT / EN / ES do header (desktop e mobile).
- Remover imports e estado relacionados ao `setLanguage` e `Language` que nao forem mais necessarios.

**3. `src/components/site/SiteFooter.tsx`** - Adicionar o seletor de idioma:
- Adicionar os botoes PT / EN / ES no rodape, com o mesmo estilo visual (referencia da imagem enviada).
- Importar `useLanguage` e `Language` para controlar a troca de idioma.

### Detalhes tecnicos

Correcao do tipo em `LanguageContext.tsx`:
```typescript
// De:
t: typeof translations["pt"];
// Para:
t: (typeof translations)[Language];
```

Isso permite que `t` aceite qualquer uma das tres traducoes sem conflito de tipos literais.

