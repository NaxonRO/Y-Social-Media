exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    post_id: { type: 'uuid', notNull: true, references: '"posts"', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    content: { type: 'text', notNull: true },
    like_count: { type: 'integer', notNull: true, default: 0, check: 'like_count >= 0' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('comments', 'post_id');
  pgm.createIndex('comments', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
