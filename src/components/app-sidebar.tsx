import {
  Archive,
  Blocks,
  BookUser,
  CircleUser,
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
import { useEffect, useState, type JSX } from "react";

type MenuItem = {
  to: string;
  label: string;
  icon: JSX.Element;
  permissions: string[];
};

export const AppSidebar = () => {
  const navigate = useNavigate();
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);

  const menuItems: MenuItem[] = [
    {
      to: "/users",
      label: "Usuários",
      icon: <Users />,
      permissions: ["ADMIN"],
    },
    {
      to: "/courses",
      label: "Cursos",
      icon: <Archive />,
      permissions: ["ADMIN", "TEACHER", "STUDENT"],
    },
    {
      to: "/classes",
      label: "Turmas",
      icon: <BookUser />,
      permissions: ["ADMIN", "TEACHER", "STUDENT"],
    },
    {
      to: "/materials",
      label: "Materiais",
      icon: <Blocks />,
      permissions: ["ADMIN", "TEACHER", "STUDENT"],
    },
    {
      to: "/activities",
      label: "Atividades",
      icon: <NotebookText />,
      permissions: ["ADMIN", "TEACHER", "STUDENT"],
    },
    {
      to: "/history",
      label: "Histórico",
      icon: <ScrollText />,
      permissions: ["ADMIN", "TEACHER", "STUDENT"],
    },
  ];

  useEffect(() => {
    async function fetchUserInfo() {
      const res = await axios.get("http://localhost:8080/api/me", {
        withCredentials: true,
      });

      const userProfiles = res.data.profiles.map((p) => p.name);

      const allowedMenu = menuItems.filter((item) =>
        item.permissions.some((role) => userProfiles.includes(role))
      );

      setFilteredMenu(allowedMenu);
    }

    fetchUserInfo();
  }, []);

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
              {filteredMenu.map((item) => (
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
