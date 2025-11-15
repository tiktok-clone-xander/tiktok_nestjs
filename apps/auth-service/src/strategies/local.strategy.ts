import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      usernameField: 'emailOrUsername',
    });
  }

  async validate(emailOrUsername: string, password: string): Promise<any> {
    // This will be handled in the auth service
    return { emailOrUsername, password };
  }
}
