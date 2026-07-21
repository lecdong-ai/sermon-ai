import Header from "@/components/school/Header";
import Footer from "@/components/school/Footer";

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  );
}
