import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { io } from "socket.io-client";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { FetchUserData } from "@/utils/FetchUserData";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { useQuickMessage } from "@/components/quickmessage";

const profileColors: Record<string, string> = {
  ADMIN: "bg-red-500",
  TEACHER: "bg-blue-500",
  STUDENT: "bg-indigo-500",
};

export const Me = () => {
  const { Toast, showMessage } = useQuickMessage();
  const [userProfiles, setUserProfiles] = useState<string[]>([]);
  const [prevName, setPrevName] = useState("");
  const [newName, setNewName] = useState("");
  const [prevEmail, setPrevEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const socket = io("http://localhost:8080");
  useEffect(() => {
    async function fetchUser() {
      const res = await FetchUserData();
      socket.emit(`teacher:join`, res.id, res.name);
      setPrevName(res.name);
      setPrevEmail(res.email);
      setNewName(res.name);
      setNewEmail(res.email);
      setUserProfiles(res.profiles);

      socket.on("class:full", (data) => {
        console.log("Turma cheia:", data);
        alert(
          `Turma ${data.id_class} está cheia. Um aluno teve matrícula recusada. Avalie aumentar o limite.`
        );
      });
    }
    fetchUser();
  }, []);

  useEffect(() => {
    console.log(userProfiles);
  }, [userProfiles]);

  function handleUpdate(e: any) {
    e.preventDefault();
    if (newName == prevName && newEmail == prevEmail) {
      showMessage("Nada a ser atualizado");
      return;
    }
    axios
      .put(
        "http://localhost:8080/api/me",
        {
          name: newName,
          email: newEmail,
          ...(newPassword ? { password: newPassword } : {}),
        },
        { withCredentials: true }
      )
      .then((res) => {
        console.log(res);
        window.location.reload();
      });
  }

  return (
    <SidebarProvider className="flex ">
      <AppSidebar />
      <main className="p-2 w-full ">
        <SidebarTrigger />
        {Toast}
        <div className="container w-full flex items-center justify-center">
          <Card className="w-100">
            <CardHeader className="text-center text-indigo-500 font-bold text-xl">
              <h1>Informações sobre mim</h1>
            </CardHeader>
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => handleUpdate(e)}
            >
              <CardContent>
                <Label htmlFor="name" className="m-2 text-indigo-500">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={prevName}
                  value={newName}
                  disabled={!isEditing}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </CardContent>
              <CardContent>
                <Label htmlFor="name" className="m-2 text-indigo-500">
                  Email
                </Label>
                <Input
                  id="name"
                  type="email"
                  disabled={!isEditing}
                  placeholder={prevEmail}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </CardContent>
              <CardContent>
                <Label htmlFor="name" className="m-2 text-indigo-500">
                  Senha
                </Label>
                <Input
                  id="name"
                  type="password"
                  placeholder="•••••••••••••••"
                  disabled={!isEditing}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </CardContent>
              <CardContent className="flex flex-col gap-2">
                {userProfiles.map((profile, key) => (
                  <Badge
                    key={key}
                    className={`cursor-pointer text-white p-2 rounded ${
                      profileColors[profile] || "bg-indigo-500"
                    } w-full rounded-2xl`}
                  >
                    {profile}
                  </Badge>
                ))}
              </CardContent>
              <CardContent>
                {isEditing && (
                  <Button className="w-full bg-green-700 cursor-pointer p-6">
                    Aplicar alterações
                  </Button>
                )}
              </CardContent>
            </form>

            <CardFooter>
              <div className="w-full gap-5 flex flex-col">
                <Button
                  className="w-full bg-indigo-500 cursor-pointer p-6"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  Editar perfil
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </SidebarProvider>
  );
};
