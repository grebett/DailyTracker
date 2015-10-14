var config = {
  port: 3000,
  callInterval: 5000,
  mongo: {
    uri: 'mongodb://localhost/jk_monitoring',
    options: {
      db: {
        safe: true
      }
    }
  },
  APIkeys: {
    youtubeGaming: 'AIzaSyCjo-rUJYc0-njCxBocZ9L4yMvPqZ5KExA',
    twitch: 'bgk65dux68h0ejaq9c22ekhjry7a12f',
    dailymotion: null,
    douyutv: null
  }
};

module.exports = config;
