import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AudioProvider } from "@/components/AudioProvider";
import { Menu } from "@/components/Menu";
import "./globals.css";

export const metadata: Metadata = {
  title: "For Jade",
  description: "A private birthday gift.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: "#211827", viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
        />
      </head>
      <body>
        <AudioProvider>
          <Menu />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
