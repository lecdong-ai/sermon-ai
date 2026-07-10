import type { Metadata } from "next";
import Header from "@/components/school/Header";
import Footer from "@/components/school/Footer";

export const metadata: Metadata = {
  title: "교회학교 솔루션 — 사역자를 위한 콘텐츠 & 도구",
  description: "교회학교 사역에 필요한 모든 것 — 공지문 작성, PPT 스튜디오, 행사 관리, 설교 자료",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  );
}
