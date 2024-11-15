import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
export default defineConfig({
 server: {
   proxy: {
     // api: "https://unitradehubmybot.onrender.com/api/v1",
      'api': "https://telegram-bot-by30.onrender.com/api/v1",
  changeOrigin: true,
   },
 },
 plugins: [react()],
 // define: {
 //   "process.env": process.env,
 // },
});
