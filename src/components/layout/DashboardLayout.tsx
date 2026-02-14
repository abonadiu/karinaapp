import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ 
  children, 
  title, 
  description,
  actions 
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-5 lg:px-8">
            <SidebarTrigger className="-ml-1" />
            {title && (
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </header>
          <main className="flex-1 p-5 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
