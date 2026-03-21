import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mail a Moment",
  description: "Thoughtful mail for the moments that matter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
