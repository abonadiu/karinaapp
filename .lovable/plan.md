

## Usar o BrandSymbol como favicon

### O que sera feito

Criar um arquivo SVG do simbolo da marca na pasta `public/` e atualizar o `index.html` para usa-lo como favicon.

### Mudancas

**1. Criar `public/favicon.svg`**

Extrair o SVG do componente `BrandSymbol` com a cor `#335072` (cor da marca) e salvar como arquivo estatico.

**2. Atualizar `index.html`**

Substituir a referencia ao `favicon.ico` atual por:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
```

