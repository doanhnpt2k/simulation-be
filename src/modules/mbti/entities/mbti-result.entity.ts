import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entitys/user.entity';
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

  @OrmColumn({ type: 'uuid', name: 'mbti_type_id', nullable: false })
  mbtiTypeId?: string | null;

  // Raw scores
  @Column({ type: 'int', name: 'e_score' })
  eScore: number;

  @Column({ type: 'int', name: 'i_score' })
  iScore: number;

  @Column({ type: 'int', name: 's_score' })
  sScore: number;

  @Column({ type: 'int', name: 'n_score' })
  nScore: number;

  @Column({ type: 'int', name: 't_score' })
  tScore: number;

  @Column({ type: 'int', name: 'f_score' })
  fScore: number;

  @Column({ type: 'int', name: 'j_score' })
  jScore: number;

  @Column({ type: 'int', name: 'p_score' })
  pScore: number;

  @Column({ type: 'int', name: '_a_score' })
  _aScore: number;

  @Column({ type: 'int', name: '_t_score' })
  _tScore: number;

  // Percentages
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'e_percentage' })
  ePercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'i_percentage' })
  iPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 's_percentage' })
  sPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'n_percentage' })
  nPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 't_percentage' })
  tPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'f_percentage' })
  fPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'j_percentage' })
  jPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'p_percentage' })
  pPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: '_a_percentage' })
  _aPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: '_t_percentage' })
  _tPercentage: number;

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
