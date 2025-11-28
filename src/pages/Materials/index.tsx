import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuickMessage } from "@/components/quickmessage";
import { Badge } from "@/components/ui/badge";

import type { Material } from "@/interfaces"; // interface que você mostrou
import { Blocks } from "lucide-react";

export const Materials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);

  // 🔎 Busca
  const [searchQuery, setSearch] = useState<string>("");
  const filteredMaterials = materials.filter((material) => {
    const q = searchQuery.toLowerCase();
    return (
      material.title.toLowerCase().includes(q) ||
      material.description?.toLowerCase().includes(q) ||
      material.id?.toString().includes(q)
    );
  });

  // ➕ Criação de material
  const [formData, setFormData] = useState<Material>({
    id: 0,
    id_class: 0,
    title: "",
    description: "",
    posted_at: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  });
  const [formMessage, setFormMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { Toast, showMessage } = useQuickMessage();

  async function handleCreateMaterial(e: React.FormEvent) {
    e.preventDefault();

    try {
      await axios
        .post("http://localhost:8080/api/materials", formData, {
          withCredentials: true,
        })
        .then(() => {
          setFormOpen(false);
          showMessage(
            "Material criado, a página será atualizada automaticamente em 5 segundos"
          );
          setTimeout(() => window.location.reload(), 5000);
        })
        .catch((err) => {
          if (err.status === 409) setFormMessage("Material já existe");
          setTimeout(() => setFormMessage(""), 3000);
          console.log(err);
        });
      return;
    } catch (error) {
      console.log(error);
      setFormMessage("Ocorreu um erro interno, tente novamente outra hora");
    }
  }

  // 🔧 Carregar materiais
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get<Material[]>(
          "http://localhost:8080/api/materials",
          { withCredentials: true }
        );
        setMaterials(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMaterials();
  }, []);

  const handleMaterialDetails = (id: number) => {
    navigate(`/materials/${id}`);
  };

  return (
    <SidebarProvider className="flex z-50">
      <AppSidebar />
      <main className="p-2 w-full">
        <SidebarTrigger />
        {Toast}

        {/* Content */}
        <div className="w-full p-5">
          <div className="search-bar flex items-center relative">
            <Input
              className="p-5 m-4"
              placeholder="Procure por um material..."
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute right-10 text-gray-400" />
          </div>

          <div className="flex justify-between text-indigo-500 w-full p-5 font-bold items-center gap-2">
            {/* Modal de criação de material */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 cursor-pointer">
                  Criar material
                </Button>
              </DialogTrigger>

              <DialogContent className="w-110">
                <DialogHeader>
                  <DialogTitle className="text-indigo-500 font-bold">
                    Criar um material
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={(e) => handleCreateMaterial(e)}
                  >
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="title"
                        className="font-bold text-indigo-500"
                      >
                        Título:
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="description"
                        className="font-bold text-indigo-500"
                      >
                        Descrição:
                      </Label>
                      <Input
                        id="description"
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="posted_at"
                        className="font-bold text-indigo-500"
                      >
                        Data de postagem:
                      </Label>
                      <Input
                        id="posted_at"
                        type="date"
                        value={formData.posted_at}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            posted_at: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    {formMessage && (
                      <h1 className="flex w-full justify-center text-red-700">
                        * {formMessage} *
                      </h1>
                    )}
                    <Button
                      className="bg-indigo-500 text-white cursor-pointer"
                      type="submit"
                    >
                      Confirmar
                    </Button>
                  </form>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-2">
              <Blocks size={16} />
              {filteredMaterials.length}
            </div>
          </div>

          {/* Materials list */}
          {filteredMaterials.map((material) => (
            <div key={material.id}>
              <Card
                className="m-2 flex flex-row justify-between items-center cursor-pointer scale-99 hover:scale-100 transition-all"
                onClick={() => handleMaterialDetails(material.id!)}
              >
                <CardContent className="flex flex-col gap-1">
                  <p className="text-gray-400">ID: {material.id}</p>
                  <h1>{material.title}</h1>
                  <CardDescription>{material.description}</CardDescription>
                  <Badge className="bg-indigo-500">
                    Postado em: {material.posted_at.split("T")[0]}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </SidebarProvider>
  );
};
