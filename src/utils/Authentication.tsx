import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet } from "react-router";
import { ApiURL } from "./api/index";

type AllowedProfiles = "Administrador" | "Professor" | "Aluno";

// Bloquear rotas que devem ser acessadas com sessão
export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${ApiURL}/api/me`, {
          withCredentials: true,
        });
        setIsAuthenticated(response.status === 200 ? true : false);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <h1>Carregando...</h1>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Bloquear rotas que devem ser acessadas sem sessão
export const PublicRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${ApiURL}/api/me`, {
          withCredentials: true,
        });
        setIsAuthenticated(response.status === 200 ? true : false);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/profile-selector" replace />;
  }

  if (isAuthenticated === null) {
    return <h1>Carregando...</h1>;
  }

  return <Outlet />;
};

// Bloquear rotas por tipo de perfil (Administrador, Professor, Aluno)
export const Restricted = ({ permission }: { permission: AllowedProfiles }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await axios.get(`${ApiURL}/api/me`, {
          withCredentials: true,
        });

        const userProfiles: AllowedProfiles[] = response.data.profiles;

        setHasPermission(userProfiles.includes(permission));
      } catch (error) {
        console.error(error);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, [permission]);

  if (hasPermission === null) {
    return <h1>Carregando...</h1>;
  }

  if (!hasPermission) {
    return <Navigate to="/profile-selector" replace />;
  }

  return <Outlet />;
};
