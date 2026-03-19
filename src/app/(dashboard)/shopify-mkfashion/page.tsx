"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";

/* ── mKFashion Design Tokens ─────────────────────────────────────────────────
   Fonte: mkfashion-style-guide.md
   Paleta do Sistema → Tokens Semânticos (seção 7)
   Tipografia: Plus Jakarta Sans (seção 1)
   Espaçamento: spacing scale (seção 2)
   Border Radius: radius scale (seção 3)
──────────────────────────────────────────────────────────────────────────── */
const mk = {
  /* Surfaces */
  surfaceBase:     "#000000",   // color/surface/base
  surfaceElevated: "#1E1E1E",   // color/surface/elevated
  surfaceLight:    "#FFFFFF",   // color/surface/light
  surfaceLightAlt: "#F5F5F5",   // color/surface/light-alt

  /* Actions */
  actionPrimary:      "#00C8FF", // color/action/primary  (Blue-100)
  actionPrimaryHover: "#2155FF", // color/action/primary-hover (Blue-300)
  actionAccent:       "#2155FF", // color/action/accent (Blue-300)

  /* Text */
  textPrimary:   "#FFFFFF", // color/text/primary (sobre fundo dark)
  textInverse:   "#000000", // color/text/inverse (sobre fundo claro)
  textSecondary: "#808080", // color/text/secondary
  textMuted:     "#6C6C6C", // color/text/muted

  /* Border Radius (seção 3) */
  radiusXs:  "3px",
  radiusS:   "8px",
  radiusM:   "14px",
  radiusL:   "16px",
  radiusXl:  "24px",

  /* Spacing (seção 2) */
  sp2xs: "4px",
  spXs:  "6px",
  spS:   "8px",
  spM:   "12px",
  spL:   "16px",
  spXl:  "21px",
  sp2xl: "24px",
  sp3xl: "26px",
  sp4xl: "46px",

  /* Typography: Plus Jakarta Sans */
  font: "'Plus Jakarta Sans', -apple-system, sans-serif",
};

