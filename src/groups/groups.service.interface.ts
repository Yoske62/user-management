import { PaginationDto } from '../users/pagination.dto';

export interface IGroupsService {
  getAllWithPagination(paginationDto: PaginationDto): Promise<any>;
  getGroupById(groupId: number): Promise<any>;
}
