export interface SubDimension {
  name: string;
  description: string;
}

export interface DimensionDescription {
  about: string;
  theoreticalBasis: string;
  subDimensions: SubDimension[];
  lowInterpretation: string;
  midInterpretation: string;
  highInterpretation: string;
  whyItMatters: string;
  signsInDailyLife: string[];
  connectionToOthers: string;
}

export const DIMENSION_DESCRIPTIONS: Record<string, DimensionDescription> = {
  "Consciência Interior": {
    about: "A Consciência Interior representa a capacidade fundamental de voltar a atenção para si mesmo de forma deliberada e não reativa. Ela abrange a habilidade de observar pensamentos, emoções e sensações corporais sem se identificar automaticamente com eles, criando um espaço entre estímulo e resposta. Esta dimensão inclui a prática de atenção plena (mindfulness), a auto-observação reflexiva e o reconhecimento de padrões automáticos de pensamento e comportamento que operam abaixo do nível consciente. Trata-se de desenvolver uma 'testemunha interna' capaz de notar o que acontece dentro de nós antes de reagir, transformando reações impulsivas em respostas conscientes e intencionais.",

    theoreticalBasis: "Fundamentada nas pesquisas de Jon Kabat-Zinn sobre mindfulness e redução de estresse (MBSR), nos estudos de Daniel Siegel sobre integração neural e 'mindsight', e na tradição contemplativa adaptada pela psicologia positiva. A neurociência contemporânea demonstra que práticas regulares de auto-observação fortalecem o córtex pré-frontal e reduzem a reatividade da amígdala, promovendo respostas mais conscientes e equilibradas. Os trabalhos de Richard Davidson no Center for Healthy Minds da Universidade de Wisconsin confirmam que a meditação regular altera positivamente a estrutura e o funcionamento cerebral, aumentando a capacidade de regulação atencional e emocional.",

    subDimensions: [
      { name: "Atenção Plena", description: "Capacidade de estar presente no momento atual com curiosidade e abertura, sem julgamento ou tentativa de modificar a experiência. Envolve perceber o que está acontecendo aqui e agora — sons, sensações, pensamentos — sem se perder em ruminações sobre o passado ou preocupações com o futuro." },
      { name: "Auto-observação Reflexiva", description: "Habilidade de perceber seus próprios estados internos — pensamentos recorrentes, emoções sutis, reações corporais — como se estivesse observando de um ponto de vista ligeiramente distanciado. É a capacidade de 'pensar sobre o pensar', percebendo não apenas o conteúdo da experiência, mas o processo em si." },
      { name: "Reconhecimento de Padrões", description: "Identificar tendências repetitivas de pensamento, emoção e comportamento que operam de forma automática. Inclui perceber gatilhos que disparam reações previsíveis, crenças limitantes que se repetem em diferentes contextos, e hábitos mentais que moldam a forma como interpretamos a realidade." },
      { name: "Pausa Consciente", description: "Criar deliberadamente um espaço entre o estímulo e a resposta, permitindo que a reação automática seja substituída por uma escolha consciente. É a prática de 'respirar antes de reagir', acessando uma resposta mais alinhada com seus valores e intenções." }
    ],

    lowInterpretation: "Seu resultado indica que você pode estar operando predominantemente no 'piloto automático', reagindo a situações de forma habitual sem perceber claramente o que está sentindo ou pensando no momento. Isso é extremamente comum na vida contemporânea, onde a velocidade das demandas nos empurra para respostas rápidas e irrefletidas. Na prática, isso pode se manifestar como dificuldade em perceber quando está sob estresse até que o corpo dê sinais claros (dores, tensões, insônia), ou como uma sensação de que os dias passam sem que você esteja plenamente presente neles. A boa notícia é que a consciência interior é uma habilidade treinável — pequenas práticas diárias de atenção plena, mesmo de 5 minutos, podem gerar mudanças perceptíveis em poucas semanas. O primeiro passo é simplesmente começar a notar: notar quando sua mente divaga, notar sensações corporais, notar emoções que surgem. Esse 'notar' já é consciência interior em ação.",

    midInterpretation: "Você já demonstra capacidade de auto-observação em diversos momentos do seu dia, conseguindo identificar emoções e pensamentos com alguma clareza. No entanto, essa capacidade pode ser inconsistente — funcionando bem em situações de baixa pressão, mas enfraquecendo quando o estresse aumenta ou quando você é ativado emocionalmente. Isso indica que sua 'musculatura' de atenção plena está em desenvolvimento, mas ainda não é robusta o suficiente para se manter estável em cenários desafiadores. Para avançar, o convite é tornar a prática de auto-observação mais regular e estruturada: estabelecer momentos fixos do dia para pausas conscientes, experimentar técnicas como o escaneamento corporal, e gradualmente expandir a atenção plena para atividades rotineiras como caminhar, comer e conversar. A consistência da prática é mais importante que a duração — 5 minutos diários superam 30 minutos esporádicos.",

    highInterpretation: "Você demonstra forte capacidade de voltar a atenção para dentro, reconhecendo pensamentos, emoções e sensações corporais com clareza e consistência. Essa habilidade é um recurso valioso que serve como alicerce para todas as outras dimensões do seu desenvolvimento pessoal e profissional. Sua capacidade de auto-observação provavelmente permite que você identifique padrões de comportamento, antecipe reações emocionais e faça escolhas mais conscientes mesmo em situações de pressão. Para aprofundar essa competência, considere explorar práticas contemplativas mais avançadas, como a meditação vipassana ou a investigação somática, que podem revelar camadas mais sutis de condicionamento e expandir ainda mais sua capacidade de presença. Além disso, sua consciência interior desenvolvida coloca você em posição privilegiada para apoiar outras pessoas no desenvolvimento dessa habilidade — compartilhar sua experiência pode amplificar o impacto positivo na sua comunidade.",

    whyItMatters: "A consciência interior é o alicerce de todo desenvolvimento pessoal genuíno. Sem a capacidade de perceber nossos padrões automáticos, ficamos presos em ciclos de reação que se repetem indefinidamente. Pesquisas em neurociência demonstram que pessoas com maior consciência interior tomam decisões mais alinhadas com seus valores, têm relacionamentos mais satisfatórios e apresentam maior resiliência diante de adversidades.",

    signsInDailyLife: [
      "Perceber quando está no 'piloto automático' e trazer-se deliberadamente de volta ao momento presente",
      "Notar tensões corporais (ombros tensos, mandíbula cerrada) antes que se tornem dores crônicas ou sinais de esgotamento",
      "Reconhecer quando uma reação emocional é desproporcional à situação e conseguir investigar o que realmente a provocou",
      "Fazer pausas voluntárias durante o dia para respirar conscientemente e reconectar-se com o momento atual"
    ],

    connectionToOthers: "A Consciência Interior funciona como a dimensão raiz do modelo de Consciência Integral. Ela alimenta diretamente a Coerência Emocional — sem perceber o que sentimos, não podemos regular nossas emoções. Sustenta a Conexão e Propósito — o autoconhecimento é a base para identificar valores autênticos. Fortalece as Relações e Compaixão — a auto-observação previne projeções e reações defensivas nos relacionamentos. E viabiliza a Transformação — reconhecer padrões é o primeiro passo para mudá-los."
  },

  "Coerência Emocional": {
    about: "A Coerência Emocional mede a habilidade de reconhecer, nomear, compreender e regular emoções de forma equilibrada e construtiva. Vai além de simplesmente 'controlar' emoções — envolve a capacidade de acolhê-las como informações valiosas, compreender suas origens e escolher conscientemente como expressá-las. Esta dimensão abrange a literacia emocional (capacidade de nomear emoções com precisão), a regulação emocional adaptativa (modular a intensidade emocional sem suprimir ou reprimir), e a expressão emocional autêntica — comunicar o que sente de forma honesta e construtiva, respeitando tanto a si mesmo quanto ao outro.",

    theoreticalBasis: "Baseada no modelo de inteligência emocional de Daniel Goleman e nos trabalhos de Peter Salovey e John Mayer, que definem a inteligência emocional como a capacidade de perceber, usar, compreender e gerenciar emoções. Incorpora também os estudos de Marc Brackett (Yale Center for Emotional Intelligence) sobre literacia emocional e o método RULER, que demonstra como a capacidade de nomear emoções com granularidade aumenta a capacidade de regulá-las. A pesquisa de James Gross sobre estratégias de regulação emocional distingue entre estratégias adaptativas (reavaliação cognitiva, aceitação) e desadaptativas (supressão, ruminação), evidenciando que a forma como regulamos emoções impacta diretamente nossa saúde mental e qualidade de vida.",

    subDimensions: [
      { name: "Literacia Emocional", description: "Capacidade de identificar e nomear emoções com precisão e granularidade, distinguindo entre estados emocionais semelhantes mas distintos (ex: irritação vs. frustração vs. ressentimento). Pesquisas mostram que nomear uma emoção corretamente já inicia o processo de regulá-la — um fenômeno chamado 'affect labeling'." },
      { name: "Regulação Emocional Adaptativa", description: "Habilidade de modular a intensidade e a duração de estados emocionais sem suprimi-los ou negá-los. Inclui técnicas como a reavaliação cognitiva (mudar a forma de interpretar uma situação), a respiração reguladora, e a capacidade de tolerar desconforto emocional sem agir impulsivamente." },
      { name: "Expressão Emocional Autêntica", description: "Comunicar emoções de forma honesta, respeitosa e construtiva, encontrando o equilíbrio entre autenticidade e adequação ao contexto. Envolve a coragem de ser vulnerável quando necessário e a sabedoria de escolher o momento e a forma adequados para a expressão." },
      { name: "Consciência dos Gatilhos", description: "Reconhecer as situações, pessoas e contextos que tendem a ativar respostas emocionais intensas, permitindo uma preparação antecipada e uma resposta mais consciente quando esses gatilhos são acionados." }
    ],

    lowInterpretation: "Seu resultado sugere que pode haver dificuldade em identificar, nomear ou expressar o que sente — ou, no outro extremo, uma tendência a reagir impulsivamente às emoções sem conseguir modulá-las. Ambas as situações são mais comuns do que imaginamos: nossa cultura frequentemente nos ensina a suprimir emoções ('engolir o choro', 'não demonstrar fraqueza') ou nos deixa sem ferramentas para lidar com elas de forma saudável. Na vida cotidiana, isso pode se manifestar como explosões emocionais seguidas de arrependimento, dificuldade em expressar necessidades em relacionamentos, sensação de estar à mercê das próprias emoções, ou um 'embotamento emocional' — não saber o que está sentindo a maior parte do tempo. O desenvolvimento da coerência emocional começa com o vocabulário: aprender a nomear emoções com mais precisão já é um passo transformador. A prática de perguntar-se 'o que estou sentindo agora?' várias vezes ao dia cria o hábito de atenção emocional que é a base para a regulação.",

    midInterpretation: "Você demonstra boa capacidade de lidar com suas emoções na maioria das situações do cotidiano, conseguindo identificar o que sente e expressar-se de forma razoavelmente adequada. No entanto, situações de maior pressão, conflito interpessoal ou carga emocional intensa ainda podem desestabilizar sua capacidade de regulação, levando a reações que depois parecem exageradas ou inadequadas. Isso é natural e indica que seu sistema de regulação emocional funciona bem dentro de certa faixa de intensidade, mas precisa ser fortalecido para situações mais desafiadoras. O próximo passo no seu desenvolvimento envolve expandir sua 'janela de tolerância' — a faixa de intensidade emocional dentro da qual você consegue funcionar com equilíbrio. Práticas como a técnica de respiração 4-7-8 em momentos de ativação, o registro escrito de emoções ('diário emocional'), e a prática da comunicação não-violenta podem fortalecer significativamente sua coerência emocional em cenários de alta demanda.",

    highInterpretation: "Você apresenta maturidade emocional significativa, demonstrando capacidade de reconhecer, compreender e regular suas emoções mesmo em situações complexas e desafiadoras. Essa competência provavelmente se reflete em relacionamentos mais saudáveis, capacidade de manter a calma sob pressão e habilidade de expressar necessidades e limites de forma clara e respeitosa. Sua inteligência emocional é um diferencial tanto na vida pessoal quanto profissional — líderes emocionalmente inteligentes tendem a criar ambientes mais seguros e produtivos ao seu redor. Para continuar evoluindo, considere explorar dimensões mais sutis da experiência emocional: emoções mistas ou ambivalentes, a influência de estados emocionais nas suas decisões e percepções, e a prática de usar emoções como bússola para decisões alinhadas com seus valores mais profundos. Sua capacidade emocional também o posiciona como um recurso valioso para apoiar outras pessoas no seu desenvolvimento.",

    whyItMatters: "A coerência emocional é determinante para a qualidade das nossas decisões, relacionamentos e saúde mental. Pessoas com alta inteligência emocional têm 58% mais chances de sucesso em posições de liderança (Bradberry & Greaves, 2009) e reportam maior satisfação nos relacionamentos. A incapacidade de regular emoções está associada a conflitos interpessoais crônicos, burnout, ansiedade e depressão.",

    signsInDailyLife: [
      "Conseguir nomear o que está sentindo com precisão (ex: 'estou frustrado' em vez de 'estou mal') e perceber como isso muda a experiência",
      "Manter a calma e a clareza de pensamento em conversas difíceis ou conflituosas, sem suprimir o que sente",
      "Perceber quando uma emoção está se intensificando e usar técnicas (respiração, pausa) para modulá-la antes que se torne avassaladora",
      "Expressar vulnerabilidade e necessidades em relacionamentos sem medo excessivo de julgamento ou rejeição"
    ],

    connectionToOthers: "A Coerência Emocional é alimentada diretamente pela Consciência Interior — sem perceber o que sentimos, não podemos regular. Ela potencializa as Relações e Compaixão — a regulação emocional permite empatia genuína sem esgotamento. Fortalece a Conexão e Propósito — emoções reguladas liberam energia para ações alinhadas com valores. E sustenta a Transformação — a capacidade de tolerar o desconforto emocional da mudança é essencial para crescer."
  },

  "Conexão e Propósito": {
    about: "A Conexão e Propósito avalia o grau de alinhamento entre suas ações cotidianas e seus valores mais profundos, assim como a clareza do seu senso de direção e significado na vida. Esta dimensão vai além da mera definição de metas — trata-se de sentir que sua vida tem um 'porquê' que transcende objetivos imediatos. Inclui a conexão com algo maior que si mesmo — seja uma causa, uma comunidade, uma dimensão espiritual ou um legado que deseja construir. Pessoas com alto senso de propósito não apenas sabem o que querem alcançar, mas entendem profundamente por que isso importa e como se conecta ao todo maior.",

    theoreticalBasis: "Fundamentada na logoterapia de Viktor Frankl, que demonstrou que o ser humano pode encontrar sentido mesmo nas circunstâncias mais adversas, e que a 'vontade de sentido' é uma motivação primária. Incorpora os trabalhos de Martin Seligman sobre florescimento humano (modelo PERMA), onde o 'Meaning' é um dos cinco pilares do bem-estar. Também se baseia nas pesquisas de Deci e Ryan sobre a Teoria da Autodeterminação, que mostra que a necessidade de propósito e significado é tão fundamental quanto as necessidades de autonomia e competência. Os estudos de Amy Wrzesniewski sobre 'job crafting' demonstram que o propósito pode ser cultivado em qualquer contexto de trabalho, não dependendo necessariamente de uma grande missão existencial.",

    subDimensions: [
      { name: "Clareza de Valores", description: "Capacidade de identificar e articular os valores que guiam suas decisões e comportamentos — o que realmente importa para você, independentemente de expectativas externas. Envolve distinguir entre valores autênticos (internamente motivados) e valores introjetados (adotados por pressão social, familiar ou cultural)." },
      { name: "Alinhamento Valores-Ações", description: "Grau de coerência entre o que você declara como importante e o que efetivamente faz no dia a dia. É a ponte entre intenção e ação — quando há forte alinhamento, a pessoa experimenta uma sensação de integridade e autenticidade; quando há desalinhamento, surgem sentimentos de vazio, culpa ou incongruência." },
      { name: "Senso de Contribuição", description: "Percepção de que suas ações contribuem para algo além de si mesmo — a comunidade, a família, a sociedade, o meio ambiente. Pessoas com forte senso de contribuição encontram motivação e resiliência mesmo em atividades aparentemente mundanas, porque enxergam como elas se conectam a um impacto maior." },
      { name: "Conexão Transcendente", description: "Capacidade de se conectar com dimensões que transcendem o ego individual — seja através de espiritualidade, natureza, arte, contemplação ou serviço ao próximo. Essa conexão oferece uma perspectiva mais ampla sobre a vida, ajudando a contextualizar dificuldades e encontrar serenidade diante do que não pode ser controlado." }
    ],

    lowInterpretation: "Seu resultado indica que pode haver uma sensação de desconexão entre o que você faz diariamente e o que realmente considera importante. Talvez as demandas da rotina tenham obscurecido seus valores essenciais, ou talvez você esteja atravessando um período de transição em que antigos propósitos já não ressoam e novos ainda não se cristalizaram. Essa sensação de 'desalinhamento' ou 'falta de sentido' é mais comum do que parece e frequentemente se manifesta como desmotivação persistente, sensação de estar 'no automático', dificuldade em tomar decisões importantes ou um vazio existencial sutil. É importante reconhecer que o propósito não precisa ser uma grande missão heroica — ele pode residir em coisas simples como estar presente para sua família, contribuir com excelência no seu trabalho, ou cultivar beleza ao seu redor. O caminho de reconexão começa com perguntas: 'O que me faz sentir vivo?', 'Quando perco a noção do tempo?', 'O que faria mesmo que ninguém pagasse por isso?'.",

    midInterpretation: "Você demonstra alguma clareza sobre seus valores e propósito, com áreas da vida em que sente alinhamento e outras onde percebe lacunas. É provável que em certos contextos (talvez o trabalho ou os relacionamentos) haja boa conexão com seus valores, enquanto em outros a sensação de significado esteja mais fraca. Esse padrão indica que você tem a base necessária para viver com propósito, mas pode beneficiar-se de uma reflexão mais profunda e sistemática sobre como expandir esse alinhamento para todas as áreas da sua vida. Um exercício poderoso é mapear como você distribui seu tempo semanal e comparar com o que declara como seus valores essenciais — as discrepâncias revelam onde estão as oportunidades de realinhamento. Fortalecer essa dimensão não requer mudanças radicais, mas sim ajustes conscientes que gradualmente tornam seu cotidiano mais coerente com aquilo que genuinamente importa para você.",

    highInterpretation: "Você demonstra forte alinhamento entre valores, ações e propósito. Essa clareza é um recurso extraordinariamente poderoso — pessoas com alto senso de propósito demonstram maior resiliência, melhor saúde física e mental, e maior satisfação com a vida, segundo pesquisas publicadas no Journal of Positive Psychology. Sua capacidade de conectar ações cotidianas a um significado maior provavelmente se reflete em decisões mais firmes, motivação mais sustentável e uma presença que inspira aqueles ao seu redor. Para continuar evoluindo, considere aprofundar sua conexão transcendente — explorar dimensões espirituais, filosóficas ou contemplativas que ampliem sua perspectiva. Considere também como pode usar sua clareza de propósito para apoiar outras pessoas que estejam buscando o próprio senso de direção, multiplicando assim o impacto positivo que já gera.",

    whyItMatters: "Pesquisas longitudinais demonstram que pessoas com forte senso de propósito vivem em média 7 anos mais (Boyle et al., 2009), têm 2,4 vezes menos chances de desenvolver Alzheimer, e reportam níveis significativamente maiores de satisfação com a vida. Na esfera profissional, colaboradores que enxergam propósito no trabalho são 3 vezes mais engajados e apresentam desempenho 30% superior. O propósito funciona como uma bússola interna que orienta decisões, sustenta motivação e oferece resiliência diante de adversidades.",

    signsInDailyLife: [
      "Sentir que suas atividades diárias contribuem para algo significativo, mesmo quando são simples ou rotineiras",
      "Tomar decisões importantes com relativa clareza, pois seus valores servem como critérios orientadores",
      "Experimentar momentos de 'fluxo' onde a atividade é tão alinhada com seus valores que o tempo parece desaparecer",
      "Sentir-se motivado por razões internas (significado, crescimento, contribuição) mais do que por recompensas externas"
    ],

    connectionToOthers: "A Conexão e Propósito é nutrida pela Consciência Interior — o autoconhecimento revela valores autênticos. É fortalecida pela Coerência Emocional — emoções reguladas permitem discernir entre propósitos genuínos e escapismos. Alimenta as Relações e Compaixão — quem vive com propósito tende a construir vínculos mais significativos. E depende da Transformação — o propósito precisa de ação e coragem para se manifestar no mundo."
  },

  "Relações e Compaixão": {
    about: "A dimensão Relações e Compaixão avalia a qualidade da sua conexão emocional com outros seres humanos e consigo mesmo. Abrange a empatia genuína — a capacidade de compreender e ressoar com a experiência emocional do outro sem perder-se nela — a compaixão ativa — o desejo e a ação de aliviar o sofrimento — e a autocompaixão — tratar-se com a mesma gentileza que ofereceria a um bom amigo em momentos de dificuldade. Inclui também a capacidade de perdoar, de estabelecer vínculos seguros e de manter conexões autênticas mesmo quando há divergências ou conflitos.",

    theoreticalBasis: "Fundamentada nos trabalhos de Kristin Neff sobre autocompaixão, que distingue três componentes: gentileza consigo mesmo (vs. autocrítica), humanidade compartilhada (vs. isolamento) e mindfulness (vs. sobre-identificação com o sofrimento). Incorpora a teoria do apego de John Bowlby e os estudos de Sue Johnson sobre vínculos emocionais, que demonstram como nossos padrões de apego na infância moldam nossos relacionamentos adultos — mas podem ser conscientemente transformados. Os trabalhos de Tania Singer e Olga Klimecki no Instituto Max Planck distinguem entre empatia (sentir com o outro, podendo levar a fadiga) e compaixão (sentir pelo outro com motivação de ajudar, gerando resiliência), demonstrando que a compaixão pode ser treinada e ativa circuitos de recompensa no cérebro.",

    subDimensions: [
      { name: "Empatia e Escuta Profunda", description: "Capacidade de se colocar genuinamente no lugar do outro, compreendendo sua perspectiva emocional e cognitiva sem julgamento. Inclui a escuta que vai além das palavras — percebendo tom de voz, expressão corporal e o que não é dito. Não se trata de concordar, mas de compreender autenticamente." },
      { name: "Autocompaixão", description: "Tratar-se com gentileza e compreensão diante de falhas, erros e sofrimentos, em vez de mergulhar em autocrítica destrutiva. A autocompaixão não é autoindulgência — pesquisas mostram que pessoas autocompassivas são mais motivadas, assumem mais responsabilidade por seus erros e têm maior resiliência." },
      { name: "Capacidade de Perdão", description: "Habilidade de liberar ressentimentos — não porque a ofensa não importou, mas porque carregar o peso do rancor causa mais dano a quem o carrega. O perdão é um processo que inclui reconhecer a dor, escolher não se definir por ela, e gradualmente liberar a carga emocional associada." },
      { name: "Vulnerabilidade Corajosa", description: "Capacidade de se mostrar autenticamente, incluindo medos, inseguranças e necessidades, nos relacionamentos. Baseada nos trabalhos de Brené Brown, a vulnerabilidade não é fraqueza — é a manifestação mais corajosa da conexão humana e o fundamento da intimidade genuína." }
    ],

    lowInterpretation: "Seu resultado sugere que podem existir barreiras à conexão emocional genuína — seja com outros ou consigo mesmo. Isso pode se manifestar de diferentes formas: dificuldade em confiar e se abrir nos relacionamentos, tendência ao isolamento emocional mesmo quando cercado de pessoas, autocrítica severa que dificulta a autocompaixão, ou dificuldade em perdoar (a si mesmo ou aos outros). Estas barreiras frequentemente têm raízes em experiências passadas onde a vulnerabilidade foi punida, ignorada ou explorada. É importante reconhecer que proteger-se emocionalmente foi uma estratégia legítima de sobrevivência, mas que pode estar limitando a profundidade e a riqueza dos seus vínculos atuais. O caminho de desenvolvimento nesta dimensão é gradual e gentil: começa com pequenos gestos de autocompaixão (falar consigo mesmo como falaria com um amigo querido) e se expande para exercícios de empatia consciente e prática de vulnerabilidade em relacionamentos seguros.",

    midInterpretation: "Você demonstra boa capacidade de conexão emocional e empatia em muitos contextos, conseguindo construir e manter relacionamentos significativos. No entanto, pode haver situações específicas onde essas habilidades enfraquecem — talvez em momentos de conflito, com pessoas que percebe como 'diferentes', ou quando a vulnerabilidade se torna desconfortável. A autocompaixão pode ser um ponto particular de desenvolvimento: muitas pessoas são genuinamente compassivas com outros, mas impiedosamente autocríticas consigo mesmas, mantendo um 'duplo padrão' de gentileza. Para fortalecer esta dimensão, observe onde estão suas 'zonas de resistência' — com quem você tem mais dificuldade de empatizar? Em que situações a autocrítica se torna mais severa? Esses pontos de resistência são exatamente onde está o maior potencial de crescimento. Práticas como a meditação de bondade amorosa (Metta) e exercícios de autocompaixão guiada podem ampliar progressivamente sua capacidade de conexão.",

    highInterpretation: "Você demonstra forte capacidade empática e compassiva, tanto com os outros quanto consigo mesmo. Esta é uma competência rara e preciosa que provavelmente se reflete em relacionamentos profundos e satisfatórios, capacidade de criar ambientes emocionalmente seguros e uma presença acolhedora que convida a autenticidade nos outros. Sua capacidade de autocompaixão sugere uma relação saudável consigo mesmo — base essencial para oferecer compaixão genuína ao mundo. É importante, no entanto, estar atento ao risco de 'fadiga de compaixão' — quando damos muito sem repor nossas reservas emocionais. Para sustentar essa capacidade ao longo do tempo, mantenha práticas regulares de autocuidado e estabeleça limites saudáveis que protejam sua energia sem fechar seu coração. Considere também como pode usar essa habilidade para impactar comunidades mais amplas — a compaixão é contagiosa e pode criar ondas de transformação social.",

    whyItMatters: "A qualidade dos nossos relacionamentos é o maior preditor isolado de felicidade e longevidade, segundo o Harvard Study of Adult Development — o estudo mais longo já realizado sobre felicidade humana (75+ anos). A autocompaixão está associada a menor ansiedade, maior motivação intrínseca e maior capacidade de recuperação após fracassos. Em ambientes profissionais, líderes compassivos geram equipes com até 40% menos rotatividade e maior criatividade.",

    signsInDailyLife: [
      "Sentir-se genuinamente tocado pela experiência de outra pessoa, sem a necessidade de 'consertar' imediatamente a situação",
      "Falar consigo mesmo com gentileza quando comete um erro, em vez de mergulhar em autocrítica ('sou um fracasso', 'nunca faço nada certo')",
      "Conseguir manter a empatia e o respeito mesmo quando discorda profundamente de alguém",
      "Perceber quando precisa estabelecer limites em relacionamentos sem sentir culpa desproporcional"
    ],

    connectionToOthers: "Relações e Compaixão é nutrida pela Consciência Interior — a auto-observação permite perceber reações defensivas antes de agir. É fortalecida pela Coerência Emocional — emoções reguladas permitem empatia sem esgotamento. Alimenta a Conexão e Propósito — relacionamentos significativos dão sentido à vida. E impulsiona a Transformação — vínculos seguros criam a base psicológica necessária para arriscar-se a mudar."
  },

  "Transformação": {
    about: "A Transformação mede sua abertura para mudança, aprendizado contínuo e crescimento pessoal intencional. Vai além da simples adaptação — envolve a disposição de questionar crenças estabelecidas, abandonar zonas de conforto e abraçar o desconforto inerente ao crescimento genuíno. Esta dimensão avalia a presença de uma mentalidade de crescimento (growth mindset): a crença de que habilidades e características podem ser desenvolvidas através de esforço e aprendizado, em oposição a uma mentalidade fixa que vê talentos como inatos e imutáveis. Inclui também a resiliência — a capacidade de se recuperar de adversidades transformando-as em catalisadores de crescimento.",

    theoreticalBasis: "Fundamentada nos trabalhos seminais de Carol Dweck sobre mentalidade de crescimento (growth mindset), que demonstram como nossas crenças sobre a mutabilidade de nossas capacidades determinam nossa resposta a desafios e fracassos. Incorpora os conceitos de Nassim Taleb sobre 'antifragilidade' — sistemas que se fortalecem com estresse e adversidade — e os estudos de Richard Tedeschi e Lawrence Calhoun sobre crescimento pós-traumático, que documentam como experiências difíceis podem catalisar transformação positiva profunda. Baseia-se também no conceito de 'zona de desenvolvimento proximal' de Vygotsky, adaptado para o desenvolvimento adulto: crescemos não na zona de conforto nem na zona de pânico, mas no espaço intermediário onde há desafio suficiente para estimular sem paralisar.",

    subDimensions: [
      { name: "Mentalidade de Crescimento", description: "Crença genuína de que capacidades, inteligência e talentos podem ser desenvolvidos através de esforço, estratégia e aprendizado. Manifesta-se na disposição de encarar erros como oportunidades de aprendizado, buscar feedback construtivo e persistir diante de dificuldades em vez de desistir." },
      { name: "Tolerância à Incerteza", description: "Capacidade de funcionar eficazmente em situações ambíguas, sem precisar de respostas definitivas ou controle total. Inclui a habilidade de tomar decisões com informação incompleta, navegar transições de vida e manter a serenidade diante do desconhecido." },
      { name: "Aprendizado Experiencial", description: "Habilidade de extrair lições significativas tanto de sucessos quanto de fracassos, integrando-as em mudanças concretas de comportamento. Vai além de 'entender intelectualmente' — envolve a transformação da compreensão em ação e da ação em hábito." },
      { name: "Coragem para Mudança", description: "Disposição de sair da zona de conforto, arriscar o familiar pelo potencialmente melhor, e sustentar o desconforto inevitável que acompanha qualquer transformação genuína. Não é a ausência de medo, mas a decisão de agir apesar dele." }
    ],

    lowInterpretation: "Seu resultado indica que pode haver resistência significativa à mudança, possivelmente manifestada como preferência pela previsibilidade, medo de fracassar, ou tendência a permanecer em situações conhecidas mesmo quando não são satisfatórias. É fundamental reconhecer que essa resistência não é 'preguiça' ou 'fraqueza' — frequentemente é uma resposta protetora legítima, baseada em experiências passadas onde mudar trouxe consequências negativas, ou em crenças (muitas vezes inconscientes) de que 'não sou capaz de mudar' ou 'é tarde demais para mim'. A pesquisa sobre mentalidade de crescimento mostra que essas crenças podem ser transformadas, começando pela consciência de que elas existem e pela exposição gradual a evidências contrárias. O caminho não é forçar grandes mudanças, mas sim cultivar uma atitude de curiosidade diante de desafios pequenos e gerenciáveis, celebrando cada passo — por menor que seja — na direção do crescimento.",

    midInterpretation: "Você demonstra disposição para crescer em diversas áreas da sua vida, com abertura para aprendizado e alguma capacidade de lidar com desafios. No entanto, pode haver domínios específicos onde a mudança parece mais assustadora ou difícil — talvez na carreira, em certos relacionamentos ou em hábitos arraigados. Isso sugere que sua mentalidade de crescimento é contextual: funciona bem em áreas onde você se sente competente, mas enfraquece onde a insegurança é maior. O próximo passo é identificar especificamente quais são essas 'zonas de resistência' e começar a aplicar a mesma mentalidade de curiosidade e aprendizado que já funciona em outras áreas. Registrar seus aprendizados — manter um 'diário de crescimento' onde anota lições aprendidas com erros e acertos — pode ajudar a consolidar a mentalidade de crescimento como um recurso disponível em qualquer contexto.",

    highInterpretation: "Você demonstra uma mentalidade de crescimento robusta, abraçando desafios e aprendizados com naturalidade e persistência. Essa postura diante da vida é um diferencial extraordinário — pesquisas mostram que pessoas com forte mentalidade de crescimento alcançam resultados significativamente superiores em praticamente todas as áreas avaliadas, desde desempenho acadêmico até satisfação nos relacionamentos. Sua capacidade de transformar adversidades em oportunidades de crescimento sugere resiliência e antifragilidade — você não apenas se recupera de dificuldades, mas emerge mais forte e sábio. Para continuar evoluindo, considere expandir essa mentalidade para os outros: como você pode inspirar crescimento nas pessoas ao seu redor? Líderes com mentalidade de crescimento transformam culturas inteiras — famílias, equipes, organizações. Considere também explorar seus 'pontos cegos' — áreas onde sua mentalidade de crescimento pode não estar tão ativa quanto imagina.",

    whyItMatters: "Estudos de Carol Dweck demonstram que a mentalidade de crescimento é um dos maiores preditores de realização ao longo da vida, superando QI e condições socioeconômicas em poder preditivo. Pessoas com mentalidade de crescimento são mais resilientes, mais criativas, mais colaborativas e mais dispostas a assumir desafios significativos. Em um mundo de mudanças aceleradas, a capacidade de se reinventar continuamente não é um luxo — é uma necessidade fundamental para o bem-estar e a relevância pessoal e profissional.",

    signsInDailyLife: [
      "Encarar erros e fracassos como fonte de aprendizado valioso em vez de evidência de incapacidade pessoal",
      "Buscar ativamente feedback construtivo, mesmo quando desconfortável, reconhecendo que a perspectiva dos outros enriquece a própria",
      "Sentir-se energizado (não paralisado) diante de desafios novos, mesmo quando não há garantia de sucesso",
      "Celebrar o progresso e o esforço, não apenas os resultados finais — reconhecendo que o caminho é tão valioso quanto o destino"
    ],

    connectionToOthers: "A Transformação é viabilizada pela Consciência Interior — reconhecer padrões que precisam mudar é o primeiro passo. É sustentada pela Coerência Emocional — tolerar o desconforto emocional da mudança exige regulação. É orientada pela Conexão e Propósito — saber 'para quê' mudar dá direção e persistência. E é fortalecida pelas Relações e Compaixão — vínculos seguros criam a rede de apoio necessária para arriscar-se a crescer."
  }
};

