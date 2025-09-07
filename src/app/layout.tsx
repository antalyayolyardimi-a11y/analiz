import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kucoin Long/Short Signal Bot",
  description: "A Next.js based bot for capturing long/short signals using Kucoin API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
