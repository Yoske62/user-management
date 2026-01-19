import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { PaginationService } from '../common/services/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupsService, PaginationService],
  controllers: [GroupsController],
  exports: [GroupsService],
})
export class GroupsModule {}
