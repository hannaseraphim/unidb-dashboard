import {
  Home,
  BookOpen,
  Users,
  School,
  GraduationCap,
  PenIcon,
  Book,
  Group,
  DoorOpen,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";
import { HiMiniAcademicCap } from "react-icons/hi2";
import { Button } from "./ui/button";
import axios from "axios";
import { ApiURL } from "@/utils/api";

type SidebarItem = {
  label: string;
  path: string;
  icon: React.ElementType;
};

const sidebarConfig: Record<string, SidebarItem[]> = {
  Administrador: [
    { label: "Dashboard", path: "/admin/home", icon: Home },
    { label: "Usuários", path: "/admin/users", icon: Users },
    { label: "Cursos", path: "/admin/courses", icon: BookOpen },
    { label: "Turmas", path: "/admin/classes", icon: School },
  ],
  Professor: [
    { label: "Minhas Turmas", path: "/professor/classes", icon: BookOpen },
    { label: "Atividades", path: "/professor/activities", icon: Home },
    { label: "Materiais", path: "/professor/materials", icon: Book },
    { label: "Notas", path: "/professor/grades", icon: Home },
  ],
  Aluno: [
    { label: "Matricular", path: "/aluno/enroll", icon: GraduationCap },
    { label: "Minhas turmas", path: "/aluno/classes", icon: Group },
    { label: "Atividades", path: "/aluno/activities", icon: PenIcon },
    { label: "Materiais", path: "/aluno/materials", icon: Book },
    { label: "Notas", path: "/aluno/grades", icon: Home },
  ],
};

type AppSidebarProps = {
  profile: "Administrador" | "Professor" | "Aluno";
};

export function AppSidebar({ profile }: AppSidebarProps) {
  const navigate = useNavigate();
  const items = sidebarConfig[profile] || [];
  const location = useLocation();

  const handleLogout = async () => {
    await axios
      .get(`${ApiURL}/auth/logout`, { withCredentials: true })
      .then(() => navigate("/login"));
  };

  return (
    <Sidebar>
      <SidebarContent className="flex justify-between bg-gray-900">
        <SidebarGroup className="flex justify-between gap-2 flex-col h-full">
          <div className="">
            <SidebarGroupContent
              className="flex items-center justify-around hover:bg-gray-600 cursor-pointer rounded-md"
              onClick={() => navigate("/profile-selector")}
            >
              <HiMiniAcademicCap className="text-5xl text-white bg-emerald-400 p-2 rounded-md" />
              <div className="flex flex-col items-start p-2">
                <h1 className="text-xl font-bold text-center text-emerald-400">
                  Portal Acadêmico
                </h1>
                <p className="text-neutral-400">{profile}</p>
              </div>
            </SidebarGroupContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        className="hover:bg-emerald-500 hover:text-white"
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center p-5 rounded-sm transition-colors text-emerald-600 ${
                            isActive ? "bg-emerald-500 text-white" : ""
                          }`}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>

          <SidebarGroupContent>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="hover:bg-emerald-500 hover:text-white"
              >
                <Button
                  className={`flex items-center p-5 rounded-sm transition-colors text-emerald-600 cursor-pointer`}
                  variant="ghost"
                  onClick={() => handleLogout()}
                >
                  <DoorOpen></DoorOpen>
                  Desconectar
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
