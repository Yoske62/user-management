import { PaginationDto } from './pagination.dto';
import { UpdateUserStatusesDto } from './update-user-statuses.dto';

export interface IUsersService {
  getAllWithPagination(paginationDto: PaginationDto): Promise<any>;
  updateUserStatuses(updateUserStatusesDto: UpdateUserStatusesDto): Promise<any>;
}
