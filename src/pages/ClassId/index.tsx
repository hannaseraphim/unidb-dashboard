import { AppSidebar } from "@/components/app-sidebar";
import { useQuickMessage } from "@/components/quickmessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Class, User } from "@/interfaces";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const Contador = () => {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (count === 0) navigate("/classes"); // para quando chegar em 0

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer); // limpa o timeout
  }, [count, navigate]);

  return <h1>Voltando em {count}s</h1>;
};

const ClassField = ({
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

const periods = ["Matutino", "Vespertino", "Noturno"];

// Componente final
export const ClassId = () => {
  const { id } = useParams();
  const [cls, setClass] = useState<Class | null>();
  const [availableTeachers, setAvailableTeachers] = useState<User[]>();
  const [updatedClass, setUpdatedClass] = useState({
    id_course: 0,
    id_teacher: 0,
    starts_on: "",
    ends_on: "",
    period: "",
    name: "",
    max_students: 0,
    archived: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const { Toast, showMessage } = useQuickMessage();

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get<Class>(
          `http://localhost:8080/api/classes/${id}`,
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

        setClass(res.data);
        setUpdatedClass({
          name: res.data.name,
          id_course: Number(res.data.id),
          id_teacher: Number(res.data.teacher?.id),
          archived: Number(res.data.archived),
          starts_on: res.data.starts_on.split("T")[0],
          ends_on: res.data.ends_on.split("T")[0],
          max_students: Number(res.data.max_students),
          period: res.data.period,
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchCourse();
  }, [id]);

  // 🔁 Atualizar curso
  async function handleUpdateClass() {
    try {
      await axios.put(
        `http://localhost:8080/api/classes/${cls!.id}`,
        updatedClass,
        { withCredentials: true }
      );
      showMessage("Curso atualizado com sucesso");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showMessage("Erro ao atualizar curso");
    }
  }

  // 🗑️ Deletar turma
  async function handleDeleteClass() {
    try {
      await axios.delete(`http://localhost:8080/api/classes/${cls?.id}`, {
        withCredentials: true,
      });
      showMessage("Turma deletada com sucesso");
      setClass(null);
      setUpdatedClass({
        id_course: 0,
        id_teacher: 0,
        starts_on: "",
        ends_on: "",
        period: "",
        name: "",
        max_students: 0,
        archived: 0,
      });
    } catch (error) {
      console.log(error);
      showMessage("Ocorreu um erro ao deletar a turma");
    }
  }

  return (
    <SidebarProvider className="flex z-50">
      <AppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />
        {Toast}

        {cls ? (
          <div className="w-full p-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-5 flex-col md:flex-row">
              <div className="w-full">
                {/* Exibição dos títulos */}
                {!isEditing && (
                  <div className="flex flex-col gap-3">
                    <h1 className="text-4xl text-indigo-500 font-bold">
                      {cls!.name}
                    </h1>
                    <p className="text-md text-gray-500">
                      Máx. de alunos: {cls!.max_students}
                    </p>
                    <div className="flex flex-col">
                      <p className="text-md text-indigo-500">
                        Data de início:{" "}
                        <span>{cls!.starts_on.split("T")[0]}</span>
                      </p>
                      <p className="text-md text-indigo-500">
                        Data de encerramento:{" "}
                        <span>{cls!.ends_on.split("T")[0]}</span>
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Badge
                        className="cursor-pointer hover:bg-indigo-500 transition-all"
                        onClick={() => navigate(`/users/${cls.teacher?.id}`)}
                      >
                        {cls.teacher?.name}
                      </Badge>
                      <Badge className="bg-indigo-500">{cls.period}</Badge>
                      <Badge
                        className={
                          cls.archived ? "bg-gray-500" : "bg-green-600"
                        }
                      >
                        {cls.archived ? "Arquivada" : "Ativa"}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Inputs de edição usando ClassField */}
                {isEditing && (
                  <div className="flex flex-col gap-4">
                    <ClassField
                      label="Nome"
                      value={updatedClass!.name}
                      onChange={(e) =>
                        setUpdatedClass({
                          ...updatedClass!,
                          name: e.target.value,
                        })
                      }
                      isEditing={true}
                    />
                    {/* Período */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="period"
                        className="text-xl font-bold text-indigo-500"
                      >
                        Período:
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setUpdatedClass({ ...updatedClass!, period: value })
                        }
                        defaultValue={updatedClass?.period}
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
                        className="text-xl font-bold text-indigo-500"
                      >
                        Professor:
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setUpdatedClass({
                            ...updatedClass,
                            id_teacher: Number(value),
                          })
                        }
                        defaultValue={String(updatedClass.id_teacher)}
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

                    <ClassField
                      label="Máx. de alunos"
                      type="number"
                      value={String(updatedClass!.max_students)}
                      onChange={(e) =>
                        setUpdatedClass({
                          ...updatedClass!,
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
                <div className="flex flex-col gap-2 w-full md:w-80">
                  <Button
                    className="bg-green-600 cursor-pointer"
                    onClick={handleUpdateClass}
                  >
                    Atualizar
                  </Button>

                  {/* Modal de exclusão */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-red-900 cursor-pointer">
                        Excluir turma
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-500 font-bold">
                          Excluir {cls!.name}?
                        </DialogTitle>
                        <DialogDescription>
                          Deseja mesmo excluir esta turma? Essa ação não poderá
                          ser revertida.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button
                          className="bg-red-500 text-white cursor-pointer"
                          onClick={handleDeleteClass}
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
                  Editar turma
                </Button>
              )}
            </div>

            {/* Turmas */}
            <div className="flex justify-center">
              <div className="flex flex-col w-full items-center mt-5">
                <h1 className="text-2xl font-bold text-indigo-500">
                  Alunos: {cls.student_count}
                </h1>
                <div className="flex flex-wrap m-5 gap-5 justify-center items-center">
                  {cls.students?.map((std, key) => (
                    <Card
                      key={key}
                      className="w-100 flex cursor-pointer transition-all hover:scale-102"
                      onClick={() => navigate(`/users/${std.id}`)}
                    >
                      <CardContent className="flex flex-col gap-2">
                        <CardTitle className="text-gray-400">
                          ID: {std.id}
                        </CardTitle>
                        <CardTitle className="text-indigo-500 font-bold">
                          {std.name}
                        </CardTitle>
                        <CardDescription>
                          Média:{" "}
                          <span
                            className={
                              Number(std.average_grade) > 5
                                ? "text-green-500"
                                : "text-red-500 font-bold"
                            }
                          >
                            {std.average_grade}
                          </span>
                        </CardDescription>
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
              Turma não encontrada.
            </h1>
            <Contador />
          </div>
        )}
      </main>
    </SidebarProvider>
  );
};
