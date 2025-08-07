import DashFooter from "@/components/Dashboard/DashFooter";
import DashHeader from "@/components/Dashboard/DashHeader";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashHeader />
      <main className="flex-1">{children}</main>
      <DashFooter />
    </div>
  );
}