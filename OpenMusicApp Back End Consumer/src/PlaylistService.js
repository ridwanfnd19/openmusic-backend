const {Pool} = require('pg');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  getPlaylistById = async (id, owner) => {
    const query = {
      text: `SELECT id, name
      FROM playlists
      WHERE owner = $2 AND id = $1`,
      values: [id, owner],
    };
    const {rows} = await this._pool.query(query);
    return rows[0];
  };

  getPlaylistSongs = async (id) => {
    const query = {
      text: `SELECT b.id, b.title, b.performer FROM playlistsongs a, songs b
        WHERE a.playlist_id = $1 AND a.song_id = b.id`,
      values: [id],
    };
    const {rows} = await this._pool.query(query);
    return rows;
  };
}

module.exports = PlaylistService;
