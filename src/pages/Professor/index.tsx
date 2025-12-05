import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import { socket } from "@/hooks/useSocket";
import { useQuickMessage } from "@/hooks/useQuickMessage";

export const Professor = () => {
  const { Toast, showMessage } = useQuickMessage();
  const [user, setUser] = useState<PersonalUser | null>(null);

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  useEffect(() => {
    if (user?.id && user?.name) {
      // professor entra na sala
      socket.emit("teacher:join", user.id, user.name);

      // handler separado
      const handler = (data) => {
        console.log("Recebido:", data);
        showMessage(data.message);
      };

      // registra listener
      socket.on("class:full", handler);

      // cleanup: remove listener ao desmontar
      return () => {
        socket.off("class:full", handler);
      };
    }
  }, [user?.id, user?.name, showMessage]);

  return (
    <SidebarProvider>
      <Toast />
      <AppSidebar profile="Professor" />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-center gap-4">
        <SidebarTrigger className="hidden" />

        <section id="header">
          <div className="container w-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <p className="text-2xl text-emerald-400 font-bold">
                Seja bem-vindo, {user?.name ? user.name : "Professor(a)"}!
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
