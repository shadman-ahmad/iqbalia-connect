import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
  host: true,
  allowedHosts: true,
  proxy: {
    "/teacher": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
    "/students": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
    "/attendance": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
    "/settings": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
    "/holidays": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
  },
},
});