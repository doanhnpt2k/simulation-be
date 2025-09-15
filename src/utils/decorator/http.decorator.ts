import {
  applyDecorators,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  type PipeTransform,
  UseGuards,
  //UseInterceptors,
} from '@nestjs/common';
import { type Type } from '@nestjs/common/interfaces';
import {
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from './role.decorator';
//import { AuthUserInterceptor } from '../interceptors';
import { RolesGuard, AuthGuard } from '../guards';
import { UserRole } from '@/modules/user/user.type';

export function Auth(roles: UserRole[] = []): ClassDecorator & MethodDecorator {
  return applyDecorators(
    Roles(roles),
    UseGuards(AuthGuard(), RolesGuard),
    ApiBearerAuth(),
    //   UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function AuthAdmin(): ClassDecorator & MethodDecorator {
  return applyDecorators(
    Roles([UserRole.ADMIN]),
    UseGuards(AuthGuard(), RolesGuard),
    ApiBearerAuth(),
    // UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function AuthRefreshToken(): MethodDecorator {
  return applyDecorators(
    UseGuards(AuthGuard({ refreshToken: true })),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
        required: ['refreshToken'],
      },
    }),
    // UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function UUIDParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return Param(property, new ParseUUIDPipe({ version: '4' }), ...pipes);
}

export function IntParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return Param(property, new ParseIntPipe(), ...pipes);
}

export function ObjectIdParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return Param(property, new ParseUUIDPipe({ version: '4' }), ...pipes);
}
