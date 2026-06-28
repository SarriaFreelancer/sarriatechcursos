export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  profilePicture?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}
