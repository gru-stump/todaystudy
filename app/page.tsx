import type { Metadata } from "next";
import { Header } from "./landing/Header";
import { HeroSection } from "./landing/sections";

export const metadata: Metadata = {
  title: "오늘의스터디 | 학원 운영 관리 플랫폼",
  description:
    "학생의 오늘을 기록하고 내일의 성장을 만드는 학원 운영 관리 플랫폼",
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
      </main>
    </>
  );
}
