import { resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import dts from "vite-plugin-dts";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: "src",
      rollupTypes: true,
      tsconfigPath: "./tsconfig.lib.json",
      beforeWriteFile(filePath, content) {
        content = content?.replace(
          /_getValidationErrors\(\): ValidationError\[];?/g,
          "",
        );
        return { filePath, content };
      }
    }),
  ],
  build: {
    lib: {
      entry: {
        "index": resolve(__dirname, "src/index.ts"),
        "extensions": resolve(__dirname, "src/extensions.ts"),
        "bind": resolve(__dirname, "src/bind/index.ts"),
        "validation": resolve(__dirname, "src/validation/index.ts"),
        "forms": resolve(__dirname, "src/forms/index.ts"),
        "components": resolve(__dirname, "src/components/index.ts"),
        "directives": resolve(__dirname, "src/directives/index.ts"),
      },
      name: "HoonamLib",
      fileName: (_, entryName) => `${entryName}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        /^vue.*/,
        /^node:.*/,
      ],
    },
    target: "es2020",
    copyPublicDir: false,
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL(".", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
