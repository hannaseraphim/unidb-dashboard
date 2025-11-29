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

import type { Class, Course, User } from "@/interfaces";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const periods = ["Matutino", "Vespertino", "Noturno"];

export const Classes = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);

  // 🔎 Busca
  const [searchQuery, setSearch] = useState<string>("");
  const filtered = classes.filter((cls) => {
    const q = searchQuery.toLowerCase();
    return (
      cls.name.toLowerCase().includes(q) ||
      cls.teacher!.name?.toLowerCase().includes(q) ||
      cls.id?.toString().includes(q)
    );
  });

  // ➕ Criação de turmas
  const [formData, setFormData] = useState<Class>({
    name: "",
    id_course: 0,
    id_teacher: 0,
    starts_on: "",
    ends_on: "",
    archived: false,
    period: "",
    max_students: 0,
  });
  const [formMessage, setFormMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { Toast, showMessage } = useQuickMessage();
  const [availableCourses, setAvailableCourses] = useState<Course[]>();
  const [availableTeachers, setAvailableTeachers] = useState<User[]>();

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();

    try {
      await axios
        .post("http://localhost:8080/api/classes", formData, {
          withCredentials: true,
        })
        .then((res) => {
          setFormOpen(false);
          showMessage(
            "Turma criada, a página será atualizada automaticamente em 5 segundos"
          );
          setTimeout(() => window.location.reload(), 5000);
          console.log(res.status);
        })
        .catch((err) => {
          if (err.status === 409) setFormMessage("Turma já existe");
          setTimeout(() => setFormMessage(""), 3000);
          console.log(err);
        });
      return;
    } catch (error) {
      console.log(error);
      setFormMessage("Ocorreu um erro interno, tente novamente outra hora");
    }
  }

  // 🔧 Carregar turmas
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get<Class[]>(
          "http://localhost:8080/api/classes",
          { withCredentials: true }
        );

        const courses = await axios.get<Course[]>(
          "http://localhost:8080/api/courses",
          { withCredentials: true }
        );

        const users = await axios.get<User[]>(
          "http://localhost:8080/api/users",
          { withCredentials: true }
        );

        const teachers = users.data.filter((user) =>
          user.profiles.some((profile) => profile.id === 2)
        );

        setAvailableTeachers(teachers);
        setClasses(res.data);
        setAvailableCourses(courses.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchClasses();
  }, []);

  const handleClassDetails = (id: number) => {
    navigate(`/classes/${id}`);
  };

  // pega a data atual no formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  console.log(classes);

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
              placeholder="Procure por uma turma..."
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute right-10 text-gray-400" />
          </div>

          <div className="flex justify-between text-indigo-500 w-full p-5 font-bold items-center gap-2">
            {/* Modal de criação de curso */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 cursor-pointer">
                  Criar turma
                </Button>
              </DialogTrigger>

              <DialogContent className="w-110">
                <DialogHeader>
                  <DialogTitle className="text-indigo-500 font-bold">
                    Criar uma turma
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={(e) => handleCreateClass(e)}
                  >
                    {/* Nome */}
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
                    {/* Curso */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="name"
                        className="font-bold text-indigo-500"
                      >
                        Curso:
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData({ ...formData, id_course: Number(value) })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Cursos disponíveis</SelectLabel>
                            {availableCourses?.map((crs, key) => (
                              <SelectItem key={key} value={String(crs.id)}>
                                {crs.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Período */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="name"
                        className="font-bold text-indigo-500"
                      >
                        Período:
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData({ ...formData, period: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Períodos disponíveis</SelectLabel>
                            {periods.map((p, key) => (
                              <SelectItem key={key} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Professor */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="name"
                        className="font-bold text-indigo-500"
                      >
                        Professor:
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            id_teacher: Number(value),
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um professor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Professores disponíveis</SelectLabel>
                            {availableTeachers?.map((t, key) => (
                              <SelectItem key={key} value={String(t.id)}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Data de início */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="name"
                        className="font-bold text-indigo-500"
                      >
                        Data de início:
                      </Label>
                      <Input
                        type="date"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            starts_on: e.target.value,
                          })
                        }
                      />
                    </div>
                    {/* Data de término */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="name"
                        className="font-bold text-indigo-500"
                      >
                        Data de término:
                      </Label>
                      <Input
                        type="date"
                        min={today} // limite mínimo
                        max="2027-12-30" // limite máximo
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ends_on: e.target.value,
                          })
                        }
                      />
                    </div>
                    {/* Quantidade de alunos */}
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

          {/* Classes list */}
          {filtered.map((cls) => (
            <div key={cls.id}>
              <Card
                className={`m-2 flex flex-row justify-between items-center cursor-pointer scale-99 hover:scale-100 transition-all ${
                  cls.archived ? "bg-gray-200" : ""
                }`}
                onClick={() => handleClassDetails(cls.id!)}
              >
                <CardContent className="flex flex-col gap-1">
                  <p className="text-gray-400">ID: {cls.id}</p>
                  <h1>{cls.name}</h1>
                  <CardDescription>{cls.period}</CardDescription>
                  <div className="flex gap-1">
                    <Badge className="bg-blue-500">
                      Professor: {cls.teacher!.name}
                    </Badge>
                    <Badge className="bg-blue-500">
                      Quantidade de alunos: {cls.student_count}
                    </Badge>
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
