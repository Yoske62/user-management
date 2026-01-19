import { Controller, Delete, Param } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';

@Controller('user-groups')
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) {}

  @Delete(':userId/:groupId')
  removeUserFromGroup(
    @Param('userId') userId: number,
    @Param('groupId') groupId: number,
  ) {
    return this.userGroupsService.removeUserFromGroup(userId, groupId);
  }
}
