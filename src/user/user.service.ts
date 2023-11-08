import { PrismaService } from './../prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
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

  findOne(idOrEmail: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });
  }

  delete(id: string) {
    return this.prismaService.user.delete({ where: { id } }).catch((error) => {
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
