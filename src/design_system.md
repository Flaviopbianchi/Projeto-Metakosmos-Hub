# mK3D Whitelabel — Design System Documentation

> Gerado via Figma MCP | Arquivo: mK3D---Whitelabel | Data: 2026-03-11

---

## 1. Tokens Inferidos

> Arquivo não possui variáveis publicadas. Tokens foram extraídos diretamente do código dos componentes.

### Cores

| Token sugerido | Valor | Uso |
|---|---|---|
| `color/surface/glass` | `rgba(255, 255, 255, 0.59)` | Background dos cards |
| `color/surface/glass-light` | `rgba(255, 255, 255, 0.60)` | Background do botão Fechar |
| `color/neutral/dark` | `#1c1d1d` | Botão de navegação ativo / close icon |
| `color/neutral/light` | `#dbdbdb` | Botão de navegação inativo |
| `color/content/primary` | `#000000` | Texto principal |

### Tipografia

| Token sugerido | Família | Tamanho | Peso | Uso |
|---|---|---|---|---|
| `text/label/xs` | Plus Jakarta Sans | 10px | Light (300) | Label do botão Fechar, subtítulo |
| `text/body/sm` | Plus Jakarta Sans | 12px | Regular (400) | Corpo de texto dos cards |
| `text/heading/sm` | Plus Jakarta Sans | 14px | Bold (700) | Título do hotspot |
| `text/heading/sm-italic` | Plus Jakarta Sans | 10px | SemiBold Italic (600i) | Subtítulo variante Variant4 |

### Border Radius

| Token sugerido | Valor | Uso |
|---|---|---|
| `radius/sm` | 10px | Card Default (imagem) |
| `radius/md` | 24px | Card container, imagens Variant2+ |
| `radius/pill` | 31px | Botão Fechar |

### Efeitos

| Token sugerido | Valor | Uso |
|---|---|---|
| `blur/glass-card` | backdrop-blur: 8.9px | Card container |
| `blur/glass-button` | backdrop-blur: 4px | Botão Fechar |
| `shadow/nav-button` | drop-shadow: 0 0 4px rgba(0,0,0,0.25) | Botões de navegação |

### Espaçamento

| Token sugerido | Valor | Uso |
|---|---|---|
| `spacing/1` | 4px | Gap interno do botão Fechar |
| `spacing/2` | 5px | Gap entre Fechar e card |
| `spacing/3` | 6px | Gap entre botões de navegação |
| `spacing/4` | 8px | Padding dos ícones |
| `spacing/5` | 12px | Padding interno card Default |
| `spacing/6` | 16px | Gap entre elementos de conteúdo |

---

## 2. Componentes

### ComponenteFecharEFullscreen

**Descrição:** Botão de dismiss com efeito glassmorphism. Sempre posicionado no topo direito dos cards. Contém label "Fechar" e ícone de close.

**Variantes disponíveis:**
- `Property 1=Default` — estado padrão

**Props:**
- `className` (string) — override de estilo externo

**Especificação visual:**
- Background: `rgba(255,255,255,0.6)` + `backdrop-blur: 4px`
- Padding: `4px 4px 4px 8px`
- Border-radius: `31px`
- Layout: row, gap `4px`, items center
- Label: Plus Jakarta Sans Light 10px, cor `#000`
- Ícone close: container `22x14px`, bg `#1c1d1d`, radius `24px`

**Tokens aplicados:**
- Background: `color/surface/glass-light`
- Blur: `blur/glass-button`
- Radius: `radius/pill`
- Icon bg: `color/neutral/dark`
- Text: `text/label/xs`

---

### ComponenteCards

**Descrição:** Card informacional de hotspot para experiências 3D/AR. Exibe imagem + conteúdo textual com navegação. Sempre inclui `ComponenteFecharEFullscreen` no topo direito. Background com glassmorphism.

**Variantes disponíveis:**
- `Default` — layout horizontal: imagem esquerda (rounded-10), conteúdo direita (título/subtítulo/texto), navegação no rodapé. Tamanho: 381×321px.
- `Variant2` — igual ao Default mas imagem com rounded-24px. Tamanho: 381×321px.
- `Variant3` — apenas conteúdo textual (sem imagem), layout compacto, setas de navegação inline. Tamanho: 381×238px.
- `Variant4` — layout vertical empilhado: imagem no topo (294px alto), conteúdo abaixo com texto longo. Tamanho: 381×635px.

**Props:**
```typescript
type ComponenteCardsProps = {
  className?: string;
  property1?: "Default" | "Variant2" | "Variant3" | "Variant4";
}
```

**Estados de navegação:**
- Seta anterior: bg `#dbdbdb` (inativo/claro)
- Seta próxima: bg `#1c1d1d` (ativo/escuro)
- Ícone: `stash:arrow-up-light` rotacionado 90°

**Conteúdo de texto:**
- Título: `text/heading/sm` (Plus Jakarta Sans Bold 14px)
- Subtítulo: `text/label/xs` (Plus Jakarta Sans Regular 10px) / em Variant4: SemiBold Italic 10px
- Corpo: `text/body/sm` (Plus Jakarta Sans Regular 12px), line-height 13px

