import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { LenisProvider } from "@/lib/lenis-provider";
import ScrollTriggerManager from "@/components/ScrollTriggerManager";
import SiteSettingsProvider from "@/components/SiteSettingsProvider";
import { getSiteData } from "@/lib/site-settings";
import "./globals.css";
import "lenis/dist/lenis.css";
import TransitionCanvas from "@/components/TransitionCanvas";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  const faviconUrl = settings.favicon_url || '/favicon.ico';
  const ogImageUrl = settings.og_image_url || '/og-image.jpg';

  return {
    title: {
      default: "Innovelous | Next-Gen Digital Agency",
      template: "%s | Innovelous",
    },
    description: "Innovelous is a premier digital agency engineering high-performance web apps, mobile apps, and custom software pipelines.",
    keywords: ["Innovelous", "Digital Agency", "Web Development", "React Native", "Next.js Production", "Custom Software"],
    authors: [{ name: "Innovelous Team" }],
    creator: "Innovelous",
    metadataBase: new URL("https://innovelous.com"),
    icons: [{ url: faviconUrl }],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://innovelous.com",
      title: "Innovelous | Next-Gen Digital Agency",
      description: "Engineering scalable web apps, mobile apps, and bespoke digital infrastructure.",
      siteName: "Innovelous",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "Innovelous Digital Agency" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Innovelous | Next-Gen Digital Agency",
      description: "Engineering scalable web apps, mobile apps, and bespoke digital infrastructure.",
      images: [ogImageUrl],
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings, testimonials, faqs } = await getSiteData();

  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <SiteSettingsProvider settings={settings} testimonials={testimonials} faqs={faqs}>
            <LenisProvider>
              <TransitionCanvas />
              <ScrollTriggerManager />
              {children}
            </LenisProvider>
          </SiteSettingsProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
