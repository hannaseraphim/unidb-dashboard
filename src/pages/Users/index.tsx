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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuickMessage } from "@/components/quickmessage";
import type { Profile, User } from "@/interfaces";
// 🔧 Cores para badges
const profileColors: Record<string, string> = {
  Administrador: "bg-red-500",
  Professor: "bg-blue-500",
  Aluno: "bg-indigo-500",
};

// Perfils disponíveis
const availableProfiles: Profile[] = [
  { id: 1, name: "Administrador" },
  { id: 2, name: "Professor" },
  { id: 3, name: "Aluno" },
];

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

  // ➕ Criação de usuário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profiles: [] as number[],
  });
  const [formMessage, setFormMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { Toast, showMessage } = useQuickMessage();

  function handleCheckboxChange(profileId: number, checked: boolean) {
    setFormData((prev) => {
      let updatedProfiles = [...prev.profiles];

      if (checked) {
        updatedProfiles = Array.from(new Set([...updatedProfiles, profileId]));
      } else {
        updatedProfiles = updatedProfiles.filter((id) => id !== profileId);
      }

      return { ...prev, profiles: updatedProfiles };
    });
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();

    if (formData.profiles.length === 0) {
      setFormMessage("Selecione pelo menos um perfil");
      return;
    }

    try {
      await axios
        .post("http://localhost:8080/api/users", formData, {
          withCredentials: true,
        })
        .then((res) => {
          setFormOpen(false);
          showMessage(
            "Usuário criado, a página será atualizada automaticamente em 5 segundos"
          );
          setTimeout(() => window.location.reload(), 5000);
          console.log(res.status);
        })
        .catch((err) => {
          if (err.status === 409) setFormMessage("Email em uso");
          setTimeout(() => setFormMessage(""), 3000);
          console.log(err);
        });
      return;
    } catch (error) {
      console.log(error);
      setFormMessage("Ocorreu um erro interno, tente novamente outra hora");
    }
  }

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
        {Toast}

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
            {/* Modal de criação de usuário */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              {/* Botão que abre o modal */}
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 cursor-pointer">
                  Criar usuário
                </Button>
              </DialogTrigger>

              {/* Conteúdo do modal */}
              <DialogContent className="w-110">
                <DialogHeader>
                  <DialogTitle className="text-indigo-500 font-bold">
                    Criar um usuário
                  </DialogTitle>
                </DialogHeader>
                <div className="">
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={(e) => handleCreateUser(e)}
                  >
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="name"
                        className="font-bold text-indigo-500"
                      >
                        Nome:
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="email"
                        className="font-bold text-indigo-500"
                      >
                        Email:
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="password"
                        className="font-bold text-indigo-500"
                      >
                        Senha:
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-bold text-indigo-500">
                        Perfis:
                      </Label>
                      {availableProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center gap-2"
                        >
                          <Input
                            type="checkbox"
                            id={`profile-${profile.id}`}
                            className="w-4"
                            checked={formData.profiles.includes(profile.id)}
                            onChange={(e) =>
                              handleCheckboxChange(profile.id, e.target.checked)
                            }
                          />
                          <Label htmlFor={`profile-${profile.id}`}>
                            {profile.name}
                          </Label>
                        </div>
                      ))}
                      {formMessage && (
                        <h1 className="flex w-full justify-center text-red-700">
                          * {formMessage} *
                        </h1>
                      )}
                      <Button
                        className="bg-indigo-500 text-white cursor-pointer"
                        type="submit"
                      >
                        Confirmar
                      </Button>
                    </div>
                  </form>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    {user.enrolments.length ? (
                      <Badge className="bg-indigo-500">
                        Turmas: {user.enrolments.length}
                      </Badge>
                    ) : (
                      ""
                    )}
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
