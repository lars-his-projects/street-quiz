import { describe, expect, test } from "vitest";
import raw from "../src/style.css?raw";

// The design system (#17, #21): the look passes the contrast and touch target checks, and no rule has a fixed value.
const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block ${selector}`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const tokens = block(":root");

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = [
  ["--color-text", "--color-surface"],
  ["--color-on-accent", "--color-accent"],
  ["--color-on-right", "--color-right"],
  ["--color-on-wrong", "--color-wrong"],
];

describe("the tokens", () => {
  test.each(PAIRS)("%s on %s has a contrast of 4.5:1 or more", (fg, bg) => {
    expect(tokens[fg]).toMatch(/^#[0-9a-f]{6}$/);
    expect(tokens[bg]).toMatch(/^#[0-9a-f]{6}$/);
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });

  test("the touch targets are 44 px or more", () => {
    expect(Number.parseFloat(tokens["--target"])).toBeGreaterThanOrEqual(44);
  });
});

test("a right and a wrong answer differ by more than the color", () => {
  expect(css).toMatch(/\.quiz\.right \.feedback::before\s*\{\s*content:\s*"✓ "/);
  expect(css).toMatch(/\.quiz\.wrong \.feedback::before\s*\{\s*content:\s*"✗ "/);
});

test("no rule of the app has a fixed color, font or distance: only the tokens", () => {
  const rules = css.replace(/:root(\[[^\]]*\])?\s*\{[^}]*\}/g, "");
  const values = [
    ...rules.matchAll(
      /(?<!-)\b(color|background|font-family|padding|margin|gap|border-radius|box-shadow|border):\s*([^;]+);/g,
    ),
  ];
  const fixed = values.filter(([, , v]) => /#[0-9a-f]{3,8}\b|rgba?\(|\b[1-9]\d*px\b|sans-serif/.test(v));
  expect(fixed.map((m) => m[0])).toEqual([]);
});
