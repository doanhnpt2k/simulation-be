import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestEntity } from './test.entity';
import { TestService } from './test.service';

@Module({
  imports: [TypeOrmModule.forFeature([TestEntity])],
  controllers: [],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}
