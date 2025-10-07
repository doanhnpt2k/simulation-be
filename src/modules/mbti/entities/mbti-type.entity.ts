import { Entity, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { MbtiResultEntity } from './mbti-result.entity';
import { MbtiPropertyEntity } from './mbti-property.entity';
import { BaseTypeEntity } from '@/core/entities/type.entity';

@Entity('mbti_types')
export class MbtiTypeEntity extends BaseTypeEntity {
  @OneToMany(() => MbtiResultEntity, (result) => result.id)
  results: MbtiResultEntity[];

  @ManyToMany(() => MbtiPropertyEntity, (property) => property.mbtiTypes)
  @JoinTable({
    name: 'mbti_type_properties',
    joinColumn: { name: 'mbti_type_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'mbti_property_id', referencedColumnName: 'id' },
  })
  properties: MbtiPropertyEntity[];
}
