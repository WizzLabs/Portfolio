import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "WizzBot — Creative Technologist", description: "AI, automation, software, IoT and creative technology." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
