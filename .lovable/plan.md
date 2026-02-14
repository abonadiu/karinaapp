

## Redesign Profundo do Relatorio de Diagnostico

### Problemas Identificados

1. **Modal pequeno** (max-w-2xl) - conteudo fica apertado e dificil de ler
2. **Redundancia** - Pontos fortes/fracos sao mostrados como DimensionCards E depois todas as dimensoes sao mostradas novamente com os mesmos cards
3. **Score header fraco** - circulo pequeno, sem impacto visual
4. **DimensionCard generico** - todos os cards iguais, sem hierarquia visual, muita informacao empilhada
5. **Recomendacoes basicas** - lista simples com checkmarks sem destaque
6. **Sem transicoes visuais** entre secoes
7. **Sem cores das dimensoes** - o sistema ja tem cores definidas (dimension-consciousness, dimension-coherence, etc.) mas nao sao usadas nos cards

### Solucao

#### 1. Expandir o modal para drawer/sheet lateral

Substituir o Dialog por um **Sheet** (drawer lateral) ocupando ~70% da tela, com scroll suave. Isso da espaco para o relatorio respirar.

#### 2. Score header impactante

```
+---------------------------------------------------+
|  [gradiente warm]                                 |
|                                                   |
|       ___                                         |
|      / 3.8 \    Resultado de Maria Silva          |
|      \ /5  /    Concluido em 13 de fevereiro      |
|       ---                                         |
|                                                   |
|   "Seu resultado mostra um bom nivel de           |
|    desenvolvimento, com bases solidas..."          |
|                                                   |
|   [========= barra de progresso =========]        |
|   [Badge: Bom desenvolvimento]                    |
+---------------------------------------------------+
```

- Score grande (text-4xl) dentro de um circulo com borda gradiente
- Background com gradient-warm-subtle
- Mensagem interpretativa em destaque
- Badge colorido com o nivel

#### 3. Eliminar redundancia - secao unica de dimensoes

Em vez de mostrar pontos fortes + pontos fracos + todas as dimensoes (3 secoes repetitivas), mostrar **uma unica secao** com todas as 5 dimensoes, cada uma com:
- Barra lateral colorida indicando se e forte (verde), fraca (laranja) ou neutra
- Badge "Ponto forte" ou "Area de desenvolvimento" quando aplicavel
- Usar as cores das dimensoes do design system (dimension-consciousness, etc.)

#### 4. DimensionCard redesenhado com accordion

Novo DimensionCard com design mais profissional:
- **Header compacto**: icone + nome + score + badge de nivel - sempre visivel
- **Conteudo expandivel** (Collapsible): descricao detalhada, interpretacao, "por que importa"
- Barra lateral com cor da dimensao (cada dimensao tem sua cor propria)
- Score como mini-gauge circular em vez de texto simples

```
+--[cor da dimensao]--+------------------------------------+
| |                   | Brain  Consciencia Interior   4.2/5 |
| |  [barra lateral]  | [============================] 84% |
| |                   | [v] Ver detalhes                    |
| |                   +-------------------------------------+
| |                   | "Esta dimensao avalia..."           |
| |                   | > "Voce tem forte capacidade..."    |
| |                   | (icone) Por que importa: "..."      |
+---------------------+-------------------------------------+
```

#### 5. Recomendacoes com visual premium

Redesenhar RecommendationList:
- Card com header gradiente usando a cor da dimensao relacionada
- Cada pratica com icone contextual (meditacao, escrita, etc.)
- Numeracao sequencial para criar senso de progressao
- Separar em "Pratica diaria" vs "Pratica semanal" quando aplicavel

#### 6. Secao "Sobre o Diagnostico" mais visual

Em vez de texto corrido, usar um bloco com icone grande, titulo em Playfair Display e texto em formato de citacao.

### Arquivos a Criar/Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/participants/ParticipantResultModal.tsx` | Redesign completo com layout profissional, score header impactante, eliminacao de redundancia |
| `src/components/diagnostic/DimensionCard.tsx` | Redesign com accordion expansivel, barra lateral colorida, mini-gauge |
| `src/components/diagnostic/RecommendationList.tsx` | Visual premium com cards gradiente e icones contextuais |
| `src/components/diagnostic/DiagnosticResults.tsx` | Mesmas melhorias para consistencia (pagina publica do participante) |
| `src/pages/Participantes.tsx` | Substituir Dialog por Sheet para mais espaco |
| `src/lib/dimension-descriptions.ts` | Adicionar mapeamento dimensao -> cor do design system |

### Detalhes Tecnicos

**Cores das dimensoes** (ja existem no CSS):
- Consciencia Interior: `--dimension-consciousness` (terracotta)
- Coerencia Emocional: `--dimension-coherence` (dourado)
- Conexao e Proposito: `--dimension-purpose` (verde sage)
- Relacoes e Compaixao: `--dimension-compassion` (azul)
- Transformacao: `--dimension-growth` (roxo)

**Componentes reutilizados**:
- `Sheet` (Vaul) para o drawer lateral
- `Collapsible` (Radix) para os accordion nos DimensionCards
- `Progress` existente
- `ResultsRadarChart` (sem alteracao)
- Fontes Playfair Display e Nunito ja configuradas

**Animacoes**: Usar `animate-fade-in` ja configurado no Tailwind para entrada suave dos cards ao expandir.

