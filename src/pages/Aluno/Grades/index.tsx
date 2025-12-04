import { AppSidebar } from "@/components/SideBar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import { useEffect, useState } from "react";

export const Grades = () => {
  const [user, setUser] = useState<PersonalUser | null>(null);

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar profile="Aluno" />
      <main className="w-full bg-gray-800 flex flex-col items-start justify-start gap-4 p-5">
        <SidebarTrigger className="hidden" />

        <section id="header">
          <div className="w-full m-5">
            <div className="flex flex-col start">
              <p className="text-2xl text-emerald-400 font-bold">
                Minhas notas
              </p>
            </div>
          </div>
        </section>

        <section id="content" className="w-full flex items-start justify-start">
          <div className="container flex flex-wrap items-start justify-evenly gap-4">
            {user?.grades.map((grade) => (
              <div
                className="container w-full flex flex-wrap items-start justify-evenly gap-4"
                key={grade.activityId}
              >
                <Card className="bg-gray-900">
                  <CardContent className="text-xl text-emerald-400 flex flex-col gap-3">
                    <h1>{grade.activityTitle}</h1>
                    <Badge className="bg-emerald-800">
                      Nota: {grade.grade}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SidebarProvider>
  );
};
