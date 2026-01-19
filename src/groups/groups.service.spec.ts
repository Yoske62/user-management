import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { GroupsService } from './groups.service';
import { Group } from '../entities/group.entity';
import { PaginationService } from '../common/services/pagination.service';
import { GroupStatus } from '../common/enums/group-status.enum';

describe('GroupsService', () => {
  let service: GroupsService;
  let groupRepository: Repository<Group>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let paginationService: PaginationService;

  beforeEach(async () => {
    // Mock QueryRunner
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        update: jest.fn(),
      },
    } as any;

    // Mock DataSource
    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as any;

    // Mock Repository
    const mockGroupRepository = {
      findOne: jest.fn(),
      query: jest.fn(),
    } as any;

    // Mock PaginationService
    const mockPaginationService = {
      paginate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getRepositoryToken(Group),
          useValue: mockGroupRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: PaginationService,
          useValue: mockPaginationService,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    groupRepository = module.get<Repository<Group>>(getRepositoryToken(Group));
    dataSource = module.get<DataSource>(DataSource);
    paginationService = module.get<PaginationService>(PaginationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Transaction Management', () => {
    it('should create queryRunner for transaction', async () => {
      (queryRunner.manager.update as jest.Mock).mockResolvedValue({});

      await service.setGroupStatusActive(1);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
    });

    it('should connect to database', async () => {
      (queryRunner.manager.update as jest.Mock).mockResolvedValue({});

      await service.setGroupStatusActive(1);

      expect(queryRunner.connect).toHaveBeenCalled();
    });

    it('should start transaction', async () => {
      (queryRunner.manager.update as jest.Mock).mockResolvedValue({});

      await service.setGroupStatusActive(1);

      expect(queryRunner.startTransaction).toHaveBeenCalled();
    });

    it('should commit transaction on successful update', async () => {
      (queryRunner.manager.update as jest.Mock).mockResolvedValue({});

      await service.setGroupStatusActive(1);

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const error = new Error('Update failed');
      (queryRunner.manager.update as jest.Mock).mockRejectedValue(error);

      await expect(service.setGroupStatusActive(1)).rejects.toThrow(
        'Update failed',
      );

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should release queryRunner after transaction', async () => {
      (queryRunner.manager.update as jest.Mock).mockResolvedValue({});

      await service.setGroupStatusActive(1);

      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should release queryRunner even if transaction fails', async () => {
      const error = new Error('Update failed');
      (queryRunner.manager.update as jest.Mock).mockRejectedValue(error);

      await expect(service.setGroupStatusActive(1)).rejects.toThrow();

      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should execute correct update query with ACTIVE status', async () => {
      (queryRunner.manager.update as jest.Mock).mockResolvedValue({});

      await service.setGroupStatusActive(42);

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Group,
        { id: 42 },
        { status: GroupStatus.ACTIVE },
      );
    });

    it('should execute correct update query with INACTIVE status', async () => {
      (queryRunner.manager.update as jest.Mock).mockResolvedValue({});

      await service.setGroupStatusInactive(10);

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Group,
        { id: 10 },
        { status: GroupStatus.INACTIVE },
      );
    });

    it('should execute correct update query with EMPTY status', async () => {
      (queryRunner.manager.update as jest.Mock).mockResolvedValue({});

      await service.setGroupStatusEmpty(5);

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Group,
        { id: 5 },
        { status: GroupStatus.EMPTY },
      );
    });
  });

  describe('getGroupById', () => {
    it('should retrieve group with users', async () => {
      const mockGroup = {
        id: 1,
        name: 'Test Group',
        status: GroupStatus.ACTIVE,
        users: [],
      };
      (groupRepository.findOne as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.getGroupById(1);

      expect(groupRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['users'],
      });
      expect(result).toEqual(mockGroup);
    });
  });

  describe('getGroupByIdWithoutUsers', () => {
    it('should retrieve group without users', async () => {
      const mockGroup = {
        id: 1,
        name: 'Test Group',
        status: GroupStatus.ACTIVE,
      };
      (groupRepository.findOne as jest.Mock).mockResolvedValue(mockGroup);

      const result = await service.getGroupByIdWithoutUsers(1);

      expect(groupRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockGroup);
    });
  });

  describe('getGroupMemberCount', () => {
    it('should return member count for a group', async () => {
      (groupRepository.query as jest.Mock).mockResolvedValue([{ count: 5 }]);

      const result = await service.getGroupMemberCount(1);

      expect(groupRepository.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM user_groups WHERE group_id = ?',
        [1],
      );
      expect(result).toBe(5);
    });

    it('should return 0 when group has no members', async () => {
      (groupRepository.query as jest.Mock).mockResolvedValue([{ count: 0 }]);

      const result = await service.getGroupMemberCount(1);

      expect(result).toBe(0);
    });
  });

  describe('getAllWithPagination', () => {
    it('should call pagination service with correct parameters', async () => {
      const paginationDto = { limit: 10, offset: 0 };
      const mockResult = { data: [], total: 0, limit: 10, offset: 0 };
      (paginationService.paginate as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.getAllWithPagination(paginationDto);

      expect(paginationService.paginate).toHaveBeenCalledWith(
        groupRepository,
        paginationDto,
        [],
      );
      expect(result).toEqual(mockResult);
    });
  });
});
