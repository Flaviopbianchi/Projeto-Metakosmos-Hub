import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0d0d14]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">{children}</main>
    </div>
  );
}
