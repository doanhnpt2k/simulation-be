import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 6, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 120, name: 'full_name', nullable: true })
  fullName: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string | null;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
