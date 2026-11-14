import { defineConfig } from "vite";

// The app is served from https://lars-his-projects.github.io/street-quiz/. `style.html` is the style page (#17).
export default defineConfig({
  base: "/street-quiz/",
  build: {
    rollupOptions: {
      input: { main: "index.html", style: "style.html" },
    },
  },
});
