import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type ThemeMode = "light" | "dark";
type SectionId = "brand" | "surfaces" | "text" | "status";

type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  success: string;
  warning: string;
  danger: string;
};

type ThemeCollection = Record<ThemeMode, ThemeColors>;

type ColorFieldConfig = {
  key: keyof ThemeColors;
  label: string;
  cssVar: string;
};

type ColorSection = {
  id: SectionId;
  title: string;
  fields: ColorFieldConfig[];
};

type PresetBundle = {
  name: string;
  description: string;
  themes: ThemeCollection;
};

const STORAGE_KEY = "palette-studio-v3";

const defaultLightTheme: ThemeColors = {
  primary: "#6366f1",
  secondary: "#22c55e",
  accent: "#f59e0b",
  background: "#ffffff",
  surface: "#f8fafc",
  surfaceElevated: "#f1f5f9",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const defaultDarkTheme: ThemeColors = {
  primary: "#818cf8",
  secondary: "#4ade80",
  accent: "#fbbf24",
  background: "#020617",
  surface: "#0f172a",
  surfaceElevated: "#111827",
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  border: "#1e293b",
  borderStrong: "#334155",
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#f87171",
};

const defaultThemes: ThemeCollection = { light: defaultLightTheme, dark: defaultDarkTheme };

const colorSections: ColorSection[] = [
  {
    id: "brand",
    title: "Brand",
    fields: [
      { key: "primary", label: "Primary", cssVar: "--color-primary" },
      { key: "secondary", label: "Secondary", cssVar: "--color-secondary" },
      { key: "accent", label: "Accent", cssVar: "--color-accent" },
    ],
  },
  {
    id: "surfaces",
    title: "Surfaces",
    fields: [
      { key: "background", label: "Background", cssVar: "--color-background" },
      { key: "surface", label: "Surface", cssVar: "--color-surface" },
      { key: "surfaceElevated", label: "Elevated", cssVar: "--color-surface-elevated" },
    ],
  },
  {
    id: "text",
    title: "Text",
    fields: [
      { key: "textPrimary", label: "Primary", cssVar: "--color-text-primary" },
      { key: "textSecondary", label: "Secondary", cssVar: "--color-text-secondary" },
      { key: "textMuted", label: "Muted", cssVar: "--color-text-muted" },
    ],
  },
  {
    id: "status",
    title: "Status",
    fields: [
      { key: "border", label: "Border", cssVar: "--color-border" },
      { key: "borderStrong", label: "Border Strong", cssVar: "--color-border-strong" },
      { key: "success", label: "Success", cssVar: "--color-success" },
      { key: "warning", label: "Warning", cssVar: "--color-warning" },
      { key: "danger", label: "Danger", cssVar: "--color-danger" },
    ],
  },
];

const allColorFields = colorSections.flatMap((s) => s.fields);

const presetBundles: PresetBundle[] = [
  {
    name: "Professional Indigo",
    description: "Balanced and portfolio-friendly default theme",
    themes: defaultThemes,
  },
  {
    name: "Ocean Signal",
    description: "Cool, technical, and polished with crisp tones",
    themes: {
      light: { ...defaultLightTheme, primary: "#0ea5e9", secondary: "#14b8a6", accent: "#f97316", background: "#f8fbff", surface: "#eef6ff", surfaceElevated: "#dbeafe", textPrimary: "#082f49", textSecondary: "#155e75", border: "#cfe3f5", borderStrong: "#93c5fd" },
      dark: { ...defaultDarkTheme, primary: "#38bdf8", secondary: "#2dd4bf", accent: "#fb923c", background: "#07131f", surface: "#0f1d2c", surfaceElevated: "#11263a", border: "#1e3a5f", borderStrong: "#334155" },
    },
  },
  {
    name: "Warm Premium",
    description: "Soft luxury feel with warmth and readability",
    themes: {
      light: { ...defaultLightTheme, primary: "#7c3aed", secondary: "#10b981", accent: "#f97316", background: "#fefaf6", surface: "#fff7ed", surfaceElevated: "#ffedd5", textPrimary: "#1f2937", textSecondary: "#4b5563", border: "#fed7aa", borderStrong: "#fdba74" },
      dark: { ...defaultDarkTheme, primary: "#a78bfa", secondary: "#34d399", accent: "#fb923c", background: "#140f14", surface: "#1f1720", surfaceElevated: "#2a1e2d", border: "#3b2244", borderStrong: "#5b2d75" },
    },
  },
  {
    name: "Minimal Mono",
    description: "Editorial and understated for sleek portfolios",
    themes: {
      light: { ...defaultLightTheme, primary: "#111827", secondary: "#0f766e", accent: "#f97316", background: "#ffffff", surface: "#f9fafb", surfaceElevated: "#f3f4f6", textPrimary: "#111827", textSecondary: "#4b5563", border: "#e5e7eb", borderStrong: "#d1d5db" },
      dark: { ...defaultDarkTheme, primary: "#f3f4f6", secondary: "#2dd4bf", accent: "#fb923c", background: "#09090b", surface: "#111827", surfaceElevated: "#1f2937", border: "#27272a", borderStrong: "#3f3f46" },
    },
  },
];

function cloneThemes(themes: ThemeCollection): ThemeCollection {
  return { light: { ...themes.light }, dark: { ...themes.dark } };
}

function normalizeHex(hex: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    const s = hex.slice(1).toLowerCase();
    return `#${s.split("").map((c) => `${c}${c}`).join("")}`;
  }
  return "#000000";
}

