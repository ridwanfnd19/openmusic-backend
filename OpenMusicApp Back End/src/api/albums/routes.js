const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: (req, h) => handler.postAlbumHandler(req, h),
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (req, h) => handler.postAlbumLikesHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: (req, h) => handler.postUploadAlbumCoverHandler(req, h),
    options: {
      payload: {
        maxBytes: 512000,
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: (req, h) => handler.getAlbumByIdHandler(req, h),
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (req, h) => handler.getAlbumLikessHandler(req, h),
  },
  {
    method: 'GET',
    path: '/upload/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: (req, h) => handler.putAlbumByIdHandler(req, h),
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: (req, h) => handler.deleteAlbumByIdHandler(req, h),
  },
];

module.exports = routes;
