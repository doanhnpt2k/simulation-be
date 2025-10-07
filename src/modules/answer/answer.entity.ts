import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { TestEntity } from '../test/test.entity';
import { QuestionEntity } from '../question/question.entity';
import { BaseAnswerEntity } from '@/core/entities/answer.entity';

@Entity('answers')
export class AnswerEntity extends BaseAnswerEntity {
  @ManyToOne(() => TestEntity, (test) => test.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'test_id' })
  test: TestEntity;

  @ManyToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}
