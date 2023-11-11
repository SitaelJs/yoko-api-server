import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtPayload } from '@auth/interfaces/tokens-interface';
import { PrismaService } from './../prisma/prisma.service';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { convertToSecondsUtil } from '@common/utils';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async save(user: Partial<User>) {
    const hashedPass = this.hashPassword(user.password);
    return this.prismaService.user.create({
      data: {
        email: user.email,
        password: hashedPass,
        roles: 'USER',
      },
    });
  }

  async findOne(idOrEmail: string, isReset = false) {
    if (isReset) {
      await this.cacheManager.del(idOrEmail);
    }
    const userInCache = await this.cacheManager.get<User>(idOrEmail);
    if (!userInCache) {
      const user = await this.prismaService.user.findFirst({
        where: {
          OR: [{ id: idOrEmail }, { email: idOrEmail }],
        },
      });
      if (!user) return null;
      await this.cacheManager.set(
        idOrEmail,
        user,
        convertToSecondsUtil(this.configService.get('JWT_EXP')),
      );
      return user;
    }
    return userInCache;
  }

  async delete(id: string, user: JwtPayload) {
    if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }
    await Promise.all([
      await this.cacheManager.get<User>(user.email),
      await this.cacheManager.get<User>(id),
    ]);

    return await this.prismaService.user
      .delete({
        where: { id },
        select: { id: true },
      })
      .catch((error) => {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error,
          },
          HttpStatus.NOT_FOUND,
          {
            cause: error,
          },
        );
      });
  }

  private hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }
}
