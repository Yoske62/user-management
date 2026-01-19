import { IsString, IsEnum, IsArray, ValidateNested, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

export class UpdateUserStatusDto {
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserStatusesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserStatusDto)
  users: UpdateUserStatusDto[];
}
