'use strict';

exports.up = (pgm) => {
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    username: { type: 'varchar(30)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    display_name: { type: 'varchar(100)' },
    bio: { type: 'text' },
    avatar_url: { type: 'text' },
    is_verified: { type: 'boolean', notNull: true, default: false },
    is_active: { type: 'boolean', notNull: true, default: true },
    email_verified_at: { type: 'timestamp' },
    email_verification_token: { type: 'varchar(64)' },
    password_reset_token: { type: 'varchar(64)' },
    password_reset_expires_at: { type: 'timestamp' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'username');
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
