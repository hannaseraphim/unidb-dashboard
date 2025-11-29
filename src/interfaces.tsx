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
  student_count?: number;
  teacher?: {
    id: number;
    name?: string;
    email?: string;
  };
  students?: Student[];
}

export interface Profile {
  id: number;
  name: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  profiles: Profile[];
  enrolments: Enrolment[];
  password?: string;
}

export interface Enrolment {
  id_student?: number;
  id_class?: number;
  class_name?: string;
  enrolled_at?: string;
  active?: number;
}

export interface Material {
  id: number;
  id_class: number;
  title: string;
  description: string;
  posted_at: string;
}
