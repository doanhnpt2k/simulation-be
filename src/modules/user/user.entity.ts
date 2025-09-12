import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole, UserStatus } from './user.type';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  name?: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 250, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', name: 'password', nullable: false, length: 255 })
  password: string;

  @Column({ type: 'varchar', name: 'role', default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'varchar', name: 'status', default: UserStatus.ACTIVE })
  status: UserStatus;
}
