import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lịch tập",
    short_name: "Lịch tập",
    description: "Lịch tập gym lặp theo tuần, có ảnh hướng dẫn và chế độ tập theo set.",
    start_url: "/",
    display: "standalone",
    background_color: "#f0ece4",
    theme_color: "#f0ece4",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
