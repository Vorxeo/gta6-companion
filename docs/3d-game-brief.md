# VI Companion: minijogo 3D (proposta para a fase de criação)

**Estado:** protótipo 3D feito em Godot 4.5.2 e exportado para Web. Está incorporado em `/arcade/demo` (um contrato público) e `/arcade` (três contratos num pacote entregue apenas após validação Pro no servidor). O código fonte está em `game/godot`.

## Experiência

Um jogo autoral em terceira pessoa, integrado como recurso Pro. O jogador personaliza um personagem, explora um bairro costeiro fictício à noite, identifica carros raros, planeja a aproximação, entra no veículo e chega a um ponto de extração. O objetivo é simples; o interesse vem da movimentação, da direção, do comportamento da segurança, dos caminhos alternativos e das consequências de cada escolha.

O primeiro recorte jogável deve ter um bairro pequeno e detalhado, com ruas, garagem, estacionamento de luxo, pedestres, tráfego e interiores pontuais. Nada de mapa enorme vazio. Cada contrato combina localização do carro, rota de fuga, nível de vigilância, horário e clima. O carro adquirido vai para uma garagem do jogador, com histórico e personalização visual. Uma tentativa fracassada muda a patrulha e a posição dos carros na próxima rodada.

## Qualidade mínima da primeira versão

- Criador de personagem com aparência, roupas e cores; câmera que mostra o resultado antes de jogar.
- Personagem 3D com animações de locomoção, entrada/saída do carro, colisão e câmera de terceira pessoa estável.
- Quatro supercarros **originais** com nomes, silhuetas, interiores, áudio e comportamento de direção distintos.
- Três contratos completos, cada um com ao menos duas abordagens e uma fuga jogável.
- Sistema de atenção de guardas e de perseguição legível para o jogador; sem detecção aleatória.
- Controles de teclado/mouse e gamepad, opções de câmera, legendas e redução de movimento.
- Carregamento progressivo, pausa ao perder foco, configurações gráficas e medição real de desempenho.
- Dados de progresso validados no servidor se forem usados para rankings, recompensas ou benefícios pagos. Um placar baseado só no navegador não é confiável.

## Motor e integração

O protótipo usa **Godot 4.5.2 com exportação Web** incorporada no Next.js. O add-on Godot AI do arquivo fornecido pelo proprietário foi instalado no projeto e o MCP foi registrado e testado com o editor ativo. O ambiente local usa Godot e uvx portáteis em `.tooling/`. O humano animado vem do repositório público GDQuest Open 3D Mannequin (CC BY 4.0); os carros usam malhas CC0 do Kenney Car Kit. Há créditos em `game/godot/assets/ATTRIBUTION.md`. O mundo tem trânsito móvel e jardins, mas ainda precisa de produção visual, direção, áudio, controles móveis e otimização.

O ranking atual é **local ao navegador** e explicitamente não verificado. Não usar as pontuações para prémios, recompensas ou reputação pública. Um ranking global exigirá simulação ou telemetria validada no servidor e proteção contra abuso, além de infraestrutura Supabase configurada.

**Unreal 5/Pixel Streaming** é uma alternativa para fidelidade visual mais alta. Exige uma aplicação Unreal rodando em servidor com GPU e transmissão por WebRTC para cada sessão; custos e escalabilidade precisam ser medidos antes de escolher esse caminho. Não há conector MCP Unity/Unreal instalado nesta sessão. A máquina possui Unity 6 e Unreal 5.2; podemos usar scripts do editor/CLI quando a produção começar.

## Arte e propriedade intelectual

O jogo deve ter cidade, personagens, carros, nomes, marcas, músicas e efeitos próprios ou licenciados para uso comercial. Modelos de supercarros reais servem como **referência de categoria e desempenho**, não como cópias 1:1 de design, logotipos ou nomes. Não usar assets ou personagens de GTA VI, nem vender a experiência como um jogo oficial. Revisar licenças dos pacotes 3D antes de incorporá-los. O trailer atualmente presente no site exige avaliação específica para uso comercial.

## Portões de produção

1. Protótipo de movimento e direção com blocos, medido em desktop e celular.
2. Vertical slice: um personagem, um carro original, uma missão completa, UI e áudio finalizados.
3. Revisão de câmera, controles, performance, acessibilidade e qualidade de arte com jogadores reais.
4. Só então ampliar o bairro, carros, missões e personalização.
5. Integrar autenticação Pro, persistência e antifraude; fazer teste fechado antes da publicação.

A demo gratuita pode ser listada como protótipo jogável. O pacote Pro não está na pasta pública e o handler `/arcade/build/[asset]` exige conta confirmada e assinatura ativa para cada arquivo. O ranking atual é apenas local e manipulável. Antes de premiar jogadores ou divulgar ranking global, validar resultados no servidor e testar em dispositivos móveis. Não apresentar a build como jogo acabado nem como conteúdo oficial da Rockstar.

Referências técnicas: [Godot Web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html), [Godot AI](https://github.com/hi-godot/godot-ai), [Unity Web](https://docs.unity.com/en-us/engine/6000.3/manual/platform-specific/webgl) e [Unreal Pixel Streaming](https://dev.epicgames.com/documentation/unreal-engine/pixel-streaming-in-unreal-engine).
