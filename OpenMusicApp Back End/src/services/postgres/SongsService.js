const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  };

  addSong = async ({title, year, genre, performer, duration, albumId}) => {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO songs 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id`,
      values: [
        id, albumId, title, year, genre, performer,
        duration, createdAt,
      ],
    };

    const {rows} = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return rows[0].id;
  };

  getSongs = async ({title = '', performer = ''}) => {
    const query = {
      text: `SELECT id, title, performer 
        FROM songs WHERE title ILIKE $1 and performer ILIKE $2`,
      values: [`%${title}%`, `%${performer}%`],
    };

    const {rows} = await this._pool.query(query);
    return rows;
  };

  getSongById = async (id) => {
    const query = {
      text: `SELECT id, title, year, performer, genre, duration, 
        album_id as "albumId"  
        FROM songs WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  };

  editSongById = async (id, {
    title, year, genre, performer, duration, albumId,
  }) => {
    const updatedAt = new Date().toISOString();

    const query = {
      text: `UPDATE songs 
        SET title = $1, album_id = $2, year = $3, genre = $4, performer = $5, 
        duration = $6, updated_at = $7 
        WHERE id = $8 RETURNING id`,
      values: [title, albumId, year, genre, performer, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  };

  deleteSongById = async (id) => {
    const query = {
      text: `DELETE FROM songs WHERE id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  };
}

module.exports = SongsService;

