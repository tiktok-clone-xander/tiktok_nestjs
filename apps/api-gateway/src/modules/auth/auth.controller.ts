import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Inject,
  OnModuleInit,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto, LoginDto } from '@app/common/dto';
import { JwtAuthGuard } from '@app/common/guards';
import { CurrentUser, generateCookieOptions, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@app/common';
import { lastValueFrom } from 'rxjs';

interface AuthServiceGrpc {
  register(data: any): any;
  login(data: any): any;
  logout(data: any): any;
  getUserById(data: any): any;
  refreshToken(data: any): any;
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
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await lastValueFrom(this.authService.register(registerDto));

    const cookieOptions = generateCookieOptions(
      process.env.NODE_ENV === 'production',
    );

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
      data: {
        user: result.user,
      },
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await lastValueFrom(this.authService.login(loginDto));

    const cookieOptions = generateCookieOptions(
      process.env.NODE_ENV === 'production',
    );

    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        user: result.user,
      },
    });
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
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    const result = await lastValueFrom(
      this.authService.refreshToken({ refreshToken }),
    );

    const cookieOptions = generateCookieOptions(
      process.env.NODE_ENV === 'production',
    );

    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Token refreshed successfully',
    });
  }
}
