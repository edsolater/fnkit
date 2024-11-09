// vite.config.ts
import { defineConfig } from "file:///C:/Users/edsol/mycode/fnkit/node_modules/.pnpm/vite@5.4.5_@types+node@22.5.5/node_modules/vite/dist/node/index.js";
import dts from "file:///C:/Users/edsol/mycode/fnkit/node_modules/.pnpm/vite-plugin-dts@4.2.1_@types+node@22.5.5_rollup@4.21.3_typescript@5.6.2_vite@5.4.5_@types+node@22.5.5_/node_modules/vite-plugin-dts/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    dts({
      tsconfigPath: "./tsconfig.json",
      staticImport: true,
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        dir: "dist"
      }
    },
    minify: false,
    // Disable overall compression
    terserOptions: {
      mangle: false
      // Disable variable name mangling
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxlZHNvbFxcXFxteWNvZGVcXFxcZm5raXRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGVkc29sXFxcXG15Y29kZVxcXFxmbmtpdFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZWRzb2wvbXljb2RlL2Zua2l0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIlxyXG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICBkdHMoe1xyXG4gICAgICB0c2NvbmZpZ1BhdGg6IFwiLi90c2NvbmZpZy5qc29uXCIsXHJcbiAgICAgIHN0YXRpY0ltcG9ydDogdHJ1ZSxcclxuICAgICAgaW5zZXJ0VHlwZXNFbnRyeTogdHJ1ZSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIGxpYjoge1xyXG4gICAgICBlbnRyeTogXCIuL3NyYy9pbmRleC50c1wiLFxyXG4gICAgICBmb3JtYXRzOiBbXCJlc1wiXSxcclxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQsIGVudHJ5TmFtZSkgPT4gYCR7ZW50cnlOYW1lfS5qc2AsXHJcbiAgICB9LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBwcmVzZXJ2ZU1vZHVsZXM6IHRydWUsXHJcbiAgICAgICAgcHJlc2VydmVNb2R1bGVzUm9vdDogXCJzcmNcIixcclxuICAgICAgICBkaXI6IFwiZGlzdFwiLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIG1pbmlmeTogZmFsc2UsIC8vIERpc2FibGUgb3ZlcmFsbCBjb21wcmVzc2lvblxyXG4gICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICBtYW5nbGU6IGZhbHNlLCAvLyBEaXNhYmxlIHZhcmlhYmxlIG5hbWUgbWFuZ2xpbmdcclxuICAgIH0sXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2USxTQUFTLG9CQUFvQjtBQUMxUyxPQUFPLFNBQVM7QUFFaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0YsY0FBYztBQUFBLE1BQ2QsY0FBYztBQUFBLE1BQ2Qsa0JBQWtCO0FBQUEsSUFDcEIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxNQUNQLFNBQVMsQ0FBQyxJQUFJO0FBQUEsTUFDZCxVQUFVLENBQUMsUUFBUSxjQUFjLEdBQUcsU0FBUztBQUFBLElBQy9DO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixpQkFBaUI7QUFBQSxRQUNqQixxQkFBcUI7QUFBQSxRQUNyQixLQUFLO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
