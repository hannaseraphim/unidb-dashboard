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
import { useState } from "react";
import axios from "axios";
import { ApiURL } from "@/utils/api";
import { useQuickMessage } from "@/hooks/useQuickMessage";

// Tipos
type Class = {
  id: number;
  name: string;
  schedule: string;
};

type Course = {
  id: number;
  name: string;
  description: string;
  max_students: number;
  classes: Class[];
};

interface CreateCourseModalProps {
  className?: string;
  trigger: React.ReactNode;
}

export const CreateCourseModal = ({
  className,
  trigger,
}: CreateCourseModalProps) => {
  const { showMessage, Toast } = useQuickMessage();
  const [newCourse, setNewCourse] = useState<Course>({
    id: 0,
    name: "",
    description: "",
    max_students: 0,
    classes: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.description || !newCourse.max_students) {
      showMessage("Campos vazios", "error");
      return;
    }

    await axios
      .post(`${ApiURL}/api/courses`, newCourse, { withCredentials: true })
      .then(() => {
        showMessage(
          "Curso criado com sucesso. A página será atualizada em 3 segundos"
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
              <DialogTitle>Criar curso</DialogTitle>
              <DialogDescription>
                Digite as informações do curso que você deseja criar
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name">Nome do curso</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Matemática Básica"
                  type="text"
                  value={newCourse.name}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Breve descrição do curso"
                  type="text"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="max_students">Número máximo de alunos</Label>
                <Input
                  id="max_students"
                  name="max_students"
                  placeholder="Ex: 30"
                  min={0}
                  max={45}
                  type="number"
                  value={newCourse.max_students}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      max_students: Number(e.target.value),
                    })
                  }
                />
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
