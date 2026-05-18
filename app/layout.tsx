import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactLenis } from "lenis/react";
import "./globals.css";
import Loader from "@/components/Loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Innovelous | Next-Gen Digital Agency",
    template: "%s | Innovelous", // Allows sub-pages to dynamically become "Services | Innovelous"
  },
  description: "Innovelous is a premier digital agency engineering high-performance web apps, mobile apps, and custom software pipelines.",
  keywords: ["Innovelous", "Digital Agency", "Web Development", "React Native", "Next.js Production", "Custom Software"],
  authors: [{ name: "Innovelous Team" }],
  creator: "Innovelous",
  metadataBase: new URL("https://innovelous.com"), // Replace with your real production domain
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://innovelous.com",
    title: "Innovelous | Next-Gen Digital Agency",
    description: "Engineering scalable web apps, mobile apps, and bespoke digital infrastructure.",
    siteName: "Innovelous",
    images: [
      {
        url: "/og-image.jpg", // Put a clean 1200x630 banner in your /public folder
        width: 1200,
        height: 630,
        alt: "Innovelous Digital Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Innovelous | Next-Gen Digital Agency",
    description: "Engineering scalable web apps, mobile apps, and bespoke digital infrastructure.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReactLenis root>
          {<Loader />}
          {children}
        </ReactLenis>
      </body>
    </html>
  );
}
