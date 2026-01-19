import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { GroupsService } from '../groups/groups.service';
import { GroupStatus } from '../common/enums/group-status.enum';

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private dataSource: DataSource,
    private groupsService: GroupsService,
  ) {}

  async removeUserFromGroup(userId: number, groupId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify both user and group exist, and user is in group in a single query
      const userGroup = await queryRunner.manager.query(
        `SELECT u.id as user_id, g.id as group_id 
         FROM user_groups ug 
         INNER JOIN users u ON ug.user_id = u.id
         INNER JOIN \`groups\` g ON ug.group_id = g.id
         WHERE u.id = ? AND g.id = ?`,
        [userId, groupId],
      );

      if (!userGroup || userGroup.length === 0) {
        throw new NotFoundException(
          `User ${userId} is not a member of group ${groupId}`,
        );
      }

      // Remove the association
      await queryRunner.manager.query(
        'DELETE FROM user_groups WHERE user_id = ? AND group_id = ?',
        [userId, groupId],
      );

      // Get remaining member count in one query
      const countResult = await queryRunner.manager.query(
        'SELECT COUNT(*) as count FROM user_groups WHERE group_id = ?',
        [groupId],
      );
      const memberCount = countResult[0].count;

      // Update group status based on member count
      if (memberCount === 0) {
        await this.groupsService.setGroupStatusEmpty(groupId);
      }

      await queryRunner.commitTransaction();

      return {
        message: `User ${userId} removed from group ${groupId}`,
        groupStatus: memberCount === 0 ? GroupStatus.EMPTY : GroupStatus.ACTIVE,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
