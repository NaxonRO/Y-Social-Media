exports.up = (pgm) => {
  pgm.createTable('followers', {
    follower_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    following_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('followers', 'followers_pkey', 'PRIMARY KEY (follower_id, following_id)');
  pgm.addConstraint('followers', 'no_self_follow', 'CHECK (follower_id != following_id)');
  pgm.createIndex('followers', 'following_id');
  pgm.createIndex('followers', 'follower_id');
};

exports.down = (pgm) => {
  pgm.dropTable('followers');
};
