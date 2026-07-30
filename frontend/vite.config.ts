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
      target: "https://iqbalia-connect.onrender.com/",
      changeOrigin: true,
    },
    "/students": {
      target: "https://iqbalia-connect.onrender.com/",
      changeOrigin: true,
    },
    "/attendance": {
      target: "https://iqbalia-connect.onrender.com/",
      changeOrigin: true,
    },
    "/settings": {
      target: "https://iqbalia-connect.onrender.com/",
      changeOrigin: true,
    },
    "/holidays": {
      target: "https://iqbalia-connect.onrender.com/",
      changeOrigin: true,
    },
  },
},
});