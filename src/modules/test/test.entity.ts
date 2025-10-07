import { Entity, OneToMany } from 'typeorm';
import { AnswerEntity } from '../answer/answer.entity';
import { BaseTestEntity } from '@/core/entities/test.entity';

@Entity('tests')
export class TestEntity extends BaseTestEntity {
  @OneToMany(() => AnswerEntity, (answer: AnswerEntity) => answer.test)
  answers: AnswerEntity[];
}
