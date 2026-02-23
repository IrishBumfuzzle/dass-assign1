import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as default, change if needed
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fest event manager",
  description: "All-in-one platform for planning, managing, and executing unforgettable experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
