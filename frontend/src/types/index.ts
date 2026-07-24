export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  profilePicture?: string;
  theme?: string;
  emailNotifications?: boolean;
  isPrivate?: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}
