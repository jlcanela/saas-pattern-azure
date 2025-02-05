import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    watch: false,
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"]
    }
  }
})
