import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flip Property Coach",
  description: "Build your property flipping empire. Find suppliers, manage projects, track cashflow, and learn from the best.",
  icons: {
  icon: "/icons/logos/logo-gold-512.jpg",
  apple: "/icons/logos/logo-gold-512.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flip Coach",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0F172A] text-white antialiased`}>
        {children}
        <Toaster position="top-center" richColors closeButton />
        
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('[PWA] Service Worker registered successfully:', registration.scope);
                    })
                    .catch((error) => {
                      console.log('[PWA] Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
