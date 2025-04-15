import { defineConfig } from "tsup";
import dotenv from "dotenv";
dotenv.config();

const env = {
  "process.env.DATABASE_URL": JSON.stringify(process.env.DATABASE_URL),
  "process.env.OPENAI_API_KEY": JSON.stringify(process.env.OPENAI_API_KEY),
};
export default defineConfig([
  {
    entry: ["src/tg-index.ts"],
    format: ["esm"],
    outDir: "dist",
    define: env,
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: false,
    target: "esnext",
    noExternal: ["fs"],
    external: ["@internal/database", "@internal/services"],
  },
  {
    entry: ["src/wa-index.ts"],
    format: ["esm"],
    outDir: "dist",
    define: env,
    splitting: false,
    sourcemap: true,
    clean: false,
    dts: false,
    target: "esnext",
    noExternal: ["fs"],
    external: ["@internal/database", "@internal/services"],
  },
]);
