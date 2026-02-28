import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeRooms - Virtual Spaces",
  description: "Create and join virtual rooms for collaboration and connection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
