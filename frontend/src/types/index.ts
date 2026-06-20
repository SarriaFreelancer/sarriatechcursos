export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}
