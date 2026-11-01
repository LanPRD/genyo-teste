import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// Testes de integração e e2e compartilham o mesmo MongoDB de teste
// (docker-compose.test.yml), isolado do banco de desenvolvimento.
export default defineConfig({
  test: {
    include: [
      "__tests__/integration/**/*.int-spec.ts",
      "__tests__/e2e/**/*.e2e-spec.ts"
    ],
    globals: true,
    root: "./",
    fileParallelism: false,
    globalSetup: ["__tests__/global-setup-infra.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL:
        "mongodb://localhost:27018/genyo_test?replicaSet=rs0&directConnection=true"
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
