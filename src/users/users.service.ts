import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { PaginationDto } from './pagination.dto';
import { UpdateUserStatusesDto } from './update-user-statuses.dto';
import { IUsersService } from './users.service.interface';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private paginationService: PaginationService,
    private dataSource: DataSource,
  ) {}

  async getAllWithPagination(paginationDto: PaginationDto) {
    // Avoid loading all groups relations for pagination - causes N+1 queries
    // Users can fetch specific user details if they need full group associations
    return this.paginationService.paginate(
      this.usersRepository,
      paginationDto,
      [], // Don't eager load relations during list pagination
    );
  }

  async getUserById(userId: number) {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: ['groups'], // Only load relations when explicitly requested
    });
  }

  async updateUserStatuses(updateUserStatusesDto: UpdateUserStatusesDto) {
    const { users } = updateUserStatusesDto;

    if (users.length === 0) {
      throw new BadRequestException('No users provided for update');
    }

    if (users.length > 500) {
      throw new BadRequestException('Maximum 500 users can be updated at once');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Use a single bulk update query instead of individual updates
      // This reduces database round trips from N to 1
      // All updates are wrapped in a transaction for atomicity
      const userIds = users.map((u) => u.userId);
      const statusMap = new Map(users.map((u) => [u.userId, u.status]));

      // Build a CASE statement for efficient bulk update
      const caseStatements = Array.from(statusMap.entries())
        .map(([id, status]) => `WHEN ${id} THEN '${status}'`)
        .join(' ');

      await queryRunner.manager.query(
        `UPDATE users SET status = CASE id ${caseStatements} END WHERE id IN (${userIds.join(
          ',',
        )})`,
      );

      await queryRunner.commitTransaction();

      return {
        message: `Successfully updated ${users.length} users`,
        count: users.length,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
