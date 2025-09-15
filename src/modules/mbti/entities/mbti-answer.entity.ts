import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MbtiTestEntity } from './mbti-test.entity';
import { QuestionEntity } from './question.entity';

@Entity('mbti_answers')
export class MbtiAnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'test_id' })
  testId: string;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId: string;

  @Column({ type: 'int' })
  score: number; // 1-7

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => MbtiTestEntity, (test) => test.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'test_id' })
  test: MbtiTestEntity;

  @ManyToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}
