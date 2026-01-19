import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "TowerStats Proxy",
  description: "Get hardest tower info for any tracker"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
