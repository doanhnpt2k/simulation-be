import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuitabilityService } from '../suitability.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBaseQuery } from '@/utils/decorator/swagger.decorator';
import {
  CreateSuitabilityTypeDto,
  GetSuitabilityTypesDto,
  UpdateSuitabilityTypeDto,
} from '../dto/type.dto';
import { AuthAdmin, UUIDParam } from '@/utils/decorator/http.decorator';

@ApiTags('Suitability Types')
@Controller({ version: '1', path: 'suitability/type' })
@ApiBearerAuth()
export class SuitabilityTypeController {
  constructor(private readonly suitabilityService: SuitabilityService) {}

  @ApiBaseQuery()
  @Get()
  async getSuitabilityTypes(@Query() dto: GetSuitabilityTypesDto) {
    return this.suitabilityService.getSuitabilityTypes(dto);
  }
  @Get(':id')
  async getSuitabilityTypeById(@UUIDParam('id') id: string) {
    return this.suitabilityService.getOneSuitabilityType(id);
  }

  @AuthAdmin()
  @Post()
  async createSuitabilityType(@Body() dto: CreateSuitabilityTypeDto) {
    return this.suitabilityService.createSuitabilityType(dto);
  }

  @AuthAdmin()
  @Patch(':id')
  async updateSuitabilityType(
    @Param('id') id: string,
    @Body() dto: UpdateSuitabilityTypeDto,
  ) {
    return this.suitabilityService.updateSuitabilityType(id, dto);
  }

  @AuthAdmin()
  @Delete(':id')
  async deleteSuitabilityType(@UUIDParam('id') id: string) {
    return this.suitabilityService.deleteSuitabilityType(id);
  }
}
