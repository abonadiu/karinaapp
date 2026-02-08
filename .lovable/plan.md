
## Melhoria do Mapeamento Corporal e Expansão do Questionário

### Visão Geral
Este plano implementa duas melhorias significativas no diagnóstico:
1. **Silhueta corporal mais detalhada e interativa** com 22 zonas anatômicas (atual: 11)
2. **16 novas perguntas** no questionário, totalizando 56 questões (atual: 40)

---

## Parte 1: Mapeamento Corporal Avançado

### Problemas atuais
- Silhueta muito simplificada (formas geométricas básicas)
- Apenas 11 zonas genéricas
- Visual pouco anatômico e profissional
- Sem indicador de intensidade (apenas presença/ausência)

### Nova implementação

**22 zonas corporais detalhadas:**

```text
CABEÇA E PESCOÇO
+----------------+
| Testa/Fronte   |
| Olhos          |
| Mandíbula      |
| Nuca           |
+----------------+

TRONCO SUPERIOR
+----------------+
| Ombro Esq/Dir  |
| Trapézio       |
| Peito          |
| Costas Alta    |
+----------------+

BRAÇOS
+----------------+
| Braço Esq/Dir  |
| Antebraço E/D  |
| Mão Esq/Dir    |
+----------------+

TRONCO MÉDIO/INFERIOR
+----------------+
| Abdômen        |
| Lombar         |
| Quadril        |
+----------------+

PERNAS
+----------------+
| Coxa Esq/Dir   |
| Joelho Esq/Dir |
| Panturrilha E/D|
| Pé Esq/Dir     |
+----------------+
```

**Novo recurso: Nível de intensidade**
- Clique 1x = Leve (amarelo/verde claro)
- Clique 2x = Moderado (laranja/verde médio)
- Clique 3x = Intenso (vermelho/verde escuro)
- Clique 4x = Remove seleção

**Melhorias de UX:**
- SVG anatômico mais realista com curvas bezier
- Tooltips ao passar o mouse com nome da região
- Animação de pulse ao selecionar
- Tamanho maior da silhueta (responsivo)
- Modo unificado (seleciona tensão OU conforto por área, com toggle visual)

---

## Parte 2: Expansão do Questionário

### Estrutura atual
- 5 dimensões × 8 perguntas = 40 perguntas
- Cada dimensão tem ~2 perguntas reversas

### Nova estrutura
- 5 dimensões × 10-12 perguntas = 56 perguntas (+40%)
- Mantém proporção de ~25% perguntas reversas

### Novas perguntas por dimensão

**1. Consciência Interior (+3 perguntas)**
- "Consigo fazer pausas conscientes durante o dia para verificar como estou me sentindo."
- "Percebo a diferença entre o que penso e o que sinto em situações desafiadoras."
- "Tenho dificuldade em distinguir minhas próprias opiniões das opiniões dos outros." (reversa)

**2. Coerência Emocional (+3 perguntas)**
- "Consigo pedir ajuda quando estou emocionalmente sobrecarregado."
- "Reconheço quando estou projetando minhas emoções em outras pessoas."
- "Evito situações que possam trazer desconforto emocional." (reversa)

**3. Conexão e Propósito (+4 perguntas)**
- "Minhas decisões importantes são guiadas por meus valores pessoais."
- "Sinto que contribuo de forma significativa para algo além de mim mesmo."
- "Frequentemente me sinto perdido sobre qual direção tomar na vida." (reversa)
- "Consigo encontrar significado mesmo em experiências difíceis."

**4. Relações e Compaixão (+3 perguntas)**
- "Pratico a escuta atenta, sem planejar minha resposta enquanto o outro fala."
- "Consigo reconhecer e celebrar as conquistas dos outros genuinamente."
- "Tenho dificuldade em pedir desculpas quando erro." (reversa)

**5. Transformação (+3 perguntas)**
- "Busco ativamente feedback sobre meu comportamento e desempenho."
- "Consigo identificar lições valiosas em fracassos e decepções."
- "Prefiro manter as coisas como estão do que arriscar mudanças." (reversa)

---

## Plano de Implementação

### Etapa 1: Migração de banco de dados
Inserir as 16 novas perguntas na tabela `diagnostic_questions` com a ordem correta.

### Etapa 2: Novo componente de mapeamento corporal
Criar `ExerciseBodyMapV2.tsx` com:
- SVG anatômico detalhado (22 zonas)
- Sistema de intensidade (3 níveis)
- Animações e feedback visual aprimorado
- Layout responsivo

### Etapa 3: Atualizar hook e tipos
- Atualizar interface `ExercisesData` para incluir intensidade
- Ajustar `useDiagnostic.ts` para usar novo componente

### Etapa 4: Atualizar página de diagnóstico
- Substituir `ExerciseBodyMap` por `ExerciseBodyMapV2`

---

## Detalhes Técnicos

### Estrutura de dados do novo mapeamento

```typescript
interface BodySelection {
  areaId: string;
  type: "tension" | "comfort";
  intensity: 1 | 2 | 3; // leve, moderado, intenso
}

interface BodyMapData {
  selections: BodySelection[];
}
```

### Zonas anatômicas (22 áreas)

```typescript
const BODY_AREAS = [
  // Cabeça
  { id: "forehead", name: "Testa", region: "head" },
  { id: "eyes", name: "Olhos", region: "head" },
  { id: "jaw", name: "Mandíbula", region: "head" },
  { id: "nape", name: "Nuca", region: "neck" },
  // Tronco superior
  { id: "left_shoulder", name: "Ombro Esquerdo", region: "upper" },
  { id: "right_shoulder", name: "Ombro Direito", region: "upper" },
  { id: "trapezius", name: "Trapézio", region: "upper" },
  { id: "chest", name: "Peito", region: "upper" },
  { id: "upper_back", name: "Costas Alta", region: "upper" },
  // Braços
  { id: "left_arm", name: "Braço Esquerdo", region: "arms" },
  { id: "right_arm", name: "Braço Direito", region: "arms" },
  { id: "left_forearm", name: "Antebraço Esquerdo", region: "arms" },
  { id: "right_forearm", name: "Antebraço Direito", region: "arms" },
  { id: "left_hand", name: "Mão Esquerda", region: "arms" },
  { id: "right_hand", name: "Mão Direita", region: "arms" },
  // Tronco médio/inferior
  { id: "abdomen", name: "Abdômen", region: "core" },
  { id: "lower_back", name: "Lombar", region: "core" },
  { id: "hips", name: "Quadril", region: "core" },
  // Pernas
  { id: "left_thigh", name: "Coxa Esquerda", region: "legs" },
  { id: "right_thigh", name: "Coxa Direita", region: "legs" },
  { id: "left_calf", name: "Panturrilha Esquerda", region: "legs" },
  { id: "right_calf", name: "Panturrilha Direita", region: "legs" },
  { id: "left_foot", name: "Pé Esquerdo", region: "legs" },
  { id: "right_foot", name: "Pé Direito", region: "legs" },
];
```

---

## Arquivos a serem criados/modificados

| Arquivo | Ação |
|---------|------|
| `src/components/diagnostic/ExerciseBodyMapV2.tsx` | Criar |
| `src/pages/Diagnostico.tsx` | Modificar (usar V2) |
| `src/hooks/useDiagnostic.ts` | Modificar (interface) |
| Migração SQL | Inserir 16 perguntas |

---

## Resultado esperado
- Diagnóstico mais completo com 56 perguntas
- Mapeamento corporal profissional e interativo
- Dados mais ricos para análise (intensidade das sensações)
- Melhor experiência visual para participantes
