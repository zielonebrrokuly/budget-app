import type { MetadataRoute } from "next";

// Dzięki temu „dodaj do ekranu głównego" bierze właściwą nazwę i ikonę,
// a nie zrzut strony. Ikony pochodzą z icon.tsx / apple-icon.tsx.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Budżet",
    short_name: "Budżet",
    description: "Osobisty budżet domowy",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b10",
    theme_color: "#0a0b10",
    icons: [
      { src: "/icon/32", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
