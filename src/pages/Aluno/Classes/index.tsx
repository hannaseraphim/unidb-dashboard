import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import axios from "axios";
import { ApiURL } from "@/utils/api";
import { Badge } from "@/components/ui/badge";
import { HiUsers } from "react-icons/hi2";

type Class = {
  id: number;
  name: string;
  starts_on: string;
  ends_on: string;
  period: string;
  max_students: number;
  archived: number;
  course: {
    id: number;
    name: string;
  };
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  students: [
    {
      id: number;
      name: string;
      email: string;
      average_grade: string;
      status: string;
    }
  ];
  student_count: number;
};

export const StudentClasses = () => {
  const [user, setUser] = useState<PersonalUser | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  useEffect(() => {
    const fetchMyClasses = async () => {
      if (user) {
        try {
          const requests = user.enrolments.map((enrolment) =>
            axios.get<Class>(`${ApiURL}/api/classes/${enrolment.classId}`, {
              withCredentials: true,
            })
          );

          const responses = await Promise.all(requests);
          const classesData = responses.map((response) => response.data);
          setClasses(classesData);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchMyClasses();
  }, [user]);

  return (
    <SidebarProvider>
      <AppSidebar profile="Aluno" />
      <main className="w-full bg-gray-800 flex flex-col items-start justify-start gap-4 p-5">
        <SidebarTrigger className="hidden" />

        <section id="header">
          <div className="w-full m-5">
            <div className="flex flex-col start">
              <p className="text-2xl text-emerald-400 font-bold">
                Minhas turmas
              </p>
            </div>
          </div>
        </section>

        <section
          id="content"
          className="w-full flex items-center justify-center"
        >
          <div className="container w-full flex flex-col items-center justify-center gap-4">
            {classes.map((cls) => (
              <Card className="w-full bg-gray-900" key={cls.id}>
                <div className="flex justify-between items-center">
                  <CardContent className="text-xl text-emerald-400 flex flex-col gap-1">
                    <h1>{cls.name}</h1>
                    <CardDescription>
                      Curso de {cls.course.name} - {cls.period}
                    </CardDescription>
                    <Badge className="bg-emerald-800">
                      Professor {cls.teacher.name}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{cls.student_count}</p>
                      <HiUsers size={15}></HiUsers>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </SidebarProvider>
  );
};
