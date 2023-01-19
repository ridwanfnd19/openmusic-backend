exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'playlists(id)',
      onDelete: 'cascade',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'TIMESTAMP(3)',
      notNull: true,
    },
    updated_at: {
      type: 'TIMESTAMP(3)',
      notNull: true,
    },
  });

  pgm.addConstraint('collaborations',
      'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
