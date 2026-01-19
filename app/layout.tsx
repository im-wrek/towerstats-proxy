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
      <body className="bg-gradient-to-b from-gray-900 to-gray-800 text-white font-sans">
        <main className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-xl bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 p-8">
            {children}
          </div>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
