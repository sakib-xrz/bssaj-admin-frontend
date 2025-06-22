import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="w-full">
        <Header />
        <main className="bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
