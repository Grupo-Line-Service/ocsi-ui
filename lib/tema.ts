// Tematização por inquilino (white-label). Client-safe (usado no layout raiz para
// injetar as CSS variables e no preview ao vivo da tela de Aparência).
//
// O cliente escolhe UMA cor principal (accent) + o tema (claro/escuro). Da cor
// derivamos o gradiente do botão (--accent-2), a versão translúcida (--accent-soft),
// o contraste do texto sobre o accent e o brilho do fundo (--glow) — assim uma
// escolha só já sai harmônica.

export type Tema = "escuro" | "claro";

// SAAS-80: fonte, cor secundária e cantos por inquilino.
export type Fonte = "nunito" | "inter" | "poppins" | "lora";
export type Cantos = "redondo" | "suave" | "reto";

/** Famílias carregadas via next/font no layout raiz (variáveis CSS). */
export const FONTES: { id: Fonte; nome: string; css: string }[] = [
  { id: "nunito", nome: "Nunito (padrão)", css: "var(--font-nunito), system-ui, sans-serif" },
  { id: "inter", nome: "Inter (moderna)", css: "var(--font-inter), system-ui, sans-serif" },
  { id: "poppins", nome: "Poppins (geométrica)", css: "var(--font-poppins), system-ui, sans-serif" },
  { id: "lora", nome: "Lora (clássica)", css: "var(--font-lora), Georgia, serif" },
];

export const CANTOS: { id: Cantos; nome: string; radius: string; radiusSm: string }[] = [
  { id: "redondo", nome: "Redondo (padrão)", radius: "14px", radiusSm: "10px" },
  { id: "suave", nome: "Suave", radius: "10px", radiusSm: "7px" },
  { id: "reto", nome: "Reto", radius: "4px", radiusSm: "3px" },
];

export function fonteValida(v: string | null | undefined): Fonte {
  return (FONTES.some((f) => f.id === v) ? v : "nunito") as Fonte;
}

export function cantosValidos(v: string | null | undefined): Cantos {
  return (CANTOS.some((c) => c.id === v) ? v : "redondo") as Cantos;
}

/** Hex válido ou null (cor secundária é OPCIONAL — null = derivada). */
export function corOpcional(c: string | null | undefined): string | null {
  return c && HEX.test(c) ? c : null;
}

export type OpcoesTema = {
  corSecundaria?: string | null;
  fonte?: string | null;
  cantos?: string | null;
};

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Cor válida em hex, ou o rosa padrão. */
export function corValida(c: string | null | undefined): string {
  return c && HEX.test(c) ? c : "#c2691c"; // fallback = laranja da marca (rosa é legado)
}

export function temaValido(t: string | null | undefined): Tema {
  return t === "claro" ? "claro" : "escuro";
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(n, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function toHex(rgb: number[]): string {
  return "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

/** Escurece o hex por um fator (0..1) — usado no fim do gradiente do botão. */
function escurecer(hex: string, f: number): string {
  const [r, g, b] = hexToRgb(hex);
  return toHex([r * (1 - f), g * (1 - f), b * (1 - f)]);
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Texto legível sobre o accent (escuro em cor clara, branco em cor escura). */
function contrasteSobre(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1a1d3a" : "#ffffff";
}

/** Mapa de CSS variables do tema — para aplicar num elemento (preview) via style. */
export function varsDoTema(tema: Tema, corBruta: string, opcoes: OpcoesTema = {}): Record<string, string> {
  const accent = corValida(corBruta);
  const secundaria = corOpcional(opcoes.corSecundaria);
  const fonte = FONTES.find((x) => x.id === fonteValida(opcoes.fonte))!;
  const canto = CANTOS.find((x) => x.id === cantosValidos(opcoes.cantos))!;
  const base: Record<string, string> = {
    "--accent": accent,
    "--accent-2": secundaria ?? escurecer(accent, 0.18),
    "--fonte-app": fonte.css,
    "--radius": canto.radius,
    "--radius-sm": canto.radiusSm,
    "--accent-soft": rgba(accent, 0.14),
    "--accent-contrast": contrasteSobre(accent),
    "--accent-shadow": rgba(accent, 0.32), // sombra/brilho do botão — SEMPRE derivada da cor
    "--glow": rgba(accent, 0.1), // brilho suave da cor no fundo (tema escuro)
  };
  if (tema === "claro") {
    return {
      ...base,
      "--bg": "#f4f5fb",
      "--surface": "#ffffff",
      "--surface-2": "#eef0f8",
      "--border": "#dfe2f0",
      "--input-bg": "#ffffff",
      "--text": "#1a1d3a",
      "--text-dim": "#6b7194",
      "--shadow": "0 12px 30px rgba(20, 24, 60, 0.08)",
      "--glow": rgba(accent, 0.18), // degradê mais visível no claro (estilo site OCSI)
      // Selos de status legíveis sobre fundo claro (fundo suave + texto forte).
      "--chip-ok-bg": "#dcfce7", "--chip-ok-fg": "#15803d",
      "--chip-danger-bg": "#fce7f3", "--chip-danger-fg": "#be185d",
      "--chip-warn-bg": "#fef3c7", "--chip-warn-fg": "#b45309",
      "--chip-neutro-bg": "#e6e9f2", "--chip-neutro-fg": "#525a76",
      "--chip-info-bg": "#dbeafe", "--chip-info-fg": "#1d4ed8",
      // KPIs: tons mais escuros pra contrastar no branco.
      "--kpi-entrada": "#2563eb",
      "--kpi-realizado": "#15803d",
      "--kpi-saida": "#be185d",
      "--kpi-vencido": "#b45309",
    };
  }
  // Tema ESCURO completo (mesmos valores do :root global) — para a prévia ser
  // autossuficiente e trocar de verdade ao clicar em "escuro".
  return {
    ...base,
    "--bg": "#0e1026",
    "--surface": "#171a36",
    "--surface-2": "#1f2347",
    "--border": "#2b2f55",
    "--input-bg": "rgba(10, 12, 32, 0.55)",
    "--text": "#eef0fb",
    "--text-dim": "#9ba3c7",
    "--shadow": "0 10px 30px rgba(5, 6, 20, 0.35)",
    "--chip-ok-bg": "#14351f", "--chip-ok-fg": "#4ade80",
    "--chip-danger-bg": "#3b1127", "--chip-danger-fg": "#f9a8d4",
    "--chip-warn-bg": "#3a2a12", "--chip-warn-fg": "#fbbf24",
    "--chip-neutro-bg": "#26324a", "--chip-neutro-fg": "#9aa7bd",
    "--chip-info-bg": "#12233f", "--chip-info-fg": "#93c5fd",
    "--kpi-entrada": "#60a5fa",
    "--kpi-realizado": "#4ade80",
    "--kpi-saida": "#ec4899",
    "--kpi-vencido": "#fbbf24",
  };
}

/** Bloco `:root{…}` para injetar no documento (layout raiz). */
export function cssDoTema(tema: Tema, corBruta: string, opcoes: OpcoesTema = {}): string {
  const vars = varsDoTema(tema, corBruta, opcoes);
  const body = Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";");
  return `:root{${body}}`;
}
