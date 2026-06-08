export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  password: string;
}
