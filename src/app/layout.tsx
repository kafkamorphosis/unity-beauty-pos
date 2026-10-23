import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: { default: "Unity Beauty", template: "%s · Unity Beauty" },
  icons: { icon: "/brand/unity-mark.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fcf2f0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
