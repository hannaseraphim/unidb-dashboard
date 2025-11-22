import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { FetchUserData } from "@/utils/FetchUserData";

export const Home = () => {
  const socket = io("http://localhost:8080");
  useEffect(() => {
    async function fetchUser() {
      const res = await FetchUserData();
      socket.emit(`teacher:join`, res.id);

      socket.on("class:full", (data) => {
        console.log("Turma cheia:", data);
        alert(
          `Turma ${data.id_class} está cheia. Um aluno teve matrícula recusada. Avalie aumentar o limite.`
        );
      });
    }
    fetchUser();
  }, []);
  return (
    <SidebarProvider className="flex">
      <AppSidebar />
      <main className="p-2">
        <SidebarTrigger />
      </main>
    </SidebarProvider>
  );
};
