import {
  Archive,
  Blocks,
  BookA,
  BookUser,
  CircleUser,
  Group,
  GroupIcon,
  LogOut,
  NotebookText,
  ScrollText,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { Button } from "./ui/button";

export const AppSidebar = () => {
  const navigate = useNavigate();
  const menuItems = [
    { to: "/users", label: "Usuários", icon: <Users /> },
    { to: "/courses", label: "Cursos", icon: <Archive /> },
    { to: "/classes", label: "Turmas", icon: <BookUser /> },
    { to: "/materials", label: "Materiais", icon: <Blocks /> },
    { to: "/activities", label: "Atividades", icon: <NotebookText /> },
    { to: "/history", label: "Histórico", icon: <ScrollText /> },
  ];

  const Logout = async () => {
    await axios.get("http://localhost:8080/auth/logout", {
      withCredentials: true,
    });
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroupLabel className="text-md font-bold text-indigo-500">
          <Link to="/">
            <h1>UniDB Cursos</h1>
          </Link>
        </SidebarGroupLabel>
      </SidebarHeader>

      <SidebarContent className="flex justify-between">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-indigo-500 hover:text-white p-5"
                  >
                    <Link to={item.to}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter>
          <SidebarMenuButton
            asChild
            className="hover:bg-indigo-500 hover:text-white p-5"
          >
            <Link to="/me">
              <CircleUser />
              <span>Meu perfil</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton
            asChild
            className="hover:bg-indigo-500 hover:text-white p-5"
          >
            <Button className="cursor-pointer" onClick={() => Logout()}>
              <LogOut />
              <span>Desconectar</span>
            </Button>
          </SidebarMenuButton>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};
