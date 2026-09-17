import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Musikfy - Pemutar Musik",
    short_name: "Musikfy",
    description: "Aplikasi pemutar musik ringkas, hemat kuota, dan bebas distraksi",
    start_url: "/",
    display: "standalone",
    background_color: "#080c14",
    theme_color: "#10b981",
    icons: [
      {
        src: "/globe.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
