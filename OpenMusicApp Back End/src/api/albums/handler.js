const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  postAlbumHandler = async (req, h) => {
    this._validator.validateAlbumPayload(req.payload);

    const albumId = await this._service.addAlbum(req.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  };

  getAlbumByIdHandler = async (req) => {
    const {id} = req.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsByAlbumId(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  };

  putAlbumByIdHandler = async (req) => {
    this._validator.validateAlbumPayload(req.payload);
    const {id} = req.params;

    const albumId = await this._service.editAlbumById(id, req.payload);
    const album = await this._service.getAlbumById(albumId.id);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
      data: {
        album,
      },
    };
  };

  deleteAlbumByIdHandler = async (req) => {
    const {id} = req.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  };

  postUploadAlbumCoverHandler = async (req, h) => {
    const {id} = req.params;
    const {cover} = req.payload;
    this._validator.validateImageCovers(cover.hapi.headers);

    await this._service.getAlbumById(id);
    const filename = await this._service.writeFile(cover, cover.hapi);
    await this._service.addCover(id, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  };

  postAlbumLikesHandler = async (req, h) => {
    let message;
    const {id} = req.params;
    const {id: credentialId} = req.auth.credentials;

    await this._service.getAlbumById(id);
    const verify = await this._service.verifylike(id, credentialId);

    if (!verify.length) {
      await this._service.addLike(id, credentialId);
      message = 'Berhasil menyukai album';
    } else {
      await this._service.deletelike(id, credentialId);
      message = 'Berhasil batal menyukai album';
    }

    const response = h.response({
      status: 'success',
      message,
    });

    response.code(201);
    return response;
  };

  getAlbumLikessHandler = async (req, h) => {
    const {id} = req.params;

    const {likes, cache} = await this._service.getLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: Number(likes),
      },
    });

    if (cache) {
      response.header('X-Data-Source', 'cache');
    }
    response.code(200);
    return response;
  };
}

module.exports = AlbumHandler;
