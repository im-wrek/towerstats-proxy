import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "TowerStats Proxy",
  description: "Proxy API for TowerStats",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics /> {/* ✅ Vercel Analytics */}
      </body>
    </html>
  );
}
