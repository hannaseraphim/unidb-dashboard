import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";

export const Aluno = () => {
  const [user, setUser] = useState<PersonalUser | null>(null);

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar profile="Aluno" />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-center gap-4">
        <SidebarTrigger className="hidden" />

        <section id="header">
          <div className="container w-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <p className="text-2xl text-emerald-400 font-bold">
                Seja bem-vindo, {user?.name ? user.name : "Aluno(a)"}!
              </p>
            </div>
          </div>
        </section>

        <section
          id="content"
          className="w-full flex items-center justify-center"
        >
          <div className="container w-full flex flex-col items-center justify-center gap-4"></div>
        </section>
      </main>
    </SidebarProvider>
  );
};
