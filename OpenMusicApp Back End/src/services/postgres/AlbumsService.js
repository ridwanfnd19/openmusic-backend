const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const fs = require('fs');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(folder, cacheService) {
    this._pool = new Pool();
    this._folder = folder;
    this._cacheService = cacheService;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {recursive: true});
    }
  }

  addAlbum = async ({name, year}) => {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id`,
      values: [id, name, year, createdAt],
    };

    const {rows} = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return rows[0].id;
  };

  getAlbumById = async (id) => {
    const query = {
      text: `SELECT id, name, year, cover AS "coverUrl" 
      FROM albums WHERE id = $1`,
      values: [id],
    };

    const {rows} = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return rows[0];
  };

  getSongsByAlbumId = async (id) => {
    const query = {
      text: `SELECT id, title, performer FROM songs WHERE album_id = $1`,
      values: [id],
    };

    const {rows} = await this._pool.query(query);

    return rows;
  };

  editAlbumById = async (id, {name, year}) => {
    const updatedAt = new Date().toISOString();

    const query = {
      text: `UPDATE albums 
        SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id`,
      values: [name, year, updatedAt, id],
    };

    const {rows} = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }

    return rows[0];
  };

  deleteAlbumById = async (id) => {
    const query = {
      text: `DELETE FROM albums WHERE id = $1 RETURNING id`,
      values: [id],
    };

    const {rows} = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  };

  writeFile = (file, meta) => {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  };

  addCover = async (id, filename) => {
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
    const updatedAt = new Date().toISOString();

    const query = {
      text: `UPDATE albums 
      SET cover = $2, updated_at = $3 
      WHERE id = $1 RETURNING id`,
      values: [
        id, fileLocation, updatedAt,
      ],
    };

    const {rows} = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Cover gagal ditambahkan');
    }
  };

  getLikes = async (albumId) => {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: JSON.parse(result),
        cache: true,
      };
    } catch (error) {
      const query = {
        text: `SELECT COUNT(album_id) AS "likes" FROM albumlikes 
        WHERE album_id = $1`,
        values: [albumId],
      };
      const {rows} = await this._pool.query(query);

      await this._cacheService.set(`likes:${albumId}`,
          JSON.stringify(rows[0].likes),
      );

      return rows[0];
    }
  };

  addLike = async (albumId, userId) => {
    const id = `like-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO albumlikes VALUES($1, $2, $3, $4, $4) RETURNING id`,
      values: [id, userId, albumId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`likes:${albumId}`);

    return result.rows[0].id;
  };

  deletelike = async (albumId, userId) => {
    const query = {
      text: `DELETE FROM albumlikes 
      WHERE user_id = $1 AND album_id = $2 RETURNING id`,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Proses batal menyukai album gagal dilakukan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  };

  verifylike = async (albumId, userId) => {
    const query = {
      text: `SELECT id FROM albumlikes WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };

    const {rows} = await this._pool.query(query);

    return rows;
  };
}

module.exports = AlbumsService;