export function getInterpretation(dimension: string, score: number): string {
  const desc = DIMENSION_DESCRIPTIONS[dimension];
  if (!desc) return "";
  if (score < 2.5) return desc.lowInterpretation;
  if (score < 3.5) return desc.midInterpretation;
  return desc.highInterpretation;
}

export function getDimensionAbout(dimension: string): string {
  return DIMENSION_DESCRIPTIONS[dimension]?.about || "";
}

export function getDimensionWhyItMatters(dimension: string): string {
  return DIMENSION_DESCRIPTIONS[dimension]?.whyItMatters || "";
}

export function getDimensionTheoreticalBasis(dimension: string): string {
  return DIMENSION_DESCRIPTIONS[dimension]?.theoreticalBasis || "";
}

export function getDimensionSubDimensions(dimension: string): SubDimension[] {
  return DIMENSION_DESCRIPTIONS[dimension]?.subDimensions || [];
}

export function getDimensionSignsInDailyLife(dimension: string): string[] {
  return DIMENSION_DESCRIPTIONS[dimension]?.signsInDailyLife || [];
}

export function getDimensionConnectionToOthers(dimension: string): string {
  return DIMENSION_DESCRIPTIONS[dimension]?.connectionToOthers || "";
}

export const DIAGNOSTIC_INTRO = "O Diagnóstico de Consciência Integral é uma ferramenta de avaliação profunda que mapeia cinco dimensões fundamentais do desenvolvimento humano integral. Baseado em teorias consolidadas da psicologia positiva, neurociência contemplativa e tradições sapienciais, o instrumento utiliza 56 itens avaliados em escala Likert para produzir um perfil multidimensional que revela não apenas onde você está, mas aponta caminhos concretos para onde pode ir. Este não é um teste de 'certo ou errado' — é um espelho que reflete seu momento atual com o objetivo de iluminar seu potencial de crescimento.";

