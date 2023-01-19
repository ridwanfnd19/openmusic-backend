const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  };

  postPlaylistHandler = async (req, h) => {
    this._validator.validatePlaylistPayload(req.payload);
    const {name} = req.payload;
    const {id: credentialId} = req.auth.credentials;

    const playlistId = await this._service.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  };

  getPlaylistHandler = async (req) => {
    const {id: credentialId} = req.auth.credentials;
    const playlists = await this._service.getPlaylist(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  };

  deletePlaylistByIdHandler = async (req) => {
    const {id} = req.params;
    const {id: credentialId} = req.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  };

  postPlaylistSongHandler = async (req, h) => {
    this._validator.validatePlaylistSongPayload(req.payload);
    const {id} = req.params;
    const {songId} = req.payload;
    const {id: credentialId} = req.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    const playlistsongId = await this._service.addPlaylistSong(
        {playlistId: id, songId, credentialId},
    );

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
      data: {
        playlistsongId,
      },
    });
    response.code(201);
    return response;
  };

  getPlaylistSongHandler = async (req) => {
    const {id} = req.params;
    const {id: credentialId} = req.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._service.getPlaylistById(
        {id, owner: credentialId},
    );
    const songs = await this._service.getPlaylistSongs(id);

    return {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          songs,
        },
      },
    };
  };

  deletePlaylistSongHandler = async (req) => {
    this._validator.validatePlaylistSongPayload(req.payload);
    const {id} = req.params;
    const {songId} = req.payload;
    const {id: credentialId} = req.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.deletePlaylistSongById(id, songId, credentialId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  };

  getPlaylistactivitiesHandler = async (req) => {
    const {id} = req.params;
    const {id: credentialId} = req.auth.credentials;
    await this._service.verifyPlaylistAccess(id, credentialId);
    const activities = await this._service.getActivities(credentialId);
    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  };
};

module.exports = PlaylistsHandler;
