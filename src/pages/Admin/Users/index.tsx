import { AppSidebar } from "@/components/SideBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiURL } from "@/utils/api";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import axios from "axios";
import {
  BookOpen,
  GraduationCap,
  MoreHorizontalIcon,
  Pen,
  Save,
  Shield,
  Trash,
  UserPlus,
  UsersIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CreateUserModal } from "../components/CreateUserModal";
import { useQuickMessage } from "@/hooks/useQuickMessage";

// Tipos de resposta
// Perfis de usuário
type Profile = {
  id: number;
  name: string;
};

// Usuário
type User = {
  id: number;
  name: string;
  email: string;
  profiles: Profile[];
};

// Tipos de perfil
const availableProfiles: Profile[] = [
  { id: 1, name: "Administrador" },
  { id: 2, name: "Professor" },
  { id: 3, name: "Aluno" },
];

// Pegar icone dinamicamente
const getRoleIcon = (role: string) => {
  switch (role) {
    case "Administrador":
      return <Shield className="h-3 w-3" />;
    case "Professor":
      return <BookOpen className="h-3 w-3" />;
    case "Aluno":
      return <GraduationCap className="h-3 w-3" />;
    default:
      return null;
  }
};

// Pegar variante dinamicamente
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "Administrador":
      return "default";
    case "Professor":
      return "secondary";
    case "Aluno":
      return "outline";
    default:
      return "outline";
  }
};

