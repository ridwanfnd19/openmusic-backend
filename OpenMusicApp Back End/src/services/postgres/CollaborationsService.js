const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor(usersService) {
    this._pool = new Pool();
    this._usersService = usersService;
  }

  addCollaboration = async (playlistId, userId) => {
    const id = `collab-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    await this._usersService.getUserById(userId);

    const query = {
      text: `INSERT INTO collaborations 
        VALUES($1, $2, $3, $4, $4) RETURNING id`,
      values: [id, playlistId, userId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  };

  deleteCollaboration = async (playlistId, userId) => {
    const query = {
      text: `DELETE FROM collaborations 
        WHERE playlist_id = $1 AND user_id = $2 RETURNING id`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  };

  verifyCollaborator = async (playlistId, userId) => {
    const query = {
      text: `SELECT * FROM collaborations 
      WHERE playlist_id = $1 AND user_id = $2`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  };
}

module.exports = CollaborationsService;
