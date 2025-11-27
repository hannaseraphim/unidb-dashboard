import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useQuickMessage } from "../../components/quickmessage";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";

// Interfaces
interface Profile {
  id: number;
  name: string;
}

interface Classes {
  course_name: string;
  id: number;
  name: string;
}

interface Grade {
  activitiy_id: number;
  activity_title: string;
  grade: number;
}

interface User {
  id?: number;
  name: string;
  email: string;
  profiles: Profile[];
  password?: string;
  classes: Classes[];
  grades: Grade[];
}

interface UpdatedUser {
  name: string;
  email: string;
  password?: string;
  profiles: number[];
}

interface ClassDetail {
  id: number;
  name: string;
  course_name: string;
  student_count: number;
  teacher?: { id: number; name: string; email: string };
}

// Perfils disponíveis
const availableProfiles: Profile[] = [
  { id: 1, name: "Administrador" },
  { id: 2, name: "Professor" },
  { id: 3, name: "Aluno" },
];

// Perfis e cores
const profileColors: Record<string, string> = {
  Administrador: "bg-red-500",
  Professor: "bg-blue-500",
  Aluno: "bg-indigo-500",
};

// Subcomponentes
const UserField = ({
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

const UserClasses = ({ classesDetails }: { classesDetails: ClassDetail[] }) => (
  <div className="flex mt-5 flex-col items-center justify-center">
    <h1 className="text-2xl font-bold text-indigo-500">Turmas</h1>
    <div className="flex flex-wrap w-full justify-center">
      {classesDetails.length ? (
        classesDetails.map((c) => (
          <Card
            key={c.id}
            className="w-100 m-5 cursor-pointer hover:scale-102 transition-all"
          >
            <CardContent>
              <h1 className="text-indigo-500 font-bold">{c.name}</h1>
              <p>Quantidade de alunos: {c.student_count}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <h1 className="text-gray-400 p-2">Não há turmas para esse usuário.</h1>
      )}
    </div>
  </div>
);

const UserGrades = ({ grades }: { grades: Grade[] }) => (
  <div className="flex mt-5 flex-col items-center justify-center">
    <h1 className="text-2xl font-bold text-indigo-500">Notas</h1>
    <div className="flex flex-wrap w-full justify-center">
      {grades.length ? (
        grades.map((g, key) => (
          <Card
            key={key}
            className="w-100 m-5 cursor-pointer hover:scale-102 transition-all"
          >
            <CardContent>
              <h1>{g.activity_title}</h1>
              <h1 className="text-indigo-500 font-bold">{g.grade}</h1>
            </CardContent>
          </Card>
        ))
      ) : (
        <h1 className="text-gray-400 p-2">Não há notas para esse usuário.</h1>
      )}
    </div>
  </div>
);

const Contador = () => {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (count === 0) navigate("/users"); // para quando chegar em 0

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer); // limpa o timeout
  }, [count, navigate]);

  return <h1>Voltando em {count}s</h1>;
};

// Componente final
export const User = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [updatedUser, setUpdatedUser] = useState<UpdatedUser>({
    name: "",
    email: "",
    password: "",
    profiles: [],
  });
  const [classesDetails, setClassesDetails] = useState<ClassDetail[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const { Toast, showMessage } = useQuickMessage();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get<User>(
          `http://localhost:8080/api/users/${id}`,
          { withCredentials: true }
        );
        setUser(res.data);
        setUpdatedUser({
          name: res.data.name,
          email: res.data.email,
          password: "",
          profiles: res.data.profiles.map((p) => p.id),
        });

        if (res.data.classes.length > 0) {
          const details = await Promise.all(
            res.data.classes.map(async (c) => {
              const clsRes = await axios.get<ClassDetail>(
                `http://localhost:8080/api/classes/${c.id}`,
                { withCredentials: true }
              );
              return clsRes.data;
            })
          );
          setClassesDetails(details);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [id]);

  // 🔁 Atualizar o usuário no banco de dados
  async function handleUpdateUser() {
    try {
      // cria uma cópia do objeto
      const payload = { ...updatedUser };

      // remove a senha se estiver vazia
      if (!payload.password) {
        delete payload.password;
      }

      console.log(payload);

      await axios.put(`http://localhost:8080/api/users/${user!.id}`, payload, {
        withCredentials: true,
      });

      showMessage("Usuário atualizado com sucesso");
    } catch (error) {
      console.error(error);
      showMessage("Erro ao atualizar usuário");
    }
  }

  // 🗑️ Deleta o usuário do banco de dados
  async function handleDeleteUser() {
    try {
      await axios.delete(`http://localhost:8080/api/users/${user?.id}`, {
        withCredentials: true,
      });
      showMessage("Usuário deletado com sucesso");
      setUser(null);
    } catch (error) {
      console.log(error);
      showMessage("Ocorreu um erro ao deletar o usuário");
    }
  }

  // 🔧 Checkboxes dinâmicos
  function handleCheckboxChange(profileId: number, checked: boolean) {
    setUpdatedUser((prev) => {
      let updatedProfiles = [...prev.profiles];

      if (checked) {
        // adiciona perfil
        updatedProfiles = Array.from(new Set([...updatedProfiles, profileId]));
      } else {
        // impede remover o último perfil
        if (updatedProfiles.length === 1) {
          showMessage("O usuário precisa ter pelo menos um perfil");
          return prev;
        }
        updatedProfiles = updatedProfiles.filter((id) => id !== profileId);
      }

      // ordena por id
      updatedProfiles.sort((a, b) => a - b);

      return { ...prev, profiles: updatedProfiles };
    });
  }

  return (
    <SidebarProvider className="flex z-50">
      <AppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />
        {Toast}

        {user ? (
          <div className="w-full p-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-5">
              <div className="w-full">
                <div className=""></div>
                <UserField
                  label="Nome"
                  value={updatedUser.name}
                  onChange={(e) =>
                    setUpdatedUser({ ...updatedUser, name: e.target.value })
                  }
                  isEditing={isEditing}
                />

                <UserField
                  label="Email"
                  type="email"
                  value={updatedUser.email}
                  onChange={(e) =>
                    setUpdatedUser({ ...updatedUser, email: e.target.value })
                  }
                  isEditing={isEditing}
                />

                {isEditing && (
                  <UserField
                    label="Senha"
                    type="password"
                    value={updatedUser.password || ""}
                    onChange={(e) =>
                      setUpdatedUser({
                        ...updatedUser,
                        password: e.target.value,
                      })
                    }
                    isEditing={true}
                  />
                )}

                {isEditing && (
                  <div className="flex flex-col mt-2 mb-2">
                    {availableProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center gap-1">
                        <Input
                          type="checkbox"
                          className="w-4"
                          id={String(profile.id)}
                          checked={updatedUser.profiles.includes(profile.id)}
                          onChange={(e) =>
                            handleCheckboxChange(profile.id, e.target.checked)
                          }
                        />
                        <Label htmlFor={String(profile.id)}>
                          {profile.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1 mt-2">
                  {user.profiles.map((p) => (
                    <Badge key={p.id} className={profileColors[p.name]}>
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-green-600 cursor-pointer"
                    onClick={handleUpdateUser}
                  >
                    Atualizar
                  </Button>

                  {/* Modal de exclusão de usuário */}
                  <Dialog>
                    {/* Botão que abre o modal */}
                    <DialogTrigger asChild>
                      <Button className="bg-red-900 cursor-pointer">
                        Excluir usuário
                      </Button>
                    </DialogTrigger>

                    {/* Conteúdo do modal */}
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-500 font-bold">
                          Excluir {user.name}?
                        </DialogTitle>
                        <DialogDescription>
                          Deseja mesmo excluir este usuário? Essa ação não
                          poderá ser revertida.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>

                        <Button
                          className="bg-red-500 text-white cursor-pointer"
                          onClick={() => handleDeleteUser()}
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
                  Editar usuário
                </Button>
              )}
            </div>

            <UserClasses classesDetails={classesDetails} />
            <UserGrades grades={user.grades} />
          </div>
        ) : (
          <div className="w-full p-5">
            <h1 className="text-2xl text-indigo-500 font-bold">
              Usuário não encontrado.
            </h1>
            <Contador />
          </div>
        )}
      </main>
    </SidebarProvider>
  );
};
