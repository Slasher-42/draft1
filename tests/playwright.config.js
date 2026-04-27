const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./ui",
  timeout: 30000,
  use: {
    headless: true,
    baseURL: "http://localhost:5173",
  },
});
