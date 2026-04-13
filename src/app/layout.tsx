import type { Metadata } from "next";
import "./globals.css";
import { BetsProvider } from "@/context/BetsContext";

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
      <body>
        <BetsProvider>{children}</BetsProvider>
      </body>
    </html>
  );
}
