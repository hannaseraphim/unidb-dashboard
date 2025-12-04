import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import axios from "axios";
import { ApiURL } from "@/utils/api";
import { useQuickMessage } from "@/hooks/useQuickMessage";

type Course = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  profiles: { id: number; name: string }[];
};

interface CreateClassModalProps {
  trigger: React.ReactNode;
}

export const CreateClassModal = ({ trigger }: CreateClassModalProps) => {
  const { showMessage, Toast } = useQuickMessage();

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);

  const [newClass, setNewClass] = useState({
    name: "",
    starts_on: "",
    ends_on: "",
    period: "",
    id_course: 0,
    id_teacher: 0,
    max_students: 0,
    archived: 0,
  });

  // Buscar cursos
  useEffect(() => {
    const fetchCourses = async () => {
      const res = await axios.get<Course[]>(`${ApiURL}/api/courses`, {
        withCredentials: true,
      });
      setCourses(res.data);
    };
    fetchCourses();
  }, []);

  // Buscar professores
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get<User[]>(`${ApiURL}/api/users`, {
        withCredentials: true,
      });
      const onlyTeachers = res.data.filter((user) =>
        user.profiles.some((p) => p.name === "Professor")
      );
      setTeachers(onlyTeachers);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (
      !newClass.name ||
      !newClass.starts_on ||
      !newClass.ends_on ||
      !newClass.period ||
      !newClass.id_course ||
      !newClass.id_teacher
    ) {
      showMessage("Preencha todos os campos obrigatórios", "error");
      return;
    }

    await axios
      .post(`${ApiURL}/api/classes`, newClass, { withCredentials: true })
      .then(() => {
        showMessage(
          "Turma criada com sucesso. A página será atualizada em 3 segundos"
        );
        setTimeout(() => window.location.reload(), 3000);
      });
  };

  return (
    <>
      <Toast />
      <Dialog>
        <form onSubmit={handleSubmit}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar turma</DialogTitle>
              <DialogDescription>
                Preencha as informações da nova turma
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              {/* Nome */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da turma</Label>
                <Input
                  id="name"
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                  placeholder="Ex: Turma A"
                />
              </div>

              {/* Início */}
              <div className="grid gap-2">
                <Label htmlFor="starts_on">Data de início</Label>
                <Input
                  id="starts_on"
                  type="date"
                  value={newClass.starts_on}
                  onChange={(e) =>
                    setNewClass({ ...newClass, starts_on: e.target.value })
                  }
                />
              </div>

              {/* Fim */}
              <div className="grid gap-2">
                <Label htmlFor="ends_on">Data de término</Label>
                <Input
                  id="ends_on"
                  type="date"
                  value={newClass.ends_on}
                  onChange={(e) =>
                    setNewClass({ ...newClass, ends_on: e.target.value })
                  }
                />
              </div>

              {/* Período */}
              <div className="grid gap-2">
                <Label>Período</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {newClass.period || "Selecione o período"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        setNewClass({ ...newClass, period: "Matutino" })
                      }
                    >
                      Matutino
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setNewClass({ ...newClass, period: "Vespertino" })
                      }
                    >
                      Vespertino
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setNewClass({ ...newClass, period: "Noturno" })
                      }
                    >
                      Noturno
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Curso */}
              <div className="grid gap-2">
                <Label>Curso</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {courses.find((c) => c.id === newClass.id_course)?.name ||
                        "Selecione o curso"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {courses.map((course) => (
                      <DropdownMenuItem
                        key={course.id}
                        onClick={() =>
                          setNewClass({ ...newClass, id_course: course.id })
                        }
                      >
                        {course.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Professor */}
              <div className="grid gap-2">
                <Label>Professor</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {teachers.find((t) => t.id === newClass.id_teacher)
                        ?.name || "Selecione o professor"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {teachers.map((teacher) => (
                      <DropdownMenuItem
                        key={teacher.id}
                        onClick={() =>
                          setNewClass({ ...newClass, id_teacher: teacher.id })
                        }
                      >
                        {teacher.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Máximo de alunos */}
              <div className="grid gap-2">
                <Label htmlFor="max_students">Máximo de alunos</Label>
                <Input
                  id="max_students"
                  type="number"
                  min={0}
                  max={45}
                  value={newClass.max_students}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      max_students: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-emerald-500"
                onClick={() => handleSubmit()}
              >
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};
