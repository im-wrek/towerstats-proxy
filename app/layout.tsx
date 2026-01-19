import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "TowerStats Proxy",
  description: "Get hardest tower info for any tracker"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white font-sans">
        <main className="max-w-3xl mx-auto p-6">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