export const Users = () => {
  // Barra de notificações
  const { Toast, showMessage } = useQuickMessage();

  // Lista de usuários pega do backend
  const [userList, setUserList] = useState<User[]>([]);

  // Sistema de busca
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filtra a lista original
    const results = userList?.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(results);
  };

  // Sistema de edição de usuário
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    profiles: number[];
  }>({
    name: "",
    email: "",
    profiles: [],
  });
  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      profiles: user.profiles.map((p) => p.id),
    });
  };

  const saveEdit = async (id: number) => {
    await axios.put(`${ApiURL}/api/users/${id}`, editForm, {
      withCredentials: true,
    });

    // Atualiza lista local
    setFilteredUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, name: editForm.name, email: editForm.email } : u
      )
    );

    setEditingUserId(null);

    showMessage("Usuário atualizado com sucesso!", "success");
  };

  // Deletar usuário
  const handleDeleteUser = async (user: User) => {
    await axios
      .delete(`${ApiURL}/api/users/${user.id}`, {
        withCredentials: true,
      })
      .then(() => {
        showMessage(
          "Usuário deletado com sucesso. A página será atualizada em 3 segundos"
        );
        setTimeout(() => window.location.reload(), 3000);
      });
  };

  // Pegar todos os usuários do backend
  useEffect(() => {
    const fetchUsersList = async () => {
      const res = await axios.get<User[]>(`${ApiURL}/api/users`, {
        withCredentials: true,
      });

      setUserList(res.data);
      setFilteredUsers(res.data);
    };

    fetchUsersList();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar profile="Administrador" />
      <Toast />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-start p-5 gap-3">
        <SidebarTrigger className="hidden" />

        <section id="header" className="w-full">
          <div className="flex items-center justify-between">
            <div className="">
              <h1 className="font-bold text-3xl text-emerald-400">Usuários</h1>
              <p className="text-neutral-400">
                Gerencie os usuários do sistema
              </p>
            </div>
            <CreateUserModal
              trigger={
                <Button className="bg-emerald-400 cursor-pointer">
                  <UserPlus />
                  Criar usuário
                </Button>
              }
            />
          </div>
        </section>

        <section id="search-bar" className="w-full">
          <Card className="bg-gray-800">
            <CardContent>
              <Input
                placeholder="Buscar usuários"
                value={searchQuery}
                onChange={handleSearch}
                className="text-white bg-gray-700"
              ></Input>
            </CardContent>
          </Card>
        </section>

        <section id="users-list" className="w-full">
          <Card className="h-full bg-gray-800">
            <CardContent className="flex w-full justify-between">
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <UsersIcon />
                Lista de usuários
              </CardTitle>
              <CardTitle className="flex items-center gap-2 flex-row-reverse text-emerald-400">
                <UsersIcon size={15} />
                {userList?.length}
              </CardTitle>
            </CardContent>
            <CardContent className="overflow-auto max-h-160">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-emerald-400">ID</TableHead>
                    <TableHead className="text-emerald-400">Nome</TableHead>
                    <TableHead className="text-emerald-400">Email</TableHead>
                    <TableHead className="text-emerald-400">Perfis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length ? (
                    filteredUsers?.map((u: User) => (
                      <TableRow
                        key={u.id}
                        className="text-white hover:bg-gray-700"
                      >
                        <TableCell>{u.id}</TableCell>

                        <TableCell>
                          {editingUserId === u.id ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="border p-1 rounded"
                            />
                          ) : (
                            u.name
                          )}
                        </TableCell>

                        <TableCell>
                          {editingUserId === u.id ? (
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  email: e.target.value,
                                })
                              }
                              className="border p-1 rounded"
                            />
                          ) : (
                            u.email
                          )}
                        </TableCell>

                        <TableCell>
                          {editingUserId === u.id ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge className="bg-emerald-500 cursor-pointer">
                                  Editar perfis
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-56 bg-white shadow-md p-2 rounded-lg m-1">
                                {availableProfiles.map((profile) => {
                                  const isChecked = u.profiles.some(
                                    (p) => p.id === profile.id
                                  );

                                  return (
                                    <DropdownMenuCheckboxItem
                                      key={profile.id}
                                      checked={isChecked}
                                      className="cursor-pointer hover:bg-neutral-200"
                                      onCheckedChange={(checked) => {
                                        // Atualiza lista visual (mantém objetos Profile)
                                        const updatedProfiles = checked
                                          ? [...u.profiles, profile]
                                          : u.profiles.filter(
                                              (p) => p.id !== profile.id
                                            );

                                        setFilteredUsers((prev) =>
                                          prev.map((user) =>
                                            user.id === u.id
                                              ? {
                                                  ...user,
                                                  profiles: updatedProfiles,
                                                }
                                              : user
                                          )
                                        );

                                        // Atualiza editForm apenas com IDs
                                        setEditForm((prev) => ({
                                          ...prev,
                                          profiles: checked
                                            ? [...prev.profiles, profile.id]
                                            : prev.profiles.filter(
                                                (id) => id !== profile.id
                                              ),
                                        }));
                                      }}
                                    >
                                      <Badge
                                        variant={getRoleBadgeVariant(
                                          profile.name
                                        )}
                                      >
                                        {getRoleIcon(profile.name)}
                                        {profile.name}
                                      </Badge>
                                    </DropdownMenuCheckboxItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <div className="flex gap-1 flex-wrap">
                              {u.profiles.map((role) => (
                                <Badge
                                  key={role.id}
                                  variant={getRoleBadgeVariant(role.name)}
                                  className={`${
                                    role.name === "Aluno"
                                      ? "text-emerald-400"
                                      : ""
                                  }`}
                                >
                                  {getRoleIcon(role.name)} {role.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <MoreHorizontalIcon
                                size={25}
                                className="cursor-pointer hover:bg-gray-600 p-1 rounded"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 text-white p-3 w-45 rounded-md shadow-md flex flex-col gap-1 border">
                              {editingUserId === u.id ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => saveEdit(u.id)}
                                    className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start"
                                  >
                                    <Save size={15} />
                                    Salvar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setEditingUserId(null)}
                                    className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-red-400"
                                  >
                                    <X size={15} /> Cancelar
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => startEditing(u)}
                                  className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start"
                                >
                                  <Pen size={15} />
                                  Editar usuário
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-red-400"
                                onClick={() => handleDeleteUser(u)}
                              >
                                <Trash size={15} />
                                Excluir usuário
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-neutral-400">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </SidebarProvider>
  );
};