**Tokens aplicados:**
- Card bg: `color/surface/glass`
- Blur: `blur/glass-card`
- Radius: `radius/md`
- Nav dark: `color/neutral/dark`
- Nav light: `color/neutral/light`
- Shadow: `shadow/nav-button`

**Subcomponentes:**
- `ComponenteFecharEFullscreen` — sempre presente, posicionado antes do card body no DOM

---

## 3. Assets

| Nome | URL (válida por 7 dias) | Uso |
|---|---|---|
| `stash:arrow-up-light` (Default) | `https://www.figma.com/api/mcp/asset/0a9ba55c-4504-4d2c-9262-93c0821fa692` | Seta nav (Default/Variant2) |
| `stash:arrow-up-light` (dark) | `https://www.figma.com/api/mcp/asset/1e8d14cb-7346-47ac-be0b-25cd1295de90` | Seta nav ativa (Default/Variant2) |
| `stash:arrow-up-light` (Variant3/4 light) | `https://www.figma.com/api/mcp/asset/6d5f0037-0ed2-4727-ba5f-852e6c685a5e` | Seta nav (Variant3/4) |
| `stash:arrow-up-light` (Variant3/4 dark) | `https://www.figma.com/api/mcp/asset/e3b73b77-8a3a-4743-b28b-6f992bc85eff` | Seta nav ativa (Variant3/4) |
| `material-symbols-light:close-rounded` | `https://www.figma.com/api/mcp/asset/42f8d111-a067-4ed3-aa4a-ffac99fecb50` | Ícone fechar |

---

## 4. Código de Referência (React + Tailwind)

### ComponenteFecharEFullscreen

```tsx
function ComponenteFecharEFullscreen({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="backdrop-blur-[4px] bg-[rgba(255,255,255,0.6)] flex gap-[4px] items-center justify-center pl-[8px] pr-[4px] py-[4px] rounded-[31px]">
        <span className="font-['Plus_Jakarta_Sans'] font-light text-[10px] text-black">
          Fechar
        </span>
        <div className="bg-[#1c1d1d] flex items-center justify-center h-[14px] px-[8px] py-[4px] rounded-[24px] w-[22px]">
          <img src={imgClose} alt="" className="size-[12px]" />
        </div>
      </div>
    </div>
  );
}
```

### ComponenteCards (estrutura simplificada)

```tsx
type ComponenteCardsProps = {
  className?: string;
  property1?: "Default" | "Variant2" | "Variant3" | "Variant4";
  title?: string;
  subtitle?: string;
  body?: string;
  imageSrc?: string;
};

export default function ComponenteCards({
  property1 = "Default",
  title = "Título do hotspot",
  subtitle = "Subtitulo",
  body = "Lorem ipsum...",
  imageSrc,
}: ComponenteCardsProps) {
  return (
    <div className="flex flex-col gap-[5px] items-end w-[381px]">
      <ComponenteFecharEFullscreen />
      <div className="backdrop-blur-[8.9px] bg-[rgba(255,255,255,0.59)] rounded-[24px] w-full ...">
        {/* conteúdo varia por variante */}
      </div>
    </div>
  );
}
```

---

## 5. Guidelines

### Quando usar cada variante

- **Default / Variant2** — hotspot com produto visual e descrição curta. Usar quando há imagem relevante.
- **Variant3** — hotspot informacional sem imagem. Usar para specs técnicas ou textos curtos.
- **Variant4** — hotspot com contexto longo. Usar quando o copy exige mais espaço vertical.

### Acessibilidade

- Imagens de produto nos cards devem ter `alt` descritivo
- Botões de navegação precisam de `aria-label` ("Anterior" / "Próximo")
- Contraste do texto `#000` sobre `rgba(255,255,255,0.59)` — verificar com imagem de fundo no viewer 3D
- Botão "Fechar" deve ser acessível por teclado com `role="button"` e `tabIndex={0}`

### Comportamento

- Largura fixa: 381px (não responsivo — componente é posicionado no espaço 3D)
- Altura variável por variante: Default/Variant2 ~321px, Variant3 ~238px, Variant4 ~635px
- Sempre flutua sobre a cena 3D com glassmorphism (requer fundo com conteúdo visível atrás)

---

## 6. Componentes não documentados

> O MCP do Figma não conseguiu enumerar as páginas do arquivo automaticamente. Apenas o componente **Componente - Cards** foi acessado via node-id fornecido no link. Para documentar os demais componentes do mK3D Whitelabel, compartilhe os node-ids ou links diretos para cada frame de componente.

Componentes prováveis não extraídos (baseado no contexto do projeto):
- Hotspot marker / pin
- Viewer 3D shell / container
- Loading state
- Product info panel
- Navegação do viewer
- Demais (até 13 total mencionados)

---

## 7. Changelog

| Versão | Data | Alteração |
|---|---|---|
| 1.0.0 | 2026-03-11 | Extração inicial via Figma MCP — Componente Cards + tokens inferidos |

---

> **Nota:** Variáveis Figma não estão publicadas no arquivo. Tokens foram inferidos a partir dos valores aplicados nos componentes. Recomenda-se publicar variáveis no Figma antes de expandir esta documentação.