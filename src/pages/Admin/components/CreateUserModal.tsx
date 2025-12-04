import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { BookOpen, GraduationCap, Shield } from "lucide-react";
import axios from "axios";
import { ApiURL } from "@/utils/api";
import { useQuickMessage } from "@/hooks/useQuickMessage";

interface CreateUserModalProps {
  className?: string;
  trigger: React.ReactNode;
}

// Tipos
// Usuário
type User = {
  id: number;
  name: string;
  email: string;
  password?: string;
  profiles: number[];
};

// Tipos de perfil
const availableProfiles = [
  { id: 1, name: "Administrador" },
  { id: 2, name: "Professor" },
  { id: 3, name: "Aluno" },
];

// Pegar icone dinamicamente
const getRoleIcon = (role: string) => {
  switch (role) {
    case "Administrador":
      return <Shield className="h-3 w-3" />;
    case "Professor":
      return <BookOpen className="h-3 w-3" />;
    case "Aluno":
      return <GraduationCap className="h-3 w-3" />;
    default:
      return null;
  }
};

// Pegar variante dinamicamente
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "Administrador":
      return "default";
    case "Professor":
      return "secondary";
    case "Aluno":
      return "outline";
    default:
      return "outline";
  }
};

export const CreateUserModal = ({
  className,
  trigger,
}: CreateUserModalProps) => {
  const { showMessage, Toast } = useQuickMessage();
  const [newUser, setNewUser] = useState<User>({
    id: 0,
    name: "",
    email: "",
    password: "",
    profiles: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.password ||
      !newUser.profiles.length
    ) {
      showMessage("Campos vazios", "error");
      return;
    }

    await axios
      .post(`${ApiURL}/api/users`, newUser, { withCredentials: true })
      .then(() => {
        showMessage(
          "Usuário criado com sucesso. A página será atualizada em 3 segundos"
        );
        setTimeout(() => window.location.reload(), 3000);
      });
  };

  return (
    <>
      <Toast />
      <Dialog>
        <form>
          <DialogTrigger asChild className={className}>
            {trigger}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar usuário</DialogTitle>
              <DialogDescription>
                Digite as informações do usuário que você deseja criar
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Nome</Label>
                <Input
                  id="name-1"
                  name="name"
                  placeholder="Nome"
                  type="text"
                  value={newUser?.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser!, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="nome@uni.com"
                  type="email"
                  value={newUser?.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser!, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••••••••••"
                  type="password"
                  value={newUser?.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser!, password: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Perfis</Label>
                <div className="flex gap-2">
                  {availableProfiles.map((p) => (
                    <Badge
                      variant={getRoleBadgeVariant(p.name)}
                      onClick={() =>
                        setNewUser(
                          (prev) =>
                            prev
                              ? {
                                  ...prev,
                                  profiles: prev.profiles.includes(p.id)
                                    ? prev.profiles.filter((id) => id !== p.id) // remove se já existe
                                    : [...prev.profiles, p.id], // adiciona se não existe
                                }
                              : { id: 0, name: "", email: "", profiles: [p.id] } // cria novo se estava undefined
                        )
                      }
                      className={`${
                        newUser?.profiles.includes(p.id)
                          ? "bg-emerald-400 text-black"
                          : ""
                      } cursor-pointer transition-all`}
                    >
                      {getRoleIcon(p.name)}
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="cursor-pointer">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-emerald-500 cursor-pointer"
                onClick={(e) => handleSubmit(e)}
              >
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};
