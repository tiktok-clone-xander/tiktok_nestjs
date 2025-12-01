import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: { email: string; username: string; password: string; fullName?: string }) {
    this.logger.log(`Register request for email: ${data.email}`);
    return await this.authService.register(data);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: { username: string; password: string }) {
    console.log('🔥🔥🔥 AUTH SERVICE - Login method called!', data);
    this.logger.log(`Login request for: ${data.username}`);
    const result = await this.authService.login(data);
    console.log('✅ Auth Service login result:', result);
    return result;
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    this.logger.log('Token validation request');
    return await this.authService.validateToken(data.token);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(data: { refreshToken: string }) {
    this.logger.log('Refresh token request');
    return await this.authService.refreshToken(data.refreshToken);
  }

  @GrpcMethod('AuthService', 'Logout')
  async logout(data: { userId: string }) {
    this.logger.log(`Logout request for userId: ${data.userId}`);
    return await this.authService.logout(data.userId);
  }

  @GrpcMethod('AuthService', 'GetUserById')
  async getUserById(data: { userId: string }) {
    this.logger.log(`Get user by id: ${data.userId}`);
    return await this.authService.getUserById(data.userId);
  }
}
