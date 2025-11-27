export interface Course {
  id?: number;
  name: string;
  description: string;
  max_students: number;
  classes?: Class[];
}

export interface Class {
  id?: number;
  name: string;
  period: string;
  starts_on: string;
  ends_on: string;
  archived: boolean;
  max_students: number;
  teacher: {
    id: number;
    name: string;
    email: string;
  };
}
