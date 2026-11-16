import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: "SPORE PAY | Payments made simple",
  description: "A planned East African wallet and payment gateway platform.",
  applicationName: "SPORE PAY",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/spore-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/spore-icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/spore-icon-192.png", sizes: "192x192", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#123c2c",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ServiceWorkerRegistration />{children}</body></html>;
}
