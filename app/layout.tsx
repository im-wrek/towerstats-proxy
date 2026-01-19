import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>TowerStats Proxy</title>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
