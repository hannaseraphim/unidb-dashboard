import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { FetchUserData } from "@/utils/FetchUserData";

export const Home = () => {
  const [name, setName] = useState("");
  const socket = io("http://localhost:8080");
  useEffect(() => {
    async function fetchUser() {
      const res = await FetchUserData();
      socket.emit(`teacher:join`, res.id, res.name);
      setName(res.name);

      socket.on("class:full", (data) => {
        console.log("Turma cheia:", data);
        alert(
          `Turma ${data.id_class} está cheia. Um aluno teve matrícula recusada. Avalie aumentar o limite.`
        );
      });
    }
    fetchUser();
  }, [socket]);
  return (
    <SidebarProvider className="flex">
      <AppSidebar />
      <main className="p-2">
        <SidebarTrigger />
        <div className="container">
          <h1 className="text-3xl font-bold m-5">
            Seja bem-vindo(a),{" "}
            <span className="text-indigo-500">{name ? name : "usuário"}!</span>
          </h1>
        </div>
      </main>
    </SidebarProvider>
  );
};
