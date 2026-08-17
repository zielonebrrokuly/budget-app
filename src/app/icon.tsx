import { ImageResponse } from "next/og";

// Dwa rozmiary z jednego pliku: mały do karty przeglądarki i duży, którego
// wymaga instalacja jako aplikacja (Android oczekuje co najmniej 192 px).
// Generowane kodem, więc nie trzymamy plików graficznych ani sharpa.
export function generateImageMetadata() {
  return [
    { id: "32", size: { width: 32, height: 32 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const iconId = await id;
  const px = iconId === "512" ? 512 : 32;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4c8dfb",
          borderRadius: px * 0.22,
          color: "#ffffff",
          fontSize: px * 0.68,
          fontWeight: 700,
        }}
      >
        $
      </div>
    ),
    { width: px, height: px },
  );
}