function sanitizeHexInput(value: string) {
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (/^#[0-9a-fA-F]{3}$/.test(prefixed) || /^#[0-9a-fA-F]{6}$/.test(prefixed)) return normalizeHex(prefixed);
  return null;
}

function isThemeColors(value: unknown): value is ThemeColors {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return allColorFields.every((f) => typeof c[f.key] === "string" && Boolean(sanitizeHexInput(c[f.key] as string)));
}

function loadInitialThemes(): ThemeCollection {
  if (typeof window === "undefined") return cloneThemes(defaultThemes);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneThemes(defaultThemes);
    const parsed = JSON.parse(raw);
    if (isThemeColors(parsed.light) && isThemeColors(parsed.dark)) {
      return { light: parsed.light, dark: parsed.dark };
    }
  } catch { }
  return cloneThemes(defaultThemes);
}

function hexToRgbTriplet(hex: string) {
  const n = normalizeHex(hex);
  return `${parseInt(n.slice(1, 3), 16)} ${parseInt(n.slice(3, 5), 16)} ${parseInt(n.slice(5, 7), 16)}`;
}

function hexToRgbTuple(hex: string) {
  const n = normalizeHex(hex);
  return [parseInt(n.slice(1, 3), 16), parseInt(n.slice(3, 5), 16), parseInt(n.slice(5, 7), 16)] as const;
}

