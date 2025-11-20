import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Home = () => {
  return (
    <SidebarProvider className="flex">
      <AppSidebar />
      <main className="p-2">
        <SidebarTrigger />
      </main>
    </SidebarProvider>
  );
};
