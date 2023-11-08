import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() dto: Partial<User>) {
    return this.userService.save(dto);
  }

  @Get(':idOrEmail')
  findUser(@Param('idOrEmail') idOrEmail: string) {
    return this.userService.findOne(idOrEmail);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }
}
