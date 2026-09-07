import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "오늘의스터디 | 학원 운영 관리 플랫폼",
  description:
    "학생의 오늘을 기록하고 내일의 성장을 만드는 학원 운영 관리 플랫폼",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={geistSans.variable}>{children}</body>
    </html>
  );
}
