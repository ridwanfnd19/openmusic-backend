const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(
      songsService, collaborationsService,
  ) {
    this._pool = new Pool();
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
  };

  addPlaylist = async ({name, owner}) => {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id`,
      values: [id, name, owner, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  };

  getPlaylist = async (owner) => {
    const query = {
      text: `
      WITH data AS (
        SELECT a.* FROM playlists a
        LEFT JOIN collaborations b ON b.playlist_id = a.id
        WHERE a.owner = $1 OR b.user_id = $1
      )
      SELECT a.id, a.name, b.username
      FROM data a, users b
      WHERE a.owner = b.id
      `,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  };

  deletePlaylistById = async (id) => {
    const query = {
      text: `DELETE FROM playlists WHERE id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  };

  addPlaylistSong = async ({playlistId, songId, credentialId}) => {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    await this._songsService.getSongById(songId);

    const query = {
      text: `INSERT INTO playlistsongs VALUES($1, $2, $3, $4, $4) RETURNING id`,
      values: [id, playlistId, songId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this.addActivities(
        playlistId, songId, credentialId, 'add',
    );

    return result.rows[0].id;
  };

  getPlaylistById = async ({id, owner}) => {
    const query = {
      text: `WITH data AS (
        SELECT a.* FROM playlists a
        LEFT JOIN collaborations b ON b.playlist_id = a.id
        WHERE a.owner = $2 OR b.user_id = $2
      )
      SELECT a.id, a.name, b.username
      FROM data a, users b
      WHERE a.owner = b.id AND a.id = $1`,
      values: [id, owner],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  };

  getPlaylistSongs = async (id) => {
    const query = {
      text: `SELECT b.id, b.title, b.performer FROM playlistsongs a, songs b
        WHERE a.playlist_id = $1 AND a.song_id = b.id`,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  };

  deletePlaylistSongById = async (id, songId, credentialId) => {
    const query = {
      text: `DELETE FROM playlistsongs 
        WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [id, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
          'Lagu gagal dihapus. songId tidak ditemukan di playlist',
      );
    }

    await this.addActivities(
        id, songId, credentialId, 'delete',
    );
  };

  verifyPlaylistOwner = async (id, owner) => {
    const query = {
      text: `SELECT * FROM playlists WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  };

  verifyPlaylistAccess = async (playlistId, userId) => {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(
            playlistId, userId,
        );
      } catch {
        throw error;
      }
    }
  };

  addActivities = async (playlistId, songId, userId, action) => {
    const id = nanoid(16);
    const time = new Date().toISOString();

    const query = {
      text: `INSERT INTO playlistsongactivities 
      VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist song activity gagal ditambahkan');
    }
  };

  getActivities = async (id) => {
    const query = {
      text: `
      WITH activities AS (
        SELECT *
        FROM playlistsongactivities a, playlists b
        WHERE a.playlist_id = b.id AND b.owner = $1
      )
      SELECT c.username, b.title, a.action, a.time
      FROM activities a, songs b, users c
      WHERE a.song_id = b.id AND a.user_id = c.id
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  };
}

module.exports = PlaylistsService;
