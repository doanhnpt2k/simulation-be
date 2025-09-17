import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Query,
  Post,
  Delete,
} from '@nestjs/common';
import { CreateMbtiTypeDto, UpdateMbtiTypeDto } from '../dto/type.dto';
import { MbtiService } from '../mbti.service';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthAdmin } from '@/utils/decorator/http.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBaseQuery } from '@/utils/decorator/swagger.decorator';
import { GetMbtiTypesDto } from '../dto/type.dto';

@ApiTags('MBTI Types')
@Controller({ version: '1', path: 'mbti/type' })
@ApiBearerAuth()
export class MbtiTypeController {
  constructor(private readonly mbtiService: MbtiService) {}

  //Get all MBTI types
  @ApiBaseQuery()
  @Get()
  async list(@Query() dto: GetMbtiTypesDto) {
    return this.mbtiService.getMbtiTypes(dto);
  }
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.mbtiService.getOneMbtiType(id);
  }
  //Create MBTI type
  // @Post()
  // async create(@Body() dto: CreateMbtiCategoryDto) {
  //   return this.mbtiService.createMbtiType(dto);
  // }

  //Update MBTI type
  @AuthAdmin()
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @AuthAdmin()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMbtiTypeDto,
    @UploadedFile()
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    return this.mbtiService.updateMbtiType(id, dto, file);
  }

  @AuthAdmin()
  @Post()
  async create(@Body() dto: CreateMbtiTypeDto) {
    return this.mbtiService.createMbtiType(dto);
  }

  @AuthAdmin()
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.mbtiService.deleteMbtiType(id);
  }
}
