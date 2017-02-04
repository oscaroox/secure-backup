'use strict';
let debug = require('debug')('secure-backup');

module.exports = function upload(cfg) {
  debug('initialized s3 handler')
  let s3 = cfg.handler
  return function (key, stream) {
    s3.upload({Bucket: cfg.bucket, Key: key, Body: stream},
    function(err, data) {
      if(err) throw err
      debug('upload to s3 finished')
    })
  }
}
