import { BaseQueryDto, OrderDirection } from '@/core/dto/base-query.dto';
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiExtraModels,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';

export function ApiDtoBody<TModel extends Type<any>>(
  model: TModel,
  options?: { description?: string },
) {
  return applyDecorators(
    ApiBody({
      description: options?.description,
      schema: { $ref: getSchemaPath(model) },
    }),
    ApiExtraModels(model),
  );
}

export function ApiDtoArrayBody<TModel extends Type<any>>(
  model: TModel,
  options?: { description?: string },
) {
  return applyDecorators(
    ApiBody({
      description: options?.description,
      schema: {
        type: 'array',
        items: { $ref: getSchemaPath(model) },
      },
    }),
    ApiExtraModels(model),
  );
}

export function ApiOkDto<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiOkResponse({ schema: { $ref: getSchemaPath(model) } }),
    ApiExtraModels(model),
  );
}

export function ApiCreatedDto<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiCreatedResponse({ schema: { $ref: getSchemaPath(model) } }),
    ApiExtraModels(model),
  );
}

export function ApiBaseQuery() {
  return applyDecorators(
    ApiExtraModels(BaseQueryDto),
    ApiQuery({
      name: 'page',
      required: true,
      type: Number,
    }),
    ApiQuery({
      name: 'limit',
      required: true,
      type: Number,
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
    }),
    ApiQuery({
      name: 'order',
      required: false,
      enum: OrderDirection,
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      type: String,
    }),
    ApiQuery({
      name: 'startTime',
      required: false,
      type: String,
    }),
    ApiQuery({
      name: 'endTime',
      required: false,
      type: String,
    }),
  );
}

/* Ví dụ nâng cao (union): oneOf([A, B])
export function ApiDtoUnionBody(models: Type<any>[], description?: string) {
  return applyDecorators(
    ApiBody({
      description,
      schema: { oneOf: models.map((m) => ({ $ref: getSchemaPath(m) })) },
    }),
    ApiExtraModels(...models),
  );
}
*/
