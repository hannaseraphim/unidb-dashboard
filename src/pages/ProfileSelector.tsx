import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

// Descrições de cada tipo de peril
const profileDescriptions: Record<string, string> = {
  Administrador: "Gerenciar usuários, cursos e turmas",
  Professor: "Lecionar turmas e avaliar alunos",
  Aluno: "Acessar materiais e realizar atividades",
};

// URLs dinâmicas
const profileURLs: Record<string, string> = {
  Administrador: "admin",
  Professor: "professor",
  Aluno: "aluno",
};

export const ProfileSelector = () => {
  // Perfis do usuário
  const [profiles, setProfiles] = useState<string[]>([]);

  // Função de navegação (mudança de rotas)
  const navigate = useNavigate();

  // Função que roda toda vez que o componente é carregado
  useEffect(() => {
    async function getUserProfiles() {
      const res = await axios.get("http://localhost:8080/api/me", {
        withCredentials: true,
      });
      setProfiles(res.data.profiles);
    }

    getUserProfiles();
  }, []);

  return (
    <div className="container w-full h-dvh flex items-center justify-center bg-gray-800">
      <div className="flex flex-col gap-10 items-center">
        <div className="flex flex-col items-center">
          <h1 className="text-xl text-emerald-400 font-bold">
            Selecione um perfil
          </h1>
          <h2 className="text-neutral-400">
            Escolha como deseja usar o sistema
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {profiles.map((p) => (
            <Card
              className="w-100 flex items-center justify-center bg-gray-900"
              key={p}
            >
              <CardHeader className="w-full flex justify-center flex-col items-center text-center ">
                <CardTitle className="text-emerald-400 font-bold text-xl">
                  {p}
                </CardTitle>
                <CardDescription>{profileDescriptions[p]}</CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                <Button
                  className="w-full bg-transparent border border-emerald-400  p-6 text-emerald-400 hover:bg-emerald-400 hover:text-white cursor-pointer"
                  onClick={() => navigate(`/${profileURLs[p]}`)}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
