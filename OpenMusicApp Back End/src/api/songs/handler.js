const autoBind = require('auto-bind');

class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  };

  postSongHandler = async (req, h) => {
    this._validator.validateSongPayload(req.payload);

    const songId = await this._service.addSong(req.payload);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  };

  getSongsHandler = async (req) => {
    const songs = await this._service.getSongs(req.query);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  };

  getSongByIdHandler = async (req) => {
    const {id} = req.params;
    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  };

  putSongByIdHandler = async (req) => {
    this._validator.validateSongPayload(req.payload);
    const {id} = req.params;

    await this._service.editSongById(id, req.payload);

    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  };

  deleteSongByIdHandler = async (req) => {
    const {id} = req.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  };
}

module.exports = SongHandler;
