import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateMbtiCategoryDto } from './dto/update-mbti-category.dto';
import { MbtiService } from './mbti.service';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthAdmin } from '@/utils/decorator/http.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('MBTI Types')
@Controller('v1/mbti/types')
@AuthAdmin()
@ApiBearerAuth()
export class MbtiTypeController {
  constructor(private readonly mbtiService: MbtiService) {}

  //Get all MBTI types
  @Get()
  async list() {
    // Tận dụng repository từ service nếu cần mở rộng
    return this.mbtiService['mbtiTypeRepository'].find({
      order: { name: 'ASC' },
    });
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
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMbtiCategoryDto,
    @UploadedFile()
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    return this.mbtiService.updateMbtiType(id, dto, file);
  }
}
