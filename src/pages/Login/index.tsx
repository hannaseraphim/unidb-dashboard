import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { Navigate } from "react-router";
import { useQuickMessage } from "../../components/quickmessage";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);

  const { showMessage, Toast } = useQuickMessage();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:8080/auth/login",
        { email, password },
        { withCredentials: true }
      );

      setRedirect(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          showMessage("Ocorreu um erro interno, tente novamente mais tarde");
        }
        switch (err.response!.status) {
          case 404:
            showMessage("Usuário não encontrado");
            break;
          case 401:
            showMessage("Email ou senha inválidos");
            break;
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {Toast}
      {redirect && <Navigate to="/" />}
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Iniciar sessão</CardTitle>
          <CardDescription>
            Entre com seu email e senha para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(e) => handleLogin(e)}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seunome@uni.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full hover:bg-indigo-500 cursor-pointer"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
