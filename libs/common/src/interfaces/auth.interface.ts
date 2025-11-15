export interface IUser {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
