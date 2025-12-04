import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuickMessage } from "@/hooks/useQuickMessage";
import axios from "axios";
import { useState } from "react";

export const Login = () => {
  // Notificação rápida
  const { Toast, showMessage } = useQuickMessage();

  // Dados de login
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Função de login
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email && !password) {
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/auth/login",
        { email, password },
        { withCredentials: true }
      );
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 404:
            showMessage("Usuário não encontrado");
            break;
          case 401:
            showMessage("Senha inválida");
            break;
          case 409:
            showMessage("Sessão já iniciada");
            break;
          case 403:
            break;
        }
      }
    }
  }

  return (
    <div className="container w-full h-dvh flex items-center justify-center">
      {/* Notificação */}
      <Toast />
      <Card className="w-100 flex items-center justify-center">
        <CardHeader className="w-full flex justify-center flex-col items-center text-center">
          <CardTitle className="text-emerald-400 font-bold text-xl">
            Inicie sessão
          </CardTitle>
          <CardDescription>
            Ao iniciar a sessão, você será redirecionado para a seleção de
            perfis
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => handleLogin(e)}
          >
            <div className="flex flex-col w-full p-1 gap-1">
              <Label
                className="text-emerald-400 font-bold text-lg"
                htmlFor="email"
              >
                Email
              </Label>
              <Input
                className="w-full"
                placeholder="seunome@uni.com"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col w-full p-1 gap-1">
              <Label
                className="text-emerald-400 font-bold text-lg"
                htmlFor="password"
              >
                Senha
              </Label>
              <Input
                className="w-full"
                placeholder="•••••••••••••••••"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              className="bg-emerald-400 cursor-pointer w-full"
              type="submit"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
