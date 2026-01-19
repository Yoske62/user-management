import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Group } from './src/entities/group.entity';
import { AddStatusToUsers1705709600000 } from './src/migrations/1705709600000-AddStatusToUsers';
import { AddPerformanceIndexes1705709600001 } from './src/migrations/1705709600001-AddPerformanceIndexes';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'user_management',
  entities: [User, Group],
  migrations: [AddStatusToUsers1705709600000, AddPerformanceIndexes1705709600001],
  logging: false,
  synchronize: false,
  migrationsRun: true,
});
