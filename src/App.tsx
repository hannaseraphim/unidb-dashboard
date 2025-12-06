import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Login } from "./pages/Login";
import { ProfileSelector } from "./pages/ProfileSelector";
import { Admin } from "./pages/Admin/";
import { Users } from "./pages/Admin/Users";
import { Courses } from "./pages/Admin/Courses";
import {
  ProtectedRoute,
  PublicRoute,
  Restricted,
} from "./utils/Authentication";
import { Classes } from "./pages/Admin/Classes";
import { Aluno } from "./pages/Aluno";
import { StudentClasses } from "./pages/Aluno/Classes";
import { Activity } from "./pages/Aluno/Activities";
import { Grades } from "./pages/Aluno/Grades";
import { Professor } from "./pages/Professor";
import { AvailableClasses } from "./pages/Aluno/Enrolment";
import { useEffect } from "react";
import { socket } from "./hooks/useSocket";
import { Materials } from "./pages/Aluno/Materials";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Conectado ao servidor");
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota geral */}
        <Route path="*" element={<Navigate to="/profile-selector" replace />} />

        {/* Rota de autenticação */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rota de seleção de perfis */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile-selector" element={<ProfileSelector />} />
        </Route>

        {/* Rotas de administrador */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin/"
            element={<Restricted permission="Administrador" />}
          >
            {/* rota índice: quando acessa /admin/ sem nada depois */}
            <Route index element={<Navigate to="home" replace />} />

            <Route path="home" element={<Admin />} />
            <Route path="users" element={<Users />} />
            <Route path="courses" element={<Courses />} />
            <Route path="classes" element={<Classes />} />
          </Route>
        </Route>

        {/* Rotas de aluno */}
        <Route element={<ProtectedRoute />}>
          <Route path="/aluno/" element={<Restricted permission="Aluno" />}>
            {/* rota índice: quando acessa /aluno/ sem nada depois */}
            <Route index element={<Navigate to="home" replace />} />
            <Route path="materials" element={<Materials />}></Route>
            <Route path="enroll" element={<AvailableClasses />} />
            <Route path="home" element={<Aluno />} />
            <Route path="classes" element={<StudentClasses />} />
            <Route path="activities" element={<Activity />} />
            <Route path="grades" element={<Grades />} />
          </Route>
        </Route>

        {/* Rotas de professor */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/professor/"
            element={<Restricted permission="Professor" />}
          >
            {/* rota índice: quando acessa /professor/ sem nada depois */}
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Professor />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
