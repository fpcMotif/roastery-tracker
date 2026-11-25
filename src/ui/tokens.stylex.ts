import * as stylex from "@stylexjs/stylex";

export const color = stylex.defineVars({
  paper: "oklch(84% 0.012 245)",
  paper2: "oklch(81% 0.012 245)",
  paper3: "oklch(77% 0.012 245)",
  sheet: "oklch(93.5% 0.008 245)",
  ink: "oklch(16% 0.020 245)",
  ink2: "oklch(24% 0.018 245)",
  muted: "oklch(38% 0.016 245)",
  rule: "oklch(73% 0.013 240)",
  rule2: "oklch(32% 0.018 240)",
  accent: "oklch(45% 0.180 350)",
  accent2: "oklch(37% 0.160 350)",
  accentInk: "oklch(97% 0.006 245)",
  focus: "oklch(46% 0.190 350)",
  error: "oklch(52% 0.19 27)",
  hover: "oklch(89% 0.010 245)",
});

export const font = stylex.defineVars({
  display: '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
  body: '"Newsreader", ui-serif, Georgia, serif',
  figure: '"IBM Plex Mono", ui-monospace, monospace',
});

export const text = stylex.defineVars({
  sm: "0.875rem",
  md: "1rem",
  lg: "1.2rem",
  section: "1.2rem",
  display: "1.728rem",
  tracking: "-0.02em",
});

export const space = stylex.defineVars({
  x3s: "2px",
  x2s: "4px",
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "24px",
  xl: "40px",
  x2l: "64px",
  x3l: "96px",
});

export const shape = stylex.defineVars({
  radius: "2px",
  hair: "1px",
  bar: "2px",
  container: "1440px",
  gutter: "clamp(16px, 4vw, 64px)",
});

export const motion = stylex.defineVars({
  micro: "120ms",
  short: "220ms",
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
});

export const layer = stylex.defineVars({
  raised: "10",
  stickyNav: "300",
  modal: "400",
});
