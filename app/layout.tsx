// app/layout.tsx
import React from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
  title: "TowerStats Proxy",
  description: "Proxy to view TowerStats data quickly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
