import { AppSidebar } from "@/components/app-sidebar";
import { useQuickMessage } from "@/components/quickmessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Class, Course } from "@/interfaces";
import axios from "axios";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const Contador = () => {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (count === 0) navigate("/courses"); // para quando chegar em 0

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer); // limpa o timeout
  }, [count, navigate]);

  return <h1>Voltando em {count}s</h1>;
};

const CourseField = ({
  label,
  value,
  onChange,
  type = "text",
  isEditing,
}: {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  isEditing: boolean;
}) => (
  <div className="flex flex-col gap-1">
    {isEditing ? (
      <div className="flex flex-col w-full gap-1">
        <Label
          htmlFor={label}
          className="m-1 text-indigo-500 font-bold text-xl"
        >
          {label}:
        </Label>
        <Input
          id={label}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          className="w-full"
        />
      </div>
    ) : (
      <h1
        className={`${
          type === "email"
            ? "text-xl text-gray-400"
            : "text-4xl text-indigo-500 font-bold"
        }`}
      >
        {value}
      </h1>
    )}
  </div>
);

// Componente final
export const CourseId = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [updatedCourse, setUpdatedCourse] = useState<Course>();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const { Toast, showMessage } = useQuickMessage();

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get<Course>(
          `http://localhost:8080/api/courses/${id}`,
          { withCredentials: true }
        );

        setCourse(res.data);
        setUpdatedCourse({
          name: res.data.name,
          description: res.data.description,
          max_students: res.data.max_students,
        });

        // Carregar classes relacionadas
        const details = await Promise.all(
          res.data.classes!.map(async (c) => {
            const clsRes = await axios.get<Class>(
              `http://localhost:8080/api/classes/${c.id}`,
              { withCredentials: true }
            );

            const formattedEndDate = clsRes.data.ends_on.split("T")[0];
            const formattedStartDate = clsRes.data.starts_on.split("T")[0];
            const result = {
              ...clsRes.data,
              starts_on: formattedStartDate,
              ends_on: formattedEndDate,
            };

            return result;
          })
        );

        console.log(details);
        setClasses(details);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCourse();
  }, [id]);

  // 🔁 Atualizar curso
  async function handleUpdateCourse() {
    try {
      await axios.put(
        `http://localhost:8080/api/courses/${course!.id}`,
        updatedCourse,
        { withCredentials: true }
      );
      showMessage("Curso atualizado com sucesso");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showMessage("Erro ao atualizar curso");
    }
  }

  // 🗑️ Deletar curso
  async function handleDeleteCourse() {
    try {
      await axios.delete(`http://localhost:8080/api/courses/${course?.id}`, {
        withCredentials: true,
      });
      showMessage("Curso deletado com sucesso");
      setCourse(null);
    } catch (error) {
      console.log(error);
      showMessage("Ocorreu um erro ao deletar o curso");
    }
  }

  const handleClassDetails = (id: number) => {
    navigate(`/classes/${id}`);
  };

  return (
    <SidebarProvider className="flex z-50">
      <AppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />
        {Toast}

        {course ? (
          <div className="w-full p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-5">
              <div className="w-full">
                {/* Exibição dos títulos */}
                {!isEditing && (
                  <div className="flex flex-col gap-3">
                    <h1 className="text-4xl text-indigo-500 font-bold">
                      {course!.name}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {course!.description}
                    </p>
                    <p className="text-md text-gray-500">
                      Máx. de alunos: {course!.max_students}
                    </p>
                  </div>
                )}

                {/* Inputs de edição usando CourseField */}
                {isEditing && (
                  <div className="flex flex-col gap-4">
                    <CourseField
                      label="Nome"
                      value={updatedCourse!.name}
                      onChange={(e) =>
                        setUpdatedCourse({
                          ...updatedCourse!,
                          name: e.target.value,
                        })
                      }
                      isEditing={true}
                    />

                    <CourseField
                      label="Descrição"
                      value={updatedCourse!.description}
                      onChange={(e) =>
                        setUpdatedCourse({
                          ...updatedCourse!,
                          description: e.target.value,
                        })
                      }
                      isEditing={true}
                    />

                    <CourseField
                      label="Máx. de alunos"
                      type="number"
                      value={String(updatedCourse!.max_students)}
                      onChange={(e) =>
                        setUpdatedCourse({
                          ...updatedCourse!,
                          max_students: Number(e.target.value),
                        })
                      }
                      isEditing={true}
                    />
                  </div>
                )}
              </div>

              {/* Botões */}
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-green-600 cursor-pointer"
                    onClick={handleUpdateCourse}
                  >
                    Atualizar
                  </Button>

                  {/* Modal de exclusão */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-red-900 cursor-pointer">
                        Excluir curso
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-500 font-bold">
                          Excluir {course!.name}?
                        </DialogTitle>
                        <DialogDescription>
                          Deseja mesmo excluir este curso? Essa ação não poderá
                          ser revertida.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button
                          className="bg-red-500 text-white cursor-pointer"
                          onClick={handleDeleteCourse}
                        >
                          Confirmar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    className="bg-gray-400 cursor-pointer"
                    onClick={() => setIsEditing(false)}
                  >
                    Voltar
                  </Button>
                </div>
              ) : (
                <Button
                  className="bg-indigo-500 cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  Editar curso
                </Button>
              )}
            </div>

            {/* Turmas */}
            <div className="flex justify-center">
              <div className="flex flex-col w-full items-center">
                <h1 className="text-2xl font-bold text-indigo-500">Turmas</h1>
                <div className="flex flex-wrap m-5 gap-5 justify-center items-center">
                  {classes.map((c, key) => (
                    <Card
                      key={key}
                      className="w-80 hover:scale-101 cursor-pointer transition-all"
                      onClick={() => handleClassDetails(c.id!)}
                    >
                      <CardContent>
                        <p className="text-gray-400">ID: {c.id}</p>
                        <h1 className=" font-bold text-indigo-500">{c.name}</h1>
                        <p>{c.period}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar size={18} />
                          <p className="text-gray-400">
                            Data de início: {c.starts_on}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={18} />
                          <p className="text-gray-400">
                            Data de término: {c.ends_on}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full p-5">
            <h1 className="text-2xl text-indigo-500 font-bold">
              Curso não encontrado.
            </h1>
            <Contador />
          </div>
        )}
      </main>
    </SidebarProvider>
  );
};
