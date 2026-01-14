import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MainSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
