/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppSidebar } from "@/components/SideBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import { ApiURL } from "@/utils/api";
import axios from "axios";
import { useEffect, useState } from "react";

// Tipo para materiais de turma
type Material = {
  id: number;
  title: string;
  description: string;
  posted_at: string;
  class_name: string;
  course_name: string;
};

export const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserData();

      if (data?.enrolments?.length) {
        // dispara todas as requisições de materiais em paralelo
        const materialResponses = await Promise.all(
          data.enrolments.map((enrol) =>
            axios.get(`${ApiURL}/api/materials/class/${enrol.classId}`, {
              withCredentials: true,
            })
          )
        );

        // junta todos os materiais em um único array
        const allMaterials: Material[] = materialResponses.flatMap(
          (res) => res.data
        );

        setMaterials(allMaterials);
        setFilteredMaterials(allMaterials);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    setFilteredMaterials(
      materials.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
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
                Materiais de turma
              </p>
            </div>
          </div>
        </section>

        <section id="search-bar" className="w-full pl-5 pr-5">
          <Card className="bg-gray-800">
            <CardContent>
              <Input
                placeholder="Buscar por título ou descrição"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-gray-700 text-white"
              />
            </CardContent>
          </Card>
        </section>

        {/* Tabela de Materiais */}
        <section
          id="materials"
          className="w-full flex items-center justify-center"
        >
          <div className="w-full flex flex-wrap items-center justify-start gap-4 mr-5 ml-5">
            {filteredMaterials.map((m) => (
              <Card className="bg-gray-900 w-100 flex items-center" key={m.id}>
                <CardContent>
                  <CardTitle className="flex flex-col gap-2">
                    <h1 className="text-xl text-white">{m.title}</h1>
                    <Badge className="w-full bg-emerald-700">
                      {m.class_name}
                    </Badge>
                  </CardTitle>
                </CardContent>
                <CardContent className="text-white flex flex-col gap-2">
                  {m.description}
                  <Button className="bg-emerald-700 font-bold cursor-pointer hover:bg-emerald-500">
                    Link
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </SidebarProvider>
  );
};
