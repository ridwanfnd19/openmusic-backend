const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  postCollaborationHandler = async (req, h) => {
    this._validator.validateCollaborationPayload(req.payload);

    const {id: credentialId} = req.auth.credentials;
    const {playlistId, userId} = req.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this._collaborationsService.
        addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  };

  deleteCollaborationHandler = async (req) => {
    this._validator.validateCollaborationPayload(req.payload);
    const {id: credentialId} = req.auth.credentials;
    const {playlistId, userId} = req.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  };
}

module.exports = CollaborationsHandler;
