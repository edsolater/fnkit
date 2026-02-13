import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

/**
 * 从模块路径提取 npm 包名，并转成可作为 chunk 名称的稳定字符串
 * Extract npm package name from module path and normalize it for chunk naming
 *
 * @param moduleId - Rollup 传入的模块绝对路径 / Absolute module id provided by Rollup
 * @returns 包名或空值 / Normalized package name or null
 */
function getNormalizedPackageNameFromModuleId(moduleId: string) {
  const nodeModulesRelativePath = moduleId.split("node_modules/")[1]
  if (!nodeModulesRelativePath) return null

  const pathSegments = nodeModulesRelativePath.split("/")
  const packageName = pathSegments[0].startsWith("@")
    ? `${pathSegments[0]}/${pathSegments[1]}`
    : pathSegments[0]

  return packageName.replace("/", "__")
}

export default defineConfig(({ mode }) => {
  const isDebugMode = mode === "debug"
  const isProductionMode = mode === "production"

  return {
    plugins: [
      dts({
        tsconfigPath: "./tsconfig.json",
        staticImport: true,
        insertTypesEntry: true,
      }),
    ],
    build: {
      // 调试模式 inline 最稳；生产模式独立 .map 便于发布与排错；若关闭 map 下游定位会变差
      // Inline maps are most stable in debug; external maps fit production publishing; disabling maps hurts traceability
      sourcemap: isDebugMode ? "inline" : true,

      // 仅生产压缩：调试保留可读性，不压缩线上体积会偏大
      // Minify in production only: preserves debug readability; never-minify would bloat production size
      minify: isProductionMode ? "esbuild" : false,

      lib: {
        entry: "./src/index.ts",
        formats: ["es"],
        // 固定 index 与 exports 对齐，避免入口命名漂移导致引用混乱
        // Keep entry artifact name aligned with exports to avoid naming drift
        fileName: "index",
      },
      rollupOptions: {
        output: {
          // 第三方包落在 vendor，并保留 npm 前缀，堆栈里一眼看出来源包
          // Place third-party chunks in vendor and keep npm-prefixed identity for quick attribution
          chunkFileNames: (chunk) =>
            chunk.name?.startsWith("npm.") ? "vendor/[name]-[hash].js" : "[name]-[hash].js",

          // 按包名拆分 node_modules；若不拆分，vendor 过于聚合不利于排查
          // Split node_modules per package; without this, vendor gets over-aggregated and harder to debug
          manualChunks(moduleId) {
            if (!moduleId.includes("node_modules/")) return
            const normalizedPackageName = getNormalizedPackageNameFromModuleId(moduleId)
            if (!normalizedPackageName) return
            return `npm.${normalizedPackageName}`
          },

          // 显式保留 sources，防止未来误改导致 map 信息缩水
          // Explicitly keep sources to prevent future regressions in map information richness
          sourcemapExcludeSources: false,
          dir: "dist",
        },
      },
    },
  }
})
