import { Injectable } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { PaginationDto } from '../../users/pagination.dto';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    paginationDto: PaginationDto,
    relations?: string[],
  ): Promise<PaginationResult<T>> {
    const limit = Math.min(paginationDto.limit || 10, 100);
    const offset = paginationDto.offset || 0;

    const [data, total] = await repository.findAndCount({
      skip: offset,
      take: limit,
      order: { id: 'ASC' } as any,
      relations: relations && relations.length > 0 ? relations : undefined,
    });

    return {
      data,
      total,
      limit,
      offset,
    };
  }
}
