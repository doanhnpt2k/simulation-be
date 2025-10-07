import { HollandType } from '@/utils/enum/suitability.enum';
import { ApiProperty } from '@nestjs/swagger';
export class SuitabilityResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  suitabilityType: HollandType;

  @ApiProperty()
  scores: {
    A: number;
    I: number;
    C: number;
    E: number;
    S: number;
    R: number;
  };

  @ApiProperty()
  percentages: {
    A: number;
    I: number;
    C: number;
    E: number;
    S: number;
    R: number;
  };

  @ApiProperty()
  createdAt: Date;
}
