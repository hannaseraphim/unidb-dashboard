import { Login } from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router";
import { PublicRoute } from "./utils/PublicRoute";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import { Home } from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
