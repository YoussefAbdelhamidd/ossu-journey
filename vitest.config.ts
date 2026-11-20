import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    globalSetup: "./tests/global-setup.ts",
    hookTimeout: 180_000,
    testTimeout: 30_000,
    env: {
      DATABASE_URL: "postgresql://ossu:ossu@127.0.0.1:5432/ossu_test?sslmode=require",
      DIRECT_URL: "postgresql://ossu:ossu@127.0.0.1:5432/ossu_test?sslmode=require",
      AUTH_SECRET: "test-secret-test-secret-test-secret-123",
      LEARNER_EMAIL: "momen@ossu.local",
      LEARNER_PASSWORD: "study-at-dawn",
      LEARNER_NAME: "Momen",
      TUTOR_EMAIL: "tutor@ossu.local",
      TUTOR_PASSWORD: "review-desk",
      TUTOR_NAME: "Tutor",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
