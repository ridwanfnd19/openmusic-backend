const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: (req, h) => handler.postExportPlaylistSongsHandler(req, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
];

module.exports = routes;
