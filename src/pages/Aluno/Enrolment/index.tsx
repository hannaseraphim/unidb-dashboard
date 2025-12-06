import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import axios from "axios";
import { ApiURL } from "@/utils/api";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuickMessage } from "@/hooks/useQuickMessage";

type Class = {
  id: number;
  name: string;
  starts_on: string;
  ends_on: string;
  period: string;
  max_students: number;
  archived: number;
  teacher_name: string;
};

export const AvailableClasses = () => {
  const { Toast, showMessage } = useQuickMessage();
  const [user, setUser] = useState<PersonalUser | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);

  const handleEnroll = async (classId: number) => {
    const formData = { id_class: classId, id_student: user?.id };

    try {
      await axios.post(`${ApiURL}/api/enrolments`, formData, {
        withCredentials: true,
      });
      showMessage("Matrícula solicitada com sucesso!", "success");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (
          err.response?.data.message == "Max students reached. Teacher notified"
        )
          showMessage(
            "Essa turma já atingiu o máximo de alunos possível. Uma notificação foi enviada ao professor responsável para considerar aumentar a quantidade máxima de alunos."
          );
        return;
      } else {
        showMessage(
          "Não foi possivel se matricular nesta turma, tente novamente outra hora.",
          "error"
        );
        return;
      }
    }
  };

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  useEffect(() => {
    const fetchAvailableClasses = async () => {
      const available = await axios.get<Class[]>(
        `${ApiURL}/api/classes/available`,
        {
          withCredentials: true,
        }
      );
      setClasses(available.data);
    };

    fetchAvailableClasses();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar profile="Aluno" />
      <Toast />
      <main className="w-full bg-gray-800 flex flex-col items-start justify-start gap-4 p-5">
        <SidebarTrigger className="hidden" />

        <section id="header">
          <div className="w-full m-5">
            <div className="flex flex-col start">
              <p className="text-2xl text-emerald-400 font-bold">
                Turmas disponíveis para matrícula
              </p>
            </div>
          </div>
        </section>

        <section
          id="content"
          className="w-full flex items-center justify-center"
        >
          <div className="container w-full flex flex-col items-center justify-center gap-4 ml-5 mr-5">
            {classes.length === 0 ? (
              <p className="text-white text-center">
                Nenhuma turma disponível.
              </p>
            ) : (
              classes.map((cls) => (
                <Card
                  key={cls.id}
                  className="bg-gray-900 w-full flex flex-row justify-between items-center"
                >
                  <CardContent className="text-xl text-emerald-400 flex flex-col gap-1">
                    <h1>{cls.name}</h1>
                    <CardDescription>{cls.period}</CardDescription>
                    <Badge className="bg-emerald-800">
                      Termina em: {cls.ends_on.split("T")[0]}
                    </Badge>
                    <Badge className="bg-emerald-600">{cls.teacher_name}</Badge>
                  </CardContent>
                  <CardContent>
                    <Button
                      className="bg-emerald-400 cursor-pointer"
                      onClick={() => handleEnroll(cls.id)}
                    >
                      Solicitar matrícula
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </SidebarProvider>
  );
};
