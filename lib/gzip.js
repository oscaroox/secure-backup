'use strict';
let spawn = require('child_process').spawn;
let debug = require('debug')('secure-backup')

module.exports = function gzip(config) {

  let gzip = spawn('gzip', ['-c']);

  gzip.stderr.on('data', function (data) {
    debug('gzip: writing data to stderr %s', data)
  });

  gzip.stdout.on('end', function (data) {
    debug('gzip: writing data to stdout ended')
  });

  gzip.on('close', function (code) {
    if (code !== 0) {
      debug('gzip: failed with code %s', code)
    }
    debug('gzip: stream closed successfully')
    gzip.stdin.end();
  });
  return gzip

}
