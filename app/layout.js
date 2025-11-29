import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "まなびリンク管理者用ページ",
  description: "まなびリンクの管理者用ページです。事前の認証が必要です。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
