import {
  AuthGuard as NestAuthGuard,
  type IAuthGuard,
  type Type,
} from '@nestjs/passport';

export function AuthGuard(
  options?: Partial<{ refreshToken: boolean }>,
): Type<IAuthGuard> {
  let strategies = ['jwt'];

  if (options?.refreshToken) {
    strategies = ['jwt-refresh'];
  }

  return NestAuthGuard(strategies);
}
