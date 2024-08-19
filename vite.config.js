// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";

export default defineConfig({
  plugins: [
    dts({
      outDir: "./dist/types",
      // ... other options if needed ...
    }),
    externalizeDeps(),
  ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        paths: resolve(__dirname, "src/paths.ts"),
        client: resolve(__dirname, "src/client.ts"),
        server: resolve(__dirname, "src/server.ts"),
      },
      name: "firebase-wrapper",
      // the proper extensions will be added
      fileName: (format, name) => `${name}.${format === "es" ? "m" : "c"}js`,
      //   fileName: (format, entryName) => {
      //     // ESM format gets .js extension
      //     if (format === 'es') {
      //       return `${entryName}.js`;
      //     }
      //     // CommonJS format gets .cjs.js extension
      //     if (format === 'cjs') {
      //       return `${entryName}.cjs.js`;
      //     }
      //     // UMD and IIFE formats (if used) could be handled here as well
      //   }
    },

    rollupOptions: {
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
      },
    },
  },
});
