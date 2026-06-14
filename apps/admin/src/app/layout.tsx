import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { isConvexConfigured } from "@cemvp/convex-client";
import { AppAuthProvider, OfflineAuthProvider } from "@cemvp/auth-ui";
import { ConvexProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Createconomy Admin",
  description: "Restricted admin access for authorized app owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const convexConfigured = isConvexConfigured();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ConvexProvider>
            {convexConfigured ? (
              <AppAuthProvider>{children}</AppAuthProvider>
            ) : (
              <OfflineAuthProvider>{children}</OfflineAuthProvider>
            )}
          </ConvexProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
