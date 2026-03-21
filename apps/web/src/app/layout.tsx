import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project One",
  description: "Moments to Mail design system and product foundation",
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