export const DIAGNOSTIC_THEORETICAL_FOUNDATION = "O modelo de Consciência Integral integra contribuições de múltiplas tradições científicas e filosóficas: a inteligência emocional (Goleman, Salovey & Mayer), a psicologia positiva (Seligman, Csikszentmihalyi), a logoterapia existencial (Viktor Frankl), a neurociência contemplativa (Davidson, Siegel), a ciência da autocompaixão (Neff), e a teoria da mentalidade de crescimento (Dweck). Cada dimensão avaliada representa um domínio empiricamente validado do funcionamento humano integral, e a interação entre elas cria um sistema dinâmico onde o desenvolvimento em uma área potencializa as demais.";

export function getOverallScoreMessage(score: number): string {
  if (score >= 4) return "Seu resultado indica um alto nível de desenvolvimento nas dimensões avaliadas. Você demonstra consistência em práticas de autoconhecimento, regulação emocional e conexão com propósito. Seu perfil sugere uma pessoa que integra diferentes dimensões da inteligência emocional e espiritual de forma coerente, criando uma base sólida para continuar evoluindo e para influenciar positivamente o ambiente ao seu redor.";
  if (score >= 3) return "Seu resultado mostra um bom nível de desenvolvimento, com bases sólidas em várias dimensões. Há oportunidades claras de crescimento que, se exploradas com intenção e consistência, podem elevar significativamente sua inteligência emocional e espiritual. O fato de estar realizando este diagnóstico já demonstra abertura para o autoconhecimento — um dos recursos mais valiosos para qualquer jornada de desenvolvimento.";
  if (score >= 2) return "Seu resultado indica um estágio moderado de desenvolvimento, com fundamentos presentes e áreas específicas que se beneficiariam de atenção intencional. Este diagnóstico é um ponto de partida valioso — ele revela com precisão onde estão as maiores oportunidades de crescimento. Pequenas mudanças de hábito, praticadas com consistência, podem gerar transformações significativas nas dimensões avaliadas.";
  return "Seu resultado mostra que você está no início de uma jornada importante de autoconhecimento. Cada dimensão avaliada representa uma oportunidade concreta de crescimento. O primeiro passo — e talvez o mais importante — já foi dado ao realizar este diagnóstico. A partir daqui, mesmo as menores ações na direção do desenvolvimento podem criar um efeito cascata positivo em todas as áreas da sua vida.";
}

