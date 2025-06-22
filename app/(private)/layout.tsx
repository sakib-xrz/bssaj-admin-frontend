import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        <main className="bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
