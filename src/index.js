const through = require('through2'),
  util = require('gulp-util');

// consts
var PLUGIN_NAME = 'gulp-inject';

module.exports = function() {
    return through.obj(function(file, encoding, callback) {

        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            // file.contents is a Stream - https://nodejs.org/api/stream.html
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
            return callback(null, file);
        } else if (file.isBuffer()) {
            // file.contents is a Buffer - https://nodejs.org/api/buffer.html
            this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));

            file.contents = rebuildContent(file.contents);

            return callback(null, file);
        }

        return callback(null, file);
    });
};