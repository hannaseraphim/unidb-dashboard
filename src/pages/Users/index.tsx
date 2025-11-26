import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { useQuickMessage } from "@/components/quickmessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaUsers, FaSearch } from "react-icons/fa";
import * as Dialog from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";

// 🔧 Mapeamento bidirecional
const IdToProfile: Record<number, string> = {
  1: "Administrador",
  2: "Professor",
  3: "Aluno",
};

const ProfileToId: Record<string, number> = {
  Administrador: 1,
  Professor: 2,
  Aluno: 3,
};

// 🔧 Cores para badges
const profileColors: Record<string, string> = {
  Administrador: "bg-red-500",
  Professor: "bg-blue-500",
  Aluno: "bg-indigo-500",
};

// Interface do usuário
interface User {
  id?: number;
  name: string;
  email: string;
  profiles: number[]; // sempre números
  password?: string;
}

type ModalType = "edit" | "create" | "delete" | null;

export const Users = () => {
  const { Toast, showMessage } = useQuickMessage();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<User>({
    name: "",
    email: "",
    profiles: [],
  });

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // 🔎 Busca
  const [searchQuery, setSearch] = useState<string>("");
  const filtered = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.id?.toString().includes(q) ||
      user.profiles.some((profile) =>
        IdToProfile[profile].toLowerCase().includes(q)
      )
    );
  });

  // 🔧 Carregar usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<User[]>("http://localhost:8080/api/users", {
          withCredentials: true,
        });
        // converter strings para números
        const normalized = res.data.map((u) => ({
          ...u,
          profiles: u.profiles.map((p) => ProfileToId[p]),
        }));
        setUsers(normalized);
        console.log(normalized);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const toggleModal = (modal: ModalType, user?: User) => {
    setActiveModal(modal);
    setSelectedUser(user || null);
  };

  // 🔧 Salvar usuário editado
  const saveUser = async () => {
    if (!selectedUser) return;
    try {
      const payload = {
        name: selectedUser.name,
        email: selectedUser.email,
        profiles: selectedUser.profiles, // já são números
        password: selectedUser.password, // se precisar
      };
      await axios.put(
        `http://localhost:8080/api/users/${selectedUser.id}`,
        payload, // já são números
        { withCredentials: true }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? selectedUser : u))
      );
      showMessage("Usuário atualizado com sucesso!");
      toggleModal(null);
    } catch (error) {
      console.error(error);
      showMessage("Erro ao atualizar o usuário.");
    }
  };

  // 🔧 Atualizar estado
  const updateUserState = (target: "selected" | "new", user: User | null) => {
    if (target === "selected") setSelectedUser(user);
    else setNewUser(user!);
  };

  // 🔧 Checkboxes dinâmicos
  const handleCheckboxChange = (
    target: "selected" | "new",
    profileId: number,
    checked: boolean
  ) => {
    const user = target === "selected" ? selectedUser : newUser;
    if (!user) return;

    let updatedProfiles: number[];

    if (checked) {
      // adiciona perfil
      updatedProfiles = Array.from(new Set([...user.profiles, profileId]));
    } else {
      // remove perfil, mas só se ainda restar pelo menos 1
      if (user.profiles.length === 1) {
        showMessage("O usuário precisa ter pelo menos um perfil");
        return;
      }
      updatedProfiles = user.profiles.filter((p) => p !== profileId);
    }

    // ordena para manter consistência
    updatedProfiles.sort((a, b) => a - b);

    const updatedUser = { ...user, profiles: updatedProfiles };
    updateUserState(target, updatedUser);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${id}`, {
        withCredentials: true,
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toggleModal(null);
      showMessage("Usuário deletado com sucesso");
    } catch (error) {
      console.log(error);
      toggleModal(null);
      showMessage("Erro ao deletar usuário");
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/users",
        { ...newUser },
        { withCredentials: true }
      );
      showMessage("Usuário criado com sucesso");
      toggleModal(null);
    } catch (error) {
      console.log(error);
      showMessage("Erro ao criar usuário");
      toggleModal(null);
    }
  };

  return (
    <SidebarProvider className="flex z-50">
      <AppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />
        {Toast}

        {/* Modals */}
        <Dialog.Root
          open={!!activeModal}
          onOpenChange={() => setActiveModal(null)}
        >
          <Dialog.Trigger className="hidden" />
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-47" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-100 p-5 rounded-md bg-white shadow-lg -translate-x-1/2 -translate-y-1/2 z-50">
            {activeModal === "edit" && (
              <>
                <Dialog.Title className="text-lg font-bold">
                  Editar Usuário
                </Dialog.Title>
                <Dialog.Description className="text-gray-600">
                  Aqui você pode editar os detalhes do usuário.
                </Dialog.Description>

                {selectedUser && (
                  <div className="flex flex-col gap-3 mt-4">
                    <h1>ID de Usuário: {selectedUser.id}</h1>
                    <Label htmlFor="newname">Nome de usuário</Label>
                    <Input
                      value={selectedUser.name}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          name: e.target.value,
                        })
                      }
                      placeholder="Nome"
                      id="newname"
                    />
                    <Label htmlFor="newemail">Email</Label>
                    <Input
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          email: e.target.value,
                        })
                      }
                      placeholder="Email"
                      id="newemail"
                    />
                    <Label htmlFor="newprofiles">Perfis</Label>
                    <div className="flex flex-col">
                      {Object.entries(ProfileToId).map(([label, id]) => {
                        return (
                          <div key={id} className="flex items-center gap-1">
                            <Input
                              type="checkbox"
                              className="w-4"
                              id={String(id)}
                              checked={selectedUser.profiles.includes(id)}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  "selected",
                                  id,
                                  e.target.checked
                                )
                              }
                            />
                            <Label htmlFor={String(id)}>{label}</Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    className="bg-gray-300"
                    onClick={() => toggleModal(null)}
                  >
                    Cancelar
                  </Button>
                  <Button className="bg-green-600" onClick={saveUser}>
                    Salvar
                  </Button>
                </div>
              </>
            )}

            {activeModal === "create" && (
              <>
                <Dialog.Title className="text-lg font-bold">
                  Criar Usuário
                </Dialog.Title>
                <Dialog.Description className="text-gray-600">
                  Preencha os dados para criar um novo usuário.
                </Dialog.Description>
                <div className="flex flex-col gap-5 mt-4">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      type="text"
                      id="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      type="password"
                      id="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Perfis</Label>
                    {Object.entries(ProfileToId).map(([label, id]) => (
                      <div key={id} className="flex items-center gap-1">
                        <Input
                          type="checkbox"
                          className="w-4"
                          checked={newUser.profiles.includes(id)}
                          onChange={(e) =>
                            handleCheckboxChange("new", id, e.target.checked)
                          }
                        />
                        <Label>{label}</Label>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleCreateUser()}
                    className="cursor-pointer hover:bg-indigo-500"
                  >
                    Criar usuário
                  </Button>
                </div>
              </>
            )}

            {activeModal === "delete" && selectedUser && (
              <>
                <Dialog.Title className="text-lg font-bold">
                  Excluir Usuário
                </Dialog.Title>
                <Dialog.Description className="text-gray-600">
                  Tem certeza que deseja excluir {selectedUser.name}?
                </Dialog.Description>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    className="bg-gray-300"
                    onClick={() => toggleModal(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-red-600"
                    onClick={() => handleDeleteUser(selectedUser.id!)}
                  >
                    Excluir
                  </Button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Root>

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
            <Button
              className="hover:bg-indigo-500 cursor-pointer"
              onClick={() => toggleModal("create")}
            >
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
              <Card className="m-2 flex flex-row justify-between items-center cursor-pointer scale-99 hover:scale-100 transition-all">
                <CardContent className="flex flex-col gap-1">
                  <p className="text-gray-400">ID: {user.id}</p>
                  <h1>{user.name}</h1>
                  <CardDescription>{user.email}</CardDescription>

                  {/* User profiles */}
                  <div className="flex gap-1">
                    {user.profiles.sort().map((profile) => {
                      const label = IdToProfile[profile];
                      return (
                        <Badge
                          key={profile}
                          className={`${
                            profileColors[label] || "bg-indigo-500"
                          }`}
                        >
                          {label ?? profile}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>

                <CardContent className="flex gap-5">
                  <Button
                    className="bg-green-600 cursor-pointer"
                    onClick={() => toggleModal("edit", user)}
                  >
                    Editar
                  </Button>
                  <Button
                    className="bg-red-800 cursor-pointer"
                    onClick={() => toggleModal("delete", user)}
                  >
                    Excluir
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </SidebarProvider>
  );
};
