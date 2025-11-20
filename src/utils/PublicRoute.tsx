import { FetchUserData } from "./FetchUserData";
import { Navigate } from "react-router";
import { Loading } from "../pages/Loading";
import { type ReactNode, useEffect, useState } from "react";

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await FetchUserData();

        if (res?.data) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (err) {
        setLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  if (loggedIn === null) {
    return <Loading />;
  }

  if (loggedIn) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
