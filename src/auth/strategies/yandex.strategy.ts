import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-yandex';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('YANDEX_APP_ID'),
      clientSecret: configService.get('YANDEX_APP_SECRET'),
      callbackURL: 'http://localhost:3001/api/auth/yandex/callback',
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;

    const user = {
      id,
      displayName,
      email: emails[0].value,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
