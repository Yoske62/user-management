import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getAllWithPagination: jest.fn(),
            updateUserStatuses: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return users with pagination', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            status: null,
            created_at: new Date(),
            groups: [],
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      };

      jest.spyOn(service, 'getAllWithPagination').mockResolvedValue(mockResult);

      const result = await controller.getAllUsers({ limit: 10, offset: 0 });

      expect(result).toEqual(mockResult);
      expect(service.getAllWithPagination).toHaveBeenCalledWith({ limit: 10, offset: 0 });
    });
  });

  describe('updateUserStatuses', () => {
    it('should update user statuses', async () => {
      const mockResult = {
        message: 'Successfully updated 2 users',
        count: 2,
      };

      jest.spyOn(service, 'updateUserStatuses').mockResolvedValue(mockResult);

      const dto = {
        users: [
          { userId: 1, status: 'active' },
          { userId: 2, status: 'blocked' },
        ],
      };

      const result = await controller.updateUserStatuses(dto);

      expect(result).toEqual(mockResult);
      expect(service.updateUserStatuses).toHaveBeenCalledWith(dto);
    });
  });
});
