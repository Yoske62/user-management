import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1705709600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper to create index safely
    const createIndexIfNotExists = async (
      indexName: string,
      tableName: string,
      columns: string,
    ) => {
      const result = await queryRunner.query(
        `SELECT COUNT(*) as count FROM information_schema.STATISTICS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        [tableName, indexName],
      );
      if (!result[0] || result[0].count === 0) {
        await queryRunner.query(
          `CREATE INDEX ${indexName} ON ${tableName}(${columns})`,
        );
      }
    };

    // Add index on users.email for faster lookups
    await createIndexIfNotExists('idx_users_email', 'users', 'email');

    // Add indexes on user_groups foreign keys for faster joins
    await createIndexIfNotExists('idx_user_groups_user_id', 'user_groups', 'user_id');
    await createIndexIfNotExists('idx_user_groups_group_id', 'user_groups', 'group_id');

    // Add index on groups.status for status-based queries
    await createIndexIfNotExists('idx_groups_status', 'groups', 'status');

    // Add composite index for efficient group member counting
    await createIndexIfNotExists('idx_user_groups_group_id_user_id', 'user_groups', 'group_id, user_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Helper to drop index safely
    const dropIndexIfExists = async (
      indexName: string,
      tableName: string,
    ) => {
      const result = await queryRunner.query(
        `SELECT COUNT(*) as count FROM information_schema.STATISTICS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        [tableName, indexName],
      );
      if (result[0] && result[0].count > 0) {
        await queryRunner.query(`DROP INDEX ${indexName} ON ${tableName}`);
      }
    };

    await dropIndexIfExists('idx_users_email', 'users');
    await dropIndexIfExists('idx_user_groups_user_id', 'user_groups');
    await dropIndexIfExists('idx_user_groups_group_id', 'user_groups');
    await dropIndexIfExists('idx_groups_status', 'groups');
    await dropIndexIfExists('idx_user_groups_group_id_user_id', 'user_groups');
  }
}
