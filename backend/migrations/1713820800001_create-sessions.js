'use strict';

exports.up = (pgm) => {
  pgm.createTable('sessions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    refresh_token: { type: 'text', notNull: true, unique: true },
    ip_address: { type: 'varchar(45)' },
    user_agent: { type: 'text' },
    expires_at: { type: 'timestamp', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    revoked_at: { type: 'timestamp' },
  });

  pgm.createIndex('sessions', 'user_id');
  pgm.createIndex('sessions', 'refresh_token');
};

exports.down = (pgm) => {
  pgm.dropTable('sessions');
};
