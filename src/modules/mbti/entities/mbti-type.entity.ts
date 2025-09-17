import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { MbtiResultEntity } from './mbti-result.entity';
import { MbtiPropertyEntity } from './mbti-property.entity';

@Entity('mbti_types')
export class MbtiTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 6, nullable: true, unique: true })
  name: string; // e.g., INTJ, ENTP

  @Column({ type: 'varchar', length: 120, name: 'full_name', nullable: true })
  fullName: string; // e.g., Introverted, Intuitive, Thinking, Perceiving

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

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
