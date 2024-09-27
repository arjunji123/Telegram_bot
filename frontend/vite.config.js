import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // api: "https://unitradehubmybot.onrender.com/api/v1",
      api: "http://localhost:4000",
    },
  },
  plugins: [react()],
  // define: {
  //   "process.env": process.env,
  // },
});
