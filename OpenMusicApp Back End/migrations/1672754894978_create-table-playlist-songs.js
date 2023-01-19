exports.up = (pgm) => {
  pgm.createTable('playlistsongs', {
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
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'songs(id)',
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

  pgm.addConstraint('playlistsongs',
      'unique_playlist_id_and_song_id', 'UNIQUE(playlist_id, song_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlistsongs');
};

