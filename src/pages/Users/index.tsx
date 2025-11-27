import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaUsers, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router";

// 🔧 Cores para badges
const profileColors: Record<string, string> = {
  Administrador: "bg-red-500",
  Professor: "bg-blue-500",
  Aluno: "bg-indigo-500",
};

// Interface do perfil
interface Profile {
  id: number;
  name: string;
}

// Interface do usuário
interface User {
  id?: number;
  name: string;
  email: string;
  profiles: Profile[]; // agora é um array de objetos
  password?: string;
}

export const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  // 🔎 Busca
  const [searchQuery, setSearch] = useState<string>("");
  const filtered = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.id?.toString().includes(q) ||
      user.profiles.some((profile) => profile.name.toLowerCase().includes(q))
    );
  });

  // 🔧 Carregar usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<User[]>("http://localhost:8080/api/users", {
          withCredentials: true,
        });
        // agora não precisa converter, já vem como objeto
        setUsers(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserDetails = (id: number) => {
    navigate(`/users/${id}`);
  };

  return (
    <SidebarProvider className="flex z-50">
      <AppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />

        {/* Content */}
        <div className="w-full p-5">
          <div className="search-bar flex items-center relative">
            <Input
              className="p-5 m-4"
              placeholder="Procure por um usuário ou cargo..."
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute right-10 text-gray-400" />
          </div>

          <div className="flex justify-between text-indigo-500 w-full p-5 font-bold items-center gap-2">
            <Button className="hover:bg-indigo-500 cursor-pointer">
              Criar usuário
            </Button>
            <div className="flex items-center gap-2">
              <FaUsers />
              {filtered.length}
            </div>
          </div>

          {/* Users list */}
          {filtered.map((user) => (
            <div key={user.id}>
              <Card
                className="m-2 flex flex-row justify-between items-center cursor-pointer scale-99 hover:scale-100 transition-all"
                onClick={() => handleUserDetails(user.id!)}
              >
                <CardContent className="flex flex-col gap-1">
                  <p className="text-gray-400">ID: {user.id}</p>
                  <h1>{user.name}</h1>
                  <CardDescription>{user.email}</CardDescription>

                  {/* User profiles */}
                  <div className="flex gap-1">
                    {user.profiles
                      .sort((a, b) => a.id - b.id) // ordena por id
                      .map((profile) => (
                        <Badge
                          key={profile.id}
                          className={`${
                            profileColors[profile.name] || "bg-indigo-500"
                          }`}
                        >
                          {profile.name}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </SidebarProvider>
  );
};
