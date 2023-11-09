import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Post,
  Get,
  BadRequestException,
  UnauthorizedException,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { AuthService } from './auth.service';
import { Tokens } from './interfaces/tokens-interface';
import { Request, Response } from 'express';
import { Cookie } from '@common/decorators';

const REFRESH_TOKEN = 'refreshToken';

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
    @Req() req: Request,
  ) {
    const agent = req.headers['user-agent'];
    console.log(agent);
    const tokens = await this.authService.login(dto);
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
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken);
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
    response.status(HttpStatus.CREATED).json(tokens.accessToken);
  }
}
