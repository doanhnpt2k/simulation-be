import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/user.entity';
import { MbtiTestEntity } from './mbti-test.entity';
import { MbtiType } from '@/utils/enum/mbti-category.enum';
import {
  Column as OrmColumn,
  ManyToOne as OrmManyToOne,
  JoinColumn as OrmJoinColumn,
} from 'typeorm';
import { MbtiTypeEntity } from './mbti-type.entity';

@Entity('mbti_results')
export class MbtiResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'test_id' })
  testId: string;

  @Column({
    type: 'enum',
    enum: MbtiType,
  })
  mbtiType: MbtiType;

  @OrmColumn({ type: 'uuid', name: 'mbti_type_id', nullable: true })
  mbtiTypeId?: string | null;

  // Raw scores
  @Column({ type: 'int' })
  eScore: number;

  @Column({ type: 'int' })
  iScore: number;

  @Column({ type: 'int' })
  sScore: number;

  @Column({ type: 'int' })
  nScore: number;

  @Column({ type: 'int' })
  tScore: number;

  @Column({ type: 'int' })
  fScore: number;

  @Column({ type: 'int' })
  jScore: number;

  @Column({ type: 'int' })
  pScore: number;

  // Percentages
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  ePercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  iPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  sPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  nPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  fPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  jPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  pPercentage: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => MbtiTestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: MbtiTestEntity;

  @OrmManyToOne(() => MbtiTypeEntity, { onDelete: 'SET NULL' })
  @OrmJoinColumn({ name: 'mbti_type_id' })
  mbtiTypeRef?: MbtiTypeEntity | null;
}
