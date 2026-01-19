import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PaginationService } from '../common/services/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, PaginationService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
