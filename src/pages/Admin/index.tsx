import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SiGoogleanalytics } from "react-icons/si";
import axios from "axios";
import { useEffect, useState } from "react";
import { ApiURL } from "@/utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { CreateUserModal } from "./components/CreateUserModal";
import { CreateCourseModal } from "./components/CreateCourseModal";
import { CreateClassModal } from "./components/CreateClassModal";

// Tipos de resposta
// Professor com mais turmas ativas
type TopTeacher = {
  teacher_id: number;
  teacher_name: string;
  active_classes: number;
};

// Aluno com mais cursos
type TopStudent = {
  user_id: number;
  user_name: string;
  email: string;
  approved_courses: number;
};

// Três turmas com desempenho médio
type TopClass = {
  class_id: number;
  class_name: string;
  average_grade: string;
};

export const Admin = () => {
  // Analytics dos cursos
  const [topTeacher, setTopTeacher] = useState<TopTeacher>();
  const [topThreeClasses, setTopThreeClasses] = useState<TopClass[]>();
  const [topStudent, setTopStudent] = useState<TopStudent>();
  const [studentsQuantity, setStudentsQuantity] = useState();

  // Pegar os analytics do backend
  useEffect(() => {
    async function fetchData() {
      try {
        const [teacherRes, classesRes, studentRes, activeStudents] =
          await Promise.all([
            axios.get<TopTeacher>(`${ApiURL}/api/users/topTeacher`, {
              withCredentials: true,
            }),
            axios.get<TopClass[]>(`${ApiURL}/api/classes/topClasses`, {
              withCredentials: true,
            }),
            axios.get<TopStudent>(`${ApiURL}/api/users/topStudent`, {
              withCredentials: true,
            }),
            axios.get(`${ApiURL}/api/enrolments`, {
              withCredentials: true,
            }),
          ]);

        setTopTeacher(teacherRes.data);
        setTopThreeClasses(classesRes.data);
        setTopStudent(studentRes.data);
        setStudentsQuantity(activeStudents.data.length);
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar profile="Administrador" />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-center gap-4">
        <SidebarTrigger className="hidden" />

        <section id="header">
          <div className="container w-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <p className="text-2xl text-emerald-400 font-bold">
                Bem vindo ao sistema de gestão acadêmica
              </p>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section
          id="analytics"
          className="flex items-center justify-center gap-2"
        >
          <div className="flex flex-col gap-2 md:flex-row md:w-300 md:flex-wrap md:justify-center">
            <div className="flex flex-col gap-2">
              {/* Quantidade de alunos com matrículas ativas */}
              <Card className="w-100 bg-gray-900">
                <CardContent className="flex flex-col gap-2">
                  <SiGoogleanalytics className="text-4xl bg-emerald-400 p-2 rounded-md text-white" />
                  <CardTitle className="flex flex-col items-start gap-2">
                    <h1 className="text-md text-emerald-400">
                      Quantidade de alunos ativos
                    </h1>
                    <h1 className="text-2xl text-white">
                      {studentsQuantity
                        ? studentsQuantity
                        : "Nenhum usuário carregado..."}
                    </h1>
                  </CardTitle>
                </CardContent>
              </Card>

              {/* Professor com mais turmas */}
              <Card className="w-100 bg-gray-900">
                <CardContent className="flex flex-col gap-2">
                  <SiGoogleanalytics className="text-4xl bg-emerald-400 p-2 rounded-md text-white" />
                  <CardTitle className="flex flex-col items-start gap-2">
                    <h1 className="text-md text-emerald-400">
                      Professor com mais turmas ativas
                    </h1>
                    <h1 className="text-xl text-white">
                      {topTeacher?.teacher_name || "Carregando..."}
                    </h1>
                    <p className="text-neutral-500">
                      Turmas: {topTeacher?.active_classes || "Carregando..."}
                    </p>
                  </CardTitle>
                </CardContent>
              </Card>

              {/* Aluno com mais cursos */}
              <Card className="w-100 bg-gray-900">
                <CardContent className="flex flex-col gap-2">
                  <SiGoogleanalytics className="text-4xl bg-emerald-400 p-2 rounded-md text-white" />
                  <CardTitle className="flex flex-col items-start gap-2">
                    <h1 className="text-md text-emerald-400">
                      Aluno com mais cursos
                    </h1>
                    <h1 className="text-xl text-white">
                      {topStudent?.user_name || "Carregando..."}
                    </h1>
                    <p className="text-neutral-500">
                      Cursos: {topStudent?.approved_courses || "Carregando..."}
                    </p>
                  </CardTitle>
                </CardContent>
              </Card>
            </div>

            {/* Três turmas com melhor desempenho médio */}
            <Card className="w-100 bg-gray-900">
              <CardContent className="flex flex-col gap-2">
                <SiGoogleanalytics className="text-4xl bg-emerald-400 p-2 rounded-md text-white" />
                <CardTitle className="flex flex-col items-start gap-5">
                  <h1 className="text-md text-neutral-400">
                    Três turmas com desempenho médio
                  </h1>
                  <div className="w-full flex flex-col gap-2">
                    {topThreeClasses?.map((c) => (
                      <Card
                        className="w-full cursor-pointer hover:bg-gray-700 bg-gray-900"
                        key={c.class_id}
                      >
                        <CardContent>
                          <CardTitle className="text-emerald-400">
                            {c.class_name}
                          </CardTitle>
                          <CardDescription>
                            Média:{" "}
                            <span className="text-emerald-600">
                              {c.average_grade}
                            </span>
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardTitle>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Ações rápidas */}
        <section id="quick-actions">
          <div className="flex w-full items-center justify-center">
            <Card className="w-100 md:w-202 bg-gray-900">
              <CardContent className="flex flex-col items-center gap-2 ">
                {/* Criar usuário */}
                <Card className="cursor-pointer hover:bg-gray-700 bg-gray-900 w-full">
                  <CreateUserModal
                    trigger={
                      <CardContent>
                        <CardTitle className="text-md text-white">
                          Cadastrar novo usuário
                        </CardTitle>
                        <CardDescription>
                          Criar um administrador, professor ou aluno
                        </CardDescription>
                      </CardContent>
                    }
                  />
                </Card>

                {/* Criar curso */}
                <Card className="cursor-pointer hover:bg-gray-700 bg-gray-900 w-full">
                  <CreateCourseModal
                    trigger={
                      <CardContent>
                        <CardTitle className="text-md text-white">
                          Criar novo curso
                        </CardTitle>
                        <CardDescription>
                          Definir um curso e suas propriedades
                        </CardDescription>
                      </CardContent>
                    }
                  />
                </Card>

                {/* Criar turma */}
                <Card className="cursor-pointer hover:bg-gray-700 bg-gray-900 w-full">
                  <CreateClassModal
                    trigger={
                      <CardContent>
                        <CardTitle className="text-md text-white">
                          Abrir nova turma
                        </CardTitle>
                        <CardDescription>
                          Criar turma e associar professor
                        </CardDescription>
                      </CardContent>
                    }
                  />
                </Card>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </SidebarProvider>
  );
};
