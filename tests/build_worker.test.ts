import { build } from "vite";
import { expect, test } from "vitest";

// MapLibre draws no tile and no street with no worker. It looks for the worker file next to its own module, and a
// bundle has no such file: on 2026-11-14 the live page asked for `assets/maplibre-gl-worker.mjs` and got a 404.
test("the build holds the worker file of the map, and the page code names it", async () => {
  const result = await build({ logLevel: "silent", build: { write: false } });
  const output = (Array.isArray(result) ? result : [result]).flatMap((part) => ("output" in part ? part.output : []));
  const worker = output.find((file) => file.type === "asset" && /maplibre-gl-worker.*\.mjs$/.test(file.fileName));
  expect(worker, "the worker file is in the build").toBeDefined();
  const code = output.flatMap((file) => (file.type === "chunk" ? [file.code] : [])).join("\n");
  expect(code).toContain(worker?.fileName);
}, 60_000);
