import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["crypto"],
    }),
  ],
  resolve: {
    alias: {
      crypto: "crypto-browserify", // Alias 'crypto' module to the installed polyfill
    },
  },
  define: {
    "process.env": {},
    global: {},
  },
});
