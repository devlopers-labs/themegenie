import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type ThemeMode = "light" | "dark";
type PreviewDevice = "desktop" | "tablet" | "mobile";
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
  description: string;
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

const defaultThemes: ThemeCollection = {
  light: defaultLightTheme,
  dark: defaultDarkTheme,
};

const colorSections: ColorSection[] = [
  {
    id: "brand",
    title: "Brand",
    fields: [
      {
        key: "primary",
        label: "Primary",
        cssVar: "--color-primary",
        description: "Main CTA, active states, and main brand actions.",
      },
      {
        key: "secondary",
        label: "Secondary",
        cssVar: "--color-secondary",
        description: "Support color for highlights, chips, and positive emphasis.",
      },
      {
        key: "accent",
        label: "Accent",
        cssVar: "--color-accent",
        description: "Use sparingly for standout details and promotional moments.",
      },
    ],
  },
  {
    id: "surfaces",
    title: "Surfaces",
    fields: [
      {
        key: "background",
        label: "Background",
        cssVar: "--color-background",
        description: "Main page canvas and overall visual atmosphere.",
      },
      {
        key: "surface",
        label: "Surface",
        cssVar: "--color-surface",
        description: "Cards, panels, and core section blocks.",
      },
      {
        key: "surfaceElevated",
        label: "Elevated",
        cssVar: "--color-surface-elevated",
        description: "Nested cards, tabs, badges, and spotlight modules.",
      },
    ],
  },
  {
    id: "text",
    title: "Text",
    fields: [
      {
        key: "textPrimary",
        label: "Text Primary",
        cssVar: "--color-text-primary",
        description: "Headlines and the most important reading content.",
      },
      {
        key: "textSecondary",
        label: "Text Secondary",
        cssVar: "--color-text-secondary",
        description: "Body text, descriptions, and interface labels.",
      },
      {
        key: "textMuted",
        label: "Text Muted",
        cssVar: "--color-text-muted",
        description: "Metadata, helper content, and subtle UI labeling.",
      },
    ],
  },
  {
    id: "status",
    title: "Status",
    fields: [
      {
        key: "border",
        label: "Border",
        cssVar: "--color-border",
        description: "Subtle outlines, separators, and low-emphasis dividers.",
      },
      {
        key: "borderStrong",
        label: "Border Strong",
        cssVar: "--color-border-strong",
        description: "Focused controls and stronger structural edges.",
      },
      {
        key: "success",
        label: "Success",
        cssVar: "--color-success",
        description: "Positive feedback and confirmed states.",
      },
      {
        key: "warning",
        label: "Warning",
        cssVar: "--color-warning",
        description: "Caution, pending tasks, and attention moments.",
      },
      {
        key: "danger",
        label: "Danger",
        cssVar: "--color-danger",
        description: "Errors and destructive actions.",
      },
    ],
  },
];

const allColorFields = colorSections.flatMap((section) => section.fields);

const staticVariableGroups = [
  {
    heading: "RADIUS",
    entries: [
      ["--radius-sm", "6px"],
      ["--radius-md", "10px"],
      ["--radius-lg", "16px"],
      ["--radius-xl", "24px"],
    ],
  },
  {
    heading: "SHADOWS",
    entries: [
      ["--shadow-sm", "0 1px 2px rgba(0,0,0,0.05)"],
      ["--shadow-md", "0 4px 12px rgba(0,0,0,0.08)"],
      ["--shadow-lg", "0 10px 25px rgba(0,0,0,0.15)"],
    ],
  },
  {
    heading: "SPACING SCALE",
    entries: [
      ["--space-xs", "4px"],
      ["--space-sm", "8px"],
      ["--space-md", "16px"],
      ["--space-lg", "24px"],
      ["--space-xl", "40px"],
      ["--space-2xl", "64px"],
    ],
  },
  {
    heading: "CONTAINER",
    entries: [["--container-max-width", "1200px"]],
  },
  {
    heading: "TRANSITIONS",
    entries: [
      ["--transition-fast", "150ms"],
      ["--transition-normal", "250ms"],
      ["--transition-slow", "400ms"],
    ],
  },
] as const;

