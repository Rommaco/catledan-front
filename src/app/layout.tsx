import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
// OFFLINE FEATURES - DESHABILITADO PARA PRODUCCIÓN
// import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
// import { TestOfflineIndicator } from "@/components/offline/TestOfflineIndicator";
// import { ServiceWorkerProvider } from "@/components/offline/ServiceWorkerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catledan SaaS - Gestión de Ganadería",
  description: "Plataforma integral para la gestión de ganadería, cultivos y producción de leche",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Catledan SaaS"
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16a34a"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* OFFLINE FEATURES - DESHABILITADO PARA PRODUCCIÓN */}
        {/* <ServiceWorkerProvider> */}
          <AuthProvider>
            <ToastProvider>
              {children}
              {/* <OfflineIndicator /> */}
              {/* <TestOfflineIndicator /> */}
            </ToastProvider>
          </AuthProvider>
        {/* </ServiceWorkerProvider> */}
        {/* <script src="/register-sw.js" async></script> */}
      </body>
    </html>
  );
}
