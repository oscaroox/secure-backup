'use strict'
let debug = require('debug')('secure-backup')

module.exports = function upload (cfg) {
  debug('initialized s3 handler')
  let s3 = cfg.handler
  let bucket = cfg.bucket
  return function (key, stream, resolve, reject) {
    return s3.upload({Bucket: bucket, Key: key, Body: stream},
    function (err, data) {
      if (err) return reject(new Error(err))
      debug('upload to s3 finished')
      return resolve(data)
    })
  }
}
