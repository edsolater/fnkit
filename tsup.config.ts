import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/**/*.ts"],
  clean: true,
  dts: true,
  format: ["esm"],
  target: "es2022",
  splitting: true,
})