const presetBundles: PresetBundle[] = [
  {
    name: "Professional Indigo",
    description: "Balanced, clean, and portfolio-friendly by default.",
    themes: {
      light: { ...defaultLightTheme },
      dark: { ...defaultDarkTheme },
    },
  },
  {
    name: "Ocean Signal",
    description: "Cool, technical, and polished with a crisp dark companion.",
    themes: {
      light: {
        primary: "#0ea5e9",
        secondary: "#14b8a6",
        accent: "#f97316",
        background: "#f8fbff",
        surface: "#eef6ff",
        surfaceElevated: "#dbeafe",
        textPrimary: "#082f49",
        textSecondary: "#155e75",
        textMuted: "#64748b",
        border: "#cfe3f5",
        borderStrong: "#93c5fd",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      dark: {
        primary: "#38bdf8",
        secondary: "#2dd4bf",
        accent: "#fb923c",
        background: "#07131f",
        surface: "#0f1d2c",
        surfaceElevated: "#11263a",
        textPrimary: "#f8fafc",
        textSecondary: "#cbd5e1",
        textMuted: "#94a3b8",
        border: "#1e3a5f",
        borderStrong: "#334155",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
    },
  },
  {
    name: "Warm Premium",
    description: "Soft luxury feel with strong readability and warmth.",
    themes: {
      light: {
        primary: "#7c3aed",
        secondary: "#10b981",
        accent: "#f97316",
        background: "#fefaf6",
        surface: "#fff7ed",
        surfaceElevated: "#ffedd5",
        textPrimary: "#1f2937",
        textSecondary: "#4b5563",
        textMuted: "#9ca3af",
        border: "#fed7aa",
        borderStrong: "#fdba74",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#dc2626",
      },
      dark: {
        primary: "#a78bfa",
        secondary: "#34d399",
        accent: "#fb923c",
        background: "#140f14",
        surface: "#1f1720",
        surfaceElevated: "#2a1e2d",
        textPrimary: "#f9fafb",
        textSecondary: "#e5e7eb",
        textMuted: "#c4b5fd",
        border: "#3b2244",
        borderStrong: "#5b2d75",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
    },
  },
  {
    name: "Minimal Mono",
    description: "Editorial, understated, and ideal for sleek portfolios.",
    themes: {
      light: {
        primary: "#111827",
        secondary: "#0f766e",
        accent: "#f97316",
        background: "#ffffff",
        surface: "#f9fafb",
        surfaceElevated: "#f3f4f6",
        textPrimary: "#111827",
        textSecondary: "#4b5563",
        textMuted: "#9ca3af",
        border: "#e5e7eb",
        borderStrong: "#d1d5db",
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      dark: {
        primary: "#f3f4f6",
        secondary: "#2dd4bf",
        accent: "#fb923c",
        background: "#09090b",
        surface: "#111827",
        surfaceElevated: "#1f2937",
        textPrimary: "#f9fafb",
        textSecondary: "#d1d5db",
        textMuted: "#9ca3af",
        border: "#27272a",
        borderStrong: "#3f3f46",
        success: "#4ade80",
        warning: "#fbbf24",
        danger: "#f87171",
      },
    },
  },
];

const previewDevices: { id: PreviewDevice; label: string; width: string }[] = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "820px" },
  { id: "mobile", label: "Mobile", width: "390px" },
];

function cloneThemes(themes: ThemeCollection): ThemeCollection {
  return {
    light: { ...themes.light },
    dark: { ...themes.dark },
  };
}

function normalizeHex(hex: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return hex.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    const short = hex.slice(1).toLowerCase();
    return `#${short
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }

  return "#000000";
}

function sanitizeHexInput(value: string) {
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (/^#[0-9a-fA-F]{3}$/.test(prefixed) || /^#[0-9a-fA-F]{6}$/.test(prefixed)) {
    return normalizeHex(prefixed);
  }

  return null;
}

function normalizeTheme(theme: ThemeColors): ThemeColors {
  return {
    primary: normalizeHex(theme.primary),
    secondary: normalizeHex(theme.secondary),
    accent: normalizeHex(theme.accent),
    background: normalizeHex(theme.background),
    surface: normalizeHex(theme.surface),
    surfaceElevated: normalizeHex(theme.surfaceElevated),
    textPrimary: normalizeHex(theme.textPrimary),
    textSecondary: normalizeHex(theme.textSecondary),
    textMuted: normalizeHex(theme.textMuted),
    border: normalizeHex(theme.border),
    borderStrong: normalizeHex(theme.borderStrong),
    success: normalizeHex(theme.success),
    warning: normalizeHex(theme.warning),
    danger: normalizeHex(theme.danger),
  };
}

function isThemeColors(value: unknown): value is ThemeColors {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return allColorFields.every((field) => typeof candidate[field.key] === "string" && Boolean(sanitizeHexInput(candidate[field.key] as string)));
}

function loadInitialThemes(): ThemeCollection {
  if (typeof window === "undefined") {
    return cloneThemes(defaultThemes);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return cloneThemes(defaultThemes);
    }

    const parsed = JSON.parse(raw) as { light?: unknown; dark?: unknown };

    if (isThemeColors(parsed.light) && isThemeColors(parsed.dark)) {
      return {
        light: normalizeTheme(parsed.light),
        dark: normalizeTheme(parsed.dark),
      };
    }
  } catch {
    return cloneThemes(defaultThemes);
  }

  return cloneThemes(defaultThemes);
}

function hexToRgbTriplet(hex: string) {
  const normalized = normalizeHex(hex);
  const red = Number.parseInt(normalized.slice(1, 3), 16);
  const green = Number.parseInt(normalized.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.slice(5, 7), 16);

  return `${red} ${green} ${blue}`;
}

function hexToRgbTuple(hex: string) {
  const normalized = normalizeHex(hex);

  return [
    Number.parseInt(normalized.slice(1, 3), 16),
    Number.parseInt(normalized.slice(3, 5), 16),
    Number.parseInt(normalized.slice(5, 7), 16),
  ] as const;
}

function relativeLuminance(hex: string) {
  const [red, green, blue] = hexToRgbTuple(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getContrastRatio(foreground: string, background: string) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}

function getReadableTextColor(background: string) {
  const darkOption = "#0f172a";
  const lightOption = "#ffffff";

  return getContrastRatio(darkOption, background) >= getContrastRatio(lightOption, background) ? darkOption : lightOption;
}

function getContrastLabel(ratio: number) {
  if (ratio >= 7) {
    return "Excellent";
  }

  if (ratio >= 4.5) {
    return "AA ready";
  }

  if (ratio >= 3) {
    return "Large text only";
  }

  return "Low contrast";
}

function wrapHue(value: number) {
  return ((value % 360) + 360) % 360;
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue >= 0 && hue < 60) {
    red = c;
    green = x;
  } else if (hue >= 60 && hue < 120) {
    red = x;
    green = c;
  } else if (hue >= 120 && hue < 180) {
    green = c;
    blue = x;
  } else if (hue >= 180 && hue < 240) {
    green = x;
    blue = c;
  } else if (hue >= 240 && hue < 300) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  const toHex = (channel: number) => Math.round((channel + m) * 255).toString(16).padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function buildRandomTheme(mode: ThemeMode): ThemeColors {
  const baseHue = Math.floor(Math.random() * 360);
  const secondaryHue = wrapHue(baseHue + 115 + Math.floor(Math.random() * 25));
  const accentHue = wrapHue(baseHue + 35 + Math.floor(Math.random() * 35));

  if (mode === "light") {
    return {
      primary: hslToHex(baseHue, 76, 55),
      secondary: hslToHex(secondaryHue, 68, 46),
      accent: hslToHex(accentHue, 90, 52),
      background: hslToHex(baseHue, 28, 98),
      surface: hslToHex(baseHue, 32, 96),
      surfaceElevated: hslToHex(baseHue, 26, 92),
      textPrimary: hslToHex(baseHue, 28, 12),
      textSecondary: hslToHex(baseHue, 18, 34),
      textMuted: hslToHex(baseHue, 14, 58),
      border: hslToHex(baseHue, 22, 88),
      borderStrong: hslToHex(baseHue, 20, 78),
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
    };
  }

  return {
    primary: hslToHex(baseHue, 82, 68),
    secondary: hslToHex(secondaryHue, 74, 62),
    accent: hslToHex(accentHue, 90, 64),
    background: hslToHex(baseHue, 34, 8),
    surface: hslToHex(baseHue, 30, 13),
    surfaceElevated: hslToHex(baseHue, 25, 18),
    textPrimary: hslToHex(baseHue, 18, 96),
    textSecondary: hslToHex(baseHue, 14, 82),
    textMuted: hslToHex(baseHue, 10, 62),
    border: hslToHex(baseHue, 20, 22),
    borderStrong: hslToHex(baseHue, 18, 30),
    success: "#4ade80",
    warning: "#fbbf24",
    danger: "#f87171",
  };
}

function buildThemeStyleVars(theme: ThemeColors) {
  return {
    "--color-primary": hexToRgbTriplet(theme.primary),
    "--color-secondary": hexToRgbTriplet(theme.secondary),
    "--color-accent": hexToRgbTriplet(theme.accent),
    "--color-background": hexToRgbTriplet(theme.background),
    "--color-surface": hexToRgbTriplet(theme.surface),
    "--color-surface-elevated": hexToRgbTriplet(theme.surfaceElevated),
    "--color-text-primary": hexToRgbTriplet(theme.textPrimary),
    "--color-text-secondary": hexToRgbTriplet(theme.textSecondary),
    "--color-text-muted": hexToRgbTriplet(theme.textMuted),
    "--color-border": hexToRgbTriplet(theme.border),
    "--color-border-strong": hexToRgbTriplet(theme.borderStrong),
    "--color-success": hexToRgbTriplet(theme.success),
    "--color-warning": hexToRgbTriplet(theme.warning),
    "--color-danger": hexToRgbTriplet(theme.danger),
  } as CSSProperties;
}

function appendThemeColorVariables(lines: string[], theme: ThemeColors) {
  lines.push("  /* brand */");
  lines.push(`  --color-primary: ${hexToRgbTriplet(theme.primary)};`);
  lines.push(`  --color-secondary: ${hexToRgbTriplet(theme.secondary)};`);
  lines.push(`  --color-accent: ${hexToRgbTriplet(theme.accent)};`);
  lines.push("");
  lines.push("  /* surfaces */");
  lines.push(`  --color-background: ${hexToRgbTriplet(theme.background)};`);
  lines.push(`  --color-surface: ${hexToRgbTriplet(theme.surface)};`);
  lines.push(`  --color-surface-elevated: ${hexToRgbTriplet(theme.surfaceElevated)};`);
  lines.push("");
  lines.push("  /* text */");
  lines.push(`  --color-text-primary: ${hexToRgbTriplet(theme.textPrimary)};`);
  lines.push(`  --color-text-secondary: ${hexToRgbTriplet(theme.textSecondary)};`);
  lines.push(`  --color-text-muted: ${hexToRgbTriplet(theme.textMuted)};`);
  lines.push("");
  lines.push("  /* borders */");
  lines.push(`  --color-border: ${hexToRgbTriplet(theme.border)};`);
  lines.push(`  --color-border-strong: ${hexToRgbTriplet(theme.borderStrong)};`);
  lines.push("");
  lines.push("  /* status */");
  lines.push(`  --color-success: ${hexToRgbTriplet(theme.success)};`);
  lines.push(`  --color-warning: ${hexToRgbTriplet(theme.warning)};`);
  lines.push(`  --color-danger: ${hexToRgbTriplet(theme.danger)};`);
}

function buildCssVariablesBlock(themes: ThemeCollection) {
  const lines = [
    ":root, [data-theme=\"light\"] {",
    "  color-scheme: light;",
    "",
    "  /* ========== COLORS ========== */",
    "",
  ];

  appendThemeColorVariables(lines, themes.light);
  lines.push("");

  staticVariableGroups.forEach((group, index) => {
    lines.push(`  /* ========== ${group.heading} ========== */`);
    lines.push("");

    group.entries.forEach(([token, value]) => {
      lines.push(`  ${token}: ${value};`);
    });

    if (index < staticVariableGroups.length - 1) {
      lines.push("");
    }
  });

  lines.push("}");
  lines.push("");
  lines.push("[data-theme=\"dark\"] {");
  lines.push("  color-scheme: dark;");
  lines.push("");
  lines.push("  /* ========== COLORS ========== */");
  lines.push("");
  appendThemeColorVariables(lines, themes.dark);
  lines.push("}");

  return lines.join("\n");
}

function applyThemeToDocument(theme: ThemeColors, mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.style.colorScheme = mode;

  allColorFields.forEach((field) => {
    root.style.setProperty(field.cssVar, hexToRgbTriplet(theme[field.key]));
  });
}

function CompactColorControl({
  field,
  value,
  onChange,
}: {
  field: ColorFieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value.toUpperCase());

  useEffect(() => {
    setDraft(value.toUpperCase());
  }, [value]);

  function commitDraft(nextValue: string) {
    const sanitized = sanitizeHexInput(nextValue);

    if (sanitized) {
      onChange(sanitized);
      setDraft(sanitized.toUpperCase());
      return;
    }

    setDraft(value.toUpperCase());
  }

  return (
    <div
      className="palette-card p-3"
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid rgb(var(--color-border))",
        backgroundColor: "rgb(var(--color-background) / 0.84)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
              {field.label}
            </p>
            <span
              className="hidden px-2 py-0.5 text-[10px] font-semibold uppercase sm:inline-flex"
              style={{
                borderRadius: "999px",
                backgroundColor: "rgb(var(--color-surface))",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              {field.cssVar}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5" style={{ color: "rgb(var(--color-text-secondary))" }}>
            {field.description}
          </p>
        </div>
        <span
          className="h-9 w-9 shrink-0"
          style={{
            borderRadius: "var(--radius-md)",
            backgroundColor: value,
            border: "1px solid rgb(var(--color-border))",
            boxShadow: "var(--shadow-sm)",
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-[56px_minmax(0,1fr)] gap-2">
        <input
          aria-label={`${field.label} color picker`}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full cursor-pointer rounded-xl border-0 bg-transparent p-0"
        />
        <input
          aria-label={`${field.label} hex value`}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value.toUpperCase())}
          onBlur={(event) => commitDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitDraft(draft);
            }
          }}
          className="h-11 w-full px-3 text-sm font-semibold uppercase outline-none"
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid rgb(var(--color-border-strong))",
            backgroundColor: "rgb(var(--color-surface))",
            color: "rgb(var(--color-text-primary))",
          }}
        />
      </div>

      <p className="mt-2 text-[11px]" style={{ color: "rgb(var(--color-text-muted))" }}>
        RGB {hexToRgbTriplet(value)}
      </p>
    </div>
  );
}

function ThemePreviewFrame({
  theme,
  mode,
  device,
}: {
  theme: ThemeColors;
  mode: ThemeMode;
  device: PreviewDevice;
}) {
  const deviceWidth = previewDevices.find((item) => item.id === device)?.width ?? "100%";
  const onPrimary = getReadableTextColor(theme.primary);
  const onSecondary = getReadableTextColor(theme.secondary);
  const onAccent = getReadableTextColor(theme.accent);
  const onSuccess = getReadableTextColor(theme.success);

  return (
    <div className="mx-auto w-full" style={{ maxWidth: device === "desktop" ? "100%" : deviceWidth }}>
      <div style={buildThemeStyleVars(theme)}>
        <div
          className="overflow-hidden"
          style={{
            colorScheme: mode,
            borderRadius: "calc(var(--radius-xl) + 8px)",
            border: "1px solid rgb(var(--color-border))",
            background:
              "radial-gradient(circle at top left, rgb(var(--color-primary) / 0.16), transparent 28%), radial-gradient(circle at top right, rgb(var(--color-secondary) / 0.14), transparent 24%), rgb(var(--color-surface))",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
            style={{
              borderColor: "rgb(var(--color-border))",
              backgroundColor: "rgb(var(--color-background) / 0.82)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[theme.danger, theme.warning, theme.success].map((item) => (
                  <span key={item} className="h-3 w-3 rounded-full" style={{ backgroundColor: item }} />
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                  {mode} theme preview
                </p>
                <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                  Responsive portfolio demo
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {["Hero", "Projects", "Testimonials", "Contact"].map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1"
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgb(var(--color-border))",
                    backgroundColor: item === "Projects" ? "rgb(var(--color-surface-elevated))" : "rgb(var(--color-background) / 0.6)",
                    color: "rgb(var(--color-text-secondary))",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-5 p-4 md:p-5">
            <section
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
            >
              <div
                className="p-5"
                style={{
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid rgb(var(--color-border))",
                  backgroundColor: "rgb(var(--color-background) / 0.84)",
                  boxShadow: "var(--shadow-md)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span
                  className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    borderRadius: "999px",
                    backgroundColor: "rgb(var(--color-surface-elevated))",
                    color: "rgb(var(--color-primary))",
                  }}
                >
                  Available for selected freelance work
                </span>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight" style={{ color: "rgb(var(--color-text-primary))" }}>
                  A live website preview that shows exactly how your palette behaves.
                </h2>
                <p className="mt-3 text-sm leading-7" style={{ color: "rgb(var(--color-text-secondary))" }}>
                  Test hero layouts, cards, forms, badges, footers, and high-emphasis actions before pasting the tokens into
                  your actual project.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="px-4 py-2.5 text-sm font-semibold"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: "rgb(var(--color-primary))",
                      color: onPrimary,
                    }}
                  >
                    View case studies
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2.5 text-sm font-semibold"
                    style={{
                      borderRadius: "999px",
                      border: "1px solid rgb(var(--color-border-strong))",
                      backgroundColor: "rgb(var(--color-background))",
                      color: "rgb(var(--color-text-primary))",
                    }}
                  >
                    Download résumé
                  </button>
                </div>

                <div
                  className="mt-5 grid gap-3"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}
                >
                  {[
                    ["18", "Launches"],
                    ["22%", "Uplift"],
                    ["4.9/5", "Client score"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="p-3"
                      style={{
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid rgb(var(--color-border))",
                        backgroundColor: "rgb(var(--color-background))",
                      }}
                    >
                      <p className="text-lg font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                        {value}
                      </p>
                      <p className="text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="space-y-3 p-5"
                style={{
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid rgb(var(--color-border))",
                  backgroundColor: "rgb(var(--color-background) / 0.82)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                      Snapshot card
                    </p>
                    <h3 className="mt-1 text-lg font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                      Senior product designer
                    </h3>
                  </div>
                  <span
                    className="px-3 py-1 text-xs font-semibold"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: theme.success,
                      color: onSuccess,
                    }}
                  >
                    Open to work
                  </span>
                </div>

                {[
                  ["Focus", "B2B SaaS, AI tools, fintech experiences"],
                  ["Stack", "Figma, React, TypeScript, Tailwind CSS"],
                  ["Strength", "Design systems, conversion pages, UX clarity"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="p-3"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid rgb(var(--color-border))",
                      backgroundColor: "rgb(var(--color-surface))",
                    }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                      {label}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "rgb(var(--color-text-primary))" }}>
                      {value}
                    </p>
                  </div>
                ))}

                <div
                  className="p-4"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, rgb(var(--color-primary) / 0.16), rgb(var(--color-secondary) / 0.14))",
                    border: "1px solid rgb(var(--color-border))",
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                    Additional feature preview
                  </p>
                  <p className="mt-1 text-sm leading-6" style={{ color: "rgb(var(--color-text-secondary))" }}>
                    Save palettes locally, compare both themes, randomize colors, and export one combined CSS block.
                  </p>
                </div>
              </div>
            </section>

            <section
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
            >
              {[
                {
                  title: "Fintech dashboard redesign",
                  label: "Case study",
                  category: "Product design",
                  summary: "Improved activation flow clarity and reduced drop-off during onboarding.",
                  gradient: "linear-gradient(135deg, rgb(var(--color-primary) / 0.92), rgb(var(--color-accent) / 0.78))",
                },
                {
                  title: "Developer docs launch",
                  label: "Launch",
                  category: "Frontend engineering",
                  summary: "Built a token-driven landing system that scales across marketing and docs.",
                  gradient: "linear-gradient(135deg, rgb(var(--color-secondary) / 0.9), rgb(var(--color-primary) / 0.64))",
                },
                {
                  title: "AI workflow microsite",
                  label: "Featured",
                  category: "Brand experience",
                  summary: "Translated a complex product into a persuasive story-led website experience.",
                  gradient: "linear-gradient(135deg, rgb(var(--color-text-primary)), rgb(var(--color-primary) / 0.8))",
                },
              ].map((project) => (
                <article
                  key={project.title}
                  className="overflow-hidden"
                  style={{
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid rgb(var(--color-border))",
                    backgroundColor: "rgb(var(--color-background))",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="h-28" style={{ background: project.gradient }} />
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                        {project.category}
                      </p>
                      <span
                        className="px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          borderRadius: "999px",
                          backgroundColor: project.label === "Featured" ? theme.accent : "rgb(var(--color-surface-elevated))",
                          color: project.label === "Featured" ? onAccent : "rgb(var(--color-text-secondary))",
                        }}
                      >
                        {project.label}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                      {project.title}
                    </h4>
                    <p className="text-sm leading-6" style={{ color: "rgb(var(--color-text-secondary))" }}>
                      {project.summary}
                    </p>
                    <button type="button" className="text-sm font-semibold" style={{ color: "rgb(var(--color-primary))" }}>
                      Read project →
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <section
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
            >
              <div
                className="p-4"
                style={{
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid rgb(var(--color-border))",
                  backgroundColor: "rgb(var(--color-surface))",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                  Testimonial module
                </p>
                <blockquote className="mt-3 text-base leading-8" style={{ color: "rgb(var(--color-text-primary))" }}>
                  “We finalized our website palette in one review cycle because the preview made every state easy to judge.”
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className="h-10 w-10"
                    style={{
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))",
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                      Maya Thompson
                    </p>
                    <p className="text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>
                      Head of product, Loomix AI
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="p-4"
                style={{
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid rgb(var(--color-border))",
                  backgroundColor: "rgb(var(--color-background))",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                      Contact form preview
                    </p>
                    <h4 className="mt-1 text-lg font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                      Inputs and CTA states
                    </h4>
                  </div>
                  <span
                    className="px-3 py-1 text-xs font-semibold"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: theme.secondary,
                      color: onSecondary,
                    }}
                  >
                    Live sync
                  </span>
                </div>

                <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                  {["Name", "Email"].map((label) => (
                    <div key={label}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                        {label}
                      </p>
                      <div
                        className="px-3 py-2.5 text-sm"
                        style={{
                          borderRadius: "var(--radius-md)",
                          border: "1px solid rgb(var(--color-border-strong))",
                          backgroundColor: "rgb(var(--color-surface))",
                          color: "rgb(var(--color-text-secondary))",
                        }}
                      >
                        Placeholder content
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                    Project details
                  </p>
                  <div
                    className="min-h-[92px] px-3 py-2.5 text-sm leading-6"
                    style={{
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgb(var(--color-border-strong))",
                      backgroundColor: "rgb(var(--color-surface))",
                      color: "rgb(var(--color-text-secondary))",
                    }}
                  >
                    I need a conversion-focused portfolio site with a reusable design system and light/dark mode.
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="px-4 py-2.5 text-sm font-semibold"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: "rgb(var(--color-primary))",
                      color: onPrimary,
                    }}
                  >
                    Send inquiry
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2.5 text-sm font-semibold"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: theme.accent,
                      color: onAccent,
                    }}
                  >
                    Book intro call
                  </button>
                </div>
              </div>
            </section>

            <footer
              className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
              style={{ borderColor: "rgb(var(--color-border))" }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                  jordan@portfolio.dev
                </p>
                <p className="text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>
                  Footer colors, links, borders, and muted text are included in the preview too.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["LinkedIn", "GitHub", "Behance"].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 text-xs font-semibold"
                    style={{
                      borderRadius: "999px",
                      border: "1px solid rgb(var(--color-border))",
                      backgroundColor: "rgb(var(--color-background))",
                      color: "rgb(var(--color-text-secondary))",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [themes, setThemes] = useState<ThemeCollection>(() => loadInitialThemes());
  const [mode, setMode] = useState<ThemeMode>("light");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [activeSection, setActiveSection] = useState<SectionId>("brand");
  const [compareBoth, setCompareBoth] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFloatingCopy, setShowFloatingCopy] = useState(false);
  const copySectionRef = useRef<HTMLElement | null>(null);

  const activeTheme = themes[mode];
  const activeSectionConfig = colorSections.find((section) => section.id === activeSection) ?? colorSections[0];

  useEffect(() => {
    applyThemeToDocument(activeTheme, mode);
  }, [activeTheme, mode]);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCopy(window.scrollY > 460);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cssBlock = useMemo(() => buildCssVariablesBlock(themes), [themes]);

  const diagnostics = useMemo(
    () => [
      {
        label: "Primary button text",
        ratio: getContrastRatio(getReadableTextColor(activeTheme.primary), activeTheme.primary),
      },
      {
        label: "Primary text on background",
        ratio: getContrastRatio(activeTheme.textPrimary, activeTheme.background),
      },
      {
        label: "Secondary text on background",
        ratio: getContrastRatio(activeTheme.textSecondary, activeTheme.background),
      },
      {
        label: "Border visibility on surface",
        ratio: getContrastRatio(activeTheme.border, activeTheme.surface),
      },
    ],
    [activeTheme]
  );

  const passedChecks = diagnostics.filter((item) => item.ratio >= 4.5).length;

  const paletteHealth = useMemo(() => {
    if (passedChecks === 4) return "Excellent";
    if (passedChecks >= 3) return "Strong";
    if (passedChecks >= 2) return "Fair";
    return "Needs work";
  }, [passedChecks]);

  function updateActiveThemeColor(key: keyof ThemeColors, value: string) {
    setThemes((current) => ({
      ...current,
      [mode]: {
        ...current[mode],
        [key]: value,
      },
    }));
  }

  function applyPreset(preset: PresetBundle) {
    setThemes(cloneThemes(preset.themes));
  }

  function resetAllThemes() {
    setThemes(cloneThemes(defaultThemes));
    setMode("light");
    setCompareBoth(false);
  }

  function randomizeCurrentTheme() {
    setThemes((current) => ({
      ...current,
      [mode]: buildRandomTheme(mode),
    }));
  }

  function syncBrandColorsAcrossModes() {
    const targetMode: ThemeMode = mode === "light" ? "dark" : "light";

    setThemes((current) => ({
      ...current,
      [targetMode]: {
        ...current[targetMode],
        primary: current[mode].primary,
        secondary: current[mode].secondary,
        accent: current[mode].accent,
      },
    }));
  }

  function savePaletteLocally() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
  }

  async function copyCssBlock() {
    try {
      await navigator.clipboard.writeText(cssBlock);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function jumpToCopyBlock() {
    copySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const previewModes: ThemeMode[] = compareBoth ? ["light", "dark"] : [mode];

  return (
    <div className="min-h-screen">
      <a
        href="#copy-css-block"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        style={{
          borderRadius: "999px",
          backgroundColor: "rgb(var(--color-primary))",
          color: getReadableTextColor(activeTheme.primary),
        }}
      >
        Skip to copy CSS section
      </a>

      {showFloatingCopy ? (
        <button
          type="button"
          onClick={jumpToCopyBlock}
          className="fixed bottom-4 right-4 z-40 px-4 py-3 text-sm font-semibold shadow-lg sm:bottom-6 sm:right-6"
          style={{
            borderRadius: "999px",
            backgroundColor: "rgb(var(--color-primary))",
            color: getReadableTextColor(activeTheme.primary),
            boxShadow: "var(--shadow-lg)",
          }}
        >
          Jump to copy CSS
        </button>
      ) : null}

      <div className="mx-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8" style={{ maxWidth: "var(--container-max-width)" }}>
        <header
          className="hero-shell relative overflow-hidden p-5 lg:p-7"
          style={{
            borderRadius: "calc(var(--radius-xl) + 10px)",
            border: "1px solid rgb(var(--color-border))",
            background:
              "linear-gradient(180deg, rgb(var(--color-background) / 0.92), rgb(var(--color-background) / 0.82)), radial-gradient(circle at top left, rgb(var(--color-primary) / 0.14), transparent 34%), radial-gradient(circle at top right, rgb(var(--color-secondary) / 0.12), transparent 28%)",
            boxShadow: "var(--shadow-lg)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgb(var(--color-primary) / 0.5), transparent)" }} />

          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgb(var(--color-border))",
                    backgroundColor: "rgb(var(--color-surface) / 0.9)",
                    color: "rgb(var(--color-primary))",
                  }}
                >
                  Responsive palette generator
                </span>
                <span
                  className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    borderRadius: "999px",
                    backgroundColor: passedChecks >= 3 ? activeTheme.success : activeTheme.warning,
                    color: getReadableTextColor(passedChecks >= 3 ? activeTheme.success : activeTheme.warning),
                  }}
                >
                  {paletteHealth} accessibility health
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: "rgb(var(--color-text-primary))" }}>
                Design, test, compare, and export your palette with confidence.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: "rgb(var(--color-text-secondary))" }}>
                Choose custom colors from compact controls, preview them across a complete responsive website, switch between
                light and dark themes, compare both side by side, and jump directly to the copy-ready CSS block whenever you
                are ready to export.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={jumpToCopyBlock}
                  className="px-4 py-3 text-sm font-semibold"
                  style={{
                    borderRadius: "999px",
                    backgroundColor: "rgb(var(--color-primary))",
                    color: getReadableTextColor(activeTheme.primary),
                  }}
                >
                  Go to copy CSS block
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 720, behavior: "smooth" })}
                  className="px-4 py-3 text-sm font-semibold"
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgb(var(--color-border-strong))",
                    backgroundColor: "rgb(var(--color-background) / 0.92)",
                    color: "rgb(var(--color-text-primary))",
                  }}
                >
                  Start editing colors
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Compact editing", "Tabbed controls keep the palette editor short and easier to use."],
                  ["Clear export path", "Jump buttons guide users to the CSS block so they never miss it."],
                  ["Better comfort", "Softer visuals, stronger hierarchy, and improved focus states."],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="palette-card p-4"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid rgb(var(--color-border))",
                      backgroundColor: "rgb(var(--color-surface) / 0.88)",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                      {title}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6" style={{ color: "rgb(var(--color-text-primary))" }}>
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px] xl:grid-cols-2">
              {[
                ["Current mode", `${mode.charAt(0).toUpperCase() + mode.slice(1)} theme active`],
                ["Preview device", previewDevices.find((item) => item.id === device)?.label ?? "Desktop"],
                ["Contrast checks", `${passedChecks}/4 strong checks`],
                ["Theme compare", compareBoth ? "Side-by-side enabled" : "Single theme view"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="palette-card p-4"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid rgb(var(--color-border))",
                    backgroundColor: "rgb(var(--color-background) / 0.84)",
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section
          className="mt-6 p-4 sm:p-5"
          style={{
            borderRadius: "calc(var(--radius-xl) + 6px)",
            border: "1px solid rgb(var(--color-border))",
            backgroundColor: "rgb(var(--color-background) / 0.84)",
            boxShadow: "var(--shadow-lg)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="grid gap-4 2xl:grid-cols-[1.2fr_1fr_auto] 2xl:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                Theme mode
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["light", "dark"] as ThemeMode[]).map((item) => {
                  const active = mode === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className="interactive-chip px-4 py-2.5 text-sm font-semibold capitalize"
                      aria-pressed={active}
                      style={{
                        borderRadius: "999px",
                        border: `1px solid ${active ? "rgb(var(--color-primary))" : "rgb(var(--color-border))"}`,
                        backgroundColor: active ? "rgb(var(--color-primary) / 0.12)" : "rgb(var(--color-surface))",
                        color: active ? "rgb(var(--color-primary))" : "rgb(var(--color-text-primary))",
                      }}
                    >
                      {item} mode
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCompareBoth((current) => !current)}
                  className="interactive-chip px-4 py-2.5 text-sm font-semibold"
                  aria-pressed={compareBoth}
                  style={{
                    borderRadius: "999px",
                    border: `1px solid ${compareBoth ? "rgb(var(--color-secondary))" : "rgb(var(--color-border))"}`,
                    backgroundColor: compareBoth ? "rgb(var(--color-secondary) / 0.12)" : "rgb(var(--color-surface))",
                    color: compareBoth ? "rgb(var(--color-secondary))" : "rgb(var(--color-text-primary))",
                  }}
                >
                  {compareBoth ? "Comparing both themes" : "Compare both themes"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                Preview size
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {previewDevices.map((item) => {
                  const active = device === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDevice(item.id)}
                      className="interactive-chip px-4 py-2.5 text-sm font-semibold"
                      aria-pressed={active}
                      style={{
                        borderRadius: "999px",
                        border: `1px solid ${active ? "rgb(var(--color-primary))" : "rgb(var(--color-border))"}`,
                        backgroundColor: active ? "rgb(var(--color-primary) / 0.12)" : "rgb(var(--color-surface))",
                        color: active ? "rgb(var(--color-primary))" : "rgb(var(--color-text-primary))",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 2xl:justify-end">
              <button
                type="button"
                onClick={randomizeCurrentTheme}
                className="interactive-chip px-4 py-2.5 text-sm font-semibold"
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgb(var(--color-border-strong))",
                  backgroundColor: "rgb(var(--color-background))",
                  color: "rgb(var(--color-text-primary))",
                }}
              >
                Randomize {mode}
              </button>
              <button
                type="button"
                onClick={savePaletteLocally}
                className="interactive-chip px-4 py-2.5 text-sm font-semibold"
                style={{
                  borderRadius: "999px",
                  backgroundColor: "rgb(var(--color-secondary))",
                  color: getReadableTextColor(activeTheme.secondary),
                }}
              >
                {saved ? "Saved locally" : "Save palette"}
              </button>
              <button
                type="button"
                onClick={jumpToCopyBlock}
                className="interactive-chip px-4 py-2.5 text-sm font-semibold"
                style={{
                  borderRadius: "999px",
                  backgroundColor: activeTheme.accent,
                  color: getReadableTextColor(activeTheme.accent),
                }}
              >
                Copy section
              </button>
              <button
                type="button"
                onClick={resetAllThemes}
                className="interactive-chip px-4 py-2.5 text-sm font-semibold"
                style={{
                  borderRadius: "999px",
                  backgroundColor: "rgb(var(--color-primary))",
                  color: getReadableTextColor(activeTheme.primary),
                }}
              >
                Reset all
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto pb-1">
            <div className="flex w-max gap-2">
              {presetBundles.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="palette-card min-w-[220px] p-3 text-left"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid rgb(var(--color-border))",
                    backgroundColor: "rgb(var(--color-surface))",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                        {preset.name}
                      </p>
                      <p className="mt-1 text-xs leading-5" style={{ color: "rgb(var(--color-text-secondary))" }}>
                        {preset.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[preset.themes.light.primary, preset.themes.light.secondary, preset.themes.dark.primary].map((color) => (
                        <span
                          key={color}
                          className="h-4 w-4 rounded-full"
                          style={{ border: "1px solid rgb(var(--color-border))", backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6 xl:sticky xl:top-6 self-start">
            <section
              className="p-4 sm:p-5"
              style={{
                borderRadius: "calc(var(--radius-xl) + 6px)",
                border: "1px solid rgb(var(--color-border))",
                backgroundColor: "rgb(var(--color-background) / 0.84)",
                boxShadow: "var(--shadow-lg)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                    Compact controls
                  </p>
                  <h2 className="mt-1 text-xl font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                    Editing {mode} palette
                  </h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: "rgb(var(--color-text-secondary))" }}>
                    Use tabs to edit one group at a time and keep the interface comfortable on mobile, tablet, and desktop.
                  </p>
                </div>
                {activeSection === "brand" ? (
                  <button
                    type="button"
                    onClick={syncBrandColorsAcrossModes}
                    className="interactive-chip px-3 py-2 text-xs font-semibold"
                    style={{
                      borderRadius: "999px",
                      border: "1px solid rgb(var(--color-border))",
                      backgroundColor: "rgb(var(--color-surface))",
                      color: "rgb(var(--color-text-primary))",
                    }}
                  >
                    Sync brand
                  </button>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {colorSections.map((section) => {
                  const active = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className="interactive-chip px-3 py-2 text-sm font-semibold"
                      aria-pressed={active}
                      style={{
                        borderRadius: "999px",
                        border: `1px solid ${active ? "rgb(var(--color-primary))" : "rgb(var(--color-border))"}`,
                        backgroundColor: active ? "rgb(var(--color-primary) / 0.12)" : "rgb(var(--color-surface))",
                        color: active ? "rgb(var(--color-primary))" : "rgb(var(--color-text-primary))",
                      }}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {activeSectionConfig.fields.map((field) => (
                  <CompactColorControl
                    key={field.cssVar}
                    field={field}
                    value={activeTheme[field.key]}
                    onChange={(nextValue) => updateActiveThemeColor(field.key, nextValue)}
                  />
                ))}
              </div>

              <div
                className="palette-card mt-4 p-3"
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgb(var(--color-border))",
                  backgroundColor: "rgb(var(--color-surface))",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                    Quick swatches
                  </p>
                  <button
                    type="button"
                    onClick={jumpToCopyBlock}
                    className="interactive-chip px-3 py-1.5 text-[11px] font-semibold"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: "rgb(var(--color-surface-elevated))",
                      color: "rgb(var(--color-text-primary))",
                    }}
                  >
                    Export CSS
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {allColorFields.map((field) => (
                    <div key={field.cssVar} className="text-center">
                      <div
                        className="mx-auto h-9 w-9"
                        style={{
                          borderRadius: "var(--radius-md)",
                          border: "1px solid rgb(var(--color-border))",
                          backgroundColor: activeTheme[field.key],
                        }}
                      />
                      <p className="mt-1 text-[10px] leading-4" style={{ color: "rgb(var(--color-text-muted))" }}>
                        {field.label.replace("Text ", "").replace("Border ", "")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section
              className="p-4 sm:p-5"
              style={{
                borderRadius: "calc(var(--radius-xl) + 6px)",
                border: "1px solid rgb(var(--color-border))",
                backgroundColor: "rgb(var(--color-background) / 0.84)",
                boxShadow: "var(--shadow-lg)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                    Accessibility checks
                  </p>
                  <h2 className="mt-1 text-xl font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                    {passedChecks}/4 strong checks in {mode}
                  </h2>
                </div>
                <span
                  className="px-3 py-1 text-xs font-semibold"
                  style={{
                    borderRadius: "999px",
                    backgroundColor: passedChecks >= 3 ? activeTheme.success : activeTheme.warning,
                    color: getReadableTextColor(passedChecks >= 3 ? activeTheme.success : activeTheme.warning),
                  }}
                >
                  {passedChecks >= 3 ? "Solid" : "Needs review"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {diagnostics.map((item) => {
                  const label = getContrastLabel(item.ratio);
                  const tone =
                    label === "Excellent"
                      ? activeTheme.success
                      : label === "AA ready"
                        ? activeTheme.primary
                        : label === "Large text only"
                          ? activeTheme.warning
                          : activeTheme.danger;

                  return (
                    <div
                      key={item.label}
                      className="palette-card flex items-center justify-between gap-3 p-3"
                      style={{
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid rgb(var(--color-border))",
                        backgroundColor: "rgb(var(--color-surface))",
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>
                          {item.ratio.toFixed(2)}:1 contrast
                        </p>
                      </div>
                      <span
                        className="px-3 py-1 text-xs font-semibold"
                        style={{
                          borderRadius: "999px",
                          backgroundColor: tone,
                          color: getReadableTextColor(tone),
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            <section
              className="p-4 sm:p-5 lg:p-6"
              style={{
                borderRadius: "calc(var(--radius-xl) + 6px)",
                border: "1px solid rgb(var(--color-border))",
                backgroundColor: "rgb(var(--color-background) / 0.84)",
                boxShadow: "var(--shadow-lg)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                    Live website preview
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                    Test the palette across a full responsive site
                  </h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: "rgb(var(--color-text-secondary))" }}>
                    The page follows the selected mode, while the preview can show the active theme only or both themes
                    together. Device buttons help you inspect how the palette feels in desktop, tablet, and mobile layouts.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allColorFields.slice(0, 6).map((field) => (
                    <span
                      key={field.cssVar}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid rgb(var(--color-border))",
                        backgroundColor: "rgb(var(--color-surface))",
                        color: "rgb(var(--color-text-secondary))",
                      }}
                    >
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: activeTheme[field.key] }} />
                      {field.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`mt-6 grid gap-4 ${compareBoth ? "2xl:grid-cols-2" : ""}`}>
                {previewModes.map((previewMode) => (
                  <ThemePreviewFrame key={previewMode} theme={themes[previewMode]} mode={previewMode} device={device} />
                ))}
              </div>
            </section>

            <section
              id="copy-css-block"
              ref={copySectionRef}
              className="scroll-mt-24 p-4 sm:p-5 lg:p-6"
              style={{
                borderRadius: "calc(var(--radius-xl) + 8px)",
                border: "1px solid rgb(var(--color-border))",
                background:
                  "linear-gradient(180deg, rgb(var(--color-background) / 0.92), rgb(var(--color-background) / 0.84)), radial-gradient(circle at top right, rgb(var(--color-accent) / 0.12), transparent 28%)",
                boxShadow: "var(--shadow-lg)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                      style={{
                        borderRadius: "999px",
                        backgroundColor: activeTheme.accent,
                        color: getReadableTextColor(activeTheme.accent),
                      }}
                    >
                      Copy palette here
                    </span>
                    <span
                      className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid rgb(var(--color-border))",
                        backgroundColor: "rgb(var(--color-surface))",
                        color: "rgb(var(--color-text-secondary))",
                      }}
                    >
                      Export-ready block
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                    Copy-ready output
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                    Export every CSS variable used by the website
                  </h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: "rgb(var(--color-text-secondary))" }}>
                    This section is your final handoff. The exported block includes the light theme in <code>:root</code> and a
                    full dark override in <code>[data-theme="dark"]</code>, so you can paste it directly into your own project
                    and keep the same theme switching behavior.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyCssBlock}
                    className="interactive-chip px-4 py-2.5 text-sm font-semibold"
                    style={{
                      borderRadius: "999px",
                      backgroundColor: "rgb(var(--color-primary))",
                      color: getReadableTextColor(activeTheme.primary),
                    }}
                  >
                    {copied ? "Copied CSS" : "Copy CSS block"}
                  </button>
                  <button
                    type="button"
                    onClick={savePaletteLocally}
                    className="interactive-chip px-4 py-2.5 text-sm font-semibold"
                    style={{
                      borderRadius: "999px",
                      border: "1px solid rgb(var(--color-border-strong))",
                      backgroundColor: "rgb(var(--color-background))",
                      color: "rgb(var(--color-text-primary))",
                    }}
                  >
                    Save current theme set
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="overflow-hidden" style={{ borderRadius: "var(--radius-xl)", border: "1px solid rgb(var(--color-border))" }}>
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
                    style={{ borderColor: "rgb(var(--color-border))", backgroundColor: "rgb(var(--color-surface))" }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                        Combined light and dark theme tokens
                      </p>
                      <p className="text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>
                        Includes color, radius, shadow, spacing, container, and transition variables.
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 text-xs font-semibold"
                      style={{
                        borderRadius: "999px",
                        backgroundColor: copied ? activeTheme.success : "rgb(var(--color-surface-elevated))",
                        color: copied ? getReadableTextColor(activeTheme.success) : "rgb(var(--color-text-secondary))",
                      }}
                    >
                      {copied ? "Ready to paste" : "Live output"}
                    </span>
                  </div>
                  <textarea
                    readOnly
                    aria-label="Generated CSS variables block"
                    value={cssBlock}
                    className="h-[420px] w-full resize-none p-4 font-mono text-sm leading-6 outline-none sm:h-[520px]"
                    style={{
                      border: "0",
                      backgroundColor: "rgb(var(--color-text-primary))",
                      color: "rgb(var(--color-surface))",
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div
                    className="palette-card p-4"
                    style={{
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid rgb(var(--color-border))",
                      backgroundColor: "rgb(var(--color-surface))",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                      User guidance
                    </p>
                    <h3 className="mt-2 text-lg font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                      What to do next
                    </h3>
                    <ol className="mt-3 space-y-3 text-sm leading-6" style={{ color: "rgb(var(--color-text-secondary))" }}>
                      <li>1. Fine-tune colors in the compact controls.</li>
                      <li>2. Review the responsive preview in light and dark modes.</li>
                      <li>3. Use the button above to copy the full CSS block.</li>
                      <li>4. Paste it into your project and keep the same token system.</li>
                    </ol>
                  </div>

                  <div
                    className="palette-card p-4"
                    style={{
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid rgb(var(--color-border))",
                      backgroundColor: "rgb(var(--color-background))",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgb(var(--color-text-muted))" }}>
                      Export summary
                    </p>
                    <div className="mt-3 space-y-3">
                      {[
                        [`${allColorFields.length}`, "Color variables"],
                        ["2", "Theme modes included"],
                        ["5", "Token groups beyond colors"],
                      ].map(([value, label]) => (
                        <div key={label} className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold" style={{ color: "rgb(var(--color-text-primary))" }}>
                            {label}
                          </p>
                          <span
                            className="px-3 py-1 text-xs font-semibold"
                            style={{
                              borderRadius: "999px",
                              backgroundColor: "rgb(var(--color-surface-elevated))",
                              color: "rgb(var(--color-text-secondary))",
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
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
