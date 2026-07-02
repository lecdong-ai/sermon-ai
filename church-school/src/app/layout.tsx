import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "교회학교 솔루션 — 사역자를 위한 콘텐츠 & 도구",
  description: "교회학교 담당 목회자, 전도사, 교사를 위한 실무 자료와 도구를 제공합니다. 학부모 소통, 교사교육, 운영문서를 한곳에서.",
  keywords: ["교회학교", "주일학교", "교회교육", "교사교육", "학부모소통", "교회학교자료"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <Header />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
