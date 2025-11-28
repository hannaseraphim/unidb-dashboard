import { AppSidebar } from "@/components/app-sidebar";
import { useQuickMessage } from "@/components/quickmessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Material } from "@/interfaces";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const Contador = () => {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (count === 0) navigate("/materials"); // volta para lista de materiais

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, navigate]);

  return <h1>Voltando em {count}s</h1>;
};

const MaterialField = ({
  label,
  value,
  onChange,
  type = "text",
  isEditing,
}: {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  isEditing: boolean;
}) => (
  <div className="flex flex-col gap-1">
    {isEditing ? (
      <div className="flex flex-col w-full gap-1">
        <Label
          htmlFor={label}
          className="m-1 text-indigo-500 font-bold text-xl"
        >
          {label}:
        </Label>
        <Input
          id={label}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          className="w-full"
        />
      </div>
    ) : (
      <h1
        className={`${
          type === "date"
            ? "text-xl text-gray-400"
            : "text-4xl text-indigo-500 font-bold"
        }`}
      >
        {value}
      </h1>
    )}
  </div>
);

// Componente final
export const MaterialId = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState<Material | null>(null);
  const [updatedMaterial, setUpdatedMaterial] = useState<Material>();
  const [isEditing, setIsEditing] = useState(false);
  // const navigate = useNavigate();

  const { Toast, showMessage } = useQuickMessage();

  useEffect(() => {
    async function fetchMaterial() {
      try {
        const res = await axios.get<Material>(
          `http://localhost:8080/api/materials/${id}`,
          { withCredentials: true }
        );

        // formatar data para YYYY-MM-DD
        const formattedDate = res.data.posted_at.split("T")[0];

        setMaterial(res.data);
        setUpdatedMaterial({
          ...res.data,
          posted_at: formattedDate,
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchMaterial();
  }, [id]);

  // 🔁 Atualizar material
  async function handleUpdateMaterial() {
    try {
      await axios.put(
        `http://localhost:8080/api/materials/${material!.id}`,
        updatedMaterial,
        { withCredentials: true }
      );
      showMessage("Material atualizado com sucesso");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showMessage("Erro ao atualizar material");
    }
  }

  // 🗑️ Deletar material
  async function handleDeleteMaterial() {
    try {
      await axios.delete(
        `http://localhost:8080/api/materials/${material?.id}`,
        {
          withCredentials: true,
        }
      );
      showMessage("Material deletado com sucesso");
      setMaterial(null);
    } catch (error) {
      console.log(error);
      showMessage("Ocorreu um erro ao deletar o material");
    }
  }

  return (
    <SidebarProvider className="flex z-50">
      <AppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />
        {Toast}

        {material ? (
          <div className="p-5 flex flex-col gap-5">
            <MaterialField
              label="Título"
              value={updatedMaterial?.title ?? ""}
              onChange={(e) =>
                setUpdatedMaterial({
                  ...updatedMaterial!,
                  title: e.target.value,
                })
              }
              isEditing={isEditing}
            />
            <MaterialField
              label="Descrição"
              value={updatedMaterial?.description ?? ""}
              onChange={(e) =>
                setUpdatedMaterial({
                  ...updatedMaterial!,
                  description: e.target.value,
                })
              }
              isEditing={isEditing}
            />
            <MaterialField
              label="Data de postagem"
              value={updatedMaterial?.posted_at ?? ""}
              onChange={(e) =>
                setUpdatedMaterial({
                  ...updatedMaterial!,
                  posted_at: e.target.value,
                })
              }
              type="date"
              isEditing={isEditing}
            />

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    className="bg-indigo-500 text-white"
                    onClick={handleUpdateMaterial}
                  >
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="bg-indigo-500 text-white"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteMaterial}>
                    Deletar
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <Contador />
        )}
      </main>
    </SidebarProvider>
  );
};
