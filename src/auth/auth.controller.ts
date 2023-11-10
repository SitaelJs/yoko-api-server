import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Post,
  Get,
  BadRequestException,
  UnauthorizedException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { AuthService } from './auth.service';
import { Tokens } from './interfaces/tokens-interface';
import { Response } from 'express';
import { Cookie, Public, UserAgent } from '@common/decorators';

const REFRESH_TOKEN = 'refreshToken';
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(
        `Не получилось зарегистрировать пользователя ${JSON.stringify(dto)}`,
      );
    }
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    const tokens = await this.authService.login(dto, agent);
    if (!tokens) {
      throw new BadRequestException(
        `Не получается войти с данными ${JSON.stringify(dto)}`,
      );
    }
    this.setRefreshTokenToCookie(tokens, res);
  }

  @Get('refresh')
  async refreshTokens(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    this.setRefreshTokenToCookie(tokens, res);
  }

  private setRefreshTokenToCookie(tokens: Tokens, response: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    response.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    response
      .status(HttpStatus.CREATED)
      .json({ accessToken: tokens.accessToken });
  }
}
