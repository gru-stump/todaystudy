import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "오늘의스터디 | 학원 운영 관리 플랫폼";
  const description =
    "학생의 오늘을 기록하고 내일의 성장을 만드는 학원 운영 관리 플랫폼";
  const imageUrl = `${origin}/og.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ko_KR",
      siteName: "오늘의스터디",
      url: origin,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "오늘의스터디 학원 운영 관리 플랫폼",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

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
