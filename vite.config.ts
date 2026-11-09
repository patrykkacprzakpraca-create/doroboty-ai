import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { recruitingComparison } from "./server/recruiting-comparison";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "GEMINI_");
  return {
    plugins: [react(), tailwindcss(), recruitingComparison(env.GEMINI_API_KEY, env.GEMINI_MODEL)],
    base: "./",
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  };
});
