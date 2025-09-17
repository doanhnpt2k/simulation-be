import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MbtiService } from '../mbti.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/utils/guards';
import {
  CreatePropertyDto,
  GetPropertyDto,
  UpdatePropertyDto,
} from '../dto/property.dto';
import { AuthAdmin } from '@/utils/decorator/http.decorator';
import { ApiBaseQuery } from '@/utils/decorator/swagger.decorator';

@Controller({ version: '1', path: 'mbti/property' })
@ApiTags('MBTI Property')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MbtiPropertyController {
  constructor(private readonly mbtiService: MbtiService) {}

  //Get all properties

  @AuthAdmin()
  @ApiBaseQuery()
  @Get()
  async getProperties(@Query() query: GetPropertyDto) {
    return this.mbtiService.getProperties(query);
  }

  //Get one property by Id
  @AuthAdmin()
  @Get(':id')
  async getPropertyById(@Param('id') id: string) {
    return this.mbtiService.getPropertyById(id);
  }

  //Create a property
  @AuthAdmin()
  @Post()
  async createProperty(@Body() body: CreatePropertyDto) {
    return this.mbtiService.createProperty(body);
  }

  //Update a property
  @AuthAdmin()
  @Patch(':id')
  async updateProperty(
    @Param('id') id: string,
    @Body() body: UpdatePropertyDto,
  ) {
    return this.mbtiService.updateProperty(id, body);
  }

  @AuthAdmin()
  @Delete(':id')
  async deleteProperty(@Param('id') id: string) {
    return this.mbtiService.deleteProperty(id);
  }
}
