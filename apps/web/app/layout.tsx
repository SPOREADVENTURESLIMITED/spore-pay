import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "SPORE PAY | Payments made simple", description: "A planned East African wallet and payment gateway platform.", applicationName: "SPORE PAY" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
