import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { OperatorProvider } from "@/contexts/OperatorContext";
import { BLEProvider } from "@/contexts/BLEContext";
import { Toaster } from "@/components/ui/sonner";
import PWAInstallPrompt from "@/components/common/PWAInstallPrompt";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "PUBBS - Public Bicycle Sharing System",
  description:
    "A comprehensive public bicycle sharing platform that connects communities through sustainable urban mobility. Join PUBBS to access eco-friendly transportation solutions in your city.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/assets/logo.svg", type: "image/svg+xml" },
      { url: "/assets/pubbs_logo.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/assets/pubbs_logo.png", sizes: "180x180", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "152x152", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "144x144", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "120x120", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "114x114", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "76x76", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "72x72", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "60x60", type: "image/png" },
      { url: "/assets/pubbs_logo.png", sizes: "57x57", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/assets/logo.svg",
        color: "#06b6d4",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PUBBS",
    startupImage: [
      {
        url: "/assets/pubbs_logo.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/assets/pubbs_logo.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/assets/pubbs_logo.png",
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "PUBBS",
    "application-name": "PUBBS",
    "msapplication-TileColor": "#06b6d4",
    "msapplication-TileImage": "/assets/pubbs_logo.png",
    "msapplication-config": "none",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${poppins.variable} antialiased font-poppins bg-dark touch-manipulation`}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <AuthProvider>
          <OperatorProvider>
            <BLEProvider>{children}</BLEProvider>
          </OperatorProvider>
        </AuthProvider>
        <Toaster richColors />
        <PWAInstallPrompt />
        <Analytics />

        <Script
          id="pwa-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
             
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                  } catch (registrationError) {
                    console.error('SW registration failed: ', registrationError);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
