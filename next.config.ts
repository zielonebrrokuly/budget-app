import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pozwól na dostęp do serwera deweloperskiego z innych urządzeń w sieci lokalnej
  // (np. telefon przez WiFi). Bez tego Next blokuje część zapytań dev z innego
  // adresu niż localhost, przez co wykresy (rysowane po stronie klienta) nie ładują się.
  allowedDevOrigins: ["192.168.18.8", "192.168.18.*", "192.168.*.*"],
};

export default nextConfig;
