import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LRSB Prototype",
  description: "Limited Risk Spread Betting prototype",
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
