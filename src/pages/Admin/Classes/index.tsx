import { AppSidebar } from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
import axios from "axios";
import {
  MoreHorizontalIcon,
  Pen,
  Save,
  School,
  Trash,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuickMessage } from "@/hooks/useQuickMessage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CreateClassModal } from "../components/CreateClassModal";

// Tipos de resposta
type Class = {
  id: number;
  course: {
    id: number;
    name: string;
  };
  name: string;
  starts_on: string;
  ends_on: string;
  period: string;
  max_students: number;
  archived: number;
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  student_count?: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  profiles: {
    id: number;
    name: string;
  }[]; // ex: ["Aluno", "Professor"]
};

export const Classes = () => {
  const { Toast, showMessage } = useQuickMessage();

  // Lista de turmas
  const [classList, setClassList] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Lista de professores
  const [teachers, setTeachers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get<User[]>(`${ApiURL}/api/users`, {
        withCredentials: true,
      });

      // filtra apenas os que têm "Professor" no array de profiles
      const onlyTeachers = res.data.filter((user: User) =>
        user.profiles.some((profile) => profile.name === "Professor")
      );
      setTeachers(onlyTeachers);
    };

    fetchUsers();
  }, []);

  // Busca de turmas
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const results = classList?.filter(
      (cls) =>
        cls.name.toLowerCase().includes(query.toLowerCase()) ||
        cls.id.toString().includes(query.toLowerCase()) ||
        cls.period.toLowerCase().includes(query.toLowerCase()) ||
        cls.max_students.toString().includes(query.toLowerCase()) ||
        cls.teacher.name.toLowerCase().includes(query.toLowerCase()) ||
        cls.archived.toString().includes(query.toLowerCase())
    );
    setFilteredClasses(results);
  };

  // Edição de turma
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    id_course: number;
    id_teacher: number;
    starts_on: string;
    ends_on: string;
    period: string;
    name: string;
    max_students: number;
    archived: number;
  }>({
    id_course: 0,
    id_teacher: 0,
    starts_on: "",
    ends_on: "",
    period: "",
    name: "",
    max_students: 0,
    archived: 0,
  });

  const startEditing = (cls: Class) => {
    setEditingClassId(cls.id);

    setEditForm({
      id_course: cls.course.id, // pega o id do objeto course
      id_teacher: cls.teacher.id,
      starts_on: cls.starts_on.split("T")[0],
      ends_on: cls.ends_on.split("T")[0],
      period: cls.period,
      name: cls.name,
      max_students: cls.max_students,
      archived: cls.archived,
    });
  };

  const saveEdit = async (id: number) => {
    await axios.put(`${ApiURL}/api/classes/${id}`, editForm, {
      withCredentials: true,
    });

    setFilteredClasses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              id_course: editForm.id_course, // usa id_course
              id_teacher: editForm.id_teacher,
              name: editForm.name,
              starts_on: editForm.starts_on.split("T")[0],
              ends_on: editForm.ends_on.split("T")[0],
              period: editForm.period,
              max_students: editForm.max_students,
              archived: editForm.archived,
              teacher: { ...c.teacher, id: editForm.id_teacher },
              course: { ...c.course, id: editForm.id_course }, // mantém consistência local
            }
          : c
      )
    );

    setEditingClassId(null);
    showMessage("Turma atualizada com sucesso!", "success");
  };

  // Deletar turma
  const handleDeleteClass = async (cls: Class) => {
    await axios
      .delete(`${ApiURL}/api/classes/${cls.id}`, {
        withCredentials: true,
      })
      .then(() => {
        showMessage(
          "Turma deletada com sucesso. A página será atualizada em 3 segundos"
        );
        setTimeout(() => window.location.reload(), 3000);
      });
  };

  // Pegar todas as turmas
  useEffect(() => {
    const fetchClassesList = async () => {
      const res = await axios.get<Class[]>(`${ApiURL}/api/classes`, {
        withCredentials: true,
      });

      setClassList(res.data);
      setFilteredClasses(res.data);
    };

    fetchClassesList();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar profile="Administrador" />
      <Toast />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-start p-5 gap-3">
        <SidebarTrigger className="hidden" />

        <section id="header" className="w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-emerald-400">Turmas</h1>
              <p className="text-neutral-400">Gerencie as turmas do sistema</p>
            </div>
            <CreateClassModal
              trigger={
                <Button className="bg-emerald-400 cursor-pointer">
                  <UserPlus />
                  Criar turma
                </Button>
              }
            />
          </div>
        </section>

        <section id="search-bar" className="w-full">
          <Card className="bg-gray-800">
            <CardContent>
              <Input
                placeholder="Buscar turmas"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-gray-700"
              />
            </CardContent>
          </Card>
        </section>

        <section id="courses-list" className="w-full">
          <Card className="h-full bg-gray-800">
            <CardContent className="flex w-full justify-between">
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <School />
                Lista de turmas
              </CardTitle>
              <CardTitle className="flex items-center gap-2 flex-row-reverse text-emerald-400">
                <School size={15} />
                {classList?.length}
              </CardTitle>
            </CardContent>
            <CardContent className="overflow-auto max-h-160">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-emerald-400">ID</TableHead>
                    <TableHead className="text-emerald-400">Nome</TableHead>
                    <TableHead className="text-emerald-400">Início</TableHead>
                    <TableHead className="text-emerald-400">Fim</TableHead>
                    <TableHead className="text-emerald-400">Período</TableHead>
                    <TableHead className="text-emerald-400">
                      Máx. de Alunos
                    </TableHead>
                    <TableHead className="text-emerald-400">
                      Alunos atuais
                    </TableHead>
                    <TableHead className="text-emerald-400">
                      Professor
                    </TableHead>
                    <TableHead className="text-emerald-400">
                      Atividade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => (
                    <TableRow
                      key={cls.id}
                      className="text-white hover:bg-gray-700"
                    >
                      {/* ID */}
                      <TableCell>{cls.id}</TableCell>

                      {/* Nome */}
                      <TableCell className="w-70">
                        {editingClassId === cls.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          cls.name
                        )}
                      </TableCell>

                      {/* Início */}
                      <TableCell>{cls.starts_on.split("T")[0]}</TableCell>

                      {/* Fim */}
                      <TableCell>
                        {editingClassId === cls.id ? (
                          <input
                            type="date"
                            value={editForm.ends_on.split("T")[0]}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                ends_on: e.target.value.split("T")[0],
                              })
                            }
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          cls.ends_on.split("T")[0]
                        )}
                      </TableCell>

                      {/* Período */}
                      <TableCell className="w-70">
                        {editingClassId === cls.id ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between bg-gray-800 hover:bg-gray-700 hover:text-white cursor-pointer"
                              >
                                {editForm.period || "Selecione o período"}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 text-white">
                              <DropdownMenuItem
                                onClick={() =>
                                  setEditForm({
                                    ...editForm,
                                    period: "Matutino",
                                  })
                                }
                                className="data-highlighted:bg-gray-700 data-highlighted:text-white cursor-pointer"
                              >
                                Matutino
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setEditForm({
                                    ...editForm,
                                    period: "Vespertino",
                                  })
                                }
                                className="data-highlighted:bg-gray-700 data-highlighted:text-white cursor-pointer"
                              >
                                Vespertino
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setEditForm({
                                    ...editForm,
                                    period: "Noturno",
                                  })
                                }
                                className="data-highlighted:bg-gray-700 data-highlighted:text-white cursor-pointer"
                              >
                                Noturno
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          cls.period
                        )}
                      </TableCell>

                      {/* Máx. de alunos */}
                      <TableCell>
                        {editingClassId === cls.id ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editForm.max_students}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                max_students: Number(e.target.value),
                              })
                            }
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          cls.max_students
                        )}
                      </TableCell>

                      {/* Quantidade de alunos */}
                      <TableCell>{cls.student_count}</TableCell>

                      {/* Professor */}
                      <TableCell className="w-70">
                        {editingClassId === cls.id ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between bg-gray-800 hover:bg-gray-700 hover:text-white cursor-pointer"
                              >
                                {teachers.find(
                                  (t) => t.id === editForm.id_teacher
                                )?.name || "Selecione o professor"}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 data-highlighted:bg-gray-700 data-highlighted:text-white">
                              {teachers.map((teacher) => (
                                <DropdownMenuItem
                                  key={teacher.id}
                                  onClick={() =>
                                    setEditForm({
                                      ...editForm,
                                      id_teacher: teacher.id,
                                    })
                                  }
                                  className="text-white data-highlighted:bg-gray-700 data-highlighted:text-white cursor-pointer"
                                >
                                  {teacher.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          cls.teacher?.name
                        )}
                      </TableCell>

                      {/* Estado da turma */}
                      <TableCell>
                        {editingClassId === cls.id ? (
                          <input
                            type="checkbox"
                            checked={editForm.archived === 1}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                archived: e.target.checked ? 1 : 0,
                              })
                            }
                          />
                        ) : cls.archived === 1 ? (
                          <Badge variant="destructive">Arquivada</Badge>
                        ) : (
                          <Badge variant="default" className="bg-emerald-400">
                            Ativa
                          </Badge>
                        )}
                      </TableCell>

                      {/* Ações */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreHorizontalIcon
                              size={25}
                              className="cursor-pointer hover:bg-gray-600 p-1 rounded"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 p-3 w-45 rounded-md shadow-md flex flex-col gap-1">
                            {editingClassId === cls.id ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() => saveEdit(cls.id)}
                                  className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-white data-highlighted:bg-gray-700 data-highlighted:text-white"
                                >
                                  <Save size={15} />
                                  Salvar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setEditingClassId(null)}
                                  className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-red-400 data-highlighted:bg-gray-700 data-highlighted:text-white"
                                >
                                  <X size={15} /> Cancelar
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => startEditing(cls)}
                                className="hover:bg-gray-700 text-white p-2 rounded cursor-pointer flex gap-5 items-center justify-start data-highlighted:bg-gray-700 data-highlighted:text-white"
                              >
                                <Pen size={15} />
                                Editar turma
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-red-400 data-highlighted:bg-gray-700 data-highlighted:text-white"
                              onClick={() => handleDeleteClass(cls)}
                            >
                              <Trash size={15} />
                              Excluir turma
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </SidebarProvider>
  );
};
