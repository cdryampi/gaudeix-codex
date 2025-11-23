export interface User {
  id: number; // Django uses integer IDs by default
  username: string;
  email: string;
  name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export type CreateUserDTO = {
  username: string;
  email: string;
  name?: string;
  password?: string;
  password_confirm?: string;
};

export type UpdateUserDTO = {
  email?: string;
  name?: string;
};
