import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';
export class UserResponse implements User {
  id: string;
  email: string;

  @Exclude()
  password: string;
  @Exclude()
  createdAt: Date;

  updatedAt: Date;
  roles: $Enums.Role;

  @Exclude()
  provider: $Enums.Provider;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
