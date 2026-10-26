import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    passWithNoTests: true,
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["**/*.spec.ts", "src/main.ts", "**/generated/**"]
    }
  },
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    swc.vite({
      module: { type: "es6" }
    })
  ]
});
