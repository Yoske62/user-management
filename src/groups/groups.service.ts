import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Group } from '../entities/group.entity';
import { PaginationDto } from '../users/pagination.dto';
import { IGroupsService } from './groups.service.interface';
import { PaginationService } from '../common/services/pagination.service';
import { GroupStatus } from '../common/enums/group-status.enum';

@Injectable()
export class GroupsService implements IGroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private paginationService: PaginationService,
    private dataSource: DataSource,
  ) {}

  async getAllWithPagination(paginationDto: PaginationDto) {
    // Avoid loading all users relations for pagination - causes N+1 queries
    // Clients can call getGroupById if they need the full group with users
    return this.paginationService.paginate(
      this.groupsRepository,
      paginationDto,
      [], // Don't eager load relations during list pagination
    );
  }

  private async updateGroupStatus(groupId: number, status: GroupStatus) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        Group,
        { id: groupId },
        { status },
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getGroupById(groupId: number) {
    return this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['users'],
    });
  }

  async getGroupByIdWithoutUsers(groupId: number) {
    return this.groupsRepository.findOne({
      where: { id: groupId },
    });
  }

  async getGroupMemberCount(groupId: number): Promise<number> {
    const result = await this.groupsRepository.query(
      'SELECT COUNT(*) as count FROM user_groups WHERE group_id = ?',
      [groupId],
    );
    return result[0].count;
  }

  async setGroupStatusEmpty(groupId: number) {
    await this.updateGroupStatus(groupId, GroupStatus.EMPTY);
  }

  async setGroupStatusActive(groupId: number) {
    await this.updateGroupStatus(groupId, GroupStatus.ACTIVE);
  }

  async setGroupStatusInactive(groupId: number) {
    await this.updateGroupStatus(groupId, GroupStatus.INACTIVE);
  }
}
