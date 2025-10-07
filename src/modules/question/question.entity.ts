import { Entity, Column } from 'typeorm';
import { MbtiCategory, QuestionType } from '@/utils/enum/mbti-category.enum';
import { BaseQuestionEntity } from '@/core/entities/question.entity';
import { SuitabilityType } from '@/utils/enum/suitability.enum';

@Entity('questions')
export class QuestionEntity extends BaseQuestionEntity {
  @Column({
    type: 'enum',
    enum: QuestionType,
    nullable: true,
    name: 'type',
  })
  type: QuestionType;
  @Column({
    type: 'enum',
    enum: MbtiCategory,
    nullable: true,
    name: 'mbti_category',
  })
  mbtiCategory: MbtiCategory;

  @Column({
    type: 'enum',
    enum: SuitabilityType,
    nullable: true,
    name: 'suitability_type',
  })
  suitabilityType: SuitabilityType;
}
