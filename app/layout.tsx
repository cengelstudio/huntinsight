import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvGörüş - Avcı Anket Platformu",
  description: "Avcıların görüşlerini toplamak ve analiz etmek için tasarlanmış anket platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
