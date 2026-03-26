import {defineConfig} from "vite";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        chunkSizeWarningLimit: 4500
    },
    plugins: [
        react(),
        svgr()
    ]
});
