exports.up = (pgm) => {
  pgm.createTable('posts', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    content: { type: 'varchar(280)', notNull: true },
    media_url: { type: 'varchar(500)' },
    media_type: { type: 'varchar(10)', check: "media_type IN ('image','gif','video')" },
    parent_id: { type: 'uuid', references: '"posts"', onDelete: 'SET NULL' },
    like_count: { type: 'integer', notNull: true, default: 0, check: 'like_count >= 0' },
    comment_count: { type: 'integer', notNull: true, default: 0, check: 'comment_count >= 0' },
    repost_count: { type: 'integer', notNull: true, default: 0, check: 'repost_count >= 0' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('posts', 'user_id');
  pgm.createIndex('posts', ['created_at'], { order: { created_at: 'DESC' } });
};

exports.down = (pgm) => {
  pgm.dropTable('posts');
};
