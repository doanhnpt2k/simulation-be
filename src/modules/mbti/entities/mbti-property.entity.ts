import { MbtiDescriptionType, SWOTType } from '@/utils/enum/mbti-category.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MbtiTypeEntity } from './mbti-type.entity';

@Entity('mbti_properties')
export class MbtiPropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MbtiDescriptionType, name: 'description_type' })
  descriptionType: MbtiDescriptionType;

  @Column({ type: 'enum', enum: SWOTType, name: 'swot_type' })
  swotType: SWOTType;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => MbtiTypeEntity, (type) => type.properties)
  mbtiTypes: MbtiTypeEntity[];
}
