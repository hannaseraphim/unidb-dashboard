import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch, FaBook } from "react-icons/fa"; // ícone de curso
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
import { Badge } from "@/components/ui/badge";

import type { Course } from "@/interfaces";

export const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);

  // 🔎 Busca
  const [searchQuery, setSearch] = useState<string>("");
  const filtered = courses.filter((course) => {
    const q = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(q) ||
      course.description?.toLowerCase().includes(q) ||
      course.id?.toString().includes(q)
    );
  });

  // ➕ Criação de curso
  const [formData, setFormData] = useState<Course>({
    name: "",
    classes: [],
    description: "",
    max_students: 0,
  });
  const [formMessage, setFormMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { Toast, showMessage } = useQuickMessage();

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();

    try {
      await axios
        .post("http://localhost:8080/api/courses", formData, {
          withCredentials: true,
        })
        .then((res) => {
          setFormOpen(false);
          showMessage(
            "Curso criado, a página será atualizada automaticamente em 5 segundos"
          );
          setTimeout(() => window.location.reload(), 5000);
          console.log(res.status);
        })
        .catch((err) => {
          if (err.status === 409) setFormMessage("Curso já existe");
          setTimeout(() => setFormMessage(""), 3000);
          console.log(err);
        });
      return;
    } catch (error) {
      console.log(error);
      setFormMessage("Ocorreu um erro interno, tente novamente outra hora");
    }
  }

  // 🔧 Carregar cursos
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get<Course[]>(
          "http://localhost:8080/api/courses",
          { withCredentials: true }
        );
        setCourses(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseDetails = (id: number) => {
    navigate(`/courses/${id}`);
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
              placeholder="Procure por um curso..."
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute right-10 text-gray-400" />
          </div>

          <div className="flex justify-between text-indigo-500 w-full p-5 font-bold items-center gap-2">
            {/* Modal de criação de curso */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 cursor-pointer">
                  Criar curso
                </Button>
              </DialogTrigger>

              <DialogContent className="w-110">
                <DialogHeader>
                  <DialogTitle className="text-indigo-500 font-bold">
                    Criar um curso
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={(e) => handleCreateCourse(e)}
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
                        htmlFor="description"
                        className="font-bold text-indigo-500"
                      >
                        Descrição:
                      </Label>
                      <Input
                        id="description"
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="description"
                        className="font-bold text-indigo-500"
                      >
                        Quantidade máxima de alunos:
                      </Label>
                      <Input
                        id="description"
                        type="number"
                        min={0}
                        max={45}
                        value={formData.max_students}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_students: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
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
              <FaBook />
              {filtered.length}
            </div>
          </div>

          {/* Courses list */}
          {filtered.map((course) => (
            <div key={course.id}>
              <Card
                className="m-2 flex flex-row justify-between items-center cursor-pointer scale-99 hover:scale-100 transition-all"
                onClick={() => handleCourseDetails(course.id!)}
              >
                <CardContent className="flex flex-col gap-1">
                  <p className="text-gray-400">ID: {course.id}</p>
                  <h1>{course.name}</h1>
                  <CardDescription>{course.description}</CardDescription>
                  <Badge className="bg-indigo-500">
                    Turmas: {course.classes!.length}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </SidebarProvider>
  );
};