// Dimension color mappings for the design system
export const DIMENSION_COLORS: Record<string, { border: string; bg: string; text: string; bgSubtle: string }> = {
  "Consciência Interior": {
    border: "border-l-[hsl(var(--dimension-consciousness))]",
    bg: "bg-[hsl(var(--dimension-consciousness))]",
    text: "text-[hsl(var(--dimension-consciousness))]",
    bgSubtle: "bg-[hsl(var(--dimension-consciousness)/0.1)]",
  },
  "Coerência Emocional": {
    border: "border-l-[hsl(var(--dimension-coherence))]",
    bg: "bg-[hsl(var(--dimension-coherence))]",
    text: "text-[hsl(var(--dimension-coherence))]",
    bgSubtle: "bg-[hsl(var(--dimension-coherence)/0.1)]",
  },
  "Conexão e Propósito": {
    border: "border-l-[hsl(var(--dimension-purpose))]",
    bg: "bg-[hsl(var(--dimension-purpose))]",
    text: "text-[hsl(var(--dimension-purpose))]",
    bgSubtle: "bg-[hsl(var(--dimension-purpose)/0.1)]",
  },
  "Relações e Compaixão": {
    border: "border-l-[hsl(var(--dimension-compassion))]",
    bg: "bg-[hsl(var(--dimension-compassion))]",
    text: "text-[hsl(var(--dimension-compassion))]",
    bgSubtle: "bg-[hsl(var(--dimension-compassion)/0.1)]",
  },
  "Transformação": {
    border: "border-l-[hsl(var(--dimension-growth))]",
    bg: "bg-[hsl(var(--dimension-growth))]",
    text: "text-[hsl(var(--dimension-growth))]",
    bgSubtle: "bg-[hsl(var(--dimension-growth)/0.1)]",
  },
};

export function getDimensionColor(dimension: string) {
  return DIMENSION_COLORS[dimension] || {
    border: "border-l-primary",
    bg: "bg-primary",
    text: "text-primary",
    bgSubtle: "bg-primary/10",
  };
}

export function getScoreLevelBadge(score: number): { label: string; className: string } {
  if (score >= 4) return { label: "Excelente", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  if (score >= 3) return { label: "Bom desenvolvimento", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  if (score >= 2) return { label: "Em progresso", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  return { label: "Início da jornada", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
}
