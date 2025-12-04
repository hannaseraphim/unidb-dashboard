import { ApiURL } from "@/utils/api";
import axios from "axios";

export interface PersonalUser {
  id: string;
  name: string;
  email: string;
  profiles: "Administrador" | "Aluno" | "Professor";
  enrolments: [
    {
      classId: number;
      className: string;
      courseId: number;
      courseName: string;
    }
  ];
  grades: [
    {
      activityId: number;
      activityTitle: string;
      grade: string;
    }
  ];
  history: [
    {
      classId: number;
      finalGrade: string;
      status: string;
    }
  ];
}

let user: PersonalUser | null = null;

export const getUserData = async (): Promise<PersonalUser> => {
  if (user) return user;

  const userData = await axios.get<PersonalUser>(`${ApiURL}/api/me`, {
    withCredentials: true,
  });
  user = userData.data;
  return user;
};

// função para acessar diretamente (sem refetch)
export function getCachedUser(): PersonalUser | null {
  return user;
}
