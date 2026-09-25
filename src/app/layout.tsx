import type { ReactNode } from "react";

import { Poppins } from "next/font/google";

import type { Metadata } from "next";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: { default: "Matnog BPLS", template: "%s | Matnog BPLS" },
  description:
    "Business registration, licensing, assessment, payment, permit issuance, and compliance for Matnog, Sorsogon.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={poppins.variable}>{children}</body>
    </html>
  );
}
