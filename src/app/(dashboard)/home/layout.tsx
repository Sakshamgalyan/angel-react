import NavBar from "@/components/NavBar";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex h-full">
        <Menu />
      </div>
      {children}
      <Footer />
    </div>
  );
}