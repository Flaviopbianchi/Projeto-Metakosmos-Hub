# mK3D Whitelabel — Documentação de Design System

> Documentação gerada via Figma MCP | Arquivo: mK3D - Whitelabel | Data: 2026-02-28

---

## Índice

- [Tokens Globais](#tokens-globais)
- [Componente 1 — ComponenteCards](#componente-1--componentecards)
- [Componente 2 — ComponentesMenus (Barra de Ação)](#componente-2--componentesmenus-barra-de-ação)
- [Componente 3 — ComponenteBtCtaV (Botão CTA Carrinho)](#componente-3--componentebtctav-botão-cta-carrinho)
- [Componente 4 — ComponenteBtCtaComprar (Botão CTA Comprar)](#componente-4--componentebtctacomprar-botão-cta-comprar)
- [Componente 5 — ComponenteBtCtaInscrever (Botão Inscrever na Lista de Espera)](#componente-5--componentebtctainscrever-botão-inscrever-na-lista-de-espera)
- [Componente 6 — BtAcaoLabelEIcone (Botão Próximo)](#componente-6--btacaolabeleicone-botão-próximo)
- [Componente 7 — BtPoweredBy](#componente-7--btpoweredby)
- [Componente 8 — BtFecharComponent (Botão Fechar)](#componente-8--btfecharcomponent-botão-fechar)
- [Componente 9 — ComponenteFecharEFullscreen (Controle Fechar + Fullscreen)](#componente-9--componentefecharefullscreen-controle-fechar--fullscreen)
- [Componente 10 — BtVoltarG (Botão Voltar)](#componente-10--btvoltarg-botão-voltar)
- [Componente 11 — ComponenteCor (Seletor de Cor)](#componente-11--componentecor-seletor-de-cor)
- [Componente 12 — OverlayCorDefault (Dropdown de Cores)](#componente-12--overlaycordefault-dropdown-de-cores)
- [Componente 13 — IFrameFlexform (Layout do Viewer)](#componente-13--iframeflexform-layout-do-viewer)
- [Temas Whitelabel](#temas-whitelabel)
  - [Positivo](#tema-positivo)
- [Problemas Identificados](#problemas-identificados)
- [Changelog](#changelog)

---

## Tokens Globais

> Nenhum token está publicado como variável no Figma neste arquivo. Todos os valores abaixo foram inferidos dos estilos hardcoded nos componentes documentados. **Recomenda-se publicar estes tokens como variáveis no Figma antes de escalar o whitelabel para novos clientes.**

### Cores

| Token sugerido | Valor | Uso |
|----------------|-------|-----|
| `color/neutral/dark` | `#1C1D1D` | Fundo CTA padrão, botão fechar ativo, botão navegação ativo |
| `color/neutral/white` | `#FFFFFF` | Fundo botões de ação secundária (pill) |
| `color/neutral/gray` | `#D9D9D9` | Placeholder de imagem/3D viewer |
| `color/neutral/gray-light` | `#DBDBDB` | Botão de navegação inativo |
| `color/cta/success` | `#00FC8A` | Fundo CTA em estado de confirmação (verde) |
| `color/cta/disabled` | `#9C9C9C` | Fundo CTA desabilitado |
| `color/cta/border-hover` | `#8C8C8C` | Borda sutil no estado hover do CTA |
| `color/text/primary` | `#1C1D1D` | Texto sobre fundos claros |
| `color/text/inverse` | `#FFFFFF` | Texto sobre fundos dark |
| `color/text/success` | `#1C1D1D` | Texto sobre fundo verde (confirmação) |
| `color/text/disabled` | `#6E6E6E` | Texto em estados desabilitados |
| `color/text/body` | `#000000` | Corpo de texto nos cards de hotspot |
| `color/surface/glass-card` | `rgba(255, 255, 255, 0.59)` | Fundo do card (glassmorphism forte) |
| `color/surface/glass-bar` | `rgba(255, 255, 255, 0.60)` | Fundo da barra de controle Fechar/Fullscreen |
| `color/surface/glass-menu` | `rgba(255, 255, 255, 0.23)` | Fundo da barra de menu (glassmorphism leve) |
| `color/shadow/overlay` | `rgba(0, 0, 0, 0.25)` | Shadow genérico de botões e menus |
| `color/danger/border` | `#FF5C5C` | Borda do botão fechar em estado de confirmação de saída |
| `color/surface/glass-control` | `rgba(255, 255, 255, 0.25)` | Fundo do badge BtPoweredBy |
| `color/swatch/preto` | `#1C1D1D` | Swatch de cor de produto — Preto |
| `color/swatch/cinza` | `#C9C9C9` | Swatch de cor de produto — Cinza |
| `color/swatch/branco` | `#FFFFFF` | Swatch de cor de produto — Branco |
| `color/swatch/verde` | `#005C32` | Swatch de cor de produto — Verde |
| `color/swatch/roxo` | `#7C15DB` | Swatch de cor de produto — Roxo |

### Tipografia

Família base: **Plus Jakarta Sans** em todos os componentes.

| Token sugerido | Tamanho | Peso | Line Height | Uso |
|----------------|---------|------|-------------|-----|
| `text/hotspot/title` | 14px | Bold (700) | 13px | Título do hotspot no card |
| `text/hotspot/subtitle` | 10px | Regular (400) | 13px | Subtítulo do hotspot |
| `text/hotspot/subtitle-alt` | 10px | SemiBold Italic (600i) | 13px | Subtítulo variante (Variant4) |
| `text/hotspot/body` | 12px | Regular (400) | 13px | Corpo descritivo do hotspot |
| `text/label/close` | 10px | Light (300) | 13px | Label do botão "Fechar" |
| `text/button/secondary` | 12px | Regular (400) | 13px | Labels dos botões de ação (Prove, Ver em 3D, Medidas) |
| `text/button/cta` | 10px | Bold (700) | 13px | Label do botão CTA (Adicionar ao carrinho, Comprar) |
| `text/button/action` | 10px | Bold (700) | 13px | Label do botão de ação direcional (Próximo) |
| `text/label/powered-by` | 8px | Medium (500) | 13px | Label "Powered By" no badge mK |
| `text/swatch/label` | 8px | Light (300) | 13px | Label de nome de cor no overlay de seleção |
| `text/selector/label` | 10px | Light (300) | 13px | Label do seletor de cor fechado |

### Espaçamento

| Token sugerido | Valor | Contexto |
|----------------|-------|----------|
| `spacing/1` | 4px | Gap entre ícone e label; gap mínimo entre elementos |
| `spacing/1.25` | 5px | Gap entre elementos do card principal |
| `spacing/1.5` | 6px | Gap entre botões de navegação; padding vertical da barra de menu |
| `spacing/2` | 8px | Padding interno de botões pill; padding horizontal da barra de menu |
| `spacing/3` | 12px | Padding horizontal dos botões de ação secundária |
| `spacing/3.5` | 14px | Padding do card na Variant3 |
| `spacing/4` | 16px | Gap entre seções de conteúdo e entre cards |

### Efeitos

| Token sugerido | Tipo | Valor | Uso |
|----------------|------|-------|-----|
| `blur/surface-bar` | Background Blur | 4px | Barra de controle Fechar/Fullscreen |
| `blur/surface-card` | Background Blur | 8.9px | Card de conteúdo (glassmorphism) |
| `blur/menu` | Background Blur | 3.95px | Barra de menu flutuante |
| `shadow/button-nav` | Drop Shadow | `0 0 4px rgba(0,0,0,0.25)` | Botões de navegação (seta) |
| `shadow/menu` | Drop Shadow | `0 0 19px rgba(0,0,0,0.25)` | Sombra da barra de menu |
| `shadow/cta-hover` | Drop Shadow | `0 0 10.9px rgba(0,0,0,1)` | Hover do botão CTA |
| `shadow/button-strong` | Drop Shadow | `0 0 8px rgba(0,0,0,0.5)` | BtAcaoLabelEIcone Variant3; BtFecharComponent Variant2 |
| `blur/powered-by` | Background Blur | 4px | Badge BtPoweredBy |

### Border Radius

| Token sugerido | Valor | Uso |
|----------------|-------|-----|
| `radius/image-sm` | 10px | Placeholder de imagem (Variant Default do card) |
| `radius/button-pill` | 24px | Botões de ação secundária, botões de navegação, card |
| `radius/bar` | 35px | Container da barra de menu |
| `radius/button-cta` | 40px | Botão CTA (Adicionar ao carrinho / Comprar) |
| `radius/pill-lg` | 31px | Barra de controle Fechar/Fullscreen |
| `radius/overlay` | 7px | Overlay do dropdown de cores |
| `radius/swatch` | 15px | Swatches de cor de produto |

### Ícones referenciados

| Ícone | Biblioteca | Tamanho | Uso |
|-------|------------|---------|-----|
| `material-symbols-light:close-rounded` | Material Symbols | 12px | Botão fechar |
| `stash:arrow-up-light` | Stash Icons | 14px | Navegação entre hotspots |
| `mynaui:ar` | Mynaui Icons | 16px | Botão "Prove em você" (AR) |
| `ic:round-3d-rotation` | Iconify / Material | 16px | Botão "Ver em 3D" |
| `mdi:rotate-3d` | Material Design Icons | 16px | Botão "Ver em 3D" (variante) |
| `solar:ruler-broken` | Solar Icons | 16px | Botão "Medidas" |
| `mdi-light:cart` | Material Design Icons Light | 16px | Botão CTA carrinho |
| `mdi-light:arrow-up` | Material Design Icons Light | 16px | Botão Próximo (rotacionado 90°); Botão Voltar (rotacionado 90° + invertido) |
| `mingcute:fullscreen-fill` | Mingcute | 10–12px | ComponenteFecharEFullscreen — modo fullscreen |
| `mingcute:zoom-in-line` | Mingcute | 10px | ComponenteFecharEFullscreen Variant7 — modo zoom |
| `mi:share` | MI Icons | 10px | ComponenteFecharEFullscreen Variant8 — compartilhar |
| `radix-icons:dot-filled` | Radix UI Icons | 16px | Swatches de cor (ComponenteCor, OverlayCorDefault) |
| `icon-park-solid:down-c` | Icon Park Solid | 16px | Controle de altura do produto (BtAltura — IFrameFlexform) |

---

## Componente 1 — ComponenteCards

**Descrição:** Card flutuante com glassmorphism usado no visualizador 3D para exibir informações contextuais de hotspots. Combina área de imagem/viewer com texto descritivo e controles de navegação entre pontos de interesse.

**Largura base:** 381px (adaptável ao container do viewer)

**Node Figma:** `140:426`

### Variantes

- `Default` — Duas colunas: imagem à esquerda, texto à direita. Botões de navegação na base do texto.
- `Variant2` — Somente área de imagem. Estado de placeholder ou loading.
- `Variant3` — Texto completo acima da imagem. Navegação lateral. Para hotspots com descrição longa.
- `Variant4` — Coluna única vertical: imagem no topo, texto abaixo. Para viewports estreitas ou mobile.

| Cenário | Variante |
|---------|----------|
| Layout padrão com imagem e descrição | Default |
| Viewer em carregamento | Variant2 |
| Descrição longa / hotspot rico | Variant3 |
| Mobile ou viewport estreita | Variant4 |

### Sub-componentes

**ComponenteFecharEFullscreen:** Barra de controle flutuante no canto superior direito. Contém label "Fechar" e botão com ícone `material-symbols-light:close-rounded`.

- Background: `color/surface/glass-bar` + `blur/surface-bar`
- Border-radius: `radius/pill-lg`

**Botões de Navegação (seta):** Pares de botões pill para avançar/recuar entre hotspots.

- Inativo/anterior: fundo `color/neutral/gray-light`
- Ativo/próximo: fundo `color/neutral/dark`
- Tamanho: 22px × 16px | Shadow: `shadow/button-nav`

### Tokens aplicados

- Background do card: `color/surface/glass-card` + `blur/surface-card`
- Border-radius do card: `radius/button-pill` (24px)
- Textos: `text/hotspot/title`, `text/hotspot/subtitle`, `text/hotspot/body`

### Guidelines

- Usar exclusivamente dentro do viewer 3D — o glassmorphism pressupõe fundo com imagem ou modelo 3D
- Em viewports abaixo de 400px, preferir Variant4
- A largura de 381px deve ser limitada por `max-width: 100%` no container pai
- Botão "Fechar" deve ter `aria-label="Fechar visualizador"`
- Botões de navegação devem ter `aria-label="Hotspot anterior"` e `aria-label="Próximo hotspot"`
- O contraste do texto `#000000` sobre `rgba(255,255,255,0.59)` deve ser validado contra o fundo real do viewer

---

## Componente 2 — ComponentesMenus (Barra de Ação)

**Descrição:** Barra de ação flutuante com glassmorphism posicionada sobre o viewer 3D. Combina botões de ativação de funcionalidades imersivas (AR, 3D, Medidas) com botão CTA de conversão. Principal ponto de interação do usuário com o mK3D.

**Largura base:** 378px (fixa na maioria das variantes). Variantes `bt2` sem largura fixa.

**Node Figma:** `120:512`

### Variantes

| Variante | Botões de ação | CTA |
|----------|----------------|-----|
| `bt1-prove` | "Prove em você" (AR) | Adicionar ao carrinho |
| `bt1-ver` | "Ver em 3D" | Adicionar ao carrinho |
| `bt2-A3d-ver` | "Ver em 3D" (ativo) + "Ver tamanho real" | — |
| `bt2-3d-Aver` | "Ver em 3D" + "Ver tamanho real" (ativo) | — |
| `bt3-prove-med` | "Prove em você" + "Medidas" | Adicionar ao carrinho |
| `bt3-ver-medidas` | "Ver em 3D" + "Medidas" | Adicionar ao carrinho |
| `Prove - Ver` | "Ver em 3D" | Inscrever na lista de espera |
| `Prove - Inscrever` | "Prove em você" | Inscrever na lista de espera |

| Contexto do produto | Variante recomendada |
|---------------------|---------------------|
| Produto com AR disponível | `bt1-prove` |
| Produto apenas com 3D | `bt1-ver` |
| Alternando entre 3D e AR no viewer | `bt2-A3d-ver` ou `bt2-3d-Aver` |
| Produto com AR + medidas | `bt3-prove-med` |
| Produto com 3D + medidas | `bt3-ver-medidas` |
| Produto fora de estoque / pré-venda | `Prove - Ver` ou `Prove - Inscrever` |

### Sub-componentes

**Botões de Ação Secundária (pill branco):** Botões com fundo branco que ativam funcionalidades do viewer.

- Background: `color/neutral/white` | Texto: `color/text/primary`
- Altura: 24px | Border-radius: `radius/button-pill`
- Gap ícone–label: `spacing/1`

**Indicador de Tab Ativo (variantes bt2):** Linha horizontal abaixo do botão ativo, largura 38px.

### Tokens aplicados

- Background da barra: `color/surface/glass-menu` + `blur/menu`
- Shadow: `shadow/menu`
- Border-radius: `radius/bar`

### Guidelines

- Posicionar flutuante sobre o viewer, centralizado horizontalmente (`left: 50%` + `transform: translateX(-50%)`)
- Em viewports menores que 400px, avaliar redução dos labels para ícone apenas
- Largura de 378px deve adaptar para `max-width: calc(100% - 32px)` em mobile
- Variantes `bt2` se adaptam melhor a viewports estreitas por não terem largura fixa
- Todos os botões devem ter `aria-label` descritivo
- Indicador de tab ativo deve ser complementado com `aria-selected` nos botões

---

## Componente 3 — ComponenteBtCtaV (Botão CTA Carrinho)

**Descrição:** Botão CTA principal de conversão com ícone de carrinho. Documenta o ciclo completo de interação, incluindo frames de animação de feedback ao clicar.

**Dimensões:** 248px × 35px | Border-radius: `radius/button-cta` (40px)

**Node Figma:** `127:304`

### Mapa de estados

| Estado | Label | Fundo | Texto | Interativo | Descrição |
|--------|-------|-------|-------|------------|-----------|
| `Default` | Adicionar ao carrinho | `color/neutral/dark` | `color/text/inverse` | não (div) | Placeholder estático |
| `A1` | Adicionar ao carrinho | `color/neutral/dark` | `color/text/inverse` | sim (button) | Estado idle clicável |
| `hover` | Adicionar ao carrinho | `color/neutral/dark` | `color/text/inverse` | sim (button) | Hover com borda `color/cta/border-hover` + `shadow/cta-hover` |
| `A2` | Adicionar ao carrinho | `color/neutral/dark` | `color/text/inverse` | não | Animação: ícone -30° |
| `A3` | Adicionar ao carrinho | `color/neutral/dark` | `color/text/inverse` | não | Animação: ícone desloca esq. |
| `A4` | Adicionar ao carrinho | `color/neutral/dark` | `color/text/inverse` | não | Animação: ícone desloca dir. |
| `A5` | Adicionado ao carrinho | `color/neutral/dark` | `color/text/inverse` | não | Animação: label de confirmação |
| `Verde` | Adicionado ao carrinho | `color/cta/success` | `color/text/success` | não | Confirmação final |
| `Variant11` | Adicionado ao carrinho | `color/cta/success` | `color/text/success` | não | Duplicata do Verde — consolidar |
| `Wait` | Adicionar ao carrinho | `color/neutral/dark` | `color/text/inverse` | não | Aguardando API |
| `Inativo` | Adicionar ao carrinho | `color/cta/disabled` | `color/text/disabled` | sim (button) | Produto indisponível |

### Sequência de animação

```
A1 (idle) → [clique] → Wait → A2 → A3 → A4 → A5 → Verde
                                                         ↓ (após timeout)
                                                        A1
[erro na API] → A1
```

### Guidelines

- Implementar como `<button>` em todos os estados (o Figma usa `div` em alguns)
- `Inativo`: `disabled` + `aria-disabled="true"`
- `Wait`: `aria-busy="true"` + `aria-label="Aguardando confirmação"`
- `Verde`: `aria-live="polite"` para anunciar confirmação ao leitor de tela
- Não usar `Default` (div) como botão real — ele não é interativo
- `Variant11` é duplicata do `Verde` — consolidar em um único estado
- `color/cta/success` é o principal ponto de customização por tema no whitelabel

---

## Componente 4 — ComponenteBtCtaComprar (Botão CTA Comprar)

**Descrição:** Variante simplificada do ComponenteBtCtaV para fluxos de compra direta sem etapa de carrinho. Sem ícone, sem animação — apenas 3 estados estáticos.

**Dimensões:** 248px × automático (py: 11px) | Border-radius: `radius/button-cta` (40px)

**Node Figma:** `141:632`

### Estados

| Estado | Label | Fundo | Texto | Descrição |
|--------|-------|-------|-------|-----------|
| `Default` | Comprar | `color/neutral/dark` | `color/text/inverse` | Estado padrão |
| `Variant6` | Comprar | `color/cta/success` | `color/text/success` | Confirmação ou destaque |
| `Inativo` | Comprar | `color/cta/disabled` | `color/text/disabled` | Produto indisponível |

### Relação com ComponenteBtCtaV

| | ComponenteBtCtaComprar | ComponenteBtCtaV |
|---|---|---|
| Ícone | Não tem | `mdi-light:cart` (16px) |
| Label padrão | "Comprar" | "Adicionar ao carrinho" |
| Frames de animação | Não (3 estados) | Sim (A1–A5 + Verde) |
| Uso | Compra direta / checkout | Adicionar ao carrinho |

Os tokens `color/cta/*` são compartilhados. Ao customizar para um tema whitelabel, ambos devem ser atualizados em conjunto.

### Guidelines

- Implementar como `<button>` (o Figma usa `div`)
- Usar quando o fluxo de compra não passa pelo carrinho
- Não usar `Variant6` como estado permanente — é confirmação transitória
- `Inativo`: `disabled` + `aria-disabled="true"`

---

## Componente 5 — ComponenteBtCtaInscrever (Botão Inscrever na Lista de Espera)

**Descrição:** Variante do ComponenteBtCtaComprar para produtos em pré-venda ou lista de espera. Mesma estrutura visual e de estados, com label diferente. Compartilha o mesmo componente base no Figma (`671:296`).

**Dimensões:** 248px × automático (py: 11px) | Border-radius: `radius/button-cta` (40px)

**Node Figma:** `671:296`

### Estados

| Estado | Label | Fundo | Texto | Descrição |
|--------|-------|-------|-------|-----------|
| `Default` | Inscrever na lista de espera | `color/neutral/dark` | `color/text/inverse` | Estado padrão de inscrição |
| `Variant6` | Inscrever na lista de espera | `color/cta/success` | `color/text/success` | Confirmação de inscrição |
| `Inativo` | Comprar | `color/cta/disabled` | `color/text/disabled` | Ação bloqueada |

> **Problema identificado:** O estado `Inativo` exibe o label "Comprar" em vez de "Inscrever na lista de espera". Isso parece um erro de conteúdo no Figma — o texto deveria manter consistência com o fluxo do componente.

### Guidelines

- Usar em produtos em pré-venda, esgotados ou com disponibilidade futura
- Implementar como `<button>` em todos os estados
- `Inativo`: `disabled` + `aria-disabled="true"`
- Tokens compartilhados com `ComponenteBtCtaComprar` — atualizar em conjunto em temas whitelabel

---

## Componente 6 — BtAcaoLabelEIcone (Botão Próximo)

**Descrição:** Botão direcional pill com label "Próximo" e ícone de seta, usado para avançar entre etapas ou telas dentro do viewer. Complementar ao `BtVoltarG`.

**Node Figma:** `127:1677`

### Estados

| Estado | Label | Fundo | Texto | Ícone | Shadow | Descrição |
|--------|-------|-------|-------|-------|--------|-----------|
| `Clicavel` | Próximo | `color/neutral/dark` | `color/text/inverse` | seta branca | — | Estado padrão clicável |
| `Variant3` | Próximo | `color/neutral/dark` | `color/text/inverse` | seta branca | `shadow/button-strong` | Estado com ênfase/destaque |
| `Inativo` | Próximo | `color/cta/disabled` | `color/text/disabled` | seta cinza | — | Estado desabilitado |

### Tokens aplicados

- Padding: `spacing/2` (vertical), `spacing/4` (left), `spacing/2` (right)
- Border-radius: `radius/button-cta` (40px)
- Ícone: `mdi-light:arrow-up` (16px, rotacionado 90°)
- Gap label–ícone: `spacing/1.25` (5px)

### Guidelines

- Posicionar sempre à direita do fluxo de navegação, em par com `BtVoltarG`
- `Variant3` é o estado de destaque — usar quando o próximo passo é a ação primária recomendada
- `Inativo`: `disabled` + `aria-disabled="true"`
- `aria-label="Próximo passo"` quando o contexto não deixar claro o destino

---

## Componente 7 — BtPoweredBy

**Descrição:** Badge de atribuição da plataforma mK. Exibido no viewer como marca d'água discreta. Sem variantes ou estados — componente fixo.

**Dimensões:** 80px × 17px

**Node Figma:** `137:493`

### Estrutura

- Fundo: `color/surface/glass-control` (`rgba(255,255,255,0.25)`) + `blur/powered-by` (4px)
- Border-radius: 29px
- Conteúdo: texto "Powered By" + separador vertical + logotipo mK (SVG)
- Tipografia: `text/label/powered-by` (8px, Medium)

### Guidelines

- Não remover ou ocultar sem autorização — é elemento de branding obrigatório da plataforma
- Posicionar no canto inferior do viewer, sem sobrepor controles interativos
- O glassmorphism pressupõe fundo com conteúdo visual — em fundos brancos sólidos o badge fica invisível

---

## Componente 8 — BtFecharComponent (Botão Fechar)

**Descrição:** Botão "Fechar" standalone com label e ícone de X. Versão atômica do controle de fechamento, usada em contextos onde não há botão de fullscreen associado. Possui estado de confirmação com borda vermelha.

**Node Figma:** `142:524`

### Estados

| Estado | Visual | Borda | Shadow | Descrição |
|--------|--------|-------|--------|-----------|
| `Default` | Label "Fechar" + X dark | — | — | Estado padrão |
| `Variant2` | Label "Fechar" + X com borda vermelha | `#FF5C5C` (1px solid) | `shadow/button-strong` | Estado de confirmação de saída |

### Tokens aplicados

- Container: `color/surface/glass-bar` + `blur/surface-bar` (4px)
- Border-radius: `radius/pill-lg` (31px)
- Padding: `spacing/1` vertical, `spacing/2` horizontal (left), `spacing/1` (right)
- Gap label–ícone: `spacing/1`
- Ícone X: `material-symbols-light:close-rounded` (12px), fundo `color/neutral/dark`, dimensões 22px × 14px
- Borda de confirmação: `color/danger/border` (`#FF5C5C`)

### Guidelines

- `Variant2` (borda vermelha) deve ser usado como estado de "confirmação de saída" — exibido após o primeiro clique, antes de fechar de fato
- Implementar lógica: primeiro clique → `Variant2`; segundo clique → fechar; clique fora → retornar para `Default`
- `aria-label="Fechar"` no estado padrão; `aria-label="Confirmar saída"` no `Variant2`

---

## Componente 9 — ComponenteFecharEFullscreen (Controle Fechar + Fullscreen)

**Descrição:** Barra de controle composta que combina o botão de fullscreen/zoom/share com o botão de fechar. É o componente de controle principal do viewer, com 8 variantes para diferentes modos e contextos de uso.

**Node Figma:** `225:5891`

### Variantes

| Variante | Botão esquerdo | Botão direito | Descrição |
|----------|---------------|---------------|-----------|
| `Default` | Fullscreen (10px, `mingcute:fullscreen-fill`) | Fechar X (14px) | Controle padrão no viewer |
| `Variant2` | Fullscreen | Fechar X com borda vermelha `#FF5C5C` | Confirmação de saída |
| `Variant3` | Fullscreen maior (12px) com shadow | Fechar X | Variante com ênfase no fullscreen |
| `f` | — | Fechar X apenas | Sem botão fullscreen |
| `f1` | — | Fechar X com borda vermelha | Sem fullscreen, em confirmação de saída |
| `iframe-ct` | Fullscreen | — (sem fechar) | Modo iframe — apenas fullscreen |
| `Variant7` | Zoom in (`mingcute:zoom-in-line`) | — | Modo de zoom sem fechar |
| `Variant8` | Share (`mi:share`) | — | Modo compartilhamento |

### Tokens aplicados

- Container: `color/surface/glass-menu` (`rgba(255,255,255,0.23)`) + `blur/menu` (3.95px)
- Border-radius: `radius/pill-lg` (31px)
- Padding: `spacing/1` em todos os lados
- Botão fullscreen/zoom/share: fundo branco, 22px × 16px, `radius/button-pill`
- Botão fechar: fundo `color/neutral/dark`, 31px × 20px, `radius/button-pill`
- Borda de confirmação: `color/danger/border` (`#FF5C5C`) + `shadow/button-nav`

### Guidelines

- Posicionar centralizado horizontalmente no topo do viewer (`-translate-x-1/2`)
- `Variant2` e `f1` (borda vermelha) seguem a mesma lógica de confirmação de saída do `BtFecharComponent`
- `iframe-ct` é usado quando o viewer está embutido em iframe de terceiros — não exibir o botão de fechar
- `Variant7` e `Variant8` são contextos especiais de interação; verificar com o produto quando acioná-los
- Botão fullscreen: `aria-label="Tela cheia"` | Botão fechar: `aria-label="Fechar viewer"`

---

## Componente 10 — BtVoltarG (Botão Voltar)

**Descrição:** Botão de navegação de retorno com ícone de seta. Disponível em duas escalas (grande e pequeno) e dois temas (claro e dark). Complementar ao `BtAcaoLabelEIcone`.

**Node Figma:** `137:180`

### Variantes

| Variante | Fundo | Ícone | Tamanho | Descrição |
|----------|-------|-------|---------|-----------|
| `Default` | `#FFFFFF` | seta escura | 16px icon + padding 8px | Grande, tema claro |
| `Variant2` | `#FFFFFF` | seta escura | 10px icon (sem padding) | Pequeno, tema claro |
| `Variant3` | `color/neutral/dark` | seta branca | 16px icon + padding 8px | Grande, tema dark |
| `Variant4` | `color/neutral/dark` | seta branca | 10px icon (sem padding) | Pequeno, tema dark |

### Tokens aplicados

- Border-radius: `radius/button-cta` (40px — pill)
- Ícone: `mdi-light:arrow-up` rotacionado 90° + `-scale-y-100` (espelhado = seta para esquerda)
- Padding (variantes grandes): `spacing/2` em todos os lados

### Guidelines

- Usar `Default` ou `Variant3` em áreas com espaço suficiente para o botão grande
- Usar `Variant2` ou `Variant4` em barras de controle compactas ou quando o botão grande é intrusivo
- Escolha de tema (claro/dark) deve seguir o contraste com o fundo do viewer no contexto de uso
- `aria-label="Voltar"` obrigatório — o botão não tem label textual

---

## Componente 11 — ComponenteCor (Seletor de Cor)

**Descrição:** Componente de seleção de variação de cor do produto. Exibido como pill fechado que expande para o `OverlayCorDefault`. Possui dois estados: fechado e aberto (indicados pela direção do chevron).

**Dimensões:** 122px × 24px | Border-radius: `radius/button-pill` (24px)

**Node Figma:** `193:1101`

### Estados

| Estado | Elemento | Interativo | Chevron | Descrição |
|--------|----------|------------|---------|-----------|
| Default | `<button>` | sim | `rotate-180` (aponta para cima) | Dropdown aberto |
| `Variant2` | `<div>` | não | `rotate-90` (aponta para direita) | Dropdown fechado |

> **Problema identificado:** A nomenclatura está invertida em relação ao padrão de UX — `Default` é o estado aberto e `Variant2` é o fechado. O estado fechado deveria ser o padrão. Recomenda-se renomear para `closed` e `open`.

### Tokens aplicados

- Fundo: `color/neutral/white`
- Padding: 4px left, 8px right, 1px vertical
- Swatch ativo: `radix-icons:dot-filled` (16px, `radius/swatch`)
- Label selecionado: `text/selector/label` (10px, Light)
- Largura interna: 110px

### Guidelines

- Ao clicar no estado fechado (`Variant2`), exibir o `OverlayCorDefault` posicionado abaixo ou acima do componente
- O swatch exibido no estado fechado deve refletir a cor atualmente selecionada
- `aria-expanded="false"` no fechado, `aria-expanded="true"` no aberto
- `aria-haspopup="listbox"` para indicar que abre um dropdown

---

## Componente 12 — OverlayCorDefault (Dropdown de Cores)

**Descrição:** Dropdown expandido do `ComponenteCor`. Exibe a lista de opções de cor disponíveis para o produto. As cores listadas são exemplos padrão — devem ser configuradas dinamicamente por produto via API.

**Dimensões:** 122px × automático | Border-radius: `radius/overlay` (7px)

**Node Figma:** `193:1095`

### Estrutura de cada item

Cada opção de cor é composta por:
- Swatch circular (`radix-icons:dot-filled`, 16px, `radius/swatch`, com `shadow/button-nav`)
- Label textual (`text/swatch/label`, 8px, Light)
- Gap swatch–label: `spacing/1` (4px)

### Cores de exemplo documentadas

| Nome | Valor hex |
|------|-----------|
| Preto | `#1C1D1D` |
| Cinza | `#C9C9C9` |
| Branco | `#FFFFFF` |
| Verde | `#005C32` |
| Roxo | `#7C15DB` |

> As cores acima são exemplos de conteúdo, não tokens de design system. Os tokens `color/swatch/*` na seção de Tokens Globais servem apenas como referência estrutural.

### Tokens aplicados

- Fundo: `color/neutral/white`
- Padding: 8px top, 4px bottom, 8px horizontal
- Gap entre itens: `spacing/3` (12px)
- Border-radius: `radius/overlay` (7px)

### Guidelines


- Posicionar acima ou abaixo do `ComponenteCor` dependendo do espaço disponível no viewport
- Fechar ao clicar fora do overlay ou ao selecionar uma cor
- Item selecionado deve ter indicação visual de seleção (não documentado no Figma — adicionar)
- `role="listbox"` no container | `role="option"` em cada item | `aria-selected="true"` no item ativo

---

## Componente 13 — IFrameFlexform (Layout do Viewer)

**Descrição:** Template de layout do viewer 3D/AR aplicado ao cliente Flexform (móveis). Não é um componente atômico — é uma composição que define o posicionamento de todos os controles sobre o viewer. Serve como referência de layout para implementações de clientes com produtos que possuem interações físicas (ex: regulagem de altura de mesa).

**Dimensões:** full (ocupa 100% do container pai) | Border-radius: `radius/button-pill` (24px) no container

**Node Figma:** `625:77`

### Estrutura do layout

```
IFrameFlexform (container full, overflow hidden, rounded-24px)
├── Fundo (background image do produto — Flexform desk)
├── [top-left] Botão "Ver no meu ambiente" (AR pill)
├── [top-right] ComponenteFecharEFullscreen (iframe-ct — apenas fullscreen)
├── [top-right -2] ComponenteFecharEFullscreen (iframe-ct — segundo controle)
├── [right-side] Stack vertical de controles
│   ├── ComponenteFecharEFullscreen (Variant7 — zoom)
│   └── ComponenteFecharEFullscreen (Variant8 — share)
└── [bottom-right] BtAltura ("Abaixar mesa")
```

### Posicionamento dos elementos

| Elemento | Posição | Notas |
|----------|---------|-------|
| Botão AR "Ver no meu ambiente" | `top: 13px, left: 14px` | Canto superior esquerdo |
| Controles fullscreen (2x) | `top: 13–15px, right` | Canto superior direito, centralizados via `translateX(-50%)` |
| Stack zoom + share | `top: 224px, left: 454px` | Lateral direita, empilhados com gap de 4px |
| BtAltura "Abaixar mesa" | `top: 464px, left: 364px` | Inferior direita, próximo ao produto |

> Os valores de posicionamento são absolutos e baseados em um canvas fixo. Em implementação responsiva, estes valores precisam ser convertidos para percentuais ou calculados dinamicamente em relação ao tamanho do container.

### Sub-componentes exclusivos deste layout

**BtAltura ("Abaixar mesa"):**
Botão de ação contextual para controle físico do produto. Usa a mesma estrutura dos botões de ação secundária (pill branco, 24px altura), mas com ícone `icon-park-solid:down-c` (16px) e label específico do produto.

- Ícone: `icon-park-solid:down-c` (Icon Park Solid) — nova biblioteca de ícones não documentada nos demais componentes
- Label: texto dinâmico por produto ("Abaixar mesa", "Elevar mesa", etc.)
- Tokens: mesmo padrão dos botões secundários — fundo `color/neutral/white`, texto `color/text/primary`, `radius/button-pill`

**Botão AR "Ver no meu ambiente":**
Variante do botão de ação AR com label diferente de "Prove em você". Usa o mesmo ícone `mynaui:ar` e estrutura pill branca. Label adaptado para produto de mobiliário (experiência de ver o móvel no ambiente do usuário via AR).

### Novo ícone identificado

| Ícone | Biblioteca | Tamanho | Uso |
|-------|------------|---------|-----|
| `icon-park-solid:down-c` | Icon Park Solid | 16px | Controle de altura do produto (BtAltura) |

### Guidelines

- Este layout é um **template por cliente/produto** — não um componente reutilizável genérico. Cada cliente pode ter controles diferentes posicionados de forma distinta conforme as interações específicas do produto.
- O posicionamento absoluto deve ser recalculado para cada breakpoint ou convertido para uma grade de posicionamento relativa ao container do viewer.
- O botão AR "Ver no meu ambiente" é uma variante do label "Prove em você" — o label deve ser configurável por produto no sistema de conteúdo, não hardcoded no componente.
- Produtos com interações físicas (altura, abertura, rotação) devem ter seus controles específicos documentados separadamente, como o `BtAltura`.
- O fundo (`background-image`) deve ser substituído pelo renderer 3D real em produção — a imagem estática é apenas placeholder de design.

---

## Temas Whitelabel

Esta seção documenta as customizações aplicadas por cliente sobre os componentes base do mK3D. Cada tema registra os tokens sobrescritos, novos tokens introduzidos, e os componentes impactados.

---

### Tema Positivo

**Cliente:** Positivo Tecnologia
**Produto:** Positivo Master (notebook com IA local)
**Arquivo Figma:** `mqTrDQHbgizgoilp65KVGY` — Positivo - Landing Page
**Node referência:** `5062:226`
**Componente base:** ComponenteCards (Componente 1)

#### Visão geral

O tema Positivo aplica a identidade da marca sobre o ComponenteCards do mK3D, introduzindo uma nova família tipográfica, paleta de marca própria e ajustes estruturais no card de hotspot.

#### Tokens sobrescritos

| Token base mK3D | Valor mK3D | Valor Positivo | Impacto |
|-----------------|------------|----------------|---------|
| `text/hotspot/title` | 14px, Plus Jakarta Sans Bold | 16px, Plus Jakarta Sans Bold | Título maior e mais destacado |
| `color/text/body` | `#000000` | `#313131` | Tom de texto levemente mais suave |
| `radius/image-sm` | 10px | 16px | Imagem com cantos mais arredondados |
| `shadow/button-nav` | `0 0 4px rgba(0,0,0,0.25)` | `0 4px 11.2px rgba(0,0,0,0.49)` | Shadow mais pronunciada e direcional na imagem do produto |

#### Novos tokens introduzidos

| Token sugerido | Valor | Uso |
|----------------|-------|-----|
| `color/brand/primary` | `#0052A3` | Cor de marca Positivo — labels das specs em azul |
| `color/text/dark` | `#313131` | Texto de corpo do tema Positivo |
| `shadow/image-product` | `0 4px 11.2px rgba(0,0,0,0.49)` | Shadow direcional na imagem do produto no card |

#### Nova família tipográfica

O tema Positivo referencia **Montserrat** como família tipográfica em alguns nós, mas renderiza com Plus Jakarta Sans. Indica possível resíduo de versão anterior do design ou fonte fallback não carregada.

| Token | Família aplicada | Observação |
|-------|-----------------|------------|
| `text/spec/label` | Plus Jakarta Sans Bold, 12px | Label azul das specs (`color/brand/primary`) |
| `text/spec/body` | Plus Jakarta Sans Regular, 12px | Descrição das specs (`color/text/dark`) |
| `text/hotspot/body` | Plus Jakarta Sans Regular, 12px | Corpo do card — `line-height: normal` (≠ padrão 13px) |

#### Estrutura do ComponenteCards no tema Positivo

O card Positivo introduz um padrão de conteúdo novo — **lista de specs com separadores** — não presente nos componentes base do mK3D:

```
ComponenteCards (Positivo)
├── [top-right] Botão Fechar (mantido do base)
└── Card glassmorphism
    ├── Imagem do produto (177px, radius 16px, shadow direcional)
    ├── Título (16px Bold, #000000)
    ├── Corpo descritivo (12px Regular, #313131)
    └── Lista de specs
        ├── Label bold #0052A3 + corpo #313131
        ├── [divider 0.5px]
        ├── Label bold #0052A3 + corpo #313131
        ├── [divider 0.5px]
        └── Label bold #0052A3 + corpo #313131
```

**Divider entre specs:** elemento de altura 0 com borda `0.5px` superior. Não documentado nos componentes base — deve ser extraído como token `border/divider`.

#### Problemas identificados no tema Positivo

**Referência a Montserrat sem aplicação real:** Os nós têm `font-family: Montserrat` no Figma mas renderizam em Plus Jakarta Sans. Verificar se Montserrat deve ser carregada ou se é resíduo de versão anterior.

**`line-height: normal` diverge do padrão:** O mK3D usa `13px` fixo em todo o sistema. O tema Positivo usa `normal` (~14.4px). Padronizar para manter consistência entre temas.

**Lista de specs sem componente atômico:** O padrão de specs com dividers é novo e não existe nos componentes base. Deve ser extraído como sub-componente `EspecificacoesList` reutilizável para outros clientes.

---

## Problemas Identificados

**Contraste WCAG insuficiente no estado Inativo (ComponenteBtCtaComprar, ComponenteBtCtaInscrever)**
Texto `#6E6E6E` sobre fundo `#9C9C9C` resulta em ratio ~1.5:1. O mínimo WCAG AA é 4.5:1. Corrigir antes de lançar para clientes com requisitos de acessibilidade.

**Tokens não publicados como variáveis no Figma**
Nenhum token de cor, espaçamento ou efeito está publicado como variável em nenhum dos 12 componentes documentados. Isso impede a geração de temas whitelabel consistentes e dificulta a manutenção em escala.

**Label incorreto no estado Inativo do ComponenteBtCtaInscrever**
O estado `Inativo` exibe "Comprar" em vez de "Inscrever na lista de espera". Inconsistência de conteúdo que pode confundir o usuário e o dev na implementação.

### Importantes

**Duplicata funcional: `Variant11` = `Verde` (ComponenteBtCtaV)**
Mesma aparência, nenhuma distinção funcional documentada. Consolidar em um único estado `success`.

**`Default` não interativo vs `A1` interativo (ComponenteBtCtaV)**
Ambos têm a mesma aparência, mas `Default` usa `div` e `A1` usa `button`. Recomenda-se remover `Default` ou documentar explicitamente que ele é apenas visual.

**Nomenclatura invertida em ComponenteCor**
`Default` é o estado aberto e `Variant2` é o fechado. Padrão de UX convencional é o inverso. Renomear para `closed` e `open`.

**Estado de seleção não documentado no OverlayCorDefault**
Não há indicação visual de qual cor está selecionada no dropdown. Adicionar estado `selected` para cada item antes de implementar.

**Padding inconsistente entre estados (ComponenteBtCtaComprar)**
Estados `Default` (60px), `Variant6` (57px) e `Inativo` (85px) têm padding horizontal diferente com o mesmo conteúdo. Padronizar para `60px` ou usar `justify-center`.

**Dois ícones diferentes para "Ver em 3D"**
`bt1-ver` usa `ic:round-3d-rotation` e `bt3-ver-medidas` usa `mdi:rotate-3d`. Padronizar para um único ícone por funcionalidade.

### Sugestões de melhoria

**Nomenclatura de estados**
Alinhar para padrão consistente: `idle`, `hover`, `loading`, `success`, `disabled`. A nomenclatura atual mistura português (Verde, Inativo), inglês (hover, Wait) e sufixos genéricos (A1–A5, Variant6).

**Publicar tokens como variáveis com suporte a Modes**
Publicar os tokens listados na seção "Tokens Globais" como variáveis no Figma com Modes para viabilizar temas whitelabel por cliente. Prioridade: `color/cta/*` e `color/surface/*`.

**Consolidar componentes de fechar**
`BtFecharComponent` e `ComponenteFecharEFullscreen` compartilham lógica de confirmação de saída (borda vermelha `#FF5C5C`). Avaliar se podem compartilhar um sub-componente atômico do botão X.

---

## Changelog

| Versão | Data | Componentes | Observação |
|--------|------|-------------|------------|
| 1.0.0 | 2026-02-28 | ComponenteCards, ComponentesMenus, ComponenteBtCtaV, ComponenteBtCtaComprar | Criação inicial via Figma MCP |
| 1.1.0 | 2026-02-28 | ComponenteBtCtaInscrever, BtAcaoLabelEIcone, BtPoweredBy, BtFecharComponent, ComponenteFecharEFullscreen, BtVoltarG, ComponenteCor, OverlayCorDefault | Adição de 8 novos componentes; expansão de tokens globais |
| 1.2.0 | 2026-02-28 | IFrameFlexform | Adição do template de layout do viewer; novo ícone `icon-park-solid:down-c` |
| 1.3.0 | 2026-02-28 | Tema Positivo | Adição da seção de Temas Whitelabel; documentação do tema Positivo sobre ComponenteCards |