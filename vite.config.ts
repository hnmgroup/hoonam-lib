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
      outDir: "dist/types",
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        "index": resolve(__dirname, "src/index.ts"),
        "extensions": resolve(__dirname, "src/extensions.ts"),
        "bind": resolve(__dirname, "src/bind/index.ts"),
      },
      name: "Hoonam",
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
