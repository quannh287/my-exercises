import type { Metadata, Viewport } from "next";
import { Geist_Mono, Literata, Nunito_Sans } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const nunitoSans = Nunito_Sans({ variable: "--font-nunito-sans", subsets: ["latin", "vietnamese"] });
const literata = Literata({ variable: "--font-literata", subsets: ["latin", "vietnamese"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lịch tập",
  description: "Lịch tập gym lặp theo tuần, có GIF hướng dẫn và chế độ tập theo set.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Lịch tập" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f0ece4",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${nunitoSans.variable} ${literata.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
