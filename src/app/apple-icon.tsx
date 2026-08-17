import { ImageResponse } from "next/og";

// Ikona na ekranie głównym iPhone'a. Bez własnego zaokrąglenia i bez
// przezroczystości — iOS sam przycina ikonę do swojego kształtu.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          color: "#ffffff",
          fontSize: 124,
          fontWeight: 700,
        }}
      >
        $
      </div>
    ),
    size,
  );
}
