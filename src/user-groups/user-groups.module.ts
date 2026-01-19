import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsController } from './user-groups.controller';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Group]), GroupsModule],
  providers: [UserGroupsService],
  controllers: [UserGroupsController],
})
export class UserGroupsModule {}
