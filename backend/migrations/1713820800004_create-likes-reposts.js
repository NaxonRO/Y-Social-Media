exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    post_id: { type: 'uuid', notNull: true, references: '"posts"', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('likes', 'likes_unique', 'UNIQUE (post_id, user_id)');
  pgm.createIndex('likes', 'post_id');

  pgm.createTable('reposts', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    post_id: { type: 'uuid', notNull: true, references: '"posts"', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('reposts', 'reposts_unique', 'UNIQUE (post_id, user_id)');
  pgm.createIndex('reposts', 'post_id');
};

exports.down = (pgm) => {
  pgm.dropTable('reposts');
  pgm.dropTable('likes');
};
