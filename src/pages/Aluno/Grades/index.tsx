/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppSidebar } from "@/components/SideBar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import { useEffect, useState } from "react";

// Tipo para grade já no formato retornado
type Grade = {
  activityId: number;
  activityTitle: string;
  grade: string;
};

export const Grades = () => {
  const [user, setUser] = useState<PersonalUser | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    getUserData().then((data) => {
      setUser(data);
      // supondo que data.grades seja o array de notas
      if (data?.grades) {
        setGrades(data.grades);
        setFilteredGrades(data.grades);
      }
    });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    setFilteredGrades(
      grades.filter(
        (g) =>
          g.activityTitle.toLowerCase().includes(query) ||
          g.grade.toLowerCase().includes(query)
      )
    );
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
                Minhas notas
              </p>
            </div>
          </div>
        </section>

        <section id="search-bar" className="w-full pl-5 pr-5">
          <Card className="bg-gray-800">
            <CardContent>
              <Input
                placeholder="Buscar por atividade ou nota"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-gray-700 text-white"
              />
            </CardContent>
          </Card>
        </section>

        {/* Tabela de Notas */}
        <section
          id="grades"
          className="w-full flex items-center justify-center"
        >
          <div className="container w-full flex flex-col items-center justify-center gap-4 mr-5 ml-5">
            <Card className="w-full bg-gray-800">
              <CardContent className="overflow-auto max-h-160">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-emerald-400">
                        Atividade
                      </TableHead>
                      <TableHead className="text-emerald-400">Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((g) => (
                      <TableRow
                        key={g.activityId}
                        className="text-white hover:bg-gray-700"
                      >
                        <TableCell>{g.activityTitle}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              Number(g.grade) > 5 ? "bg-blue-500" : "bg-red-500"
                            }
                          >
                            {g.grade}
                          </Badge>
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
