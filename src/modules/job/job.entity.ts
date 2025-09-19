import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SuitabilityTypeEntity } from '@/modules/suitability/entities/type.enity';
import { JobLevel, JobType } from '@/utils/enum/suitability.enum';

@Entity('jobs')
export class JobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 30 })
  type: JobType;

  @Column({ type: 'varchar', length: 250, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, name: 'route', nullable: true })
  route: string;

  @Column({ type: 'int', name: 'min_salary' })
  minSalary: number;

  @Column({ type: 'int', name: 'max_salary' })
  maxSalary: number;

  @Column({ type: 'varchar', length: 250, name: 'working_time' })
  workingTime: string;

  @Column({ type: 'varchar', length: 50, name: 'day_off' })
  dayOff: string;

  @Column({ type: 'varchar', length: 50, name: 'level' })
  level: JobLevel;

  @Column({ type: 'varchar', length: 250, name: 'benefit', nullable: true })
  benefit: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => SuitabilityTypeEntity, (type) => type.jobs)
  suitabilityTypes: SuitabilityTypeEntity[];
}
