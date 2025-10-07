import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SuitabilityTypeEntity } from './type.enity';

@Entity('suitability_results')
export class SuitabilityResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'test_id' })
  testId: string;

  @Column({ type: 'int', name: 'a_score' })
  aScore: number;

  @Column({ type: 'int', name: 'i_score' })
  iScore: number;

  @Column({ type: 'int', name: 'c_score' })
  cScore: number;

  @Column({ type: 'int', name: 'e_score' })
  eScore: number;

  @Column({ type: 'int', name: 's_score' })
  sScore: number;

  @Column({ type: 'int', name: 'r_score' })
  rScore: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => SuitabilityTypeEntity, (type) => type.results)
  suitabilityType: SuitabilityTypeEntity;
}
