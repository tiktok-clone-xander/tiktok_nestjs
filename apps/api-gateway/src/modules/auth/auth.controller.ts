import {
  ACCESS_TOKEN_COOKIE,
  CurrentUser,
  generateCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from '@app/common';
import { LoginDto, RegisterDto } from '@app/common/dto';
import { JwtAuthGuard } from '@app/common/guards';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  OnModuleInit,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { lastValueFrom, Observable } from 'rxjs';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface LogoutRequest {
  userId: string;
}

interface GetUserByIdRequest {
  userId: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface AuthServiceGrpc {
  register(data: RegisterDto): Observable<AuthResponse>;
  login(data: LoginDto): Observable<AuthResponse>;
  logout(data: LogoutRequest): Observable<unknown>;
  getUserById(data: GetUserByIdRequest): Observable<unknown>;
  refreshToken(data: RefreshTokenRequest): Observable<RefreshTokenResponse>;
}

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController implements OnModuleInit {
  private authService: AuthServiceGrpc;

  constructor(@Inject('AUTH_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const result = (await lastValueFrom(this.authService.register(registerDto))) as AuthResponse;

      const cookieOptions = generateCookieOptions(process.env.NODE_ENV === 'production');

      res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    console.log('🔥 API Gateway - Login endpoint hit!', loginDto);
    try {
      console.log('🚀 Calling Auth Service via gRPC...');
      const result = (await lastValueFrom(this.authService.login(loginDto))) as AuthResponse;
      console.log('✅ Auth Service response:', result);

      const cookieOptions = generateCookieOptions(process.env.NODE_ENV === 'production');

      res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'User logged in successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      return res.status(error.status || HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@CurrentUser('userId') userId: string, @Res() res: Response) {
    await lastValueFrom(this.authService.logout({ userId }));

    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser('userId') userId: string) {
    const user = await lastValueFrom(this.authService.getUserById({ userId }));
    return user;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies ? req.cookies[REFRESH_TOKEN_COOKIE] : undefined;

    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    const result = (await lastValueFrom(
      this.authService.refreshToken({ refreshToken }),
    )) as RefreshTokenResponse;

    const cookieOptions = generateCookieOptions(process.env.NODE_ENV === 'production');

    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  }
}
