import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["apps/bots/src/tg-index.ts", "apps/bots/src/wa-index.ts"],
    outDir: "apps/bots/dist",
    format: ["esm"],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: false,
  },
  {
    entry: ["packages/services/src/index.ts"],
    outDir: "packages/services/dist",
    format: ["esm"],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
  },
  {
    entry: ["packages/database/src/index.ts"],
    outDir: "packages/database/dist",
    format: ["esm"],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
  },
]);
