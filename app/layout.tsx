import type { Metadata, Viewport } from "next";
import {  Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Suspense } from "react";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebEntog | Cyberduck Alternative",
  description: "Object Storage Management",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-white tracking-tight antialiased`}
      >

        <ThemeProvider
          enableSystem={true}
          attribute="class"
          storageKey="theme"
          defaultTheme="light"
        >
              <Suspense>
                {children}
              </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
