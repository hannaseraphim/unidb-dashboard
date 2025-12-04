import { AppSidebar } from "@/components/SideBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import { ApiURL } from "@/utils/api";
import axios from "axios";
import { useEffect, useState } from "react";

type Activity = {
  id: number;
  id_class: number;
  title: string;
  description: string;
  type: string;
  max_grade: string;
  due_date: string;
};

export const Activity = () => {
  const [user, setUser] = useState<PersonalUser | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      if (user) {
        try {
          const requests = user.enrolments.map((enrolment) =>
            axios.get<Activity>(
              `${ApiURL}/api/activities/${enrolment.classId}`,
              {
                withCredentials: true,
              }
            )
          );

          const responses = await Promise.all(requests);

          // extrai apenas os dados
          const activitiesData = responses.map((res) => res.data);

          setActivities(activitiesData);
        } catch (error) {
          console.error("Erro ao buscar atividades:", error);
        }
      }
    };

    fetchActivities();
  }, [user]);

  const now = new Date().toISOString().split("T")[0];

  return (
    <SidebarProvider>
      <AppSidebar profile="Aluno" />
      <main className="w-full bg-gray-800 flex flex-col items-start justify-start gap-4 p-5">
        <SidebarTrigger className="hidden" />

        <section id="header">
          <div className="w-full m-5">
            <div className="flex flex-col start">
              <p className="text-2xl text-emerald-400 font-bold">
                Minhas atividades
              </p>
            </div>
          </div>
        </section>

        <section
          id="content"
          className="w-full flex items-center justify-center"
        >
          <div className="container w-full flex flex-wrap items-start justify-evenly gap-4">
            {activities ? (
              activities.map((activity) => {
                const isOverdue = activity.due_date.split("T")[0] < now;

                return (
                  <div className="" key={activity.id}>
                    <Card className="w-full bg-gray-900">
                      <div className="flex justify-between items-center">
                        <CardContent className="text-xl text-emerald-400 flex flex-col gap-1">
                          <h1>{activity.title}</h1>
                          <CardDescription>
                            {activity.description}
                          </CardDescription>
                          <Badge
                            className={`${
                              isOverdue ? "text-red-500" : "text-white"
                            } bg-emerald-900`}
                          >
                            {activity.due_date.split("T")[0]}
                          </Badge>
                          <Badge className="bg-emerald-800">
                            {activity.type}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <p className="text-sm">{}</p>
                          </div>
                        </CardContent>
                        <CardContent className="flex flex-col gap-1">
                          <Button
                            className={`${
                              isOverdue
                                ? "bg-gray-700"
                                : "bg-emerald-500 cursor-pointer"
                            } `}
                            disabled={isOverdue}
                          >
                            Realizar atividade
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                );
              })
            ) : (
              <p className="text-white">Nenhuma atividade pendente</p>
            )}
          </div>
        </section>
      </main>
    </SidebarProvider>
  );
};
