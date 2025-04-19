import { defineConfig } from "tsup";
import dotenv from "dotenv";
dotenv.config();

const env = {
  "process.env.PUPPETEER_EXECUTABLE_PATH": JSON.stringify(
    process.env.PUPPETEER_EXECUTABLE_PATH || ""
  ),
  "process.env.DATABASE_URL": JSON.stringify(process.env.DATABASE_URL),
  "process.env.OPENAI_API_KEY": JSON.stringify(process.env.OPENAI_API_KEY),
};

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  target: "esnext",
  env,
});
