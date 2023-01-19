const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  postExportPlaylistSongsHandler = async (req, h) => {
    this._validator.validateExportPlaylistPayload(req.payload);

    const {playlistId} = req.params;
    const {id: credentialId} = req.auth.credentials;

    await this._service.verify(playlistId, credentialId);

    const message = {
      playlistId,
      userId: credentialId,
      targetEmail: req.payload.targetEmail,
    };

    await this._service.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  };
}

module.exports = ExportsHandler;
