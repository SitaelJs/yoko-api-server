import { JwtPayload } from '@auth/interfaces/tokens-interface';
import { PrismaService } from './../prisma/prisma.service';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async findOne(idOrEmail: string) {
    return await this.prismaService.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });
  }

  async delete(id: string, user: JwtPayload) {
    if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }
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
