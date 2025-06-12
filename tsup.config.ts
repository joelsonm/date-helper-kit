import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/append-offset.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: false,
  outDir: "dist",
});
