// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        main: resolve(__dirname, 'src/index.ts'),
        client: resolve(__dirname, 'src/client.ts'),
        server: resolve(__dirname, 'src/server.ts'),
      },
      name: 'firebase-soil',
      // the proper extensions will be added
      fileName: (format, name) => `${name}.${format}.js`
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
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      plugins: [dts({
          outDir: './dist/types',
          // ... other options if needed ...
        })],
      
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
        },
      },
    },
  },
})