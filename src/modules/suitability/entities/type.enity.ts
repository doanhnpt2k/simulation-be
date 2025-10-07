import { Entity, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { SuitabilityResultEntity } from './result.entity';
import { BaseTypeEntity } from '@/core/entities/type.entity';
import { SuitabilitySkillEntity } from './skill.entity';
import { JobEntity } from '@/modules/job/job.entity';

@Entity('suitability_types')
export class SuitabilityTypeEntity extends BaseTypeEntity {
  @OneToMany(() => SuitabilityResultEntity, (result) => result.suitabilityType)
  results: SuitabilityResultEntity[];

  @ManyToMany(() => JobEntity, (job) => job.suitabilityTypes)
  @JoinTable({
    name: 'suitability_type_jobs',
    joinColumn: { name: 'suitability_type_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'suitability_job_id',
      referencedColumnName: 'id',
    },
  })
  jobs: JobEntity[];

  @ManyToMany(() => SuitabilitySkillEntity, (skill) => skill.suitabilityTypes)
  @JoinTable({
    name: 'suitability_type_skills',
    joinColumn: { name: 'suitability_type_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'suitability_skill_id',
      referencedColumnName: 'id',
    },
  })
  skills: SuitabilitySkillEntity[];
}
