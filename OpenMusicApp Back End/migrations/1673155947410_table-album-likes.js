exports.up = (pgm) => {
  pgm.createTable('albumlikes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'albums(id)',
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

  pgm.addConstraint('albumlikes',
      'unique_user_id_and_album_id', 'UNIQUE(user_id, album_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('albumlikes');
};
