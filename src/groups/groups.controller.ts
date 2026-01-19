import { Controller, Get, Query } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { PaginationDto } from '../users/pagination.dto';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  getAllGroups(@Query() paginationDto: PaginationDto) {
    return this.groupsService.getAllWithPagination(paginationDto);
  }
}
