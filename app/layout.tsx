import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Instagram Post Creator",
  description: "Turn Tamil Nadu & India news into viral Instagram posts",
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
