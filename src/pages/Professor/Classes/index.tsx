import { AppSidebar } from "@/components/SideBar";
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
import { MoreHorizontalIcon, Pen, Save, School, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuickMessage } from "@/hooks/useQuickMessage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";

// Tipo da turma
type Teaching = {
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

export const TeacherClasses = () => {
  const { Toast, showMessage } = useQuickMessage();

  const [user, setUser] = useState<PersonalUser | null>(null);

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  // Lista de turmas
  const [classList, setClassList] = useState<Teaching[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Teaching[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pegar turmas do backend
  useEffect(() => {
    const fetchClassesList = async () => {
      try {
        const res = await axios.get(`${ApiURL}/api/classes/myClasses`, {
          withCredentials: true,
        });

        setClassList(res.data.teaching);
        setFilteredClasses(res.data.teaching);
      } catch (err) {
        console.error(err);
        showMessage("Erro ao carregar turmas!", "error");
      }
    };

    fetchClassesList();
  }, [showMessage]);

  // Busca
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const results =
      classList?.filter((cls) =>
        [
          cls.name,
          cls.id.toString(),
          cls.period,
          cls.max_students.toString(),
          cls.teacher?.name,
          cls.archived.toString(),
        ].some((field) => field.toLowerCase().includes(query.toLowerCase()))
      ) || [];

    setFilteredClasses(results);
  };

  // Edição
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    max_students: 0,
  });

  const startEditing = (cls: Teaching) => {
    setEditingClassId(cls.id);
    setEditForm({
      max_students: cls.max_students,
    });
  };

  const saveEdit = async (cls: Teaching) => {
    console.log(cls);
    try {
      const payload = {
        // id_course: cls.,
        id_teacher: user!.id,
        starts_on: cls.starts_on.split("T")[0],
        ends_on: cls.ends_on.split("T")[0],
        period: cls.period,
        name: cls.name,
        archived: cls.archived,
        max_students: editForm.max_students,
      };

      console.log(payload);

      await axios.put(`${ApiURL}/api/classes/${cls.id}`, payload, {
        withCredentials: true,
      });

      setFilteredClasses((prev) =>
        prev.map((c) =>
          c.id === cls.id ? { ...c, max_students: editForm.max_students } : c
        )
      );

      setEditingClassId(null);
      showMessage("Turma atualizada com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showMessage("Erro ao atualizar turma!", "error");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar profile="Professor" />
      <Toast />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-start p-5 gap-3">
        <SidebarTrigger className="hidden" />

        <section id="header" className="w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-emerald-400">Turmas</h1>
              <p className="text-neutral-400">Gerencie as turmas do sistema</p>
            </div>
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
                {classList.length}
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
                      <TableCell>{cls.id}</TableCell>

                      <TableCell className="w-70">{cls.name}</TableCell>

                      <TableCell>{cls.starts_on.split("T")[0]}</TableCell>

                      <TableCell>{cls.ends_on.split("T")[0]}</TableCell>

                      <TableCell className="w-70">{cls.period}</TableCell>

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

                      <TableCell>{cls.student_count ?? 0}</TableCell>

                      <TableCell className="w-70">{user?.name}</TableCell>

                      <TableCell>
                        {cls.archived === 1 ? (
                          <Badge variant="destructive">Arquivada</Badge>
                        ) : (
                          <Badge variant="default" className="bg-emerald-400">
                            Ativa
                          </Badge>
                        )}
                      </TableCell>

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
                                  onClick={() => saveEdit(cls)}
                                  className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center text-white"
                                >
                                  <Save size={15} />
                                  Salvar
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => setEditingClassId(null)}
                                  className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center text-red-400"
                                >
                                  <X size={15} /> Cancelar
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => startEditing(cls)}
                                className="hover:bg-gray-700 text-white p-2 rounded cursor-pointer flex gap-5"
                              >
                                <Pen size={15} />
                                Editar turma
                              </DropdownMenuItem>
                            )}
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
