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
  BookOpen,
  GraduationCap,
  MoreHorizontalIcon,
  Pen,
  Save,
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
import { CreateCourseModal } from "../components/CreateCourseModal";

// Tipos de resposta
type Course = {
  id: number;
  name: string;
  description: string;
  max_students: number;
  classes: Class[];
};

type Class = {
  id: number;
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
};

export const Courses = () => {
  const { Toast, showMessage } = useQuickMessage();

  const [courseList, setCourseList] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const results = courseList?.filter(
      (course) =>
        course.name.toLowerCase().includes(query.toLowerCase()) ||
        course.id.toString().includes(query.toLowerCase()) ||
        course.max_students.toString().includes(query.toLowerCase())
    );
    setFilteredCourses(results);
  };

  // Edição de curso
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    max_students: number;
  }>({
    name: "",
    description: "",
    max_students: 0,
  });

  const startEditing = (course: Course) => {
    setEditingCourseId(course.id);
    setEditForm({
      name: course.name,
      description: course.description,
      max_students: course.max_students,
    });
  };

  const saveEdit = async (id: number) => {
    await axios.put(`${ApiURL}/api/courses/${id}`, editForm, {
      withCredentials: true,
    });

    setFilteredCourses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: editForm.name,
              description: editForm.description,
              max_students: editForm.max_students,
            }
          : c
      )
    );

    setEditingCourseId(null);

    showMessage("Curso atualizado com sucesso!", "success");
  };

  // Deletar curso
  const handleDeleteCourse = async (course: Course) => {
    await axios
      .delete(`${ApiURL}/api/courses/${course.id}`, {
        withCredentials: true,
      })
      .then(() => {
        showMessage(
          "Curso deletado com sucesso. A página será atualizada em 3 segundos"
        );
        setTimeout(() => window.location.reload(), 3000);
      });
  };

  // Pegar todos os cursos
  useEffect(() => {
    const fetchCoursesList = async () => {
      const res = await axios.get<Course[]>(`${ApiURL}/api/courses`, {
        withCredentials: true,
      });

      setCourseList(res.data);
      setFilteredCourses(res.data);
    };

    fetchCoursesList();
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
              <h1 className="font-bold text-3xl text-emerald-400">Cursos</h1>
              <p className="text-neutral-400">Gerencie os cursos do sistema</p>
            </div>
            <CreateCourseModal
              trigger={
                <Button className="bg-emerald-400 cursor-pointer">
                  <UserPlus />
                  Criar curso
                </Button>
              }
            />
          </div>
        </section>

        <section id="search-bar" className="w-full">
          <Card className="bg-gray-800">
            <CardContent>
              <Input
                placeholder="Buscar cursos"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-gray-700 text-white"
              />
            </CardContent>
          </Card>
        </section>

        <section id="courses-list" className="w-full">
          <Card className="h-full bg-gray-800">
            <CardContent className="flex w-full justify-between">
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <GraduationCap />
                Lista de cursos
              </CardTitle>
              <CardTitle className="flex items-center gap-2 flex-row-reverse text-emerald-400">
                <BookOpen size={15} />
                {courseList?.length}
              </CardTitle>
            </CardContent>
            <CardContent className="overflow-auto max-h-160">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-emerald-400">ID</TableHead>
                    <TableHead className="text-emerald-400">Nome</TableHead>
                    <TableHead className="text-emerald-400">
                      Descrição
                    </TableHead>
                    <TableHead className="text-emerald-400">
                      Máx. de Alunos
                    </TableHead>
                    <TableHead className="text-emerald-400">Turmas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-white">
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-gray-700">
                      <TableCell>{course.id}</TableCell>
                      <TableCell>
                        {editingCourseId === course.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                name: e.target.value,
                              })
                            }
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          course.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCourseId === course.id ? (
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          course.description
                        )}
                      </TableCell>
                      <TableCell>
                        {editingCourseId === course.id ? (
                          <input
                            type="number"
                            min={0}
                            max={45}
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
                          course.max_students
                        )}
                      </TableCell>
                      <TableCell>{course.classes.length}</TableCell>
                      <TableCell className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreHorizontalIcon
                              size={25}
                              className="cursor-pointer hover:bg-gray-600 p-1 rounded"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 p-3 w-45 rounded-md shadow-md flex flex-col gap-1">
                            {editingCourseId === course.id ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() => saveEdit(course.id)}
                                  className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-white data-highlighted:bg-gray-700 data-highlighted:text-white"
                                >
                                  <Save size={15} />
                                  Salvar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setEditingCourseId(null)}
                                  className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-red-400 data-highlighted:bg-gray-700 data-highlighted:text-white"
                                >
                                  <X size={15} /> Cancelar
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => startEditing(course)}
                                className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-white data-highlighted:bg-gray-700 data-highlighted:text-white"
                              >
                                <Pen size={15} />
                                Editar curso
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="hover:bg-gray-700 p-2 rounded cursor-pointer flex gap-5 items-center justify-start text-red-400 data-highlighted:bg-gray-700 data-highlighted:text-white"
                              onClick={() => handleDeleteCourse(course)}
                            >
                              <Trash size={15} />
                              Excluir curso
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
