import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { UserGroupsModule } from './user-groups/user-groups.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'user',
      password: 'password',
      database: 'user_management',
      entities: [User, Group],
      migrations: [__dirname + '/../**/migrations/*.js'],
      synchronize: false,
      logging: false,
      migrationsRun: true,
    }),
    UsersModule,
    GroupsModule,
    UserGroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
