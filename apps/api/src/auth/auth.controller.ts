import { Body, Controller, Post } from '@nestjs/common';
import {
  adminLoginSchema,
  userRegisterSchema,
  userLoginSchema,
  type AdminLoginInput,
  type UserRegisterInput,
  type UserLoginInput,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin/login')
  adminLogin(@Body(new ZodValidationPipe(adminLoginSchema)) body: AdminLoginInput) {
    return this.auth.adminLogin(body);
  }

  @Post('user/register')
  userRegister(@Body(new ZodValidationPipe(userRegisterSchema)) body: UserRegisterInput) {
    return this.auth.userRegister(body);
  }

  @Post('user/login')
  userLogin(@Body(new ZodValidationPipe(userLoginSchema)) body: UserLoginInput) {
    return this.auth.userLogin(body);
  }
}
