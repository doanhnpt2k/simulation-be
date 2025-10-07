import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entitys/user.entity';
import { TestEntity } from '../../test/test.entity';
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

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => TestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: TestEntity;

  @OrmManyToOne(() => MbtiTypeEntity, { onDelete: 'SET NULL' })
  @OrmJoinColumn({ name: 'mbti_type_id' })
  mbtiTypeRef?: MbtiTypeEntity | null;
}
