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

const profileIds: Record<string, number> = {
  ADMIN: 1,
  TEACHER: 2,
  STUDENT: 3,
};

const profileColors: Record<string, string> = {
  ADMIN: "bg-red-500",
  TEACHER: "bg-blue-500",
  STUDENT: "bg-indigo-500",
};

// Interface do usuário
interface User {
  id: number;
  name: string;
  email: string;
  profiles: string[];
}

export const Users = () => {
  const { Toast, showMessage } = useQuickMessage();

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearch] = useState<string>("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const filtered = users.filter((user) => {
    const q = searchQuery.toLowerCase();

    return (
      // Search by name
      user.name.toLowerCase().includes(q) ||
      // Search by email
      user.email?.toLowerCase().includes(q) ||
      // Search by id
      user.id.toString().includes(q) ||
      // Search by profiles (name)
      user.profiles.some((profile) => profile.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<User[]>("http://localhost:8080/api/users", {
          withCredentials: true,
        });
        console.log(res.data);
        setUsers(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const openDialog = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setIsDialogOpen(false);
  };

  const saveUser = async () => {
    if (!selectedUser) return;

    try {
      const payload = {
        ...selectedUser,
        profiles: selectedUser.profiles.map((profile) => profileIds[profile]),
      };

      await axios.put(
        `http://localhost:8080/api/users/${selectedUser.id}`,
        {
          name: payload.name,
          email: payload.email,
          profiles: payload.profiles,
        },
        { withCredentials: true }
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? selectedUser : u))
      );

      showMessage("Usuário atualizado com sucesso!");
      closeDialog();
    } catch (error) {
      console.error(error);
      showMessage("Erro ao atualizar o usuário.");
    }
  };

  const handleCheckboxChange = (profile: string, checked: boolean) => {
    if (!selectedUser) return;

    let updatedProfiles = [...selectedUser.profiles];

    if (checked) {
      if (!updatedProfiles.includes(profile)) {
        updatedProfiles.unshift(profile);
      }
    } else {
      if (updatedProfiles.length > 1) {
        updatedProfiles = updatedProfiles.filter((p) => p !== profile);
      } else {
        showMessage("O usuário deve ter pelo menos 1 perfil.");
        return;
      }
    }

    setSelectedUser({ ...selectedUser, profiles: updatedProfiles });
  };

  return (
    <SidebarProvider className="flex z-50">
      <AppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />
        {Toast}

        {/* Modal de edição */}
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger className="hidden" />
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-47" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-fit p-5 rounded-md bg-white shadow-lg -translate-x-1/2 -translate-y-1/2 z-50">
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
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                  placeholder="Nome"
                  id="newname"
                />
                <Label htmlFor="newemail">Email</Label>
                <Input
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  placeholder="newemail"
                />
                <Label htmlFor="newprofiles">Perfis</Label>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <Input
                      type="checkbox"
                      className="w-4"
                      id="admin"
                      checked={selectedUser.profiles.includes("ADMIN")}
                      onChange={(e) =>
                        handleCheckboxChange("ADMIN", e.target.checked)
                      }
                    />
                    <Label htmlFor="admin">Administrador</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="checkbox"
                      className="w-4"
                      id="teacher"
                      checked={selectedUser.profiles.includes("TEACHER")}
                      onChange={(e) =>
                        handleCheckboxChange("TEACHER", e.target.checked)
                      }
                    />
                    <Label htmlFor="teacher">Professor</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="checkbox"
                      className="w-4"
                      id="student"
                      checked={selectedUser.profiles.includes("STUDENT")}
                      onChange={(e) =>
                        handleCheckboxChange("STUDENT", e.target.checked)
                      }
                    />
                    <Label htmlFor="student">Aluno</Label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button className="bg-gray-300" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button className="bg-green-600" onClick={saveUser}>
                Salvar
              </Button>
            </div>
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

          <p className="flex text-indigo-500 w-full justify-end p-5 font-bold items-center gap-2">
            <FaUsers />
            {filtered.length}
          </p>

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
                    {user.profiles.map((profile, index) => (
                      <Badge
                        key={index}
                        className={`${
                          profileColors[profile] || "bg-indigo-500"
                        }`}
                      >
                        {profile}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardContent className="flex gap-5">
                  <Button
                    className="bg-green-600 cursor-pointer"
                    onClick={() => openDialog(user)}
                  >
                    Editar
                  </Button>
                  <Button className="bg-red-800 cursor-pointer">Excluir</Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </SidebarProvider>
  );
};
