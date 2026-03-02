import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers
    target: "ES2020",

    // Improve build output
    minify: "esbuild", // Use esbuild instead of terser (already bundled with Vite)

    // Code splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "vendor-react": ["react", "react-dom"],
          "vendor-firebase": ["firebase"],
          "vendor-router": ["react-router-dom"],
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
          "vendor-ui": ["react-icons", "framer-motion", "swiper"],
          "vendor-utils": [
            "axios",
            "uuid",
            "clsx",
            "idb-keyval",
            "tailwind-merge",
          ],

          // Feature chunks (let Vite handle imports to avoid circular deps)
          "admin-dashboard": ["src/admin/pages/DashboardPage.jsx"],
          "admin-courses": [
            "src/admin/pages/CoursesListPage.jsx",
            "src/admin/pages/CourseEditPage.jsx",
            "src/admin/importer/ImportCoursesPage.jsx",
          ],
          "admin-roadmaps": [
            "src/admin/pages/RoadmapsListPage.jsx",
            "src/admin/pages/RoadmapEditPage.jsx",
          ],
          "admin-content": [
            "src/admin/pages/HomeEditPage.jsx",
            "src/admin/pages/AboutEditPage.jsx",
          ],
          "admin-orders": [
            "src/admin/pages/OrdersListPage.jsx",
            "src/admin/pages/CourseRequestsPage.jsx",
          ],
        },
      },
    },

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,

    // CSS code splitting
    cssCodeSplit: true,

    // Source maps for production debugging (optional, disable for smaller builds)
    sourcemap: false,

    // Common options
    outDir: "dist",
    emptyOutDir: true,
  },

  // Optimization for dev
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "@react-pdf/renderer",
      "firebase",
      "firebase-auth",
      "firebase-firestore",
    ],
  },

  server: {
    open: true,
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
});
