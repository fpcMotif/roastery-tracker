import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { redact } from "@tanstack/redact/vite";
import stylex from "@stylexjs/unplugin";

export default defineConfig({
  ssr: { noExternal: true },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    stylex.vite({ devMode: "full" }),
    tanstackStart(),
    react(),
    redact(),
  ],
});
