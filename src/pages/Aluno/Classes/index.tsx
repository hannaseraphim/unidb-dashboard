import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { ApiURL } from "@/utils/api";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

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
  const [classList, setClassList] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
          setClassList(classesData);
          setFilteredClasses(classesData);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchMyClasses();
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const results = classList?.filter(
      (cls) =>
        cls.name.toLowerCase().includes(query.toLowerCase()) ||
        cls.id.toString().includes(query.toLowerCase()) ||
        cls.period.toLowerCase().includes(query.toLowerCase()) ||
        cls.max_students.toString().includes(query.toLowerCase()) ||
        cls.teacher.name.toLowerCase().includes(query.toLowerCase()) ||
        cls.archived.toString().includes(query.toLowerCase())
    );
    setFilteredClasses(results);
  };

  return (
    <SidebarProvider>
      <AppSidebar profile="Aluno" />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-start gap-3 p-5">
        <SidebarTrigger className="hidden" />

        <section id="header" className="w-full">
          <div className="w-full m-5">
            <div className="flex flex-col start">
              <p className="text-2xl text-emerald-400 font-bold">
                Minhas turmas
              </p>
            </div>
          </div>
        </section>

        <section id="search-bar" className="w-full pl-5 pr-5">
          <Card className="bg-gray-800">
            <CardContent>
              <Input
                placeholder="Buscar turmas"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-gray-700 text-white"
              />
            </CardContent>
          </Card>
        </section>

        <section
          id="content"
          className="w-full flex items-center justify-center"
        >
          <div className="container w-full flex flex-col items-center justify-center gap-4">
            <Card className="w-full bg-gray-800">
              <CardContent className="overflow-auto max-h-160">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-emerald-400">ID</TableHead>
                      <TableHead className="text-emerald-400">Nome</TableHead>
                      <TableHead className="text-emerald-400">Início</TableHead>
                      <TableHead className="text-emerald-400">Fim</TableHead>
                      <TableHead className="text-emerald-400">
                        Período
                      </TableHead>
                      <TableHead className="text-emerald-400">
                        Máx. de Alunos
                      </TableHead>
                      <TableHead className="text-emerald-400">
                        Alunos atuais
                      </TableHead>
                      <TableHead className="text-emerald-400">
                        Professor
                      </TableHead>
                      <TableHead className="text-emerald-400">
                        Atividade
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((cls) => (
                      <TableRow
                        key={cls.id}
                        className="text-white hover:bg-gray-700"
                      >
                        {/* ID */}
                        <TableCell>{cls.id}</TableCell>

                        {/* Nome */}
                        <TableCell className="w-70">{cls.name}</TableCell>

                        {/* Início */}
                        <TableCell>{cls.starts_on.split("T")[0]}</TableCell>

                        {/* Fim */}
                        <TableCell>{cls.ends_on.split("T")[0]}</TableCell>

                        {/* Período */}
                        <TableCell className="w-70">{cls.period}</TableCell>

                        {/* Máx. de alunos */}
                        <TableCell>{cls.max_students}</TableCell>

                        {/* Quantidade de alunos */}
                        <TableCell>{cls.student_count}</TableCell>

                        {/* Professor */}
                        <TableCell className="w-70">
                          {cls.teacher?.name}
                        </TableCell>

                        {/* Estado da turma */}
                        <TableCell>
                          {cls.archived === 1 ? (
                            <Badge variant="destructive">Arquivada</Badge>
                          ) : (
                            <Badge variant="default" className="bg-emerald-400">
                              Ativa
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </SidebarProvider>
  );
};
