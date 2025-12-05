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
import { Button } from "@/components/ui/button";

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
  const [classList, setClassList] = useState<Activity[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  useEffect(() => {
    const fetchMyActivities = async () => {
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
          const classesData = responses.map((response) => response.data);
          setClassList(classesData);
          setFilteredClasses(classesData);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchMyActivities();
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const results = classList?.filter(
      (act) =>
        act.id.toString() ||
        act.title.toLowerCase() ||
        act.description.toLowerCase() ||
        act.type.toLowerCase()
    );
    setFilteredClasses(results);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <SidebarProvider>
      <AppSidebar profile="Aluno" />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-start gap-3 p-5">
        <SidebarTrigger className="hidden" />

        <section id="header" className="w-full">
          <div className="w-full m-5">
            <div className="flex flex-col start">
              <p className="text-2xl text-emerald-400 font-bold">
                Minhas atividades
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
                      <TableHead className="text-emerald-400">
                        ID da Atividade
                      </TableHead>
                      <TableHead className="text-emerald-400">
                        ID da Turma
                      </TableHead>
                      <TableHead className="text-emerald-400">Título</TableHead>
                      <TableHead className="text-emerald-400">
                        Descrição
                      </TableHead>
                      <TableHead className="text-emerald-400">
                        Expira em
                      </TableHead>
                      <TableHead className="text-emerald-400">Tipo</TableHead>
                      <TableHead className="text-emerald-400">
                        Nota máxima
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((act) => (
                      <TableRow
                        key={act.id}
                        className="text-white hover:bg-gray-700"
                      >
                        {/* ID da atividade */}
                        <TableCell>{act.id}</TableCell>

                        {/* ID da turma */}
                        <TableCell>{act.id_class}</TableCell>

                        {/* Título da atividade */}
                        <TableCell>{act.title}</TableCell>

                        {/* Descrição da atividade */}
                        <TableCell>{act.description}</TableCell>

                        {/* Data de expiração */}
                        <TableCell
                          className={
                            act.due_date < today
                              ? "text-red-500"
                              : "text-emerald-400"
                          }
                        >
                          {act.due_date.split("T")[0]}
                        </TableCell>

                        {/* Tipo da atividade */}
                        <TableCell>
                          <Badge className="bg-emerald-600">{act.type}</Badge>
                        </TableCell>

                        {/* Nota máxima da atividade */}
                        <TableCell>{act.max_grade}</TableCell>

                        {/* Realizar atividade */}
                        <TableCell>
                          <Button
                            className="cursor-pointer bg-emerald-800"
                            disabled={act.due_date < today}
                          >
                            Realizar atividade
                          </Button>
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
