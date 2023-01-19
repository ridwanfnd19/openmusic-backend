const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (req, h) => handler.postPlaylistHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (req, h) => handler.getPlaylistHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: (req, h) => handler.deletePlaylistByIdHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (req, h) => handler.postPlaylistSongHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (req, h) => handler.getPlaylistSongHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (req, h) => handler.deletePlaylistSongHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (req, h) => handler.getPlaylistactivitiesHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
];

module.exports = routes;

