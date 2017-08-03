const conf = require('./gulp.conf');

module.exports = function () {
  return {
    server: {
      baseDir: [
        conf.paths.tmp,
        conf.paths.src
      ],
      routes: {
        '/bower_components': 'bower_components'
      },
      middleware: function (req, res, next) {
       res.setHeader('Access-Control-Allow-Origin', '*');
       next();
     },
    },
    open: false,
    port: 3005,
    socket: {
      domain: '127.0.0.1:3005'
    }
  };
};
