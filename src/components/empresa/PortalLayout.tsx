import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { PortalSidebar } from "./PortalSidebar";

interface PortalLayoutProps {
  children: ReactNode;
  companyName: string;
}

export function PortalLayout({ children, companyName }: PortalLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PortalSidebar companyName={companyName} />
        <SidebarInset className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">Portal da Empresa</h1>
              <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
