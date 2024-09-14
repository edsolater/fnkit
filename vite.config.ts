import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: "./tsconfig.json",
      staticImport: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        dir: "dist",
      },
    },
    minify: false, // Disable overall compression
    terserOptions: {
      mangle: false, // Disable variable name mangling
    },
  },
})
