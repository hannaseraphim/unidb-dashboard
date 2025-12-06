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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { ApiURL } from "@/utils/api";
import { useQuickMessage } from "@/hooks/useQuickMessage";
import { Textarea } from "@/components/ui/textarea";

interface CreateSubmissionModalProps {
  trigger: React.ReactNode;
  activity: {
    title: string;
    id: number;
    classId: number;
  };
  userId: string;
}

export const CreateSubmissionModal = ({
  trigger,
  activity,
  userId,
}: CreateSubmissionModalProps) => {
  const { showMessage, Toast } = useQuickMessage();
  const [newSubmission, setNewSubmission] = useState({
    id_student: userId,
    id_activity: activity.id,
    id_class: activity.classId,
    content: "",
  });

  const handleSubmit = async () => {
    if (!newSubmission.content) {
      showMessage("Preencha o conteúdo da atividade", "error");
      return;
    }

    await axios
      .post(`${ApiURL}/api/submissions`, newSubmission, {
        withCredentials: true,
      })
      .then(() => {
        showMessage(
          "Atividade enviada com sucesso. A página será atualizada em 3 segundos"
        );
        setTimeout(() => window.location.reload(), 3000);
      });
  };

  return (
    <>
      <Toast />
      <Dialog>
        <form onSubmit={handleSubmit}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Realizar atividade</DialogTitle>
              <DialogDescription>{activity.title}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              {/* Nome */}
              <div className="grid gap-2">
                <Label htmlFor="name">Atividade</Label>
                <Textarea
                  placeholder="Digite o conteúdo da sua atividade"
                  value={newSubmission.content}
                  onChange={(e) =>
                    setNewSubmission({
                      ...newSubmission,
                      content: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-emerald-500 cursor-pointer"
                onClick={() => handleSubmit()}
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
