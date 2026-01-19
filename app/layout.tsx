// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'TowerStats Proxy',
  description: 'Lightweight proxy for towerstats.com',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