function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgbTuple(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(fg: string, bg: string) {
  const l1 = relativeLuminance(fg), l2 = relativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function getReadableTextColor(bg: string) {
  return getContrastRatio("#0f172a", bg) >= getContrastRatio("#ffffff", bg) ? "#0f172a" : "#ffffff";
}

function getContrastLabel(ratio: number) {
  if (ratio >= 7) return "Excellent";
  if (ratio >= 4.5) return "AA Ready";
  if (ratio >= 3) return "Large Only";
  return "Low";
}

function wrapHue(v: number) { return ((v % 360) + 360) % 360; }

function hslToHex(h: number, s: number, l: number) {
  const s1 = s / 100, l1 = l / 100;
  const c = (1 - Math.abs(2 * l1 - 1)) * s1;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l1 - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (ch: number) => Math.round((ch + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function buildRandomTheme(mode: ThemeMode): ThemeColors {
  const h = Math.floor(Math.random() * 360);
  const h2 = wrapHue(h + 115 + Math.floor(Math.random() * 25));
  const h3 = wrapHue(h + 35 + Math.floor(Math.random() * 35));
  if (mode === "light") {
    return {
      primary: hslToHex(h, 76, 55), secondary: hslToHex(h2, 68, 46), accent: hslToHex(h3, 90, 52),
      background: hslToHex(h, 28, 98), surface: hslToHex(h, 32, 96), surfaceElevated: hslToHex(h, 26, 92),
      textPrimary: hslToHex(h, 28, 12), textSecondary: hslToHex(h, 18, 34), textMuted: hslToHex(h, 14, 58),
      border: hslToHex(h, 22, 88), borderStrong: hslToHex(h, 20, 78),
      success: "#22c55e", warning: "#f59e0b", danger: "#ef4444",
    };
  }
  return {
    primary: hslToHex(h, 82, 68), secondary: hslToHex(h2, 74, 62), accent: hslToHex(h3, 90, 64),
    background: hslToHex(h, 34, 8), surface: hslToHex(h, 30, 13), surfaceElevated: hslToHex(h, 25, 18),
    textPrimary: hslToHex(h, 18, 96), textSecondary: hslToHex(h, 14, 82), textMuted: hslToHex(h, 10, 62),
    border: hslToHex(h, 20, 22), borderStrong: hslToHex(h, 18, 30),
    success: "#4ade80", warning: "#fbbf24", danger: "#f87171",
  };
}

function buildThemeStyleVars(theme: ThemeColors): CSSProperties {
  return Object.fromEntries(allColorFields.map((f) => [f.cssVar, hexToRgbTriplet(theme[f.key])])) as CSSProperties;
}

function buildCssBlock(themes: ThemeCollection) {
  const lines = [':root, [data-theme="light"] {', "  color-scheme: light;", ""];
  allColorFields.forEach((f) => lines.push(`  ${f.cssVar}: ${hexToRgbTriplet(themes.light[f.key])};`));
  lines.push("}", "", '[data-theme="dark"] {', "  color-scheme: dark;", "");
  allColorFields.forEach((f) => lines.push(`  ${f.cssVar}: ${hexToRgbTriplet(themes.dark[f.key])};`));
  lines.push("}");
  return lines.join("\n");
}

function applyThemeToDocument(theme: ThemeColors, mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
  allColorFields.forEach((f) => root.style.setProperty(f.cssVar, hexToRgbTriplet(theme[f.key])));
}

function ColorControl({ field, value, onChange }: { field: ColorFieldConfig; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value.toUpperCase());
  useEffect(() => setDraft(value.toUpperCase()), [value]);

  const commit = (v: string) => {
    const s = sanitizeHexInput(v);
    if (s) { onChange(s); setDraft(s.toUpperCase()); }
    else setDraft(value.toUpperCase());
  };

  return (
    <div className="p-3" style={{ borderRadius: "12px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background) / 0.84)" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium" style={{ color: "rgb(var(--color-text-primary))" }}>{field.label}</span>
        <span className="h-6 w-6 shrink-0 rounded" style={{ backgroundColor: value, border: "1px solid rgb(var(--color-border))" }} />
      </div>
      <div className="mt-2 grid grid-cols-[48px_1fr] gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full cursor-pointer rounded border-0 bg-transparent p-0" />
        <input
          type="text" value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit(draft)}
          className="h-9 w-full rounded px-2 text-sm font-mono uppercase outline-none"
          style={{ border: "1px solid rgb(var(--color-border-strong))", backgroundColor: "rgb(var(--color-surface))", color: "rgb(var(--color-text-primary))" }}
        />
      </div>
    </div>
  );
}

function ThemePreview({ theme, mode }: { theme: ThemeColors; mode: ThemeMode }) {
  const onPrimary = getReadableTextColor(theme.primary);
  const onSecondary = getReadableTextColor(theme.secondary);

  return (
    <div style={buildThemeStyleVars(theme)}>
      <div className="overflow-hidden" style={{ colorScheme: mode, borderRadius: "16px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-surface))", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
        <div className="flex items-center justify-between gap-3 border-b px-3 py-2 sm:px-4 sm:py-3" style={{ borderColor: "rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background) / 0.82)" }}>
          <div className="flex gap-1.5">
            {[theme.danger, theme.warning, theme.success].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3" style={{ backgroundColor: c }} />)}
          </div>
          <span className="text-[10px] font-semibold uppercase sm:text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>{mode} preview</span>
        </div>

        <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
          <div className="p-3 sm:p-4" style={{ borderRadius: "12px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background))" }}>
            <h2 className="text-lg font-semibold sm:text-xl" style={{ color: "rgb(var(--color-text-primary))" }}>Preview card title</h2>
            <p className="mt-1.5 text-xs sm:mt-2 sm:text-sm" style={{ color: "rgb(var(--color-text-secondary))" }}>This demonstrates how text colors appear on surfaces.</p>
            <div className="mt-2.5 flex flex-wrap gap-2 sm:mt-3">
              <button className="px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:py-2 sm:text-sm" style={{ borderRadius: "999px", backgroundColor: "rgb(var(--color-primary))", color: onPrimary }}>Primary</button>
              <button className="px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:py-2 sm:text-sm" style={{ borderRadius: "999px", backgroundColor: "rgb(var(--color-secondary))", color: onSecondary }}>Secondary</button>
              <button className="px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:py-2 sm:text-sm" style={{ borderRadius: "999px", border: "1px solid rgb(var(--color-border-strong))", backgroundColor: "rgb(var(--color-surface))", color: "rgb(var(--color-text-primary))" }}>Outline</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[["Focus", "B2B SaaS"], ["Stack", "React, TS"]].map(([l, v]) => (
              <div key={l} className="p-2.5 sm:p-3" style={{ borderRadius: "10px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-surface))" }}>
                <p className="text-[9px] uppercase sm:text-[10px]" style={{ color: "rgb(var(--color-text-muted))" }}>{l}</p>
                <p className="mt-0.5 text-xs font-medium sm:mt-1 sm:text-sm" style={{ color: "rgb(var(--color-text-primary))" }}>{v}</p>
              </div>
            ))}
          </div>

          <div className="p-2.5 sm:p-3" style={{ borderRadius: "10px", background: "linear-gradient(135deg, rgb(var(--color-primary) / 0.16), rgb(var(--color-secondary) / 0.14))", border: "1px solid rgb(var(--color-border))" }}>
            <p className="text-xs sm:text-sm" style={{ color: "rgb(var(--color-text-primary))" }}>Gradient surface with primary/secondary tint.</p>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[["Success", theme.success], ["Warning", theme.warning], ["Danger", theme.danger]].map(([l, c]) => (
              <span key={l} className="px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs" style={{ borderRadius: "999px", backgroundColor: c, color: getReadableTextColor(c) }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [themes, setThemes] = useState<ThemeCollection>(() => loadInitialThemes());
  const [mode, setMode] = useState<ThemeMode>("light");
  const [section, setSection] = useState<SectionId>("brand");
  const [compareBoth, setCompareBoth] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const exportRef = useRef<HTMLElement>(null);

  const activeTheme = themes[mode];
  const sectionConfig = colorSections.find((s) => s.id === section) ?? colorSections[0];

  useEffect(() => { applyThemeToDocument(activeTheme, mode); }, [activeTheme, mode]);

  useEffect(() => {
    const handleScroll = () => setShowFloating(window.scrollY > 400);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cssBlock = useMemo(() => buildCssBlock(themes), [themes]);

  const diagnostics = useMemo(() => [
    { label: "Primary button text", ratio: getContrastRatio(getReadableTextColor(activeTheme.primary), activeTheme.primary) },
    { label: "Text on background", ratio: getContrastRatio(activeTheme.textPrimary, activeTheme.background) },
    { label: "Secondary text", ratio: getContrastRatio(activeTheme.textSecondary, activeTheme.background) },
    { label: "Border on surface", ratio: getContrastRatio(activeTheme.border, activeTheme.surface) },
  ], [activeTheme]);

  const passedChecks = diagnostics.filter((d) => d.ratio >= 4.5).length;

  const healthLabel = useMemo(() => {
    if (passedChecks === 4) return "Excellent";
    if (passedChecks >= 3) return "Strong";
    if (passedChecks >= 2) return "Fair";
    return "Needs Work";
  }, [passedChecks]);

  const updateColor = (key: keyof ThemeColors, value: string) => setThemes((c) => ({ ...c, [mode]: { ...c[mode], [key]: value } }));
  const applyPreset = (p: PresetBundle) => setThemes(cloneThemes(p.themes));
  const reset = () => { setThemes(cloneThemes(defaultThemes)); setMode("light"); setCompareBoth(false); };
  const randomize = () => setThemes((c) => ({ ...c, [mode]: buildRandomTheme(mode) }));
  const save = () => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(themes)); } catch { } };
  const copy = async () => { try { await navigator.clipboard.writeText(cssBlock); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { } };
  const scrollToExport = () => exportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen">
      {/* Skip Link */}
      <a
        href="#export-section"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:outline-none"
        style={{ backgroundColor: "rgb(var(--color-primary))", color: getReadableTextColor(activeTheme.primary) }}
      >
        Skip to export CSS
      </a>

      {/* Floating Copy Button */}
      {showFloating && (
        <button
          onClick={scrollToExport}
          className="fixed bottom-4 right-4 z-50 px-4 py-3 text-sm font-semibold shadow-lg sm:bottom-6 sm:right-6"
          style={{ borderRadius: "999px", backgroundColor: "rgb(var(--color-primary))", color: getReadableTextColor(activeTheme.primary), boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
        >
          Copy CSS ↓
        </button>
      )}

      <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <header className="p-4 sm:p-5 lg:p-6" style={{ borderRadius: "16px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background) / 0.84)", backdropFilter: "blur(12px)" }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold sm:text-2xl lg:text-3xl" style={{ color: "rgb(var(--color-text-primary))" }}>Theme Genie</h1>
                {/* Accessibility Health Label */}
                <span
                  className="px-2.5 py-1 text-[10px] font-semibold uppercase sm:text-xs"
                  style={{ borderRadius: "999px", backgroundColor: passedChecks >= 3 ? activeTheme.success : activeTheme.warning, color: getReadableTextColor(passedChecks >= 3 ? activeTheme.success : activeTheme.warning) }}
                >
                  {healthLabel}
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm" style={{ color: "rgb(var(--color-text-secondary))" }}>
                Design, preview, and export CSS color palettes with accessibility checks.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {(["light", "dark"] as ThemeMode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)} className="px-3 py-2 text-xs font-medium capitalize sm:text-sm"
                  style={{ borderRadius: "999px", border: `1px solid ${mode === m ? "rgb(var(--color-primary))" : "rgb(var(--color-border))"}`, backgroundColor: mode === m ? "rgb(var(--color-primary) / 0.12)" : "rgb(var(--color-surface))", color: mode === m ? "rgb(var(--color-primary))" : "rgb(var(--color-text-primary))" }}>
                  {m}
                </button>
              ))}
              <button onClick={() => setCompareBoth((c) => !c)} className="px-3 py-2 text-xs font-medium sm:text-sm"
                style={{ borderRadius: "999px", border: `1px solid ${compareBoth ? "rgb(var(--color-secondary))" : "rgb(var(--color-border))"}`, backgroundColor: compareBoth ? "rgb(var(--color-secondary) / 0.12)" : "rgb(var(--color-surface))", color: compareBoth ? "rgb(var(--color-secondary))" : "rgb(var(--color-text-primary))" }}>
                Compare
              </button>
              <button onClick={randomize} className="px-3 py-2 text-xs font-medium sm:text-sm" style={{ borderRadius: "999px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-surface))", color: "rgb(var(--color-text-primary))" }}>Randomize</button>
              <button onClick={save} className="px-3 py-2 text-xs font-medium sm:text-sm" style={{ borderRadius: "999px", backgroundColor: "rgb(var(--color-secondary))", color: getReadableTextColor(activeTheme.secondary) }}>Save</button>
              <button onClick={reset} className="px-3 py-2 text-xs font-medium sm:text-sm" style={{ borderRadius: "999px", backgroundColor: "rgb(var(--color-primary))", color: getReadableTextColor(activeTheme.primary) }}>Reset</button>
            </div>
          </div>

          {/* Preset Bundles with Descriptions */}
          <div className="mt-4 overflow-x-auto pb-1">
            <div className="flex w-max gap-2 sm:gap-3">
              {presetBundles.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p)} className="min-w-[180px] p-3 text-left sm:min-w-[200px]"
                  style={{ borderRadius: "12px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-surface))" }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[p.themes.light.primary, p.themes.light.secondary].map((c) => (
                        <span key={c} className="h-3 w-3 rounded-full" style={{ backgroundColor: c, border: "1px solid rgb(var(--color-border))" }} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold sm:text-sm" style={{ color: "rgb(var(--color-text-primary))" }}>{p.name}</span>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-tight sm:text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>{p.description}</p>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[320px_1fr] 2xl:grid-cols-[360px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4 sm:space-y-6 xl:sticky xl:top-6 xl:self-start">
            {/* Color Editor */}
            <section className="p-4 sm:p-5" style={{ borderRadius: "16px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background) / 0.84)", backdropFilter: "blur(12px)" }}>
              <h2 className="text-base font-semibold sm:text-lg" style={{ color: "rgb(var(--color-text-primary))" }}>Edit {mode} theme</h2>

              <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {colorSections.map((s) => (
                  <button key={s.id} onClick={() => setSection(s.id)} className="px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:text-sm"
                    style={{ borderRadius: "999px", border: `1px solid ${section === s.id ? "rgb(var(--color-primary))" : "rgb(var(--color-border))"}`, backgroundColor: section === s.id ? "rgb(var(--color-primary) / 0.12)" : "rgb(var(--color-surface))", color: section === s.id ? "rgb(var(--color-primary))" : "rgb(var(--color-text-primary))" }}>
                    {s.title}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:gap-3">
                {sectionConfig.fields.map((f) => (
                  <ColorControl key={f.cssVar} field={f} value={activeTheme[f.key]} onChange={(v) => updateColor(f.key, v)} />
                ))}
              </div>

              {/* Quick Swatches */}
              <div className="mt-4 grid grid-cols-7 gap-1">
                {allColorFields.map((f) => (
                  <div key={f.cssVar} className="aspect-square rounded" style={{ backgroundColor: activeTheme[f.key], border: "1px solid rgb(var(--color-border))" }} title={f.label} />
                ))}
              </div>
            </section>

            {/* Contrast Checks with Accessibility Labels */}
            <section className="p-4 sm:p-5" style={{ borderRadius: "16px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background) / 0.84)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold sm:text-lg" style={{ color: "rgb(var(--color-text-primary))" }}>Contrast Checks</h2>
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold sm:text-xs"
                  style={{ borderRadius: "999px", backgroundColor: passedChecks >= 3 ? activeTheme.success : activeTheme.warning, color: getReadableTextColor(passedChecks >= 3 ? activeTheme.success : activeTheme.warning) }}
                >
                  {passedChecks}/4
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {diagnostics.map((d) => {
                  const label = getContrastLabel(d.ratio);
                  const tone = label === "Excellent" ? activeTheme.success : label === "AA Ready" ? activeTheme.primary : label === "Large Only" ? activeTheme.warning : activeTheme.danger;
                  return (
                    <div key={d.label} className="flex items-center justify-between gap-2 p-2" style={{ borderRadius: "8px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-surface))" }}>
                      <span className="text-xs sm:text-sm" style={{ color: "rgb(var(--color-text-primary))" }}>{d.label}</span>
                      <span className="whitespace-nowrap px-2 py-0.5 text-[10px] font-medium sm:text-xs" style={{ borderRadius: "999px", backgroundColor: tone, color: getReadableTextColor(tone) }}>
                        {d.ratio.toFixed(1)}:1 · {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>

          {/* Main Content */}
          <main className="space-y-4 sm:space-y-6">
            {/* Preview */}
            <section className="p-4 sm:p-5 lg:p-6" style={{ borderRadius: "16px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background) / 0.84)", backdropFilter: "blur(12px)" }}>
              <h2 className="text-base font-semibold sm:text-lg" style={{ color: "rgb(var(--color-text-primary))" }}>Live Preview</h2>
              <p className="mt-1 text-xs sm:text-sm" style={{ color: "rgb(var(--color-text-secondary))" }}>See how your palette looks in a realistic UI.</p>

              <div className={`mt-4 grid gap-4 ${compareBoth ? "md:grid-cols-2" : ""}`}>
                {(compareBoth ? ["light", "dark"] as ThemeMode[] : [mode]).map((m) => (
                  <ThemePreview key={m} theme={themes[m]} mode={m} />
                ))}
              </div>
            </section>

            {/* Export Section */}
            <section
              id="export-section"
              ref={exportRef}
              className="scroll-mt-20 p-4 sm:p-5 lg:p-6"
              style={{ borderRadius: "16px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background) / 0.84)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold sm:text-lg" style={{ color: "rgb(var(--color-text-primary))" }}>Export CSS Variables</h2>
                  <p className="mt-1 text-xs sm:text-sm" style={{ color: "rgb(var(--color-text-secondary))" }}>Copy and paste into your project.</p>
                </div>
                <button onClick={copy} className="self-start px-4 py-2 text-xs font-semibold sm:self-auto sm:text-sm" style={{ borderRadius: "999px", backgroundColor: "rgb(var(--color-primary))", color: getReadableTextColor(activeTheme.primary) }}>
                  {copied ? "Copied!" : "Copy CSS"}
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px] xl:grid-cols-[1fr_280px]">
                {/* Code Block */}
                <div className="overflow-hidden" style={{ borderRadius: "12px", border: "1px solid rgb(var(--color-border))" }}>
                  <div className="flex items-center justify-between border-b px-3 py-2 sm:px-4" style={{ borderColor: "rgb(var(--color-border))", backgroundColor: "rgb(var(--color-surface))" }}>
                    <span className="text-xs font-medium sm:text-sm" style={{ color: "rgb(var(--color-text-primary))" }}>CSS Variables</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium sm:text-xs" style={{ borderRadius: "999px", backgroundColor: copied ? activeTheme.success : "rgb(var(--color-surface-elevated))", color: copied ? getReadableTextColor(activeTheme.success) : "rgb(var(--color-text-secondary))" }}>
                      {copied ? "Ready to paste" : "Live output"}
                    </span>
                  </div>
                  <textarea
                    readOnly
                    value={cssBlock}
                    className="h-48 w-full resize-none p-3 font-mono text-[10px] leading-relaxed outline-none sm:h-64 sm:p-4 sm:text-xs"
                    style={{ border: "0", backgroundColor: "rgb(var(--color-text-primary))", color: "rgb(var(--color-surface))" }}
                  />
                </div>

                {/* Export Summary Cards */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4" style={{ borderRadius: "12px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-surface))" }}>
                    <p className="text-[10px] font-semibold uppercase sm:text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>Export Summary</p>
                    <div className="mt-3 space-y-2">
                      {[
                        [String(allColorFields.length), "Color variables"],
                        ["2", "Theme modes"],
                        [passedChecks >= 3 ? "Yes" : "Review", "WCAG ready"],
                      ].map(([value, label]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm" style={{ color: "rgb(var(--color-text-primary))" }}>{label}</span>
                          <span className="px-2 py-0.5 text-[10px] font-medium sm:text-xs" style={{ borderRadius: "999px", backgroundColor: "rgb(var(--color-surface-elevated))", color: "rgb(var(--color-text-secondary))" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4" style={{ borderRadius: "12px", border: "1px solid rgb(var(--color-border))", backgroundColor: "rgb(var(--color-background))" }}>
                    <p className="text-[10px] font-semibold uppercase sm:text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>Quick Guide</p>
                    <ol className="mt-2 space-y-1.5 text-[10px] sm:text-xs" style={{ color: "rgb(var(--color-text-secondary))" }}>
                      <li>1. Customize colors in editor</li>
                      <li>2. Check contrast scores</li>
                      <li>3. Preview in light/dark</li>
                      <li>4. Copy CSS to your project</li>
                    </ol>
                  </div>

                  <div className="p-3 sm:p-4" style={{ borderRadius: "12px", background: "linear-gradient(135deg, rgb(var(--color-primary) / 0.12), rgb(var(--color-secondary) / 0.1))", border: "1px solid rgb(var(--color-border))" }}>
                    <p className="text-[10px] font-semibold uppercase sm:text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>Usage</p>
                    <code className="mt-2 block text-[10px] sm:text-xs" style={{ color: "rgb(var(--color-text-primary))" }}>
                      color: rgb(var(--color-primary));
                    </code>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}