exports.up = (pgm) => {
  pgm.createTable('notifications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    recipient_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    actor_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    type: { type: 'varchar(20)', notNull: true },
    post_id: { type: 'uuid', references: '"posts"', onDelete: 'CASCADE' },
    conversation_id: { type: 'uuid' },
    message_preview: { type: 'text' },
    is_read: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('notifications', ['recipient_id', 'created_at']);
  pgm.createIndex('notifications', 'recipient_id', { where: 'is_read = FALSE', name: 'idx_notif_unread' });

  pgm.createTable('conversations', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    participant1_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    participant2_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    last_message_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('conversations', ['participant1_id', 'participant2_id'], { unique: true });

  pgm.createTable('messages', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    conversation_id: { type: 'uuid', notNull: true, references: '"conversations"', onDelete: 'CASCADE' },
    sender_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    content: { type: 'text', notNull: true },
    is_read: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('messages', ['conversation_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('messages');
  pgm.dropTable('conversations');
  pgm.dropTable('notifications');
};
