import { RegisterDto } from '@auth/dto';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPasswordMatching', async: false })
export class IsPasswordMatchingConstraint
  implements ValidatorConstraintInterface
{
  validate(
    passwordRepeat: string,
    validationArguments?: ValidationArguments,
  ): boolean {
    const obj = validationArguments.object as RegisterDto;
    return obj.password === passwordRepeat;
  }
  defaultMessage(_validationArguments?: ValidationArguments): string {
    return 'Пароли не совпадают';
  }
}
