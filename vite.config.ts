import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  ssr: {
    noExternal: ["@ai-sdk/anthropic", "@ai-sdk/openai", "@ai-sdk/google"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
