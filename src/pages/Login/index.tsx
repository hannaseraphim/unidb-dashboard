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

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [activeMessage, setActiveMessage] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setActiveMessage(true);
    setTimeout(() => {
      setActiveMessage(false);
    }, 3000);
  };

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
      {redirect && <Navigate to="/" />}
      <div
        className={`max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-neutral-800 dark:border-neutral-700 absolute ${
          activeMessage ? "top-2" : "-top-20"
        } transition-all`}
        role="alert"
        tabIndex={-1}
        aria-labelledby="hs-toast-normal-example-label"
      >
        <div className="flex p-4">
          <div className="shrink-0">
            <svg
              className="shrink-0 size-4 text-blue-500 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path>
            </svg>
          </div>
          <div className="ms-3">
            <p
              id="hs-toast-normal-example-label"
              className="text-sm text-gray-700 dark:text-neutral-400"
            >
              {message}
            </p>
          </div>
        </div>
      </div>
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
            <Button type="submit" className="w-full bg-indigo-500">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
