import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TradeSprint — Learn to Trade with Play Money",
    template: "%s | TradeSprint",
  },
  description:
    "Practice trading stocks with $10,000 of play money. Trade through a mystery year, get AI-powered feedback on your trading psychology. No risk, real lessons.",
  metadataBase: new URL("https://trade-sprint.vercel.app"),
  openGraph: {
    title: "TradeSprint — Learn to Trade with Play Money",
    description:
      "Practice trading stocks with $10,000 of play money. Get AI feedback on your trading psychology.",
    siteName: "TradeSprint",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeSprint — Learn to Trade with Play Money",
    description:
      "Practice trading stocks with $10,000 of play money. Get AI feedback on your trading psychology.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-100`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
