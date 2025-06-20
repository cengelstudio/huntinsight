import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AvGörüş - Avcı Anket Platformu",
  description: "Avcıların görüşlerini toplamak ve analiz etmek için tasarlanmış anket platformu",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#1d9bf0" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
