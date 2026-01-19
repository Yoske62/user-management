import { Controller, Get, Patch, Query, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationDto } from './pagination.dto';
import { UpdateUserStatusesDto } from './update-user-statuses.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(@Query() paginationDto: PaginationDto) {
    return this.usersService.getAllWithPagination(paginationDto);
  }

  @Patch('statuses')
  updateUserStatuses(@Body() updateUserStatusesDto: UpdateUserStatusesDto) {
    return this.usersService.updateUserStatuses(updateUserStatusesDto);
  }
}