export default function ShopifyMkFashionPage() {
  const [shopDomain, setShopDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!shopDomain.trim()) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Shopify · mKFashion" subtitle="Conectar Loja" />

      {/* Page background — surface/light-alt */}
      <div
        style={{
          flex: 1,
          background: mk.surfaceLightAlt,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: mk.sp4xl,
          overflow: "auto",
        }}
      >
        {/* ── Modal Card ────────────────────────────────────────────────── */}
        <div
          style={{
            background: mk.surfaceLight,
            borderRadius: mk.radiusM,
            padding: mk.sp4xl,
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: mk.sp3xl,
          }}
        >
          {/* ── Logo + Produto ─────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: mk.spXs }}>
            <LogoMkFashion />
            <p
              style={{
                fontFamily: mk.font,
                fontSize: 13,
                fontWeight: 400,
                color: mk.textSecondary,
                margin: 0,
                lineHeight: "auto",
              }}
            >
              Virtual Try-On para Shopify
            </p>
          </div>

          {/* ── Form ───────────────────────────────────────────────────── */}
          <form
            onSubmit={handleConnect}
            style={{ display: "flex", flexDirection: "column", gap: mk.sp2xl }}
          >
            {/* Section label */}
            <div style={{ display: "flex", flexDirection: "column", gap: mk.spS }}>
              <span
                style={{
                  fontFamily: mk.font,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: mk.actionAccent,
                }}
              >
                Conectar Loja
              </span>

              <h2
                style={{
                  fontFamily: mk.font,
                  fontSize: 22,
                  fontWeight: 700,
                  color: mk.textInverse,
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                Informe o domínio da sua loja
              </h2>

              <p
                style={{
                  fontFamily: mk.font,
                  fontSize: 13,
                  fontWeight: 400,
                  color: mk.textSecondary,
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                Digite o subdomínio da sua loja Shopify para iniciar a instalação
                do provador virtual.
              </p>
            </div>

            {/* Info box */}
            <div
              style={{
                background: `rgba(33, 85, 255, 0.06)`,
                border: `1px solid rgba(33, 85, 255, 0.14)`,
                borderRadius: mk.radiusS,
                padding: mk.spM,
              }}
            >
              <p
                style={{
                  fontFamily: mk.font,
                  fontSize: 12,
                  fontWeight: 400,
                  color: mk.textMuted,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Onde encontrar? Acesse o admin da sua loja Shopify. O domínio
                aparece na barra de endereço:{" "}
                <code
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 11,
                    background: `rgba(33, 85, 255, 0.10)`,
                    color: mk.actionAccent,
                    padding: "1px 5px",
                    borderRadius: mk.radiusXs,
                  }}
                >
                  sua-loja.myshopify.com
                </code>
              </p>
            </div>

            {/* Input field */}
            <div style={{ display: "flex", flexDirection: "column", gap: mk.spXs }}>
              <label
                htmlFor="shop-domain"
                style={{
                  fontFamily: mk.font,
                  fontSize: 13,
                  fontWeight: 600,
                  color: mk.textInverse,
                }}
              >
                Domínio da loja
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: `1px solid ${focused ? mk.actionAccent : "rgba(0,0,0,0.16)"}`,
                  borderRadius: mk.radiusS,
                  overflow: "hidden",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxShadow: focused
                    ? `0 0 0 3px rgba(33,85,255,0.12)`
                    : "none",
                }}
              >
                <input
                  id="shop-domain"
                  type="text"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="sua-loja"
                  autoComplete="off"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: `${mk.spM} ${mk.spL}`,
                    fontFamily: mk.font,
                    fontSize: 14,
                    fontWeight: 400,
                    color: mk.textInverse,
                    background: "transparent",
                  }}
                />
                <span
                  style={{
                    fontFamily: mk.font,
                    fontSize: 13,
                    fontWeight: 500,
                    color: mk.textSecondary,
                    padding: `${mk.spM} ${mk.spL} ${mk.spM} 0`,
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  .myshopify.com
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading || !shopDomain.trim()}
              style={{
                fontFamily: mk.font,
                fontSize: 15,
                fontWeight: 700,
                color: mk.surfaceLight,
                background: shopDomain.trim() ? mk.surfaceBase : "rgba(0,0,0,0.30)",
                border: "none",
                borderRadius: mk.radiusL,
                padding: `${mk.spL} ${mk.sp2xl}`,
                width: "100%",
                cursor: shopDomain.trim() ? "pointer" : "not-allowed",
                transition: "background 0.18s, transform 0.12s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: mk.spS,
              }}
              onMouseEnter={(e) => {
                if (!shopDomain.trim()) return;
                (e.currentTarget as HTMLButtonElement).style.background = "#1a1a1a";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  shopDomain.trim() ? mk.surfaceBase : "rgba(0,0,0,0.30)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {loading ? <Spinner /> : "Conectar loja"}
            </button>
          </form>

          {/* Footer disclaimer */}
          <p
            style={{
              fontFamily: mk.font,
              fontSize: 11,
              fontWeight: 400,
              color: mk.textMuted,
              margin: 0,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Ao conectar, você autoriza o mKFashion a acessar dados de
            produtos da sua loja.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Logo mKFashion ─────────────────────────────────────────────────────────

function LogoMkFashion() {
  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        fontSize: 22,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        display: "flex",
        alignItems: "baseline",
      }}
    >
      {/* "m" — texto inverso, peso 800 */}
      <span style={{ color: "#000000" }}>m</span>
      {/* "K" — action/primary (#00C8FF) */}
      <span style={{ color: "#00C8FF" }}>K</span>
      {/* "Fashion" — texto inverso */}
      <span style={{ color: "#000000" }}>Fashion</span>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
