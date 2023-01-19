class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const {playlistId, userId, targetEmail} = JSON.parse(
          message.content.toString(),
      );

      const playlist = await this._playlistService.getPlaylistById(
          playlistId, userId,
      );

      const songs = await this._playlistService.getPlaylistSongs(playlistId);
      const result = await this._mailSender.sendEmail(
          targetEmail, JSON.stringify(
              {
                playlist: {
                  ...playlist,
                  songs,
                },
              },
          ),
      );
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
