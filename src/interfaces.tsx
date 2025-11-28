export interface Course {
  id?: number;
  name: string;
  description: string;
  max_students: number;
  classes?: Class[];
}

export interface Student {
  id: number;
  name?: string;
  email?: string;
  average_grade?: string;
  status?: string;
}

export interface Class {
  id?: number;
  id_course?: number;
  id_teacher?: number;
  name: string;
  period: string;
  starts_on: string;
  ends_on: string;
  archived: boolean;
  max_students: number;
  teacher?: {
    id: number;
    name?: string;
    email?: string;
  };
  students?: Student[];
}

// Interface do perfil
export interface Profile {
  id: number;
  name: string;
}

// Interface do usuário
export interface User {
  id?: number;
  name: string;
  email: string;
  profiles: Profile[];
  password?: string;
}
