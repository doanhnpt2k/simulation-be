import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobEntity } from './job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity])],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
